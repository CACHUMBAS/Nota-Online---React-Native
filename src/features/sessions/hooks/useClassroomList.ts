import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { toAppError, type AppError } from '../../../shared/lib/errors.ts';
import { listClassrooms } from '../services/sessionsService.ts';
import type { ClassroomSession } from '../types.ts';

/** Sesiones del profesor. Se recargan cada vez que la pantalla recupera el foco. */
export function useClassroomList() {
  const [rooms, setRooms] = useState<ClassroomSession[] | null>(null);
  const [error, setError] = useState<AppError | null>(null);

  const reload = useCallback(async () => {
    try {
      setRooms(await listClassrooms());
      setError(null);
    } catch (caught) {
      setError(toAppError(caught));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  return { rooms, error, reload };
}
