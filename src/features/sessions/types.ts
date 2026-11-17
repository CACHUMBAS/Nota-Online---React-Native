export type ProjectStatus = 'pending' | 'open' | 'closed';
export interface ClassroomSession {
  id: string; title: string; code: string; status: 'active' | 'closed'; created_at: string;
}
export interface Project {
  id: string; title: string; author: string; status: ProjectStatus;
  vote_count: number; average: number | null; my_score: number | null;
}
export interface SessionSnapshot {
  session: ClassroomSession; is_owner: boolean; participant_count: number; projects: Project[];
}
