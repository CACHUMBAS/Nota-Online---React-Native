import { ensureStudentSession } from '../../auth/services/authService.ts';
import { joinClassroom } from './sessionsService.ts';
import { saveLastClassroom } from './lastClassroomStorage.ts';

/** Recorrido de entrada del alumno: identidad anónima persistente, unirse y recordar la sesión. */
export async function joinAsStudent(code: string, alias: string): Promise<string> {
  await ensureStudentSession();
  const classroomId = await joinClassroom(code, alias);
  await saveLastClassroom(classroomId);
  return classroomId;
}
