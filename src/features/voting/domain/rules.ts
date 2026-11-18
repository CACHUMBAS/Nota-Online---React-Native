export function validScore(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 10;
}

export function normalizeCode(value: string): string {
  const code = value.trim().toUpperCase();
  if (!/^[A-Z0-9]{6}$/.test(code)) throw new Error('Introduce un código de seis letras o números.');
  return code;
}

export function cleanText(value: string, max: number): string {
  const text = value.trim();
  if (!text || text.length > max) throw new Error(`Introduce entre 1 y ${max} caracteres.`);
  return text;
}

/** Texto opcional: vacío es válido, pero no puede superar el máximo. */
export function cleanOptionalText(value: string, max: number): string {
  const text = value.trim();
  if (text.length > max) throw new Error(`No puede superar los ${max} caracteres.`);
  return text;
}

export function formatVoteCount(count: number): string {
  return count === 1 ? '1 voto' : `${count} votos`;
}

export function formatAverage(value: number | null): string {
  return value === null ? 'Sin votos' : value.toFixed(1).replace('.', ',');
}
