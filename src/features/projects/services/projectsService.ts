import { callRpc } from '../../../shared/lib/rpc.ts';
import { parseId } from '../../../shared/domain/parsers.ts';
import type { ProjectStatus } from '../../../shared/domain/classroom.ts';

export async function addProject(classroomId: string, title: string, author: string): Promise<string> {
  return parseId(await callRpc('add_classwork', { p_classroom: classroomId, p_title: title, p_author: author }));
}

/** Solo se pide abrir o cerrar; las transiciones permitidas las decide el servidor. */
export async function setProjectState(projectId: string, state: Exclude<ProjectStatus, 'pending'>): Promise<void> {
  await callRpc('set_classwork_state', { p_work: projectId, p_state: state });
}
