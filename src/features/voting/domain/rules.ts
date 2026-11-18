/** Una nota válida es un entero de 0 a 10, sin coerción de tipos (un texto «5» no vale). */
export function validScore(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 10;
}
