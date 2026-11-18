import { asRecord, count, countOrNull, flag, invalid, text } from '../../../shared/domain/parsers.ts';
import type { ClassroomSession, Project, ProjectStatus, SessionSnapshot } from '../../../shared/domain/classroom.ts';

/** Validación de las respuestas de sesión: la sesión, sus trabajos y la instantánea completa. */

function projectStatus(value: string): ProjectStatus {
  if (value === 'pending' || value === 'open' || value === 'closed') return value;
  throw invalid();
}

export function parseClassroom(value: unknown): ClassroomSession {
  const record = asRecord(value);
  const status = text(record, 'status');
  if (status !== 'active' && status !== 'closed') throw invalid();
  return {
    id: text(record, 'id'),
    title: text(record, 'title'),
    code: text(record, 'code'),
    status,
    created_at: text(record, 'created_at'),
  };
}

export function parseClassroomList(value: unknown): ClassroomSession[] {
  if (!Array.isArray(value)) throw invalid();
  return value.map(parseClassroom);
}

export function parseProject(value: unknown): Project {
  const record = asRecord(value);
  return {
    id: text(record, 'id'),
    title: text(record, 'title'),
    author: text(record, 'author'),
    status: projectStatus(text(record, 'status')),
    vote_count: countOrNull(record, 'vote_count'),
    average: countOrNull(record, 'average'),
    my_score: countOrNull(record, 'my_score'),
  };
}

export function parseSnapshot(value: unknown): SessionSnapshot {
  const record = asRecord(value);
  const projects = record.projects;
  if (!Array.isArray(projects)) throw invalid();
  return {
    session: parseClassroom(record.session),
    is_owner: flag(record, 'is_owner'),
    participant_count: count(record, 'participant_count'),
    projects: projects.map(parseProject),
  };
}
