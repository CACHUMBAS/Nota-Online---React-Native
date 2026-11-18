/** Mensaje para el usuario cuando una función de validación del dominio lanza un Error. */
export function validationMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Valor no válido.';
}
