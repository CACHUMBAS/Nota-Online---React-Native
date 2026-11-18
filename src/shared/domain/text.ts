/** Validación de campos de texto de formularios. Funciones puras: lanzan un Error con el mensaje para el usuario. */

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
