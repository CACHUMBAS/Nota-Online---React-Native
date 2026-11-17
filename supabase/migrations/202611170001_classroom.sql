-- Nota Online: sesiones de clase, trabajos y votos.
--
-- Diseño (resumen para la defensa):
--  * Las tablas viven en el esquema `nota_private`, que no está expuesto a la API y al que
--    `anon`/`authenticated` no tienen acceso. Además tienen RLS activada sin políticas
--    (defensa en profundidad: aunque se expusieran, nadie podría leerlas).
--  * La única puerta de entrada son las funciones `public.*` (SECURITY DEFINER, search_path vacío),
--    concedidas solo a `authenticated`. Cada una comprueba identidad y permisos en el servidor.
--  * "Profesor" = usuario no anónimo (cuenta preparada en Supabase) y propietario de la sesión.
--    "Alumno" = usuario anónimo del backend que se ha unido con el código de la sesión.
--  * Apertura, cierre y voto serializan bloqueando la fila de la sesión.

create schema if not exists nota_private;
revoke all on schema nota_private from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------------------

create table nota_private.classrooms (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  title text not null check (char_length(title) between 1 and 80),
  code text not null unique check (code ~ '^[A-Z0-9]{6}$'),
  status text not null default 'active' check (status in ('active', 'closed')),
  created_at timestamptz not null default now()
);

create table nota_private.participants (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references nota_private.classrooms (id) on delete cascade,
  user_id uuid not null,
  alias text not null check (char_length(alias) between 1 and 30),
  created_at timestamptz not null default now(),
  unique (classroom_id, user_id),
  unique (id, classroom_id)
);

create table nota_private.works (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references nota_private.classrooms (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  author text not null default '' check (char_length(author) <= 80),
  sort_order integer not null,
  status text not null default 'pending' check (status in ('pending', 'open', 'closed')),
  created_at timestamptz not null default now(),
  unique (classroom_id, sort_order),
  unique (id, classroom_id)
);

-- Como máximo un trabajo abierto por sesión, impuesto por la base de datos.
create unique index works_one_open_per_classroom
  on nota_private.works (classroom_id) where status = 'open';

create table nota_private.votes (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null,
  work_id uuid not null,
  participant_id uuid not null,
  score smallint not null check (score between 0 and 10),
  created_at timestamptz not null default now(),
  -- Un voto por participante y trabajo.
  unique (work_id, participant_id),
  -- El trabajo y el participante deben pertenecer a la misma sesión que el voto.
  foreign key (work_id, classroom_id) references nota_private.works (id, classroom_id) on delete cascade,
  foreign key (participant_id, classroom_id) references nota_private.participants (id, classroom_id) on delete cascade
);

alter table nota_private.classrooms enable row level security;
alter table nota_private.participants enable row level security;
alter table nota_private.works enable row level security;
alter table nota_private.votes enable row level security;

revoke all on all tables in schema nota_private from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Ayudas internas (no accesibles desde la API)
-- ---------------------------------------------------------------------------

create function nota_private.current_uid()
returns uuid
language plpgsql
stable
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'auth_required';
  end if;
  return v_uid;
end;
$$;

create function nota_private.is_anonymous()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false)
$$;

-- Código de sala de 6 caracteres sin 0/O/1/I. 32 símbolos: sin sesgo al usar bytes aleatorios.
create function nota_private.new_code()
returns text
language plpgsql
volatile
set search_path = ''
as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  bytes bytea := decode(replace(gen_random_uuid()::text, '-', ''), 'hex');
  result text := '';
begin
  for i in 0..5 loop
    result := result || substr(alphabet, (get_byte(bytes, i) % 32) + 1, 1);
  end loop;
  return result;
end;
$$;

create function nota_private.classroom_json(c nota_private.classrooms)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select jsonb_build_object(
    'id', c.id, 'title', c.title, 'code', c.code, 'status', c.status, 'created_at', c.created_at
  )
$$;

-- Devuelve la sesión bloqueada para escritura solo si pertenece a `p_uid`.
-- No distingue "no existe" de "no es tuya": ambos dan access_denied.
create function nota_private.lock_owned_classroom(p_classroom uuid, p_uid uuid)
returns nota_private.classrooms
language plpgsql
set search_path = ''
as $$
declare
  v_room nota_private.classrooms;
begin
  select * into v_room
    from nota_private.classrooms
   where id = p_classroom and owner_id = p_uid
     for update;
  if not found then
    raise exception 'access_denied';
  end if;
  return v_room;
end;
$$;

-- ---------------------------------------------------------------------------
-- API pública (RPC)
-- ---------------------------------------------------------------------------

create function public.create_classroom(p_title text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := nota_private.current_uid();
  v_title text := btrim(p_title);
  v_room nota_private.classrooms;
begin
  if nota_private.is_anonymous() then
    raise exception 'teacher_required';
  end if;
  if v_title is null or char_length(v_title) not between 1 and 80 then
    raise exception 'invalid_title';
  end if;

  for attempt in 1..10 loop
    begin
      insert into nota_private.classrooms (owner_id, title, code)
      values (v_uid, v_title, nota_private.new_code())
      returning * into v_room;
      return nota_private.classroom_json(v_room);
    exception when unique_violation then
      null; -- código repetido: se prueba con otro
    end;
  end loop;
  raise exception 'code_generation_failed';
end;
$$;

create function public.add_classwork(p_classroom uuid, p_title text, p_author text default '')
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := nota_private.current_uid();
  v_room nota_private.classrooms;
  v_title text := btrim(p_title);
  v_author text := btrim(coalesce(p_author, ''));
  v_id uuid;
begin
  v_room := nota_private.lock_owned_classroom(p_classroom, v_uid);
  if v_room.status <> 'active' then
    raise exception 'session_closed';
  end if;
  if v_title is null or char_length(v_title) not between 1 and 80 then
    raise exception 'invalid_title';
  end if;
  if char_length(v_author) > 80 then
    raise exception 'invalid_author';
  end if;

  -- La sesión está bloqueada: dos altas simultáneas no pueden repetir sort_order.
  insert into nota_private.works (classroom_id, title, author, sort_order)
  values (
    p_classroom, v_title, v_author,
    coalesce((select max(w.sort_order) from nota_private.works w where w.classroom_id = p_classroom), 0) + 1
  )
  returning id into v_id;
  return v_id;
end;
$$;

-- Transiciones permitidas: pending -> open -> closed. El cierre es irreversible.
create function public.set_classwork_state(p_work uuid, p_state text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := nota_private.current_uid();
  v_classroom uuid;
  v_room nota_private.classrooms;
  v_work nota_private.works;
begin
  if p_state is null or p_state not in ('open', 'closed') then
    raise exception 'invalid_state';
  end if;

  select w.classroom_id into v_classroom from nota_private.works w where w.id = p_work;
  if not found then
    raise exception 'access_denied';
  end if;

  v_room := nota_private.lock_owned_classroom(v_classroom, v_uid);
  -- Se vuelve a leer el trabajo ya con la sesión bloqueada.
  select * into v_work from nota_private.works w where w.id = p_work;

  if v_room.status <> 'active' then
    raise exception 'session_closed';
  end if;
  if not ((v_work.status = 'pending' and p_state = 'open')
       or (v_work.status = 'open' and p_state = 'closed')) then
    raise exception 'invalid_transition';
  end if;
  if p_state = 'open' and exists (
    select 1 from nota_private.works w where w.classroom_id = v_classroom and w.status = 'open'
  ) then
    raise exception 'already_open';
  end if;

  update nota_private.works set status = p_state where id = p_work;
  return p_state;
end;
$$;

create function public.close_classroom(p_classroom uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := nota_private.current_uid();
  v_room nota_private.classrooms;
begin
  v_room := nota_private.lock_owned_classroom(p_classroom, v_uid);
  if v_room.status = 'closed' then
    return; -- idempotente
  end if;
  update nota_private.works set status = 'closed'
   where classroom_id = p_classroom and status = 'open';
  update nota_private.classrooms set status = 'closed' where id = p_classroom;
end;
$$;

-- Unirse es idempotente: repetir la llamada devuelve la misma sesión sin cambiar el alias.
create function public.join_classroom(p_code text, p_alias text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := nota_private.current_uid();
  v_code text := upper(btrim(p_code));
  v_alias text := btrim(p_alias);
  v_room nota_private.classrooms;
begin
  if v_code is null or v_code !~ '^[A-Z0-9]{6}$' then
    raise exception 'invalid_code';
  end if;

  -- FOR SHARE: se serializa con close_classroom (que bloquea para escritura).
  select * into v_room from nota_private.classrooms c where c.code = v_code for share;
  if not found then
    raise exception 'session_not_found';
  end if;
  if v_room.owner_id = v_uid then
    raise exception 'owner_cannot_join';
  end if;

  if exists (
    select 1 from nota_private.participants p
     where p.classroom_id = v_room.id and p.user_id = v_uid
  ) then
    return v_room.id;
  end if;

  if v_room.status <> 'active' then
    raise exception 'session_closed';
  end if;
  if v_alias is null or char_length(v_alias) not between 1 and 30 then
    raise exception 'invalid_alias';
  end if;

  insert into nota_private.participants (classroom_id, user_id, alias)
  values (v_room.id, v_uid, v_alias)
  on conflict (classroom_id, user_id) do nothing;
  return v_room.id;
end;
$$;

-- Un voto por participante y trabajo. Un reintento con la misma nota devuelve el voto existente;
-- una nota distinta es already_voted: nunca se sobrescribe un voto confirmado.
create function public.submit_score(p_work uuid, p_score numeric)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := nota_private.current_uid();
  v_classroom uuid;
  v_participant uuid;
  v_room nota_private.classrooms;
  v_work nota_private.works;
  v_existing smallint;
begin
  if p_score is null or p_score <> trunc(p_score) or p_score < 0 or p_score > 10 then
    raise exception 'invalid_score';
  end if;

  select w.classroom_id into v_classroom from nota_private.works w where w.id = p_work;
  if not found then
    raise exception 'access_denied';
  end if;

  select p.id into v_participant
    from nota_private.participants p
   where p.classroom_id = v_classroom and p.user_id = v_uid;
  if not found then
    raise exception 'access_denied';
  end if;

  -- Bloqueo compartido de la sesión: los votos conviven entre sí pero esperan a que termine
  -- una apertura/cierre en curso. El estado se lee DESPUÉS de obtener el bloqueo.
  select * into v_room from nota_private.classrooms c where c.id = v_classroom for share;
  select * into v_work from nota_private.works w where w.id = p_work;

  select v.score into v_existing
    from nota_private.votes v
   where v.work_id = p_work and v.participant_id = v_participant;
  if found then
    if v_existing = p_score then
      return v_existing; -- acuse de un voto ya confirmado, incluso tras el cierre
    end if;
    raise exception 'already_voted';
  end if;

  if v_work.status = 'closed' or v_room.status = 'closed' then
    raise exception 'voting_closed';
  end if;
  if v_work.status <> 'open' then
    raise exception 'voting_not_open';
  end if;

  insert into nota_private.votes (classroom_id, work_id, participant_id, score)
  values (v_classroom, p_work, v_participant, p_score::smallint)
  on conflict (work_id, participant_id) do nothing;

  if not found then
    -- Otro reintento simultáneo del mismo participante ganó la carrera.
    select v.score into v_existing
      from nota_private.votes v
     where v.work_id = p_work and v.participant_id = v_participant;
    if v_existing <> p_score then
      raise exception 'already_voted';
    end if;
    return v_existing;
  end if;
  return p_score::integer;
end;
$$;

-- Instantánea autorizada de la sesión. Ocultación de resultados, calculada en el servidor:
--   average: solo con el trabajo cerrado (null = sin votos). Nunca durante la votación.
--   vote_count: el profesor lo ve siempre; el alumno solo con el trabajo cerrado (si no, null).
--   my_score: solo el voto de quien consulta.
create function public.classroom_snapshot(p_classroom uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := nota_private.current_uid();
  v_room nota_private.classrooms;
  v_is_owner boolean;
  v_participant uuid;
begin
  select * into v_room from nota_private.classrooms c where c.id = p_classroom;
  if not found then
    raise exception 'access_denied';
  end if;

  v_is_owner := v_room.owner_id = v_uid;
  select p.id into v_participant
    from nota_private.participants p
   where p.classroom_id = p_classroom and p.user_id = v_uid;
  if not v_is_owner and v_participant is null then
    raise exception 'access_denied';
  end if;

  return jsonb_build_object(
    'session', nota_private.classroom_json(v_room),
    'is_owner', v_is_owner,
    'participant_count', (select count(*) from nota_private.participants p where p.classroom_id = p_classroom),
    'projects', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', w.id,
          'title', w.title,
          'author', w.author,
          'status', w.status,
          'vote_count', case when v_is_owner or w.status = 'closed'
            then (select count(*) from nota_private.votes v where v.work_id = w.id) end,
          'average', case when w.status = 'closed'
            then (select avg(v.score) from nota_private.votes v where v.work_id = w.id) end,
          'my_score', (select v.score from nota_private.votes v
                        where v.work_id = w.id and v.participant_id = v_participant)
        )
        order by w.sort_order
      )
      from nota_private.works w
     where w.classroom_id = p_classroom
    ), '[]'::jsonb)
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Permisos mínimos: solo `authenticated` ejecuta la API. `anon` y PUBLIC, nada.
-- (Supabase concede por defecto a anon/authenticated en `public`; aquí se revoca de forma explícita.)
-- ---------------------------------------------------------------------------

revoke all on function public.create_classroom(text) from public, anon;
revoke all on function public.add_classwork(uuid, text, text) from public, anon;
revoke all on function public.set_classwork_state(uuid, text) from public, anon;
revoke all on function public.close_classroom(uuid) from public, anon;
revoke all on function public.join_classroom(text, text) from public, anon;
revoke all on function public.submit_score(uuid, numeric) from public, anon;
revoke all on function public.classroom_snapshot(uuid) from public, anon;

grant execute on function public.create_classroom(text) to authenticated;
grant execute on function public.add_classwork(uuid, text, text) to authenticated;
grant execute on function public.set_classwork_state(uuid, text) to authenticated;
grant execute on function public.close_classroom(uuid) to authenticated;
grant execute on function public.join_classroom(text, text) to authenticated;
grant execute on function public.submit_score(uuid, numeric) to authenticated;
grant execute on function public.classroom_snapshot(uuid) to authenticated;
