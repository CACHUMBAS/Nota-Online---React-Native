import type { Project, ProjectStatus } from '../../../shared/domain/classroom.ts';

/** El trabajo que se está votando ahora. El servidor garantiza que como máximo hay uno. */
export function findOpenProject(projects: readonly Project[]): Project | null {
  return projects.find((project) => project.status === 'open') ?? null;
}

export function closedProjects(projects: readonly Project[]): Project[] {
  return projects.filter((project) => project.status === 'closed');
}

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  pending: 'Pendiente',
  open: 'Votando',
  closed: 'Cerrado',
};
