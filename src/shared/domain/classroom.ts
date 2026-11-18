export type ProjectStatus = 'pending' | 'open' | 'closed';
export interface ClassroomSession {
  id: string; title: string; code: string; status: 'active' | 'closed'; created_at: string;
}
/**
 * Lo que el servidor decide mostrar (la app no recalcula nada):
 * - average: solo con el trabajo cerrado; null = "Sin votos". Mientras no está cerrado siempre es null.
 * - vote_count: el profesor lo ve siempre; el alumno solo con el trabajo cerrado (antes, null).
 * - my_score: únicamente el voto de quien consulta.
 */
export interface Project {
  id: string; title: string; author: string; status: ProjectStatus;
  vote_count: number | null; average: number | null; my_score: number | null;
}
export interface SessionSnapshot {
  session: ClassroomSession; is_owner: boolean; participant_count: number; projects: Project[];
}
