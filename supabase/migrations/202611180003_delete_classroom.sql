-- Borrado de una sesión de clase y todo lo que cuelga de ella.
--
-- Reglas (las comprueba el servidor, no el móvil):
--  * Solo el propietario de la sesión puede borrarla. Para cualquier otro usuario (otro profesor,
--    un alumno, una sesión que no existe) el resultado es el mismo: access_denied, sin revelar si existe.
--  * Solo se pueden borrar sesiones YA CERRADAS (session_not_closed): así nadie destruye por error una
--    votación en curso; hay que cerrarla antes, y el cierre es irreversible por diseño.
--  * El borrado es en cascada (participantes, trabajos y votos) gracias a las claves foráneas
--    `on delete cascade` de la migración 001. Es irreversible.
--  * Se serializa con el resto de operaciones bloqueando la fila de la sesión (lock_owned_classroom).

create function public.delete_classroom(p_classroom uuid)
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
  if v_room.status <> 'closed' then
    raise exception 'session_not_closed';
  end if;
  delete from nota_private.classrooms where id = p_classroom;
end;
$$;

revoke all on function public.delete_classroom(uuid) from public, anon;
grant execute on function public.delete_classroom(uuid) to authenticated;
