import { AppError } from '../lib/errors.ts';

/**
 * El servidor devuelve JSON sin tipo. Estas funciones comprueban la forma antes de que
 * la respuesta llegue a hooks o componentes; si algo no encaja se lanza `invalid_response`.
 * Son las piezas básicas que usa cada funcionalidad para validar sus propias respuestas.
 */
export type UnknownRecord = Record<string, unknown>;

export function invalid(): AppError {
  return new AppError('invalid_response');
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function asRecord(value: unknown): UnknownRecord {
  if (!isRecord(value)) throw invalid();
  return value;
}

export function text(record: UnknownRecord, key: string): string {
  const value = record[key];
  if (typeof value !== 'string') throw invalid();
  return value;
}

export function count(record: UnknownRecord, key: string): number {
  const value = record[key];
  if (typeof value !== 'number' || !Number.isFinite(value)) throw invalid();
  return value;
}

export function countOrNull(record: UnknownRecord, key: string): number | null {
  const value = record[key];
  if (value === null) return null;
  return count(record, key);
}

export function flag(record: UnknownRecord, key: string): boolean {
  const value = record[key];
  if (typeof value !== 'boolean') throw invalid();
  return value;
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
