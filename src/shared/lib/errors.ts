/**
 * Errores de la aplicación. El servidor lanza excepciones con un código corto como mensaje
 * (por ejemplo `already_voted`); aquí se convierten en un código tipado y en un texto para el usuario.
 */
export const ERROR_MESSAGES = {
  auth_required: 'Necesitas iniciar sesión.',
  teacher_required: 'Esta acción es solo para profesores.',
  access_denied: 'No tienes acceso a esta sesión.',
  invalid_title: 'El título debe tener entre 1 y 80 caracteres.',
  invalid_author: 'El autor no puede superar los 80 caracteres.',
  invalid_alias: 'El alias debe tener entre 1 y 30 caracteres.',
  invalid_code: 'Introduce un código de seis letras o números.',
  invalid_state: 'Estado de votación no válido.',
  invalid_score: 'La nota debe ser un número entero entre 0 y 10.',
  invalid_transition: 'Esa votación ya no se puede cambiar a ese estado.',
  already_open: 'Ya hay una votación abierta. Ciérrala antes de abrir otra.',
  already_voted: 'Ya habías votado este trabajo con otra nota. Tu voto no se puede cambiar.',
  voting_closed: 'La votación de este trabajo ya está cerrada.',
  voting_not_open: 'Este trabajo todavía no está abierto a votación.',
  session_closed: 'La sesión ya está cerrada.',
  session_not_found: 'No existe ninguna sesión con ese código.',
  owner_cannot_join: 'No puedes entrar como alumno a una sesión que has creado.',
  code_generation_failed: 'No se pudo generar el código de la sesión. Inténtalo de nuevo.',
  invalid_credentials: 'Correo o contraseña incorrectos.',
  anonymous_disabled: 'El acceso de alumnos no está activado en el servidor.',
  connection: 'No hay conexión con el servidor. Comprueba tu red e inténtalo de nuevo.',
  not_configured: 'La aplicación no está conectada a ningún servidor.',
  invalid_response: 'El servidor devolvió una respuesta inesperada.',
  unknown: 'Ha ocurrido un error inesperado.',
} as const;

export type ErrorCode = keyof typeof ERROR_MESSAGES;

function isErrorCode(value: string): value is ErrorCode {
  return Object.prototype.hasOwnProperty.call(ERROR_MESSAGES, value);
}

/** Traduce el mensaje de un error de red, de autenticación o del servidor a un código conocido. */
export function codeFromMessage(message: string): ErrorCode {
  const text = message.trim();
  if (isErrorCode(text)) return text;
  if (/invalid login credentials/i.test(text)) return 'invalid_credentials';
  if (/anonymous sign-?ins are disabled/i.test(text)) return 'anonymous_disabled';
  if (/network|fetch|timed? ?out|failed to connect|offline/i.test(text)) return 'connection';
  return 'unknown';
}

export class AppError extends Error {
  readonly code: ErrorCode;

  constructor(code: ErrorCode) {
    super(ERROR_MESSAGES[code]);
    this.name = 'AppError';
    this.code = code;
  }
}

/** Convierte cualquier valor lanzado en un AppError sin perder los que ya lo son. */
export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  if (error instanceof Error) return new AppError(codeFromMessage(error.message));
  return new AppError('unknown');
}
