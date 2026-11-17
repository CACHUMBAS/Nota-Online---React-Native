import { AppError, codeFromMessage } from '../../../shared/lib/errors.ts';
import { requireClient } from '../../../shared/lib/supabase.ts';

export async function signInTeacher(email: string, password: string): Promise<void> {
  const { error } = await requireClient().auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw new AppError(codeFromMessage(error.message));
}

/**
 * Garantiza una identidad anónima persistente para el alumno. Si este móvil tenía una cuenta
 * de profesor abierta se cierra antes: una misma sesión no puede ser profesor y alumno a la vez.
 */
export async function ensureStudentSession(): Promise<void> {
  const client = requireClient();
  const { data } = await client.auth.getSession();
  const user = data.session?.user;
  if (user?.is_anonymous) return;
  if (user) await client.auth.signOut();
  const { error } = await client.auth.signInAnonymously();
  if (error) throw new AppError(codeFromMessage(error.message));
}

export async function signOut(): Promise<void> {
  const { error } = await requireClient().auth.signOut();
  if (error) throw new AppError(codeFromMessage(error.message));
}
