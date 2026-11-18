import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../../shared/lib/supabase.ts';

export type AuthState =
  | { status: 'loading' }
  | { status: 'signedOut' }
  | { status: 'signedIn'; isAnonymous: boolean };

const AuthContext = createContext<AuthState | null>(null);

function toState(session: Session | null): AuthState {
  return session ? { status: 'signedIn', isAnonymous: session.user.is_anonymous === true } : { status: 'signedOut' };
}

/**
 * Solo expone el estado de la sesión (cargando / sin sesión / con sesión y si es anónima).
 * Quién es profesor no se decide aquí: lo decide el servidor en cada llamada.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: supabase ? 'loading' : 'signedOut' });

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!cancelled) setState(toState(data.session));
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'signedOut' });
      });
    // Dentro de este callback solo se actualiza el estado (sin llamar a más funciones de auth).
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setState(toState(session)));
    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const state = useContext(AuthContext);
  if (!state) throw new Error('useAuth debe usarse dentro de AuthProvider.');
  return state;
}
