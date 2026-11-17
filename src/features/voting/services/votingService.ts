import { callRpc } from '../../../shared/lib/rpc.ts';
import { parseScore } from '../../sessions/domain/parsers.ts';
import { validScore } from '../domain/rules.ts';
import { AppError } from '../../../shared/lib/errors.ts';

/**
 * Envía la nota. Se devuelve la nota solo cuando el servidor la ha aceptado.
 * Repetir el envío con la misma nota es seguro: el servidor devuelve el voto ya registrado.
 */
export async function submitScore(projectId: string, score: number): Promise<number> {
  if (!validScore(score)) throw new AppError('invalid_score');
  return parseScore(await callRpc('submit_score', { p_work: projectId, p_score: score }));
}
