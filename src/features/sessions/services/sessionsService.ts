import { callRpc } from '../../../shared/lib/rpc.ts';
import { parseId } from '../../../shared/domain/parsers.ts';
import { parseClassroom, parseClassroomList, parseSnapshot } from '../domain/parsers.ts';
import type { ClassroomSession, SessionSnapshot } from '../../../shared/domain/classroom.ts';

export async function createClassroom(title: string): Promise<ClassroomSession> {
  return parseClassroom(await callRpc('create_classroom', { p_title: title }));
}

export async function listClassrooms(): Promise<ClassroomSession[]> {
  return parseClassroomList(await callRpc('list_classrooms'));
}

export async function getSnapshot(classroomId: string): Promise<SessionSnapshot> {
  return parseSnapshot(await callRpc('classroom_snapshot', { p_classroom: classroomId }));
}

export async function closeClassroom(classroomId: string): Promise<void> {
  await callRpc('close_classroom', { p_classroom: classroomId });
}

/** Borra una sesión cerrada con sus trabajos, participantes y votos. Irreversible; el servidor exige que esté cerrada. */
export async function deleteClassroom(classroomId: string): Promise<void> {
  await callRpc('delete_classroom', { p_classroom: classroomId });
}

/** Devuelve el identificador de la sesión a la que se ha unido. Repetir la llamada es seguro. */
export async function joinClassroom(code: string, alias: string): Promise<string> {
  return parseId(await callRpc('join_classroom', { p_code: code, p_alias: alias }));
}
