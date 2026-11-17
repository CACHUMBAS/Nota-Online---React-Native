import { useCallback, useRef, useState } from 'react';
import { toAppError, type AppError } from '../lib/errors.ts';

export type ActionResult<Result> = { ok: true; value: Result } | { ok: false };

/**
 * Ejecuta una acción asíncrona (llamada al servidor) y expone si está en curso y su error.
 * Mientras una ejecución está en marcha se ignoran las nuevas: evita enviar dos veces con una doble pulsación.
 */
export function useAsyncAction<Args extends unknown[], Result>(action: (...args: Args) => Promise<Result>) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const busy = useRef(false);

  const run = useCallback(
    async (...args: Args): Promise<ActionResult<Result>> => {
      if (busy.current) return { ok: false };
      busy.current = true;
      setPending(true);
      setError(null);
      try {
        return { ok: true, value: await action(...args) };
      } catch (caught) {
        setError(toAppError(caught));
        return { ok: false };
      } finally {
        busy.current = false;
        setPending(false);
      }
    },
    [action],
  );

  const clearError = useCallback(() => setError(null), []);
  return { run, pending, error, clearError };
}
