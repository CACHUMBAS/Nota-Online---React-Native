/** Código de sesión: seis letras o números, sin distinguir mayúsculas ni espacios alrededor. */
export function normalizeCode(value: string): string {
  const code = value.trim().toUpperCase();
  if (!/^[A-Z0-9]{6}$/.test(code)) throw new Error('Introduce un código de seis letras o números.');
  return code;
}
