-- Lista las sesiones del profesor autenticado (más recientes primero).
-- Necesaria para recuperar una votación abierta aunque se borren los datos locales del móvil.
-- Solo devuelve sesiones propias; un usuario anónimo (alumno) no puede usarla.

create function public.list_classrooms()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := nota_private.current_uid();
begin
  if nota_private.is_anonymous() then
    raise exception 'teacher_required';
  end if;

  return coalesce((
    select jsonb_agg(nota_private.classroom_json(c) order by c.created_at desc)
      from nota_private.classrooms c
     where c.owner_id = v_uid
  ), '[]'::jsonb);
end;
$$;

revoke all on function public.list_classrooms() from public, anon;
grant execute on function public.list_classrooms() to authenticated;
