import { useIsFocused } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppActive } from '../../../shared/hooks/useAppActive.ts';
import { POLL_INTERVAL_MS } from '../../../shared/lib/config.ts';
import { toAppError, type AppError } from '../../../shared/lib/errors.ts';
import { getSnapshot } from '../services/sessionsService.ts';
import type { SessionSnapshot } from '../types.ts';

/**
 * Mantiene al día el estado de una sesión consultando al servidor (ADR-005, no es Realtime):
 * al entrar, cada POLL_INTERVAL_MS mientras la pantalla está en foco y la app en primer plano,
 * y al volver a primer plano. Si una respuesta llega tarde y ya hay otra más reciente, se descarta.
 * Si falla una consulta se conserva el último estado conocido y se expone el error.
 */
export function useClassroomSnapshot(classroomId: string) {
  const [snapshot, setSnapshot] = useState<SessionSnapshot | null>(null);
  const [error, setError] = useState<AppError | null>(null);
  const [loading, setLoading] = useState(true);
  const focused = useIsFocused();
  const appActive = useAppActive();
  const latestRequest = useRef(0);

  const refresh = useCallback(async () => {
    const requestId = ++latestRequest.current;
    try {
      const next = await getSnapshot(classroomId);
      if (requestId !== latestRequest.current) return;
      setSnapshot(next);
      setError(null);
    } catch (caught) {
      if (requestId !== latestRequest.current) return;
      setError(toAppError(caught));
    } finally {
      if (requestId === latestRequest.current) setLoading(false);
    }
  }, [classroomId]);

  useEffect(() => {
    if (!focused || !appActive) return;
    void refresh();
    const timer = setInterval(() => void refresh(), POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [focused, appActive, refresh]);

  return { snapshot, error, loading, refresh };
}
