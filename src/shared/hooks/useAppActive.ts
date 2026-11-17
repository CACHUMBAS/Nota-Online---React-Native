import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

/** true mientras la app está en primer plano. Sirve para no consultar el servidor en segundo plano. */
export function useAppActive(): boolean {
  const [active, setActive] = useState(AppState.currentState === 'active');
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => setActive(state === 'active'));
    return () => subscription.remove();
  }, []);
  return active;
}
