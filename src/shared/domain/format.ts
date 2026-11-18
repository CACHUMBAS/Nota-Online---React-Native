/** Presentación de resultados. Funciones puras, usadas por varias funcionalidades. */

export function formatVoteCount(count: number): string {
  return count === 1 ? '1 voto' : `${count} votos`;
}

/** null = sin votos: se muestra «Sin votos», nunca un cero. */
export function formatAverage(value: number | null): string {
  return value === null ? 'Sin votos' : value.toFixed(1).replace('.', ',');
}
