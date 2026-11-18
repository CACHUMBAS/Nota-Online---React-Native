import { AppError } from '../../../shared/lib/errors.ts';
import type { ClassroomSession, Project, ProjectStatus, SessionSnapshot } from '../types.ts';

/**
 * El servidor devuelve JSON sin tipo. Estas funciones comprueban la forma antes de que
 * la respuesta llegue a hooks o componentes; si algo no encaja se lanza `invalid_response`.
 */
type UnknownRecord = Record<string, unknown>;

function invalid(): AppError {
  return new AppError('invalid_response');
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asRecord(value: unknown): UnknownRecord {
  if (!isRecord(value)) throw invalid();
  return value;
}

function text(record: UnknownRecord, key: string): string {
  const value = record[key];
  if (typeof value !== 'string') throw invalid();
  return value;
}

function count(record: UnknownRecord, key: string): number {
  const value = record[key];
  if (typeof value !== 'number' || !Number.isFinite(value)) throw invalid();
  return value;
}

function countOrNull(record: UnknownRecord, key: string): number | null {
  const value = record[key];
  if (value === null) return null;
  return count(record, key);
}

function flag(record: UnknownRecord, key: string): boolean {
  const value = record[key];
  if (typeof value !== 'boolean') throw invalid();
  return value;
}

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

/** Identificador devuelto por funciones como add_classwork o join_classroom. */
export function parseId(value: unknown): string {
  if (typeof value !== 'string' || value.length === 0) throw invalid();
  return value;
}

/** Nota devuelta por submit_score tras aceptarla el servidor. */
export function parseScore(value: unknown): number {
  if (typeof value !== 'number' || !Number.isInteger(value)) throw invalid();
  return value;
}
