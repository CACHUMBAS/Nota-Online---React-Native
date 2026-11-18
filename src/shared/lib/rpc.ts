import { AppError, codeFromMessage } from './errors.ts';
import { requireClient } from './supabase.ts';

/**
 * Único punto por el que la app llama a las funciones del servidor. Los servicios de cada
 * funcionalidad lo usan; ningún componente visual habla con Supabase directamente.
 * Devuelve `unknown`: cada servicio valida la forma de la respuesta antes de usarla.
 */
export async function callRpc(name: string, args?: Record<string, unknown>): Promise<unknown> {
  const client = requireClient();
  let result;
  try {
    result = await client.rpc(name, args);
  } catch {
    throw new AppError('connection');
  }
  if (result.error) throw new AppError(codeFromMessage(result.error.message));
  return result.data;
}
