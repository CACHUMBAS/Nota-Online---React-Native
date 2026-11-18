import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';
import { AppError } from './errors.ts';

// Estas variables EXPO_PUBLIC_* quedan dentro de la app empaquetada: solo URL y clave publishable.
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/** null cuando falta la configuración: la app muestra entonces una pantalla explicativa. */
export const supabase: SupabaseClient | null =
  url && publishableKey
    ? createClient(url, publishableKey, {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      })
    : null;

export const isBackendConfigured = supabase !== null;

export function requireClient(): SupabaseClient {
  if (!supabase) throw new AppError('not_configured');
  return supabase;
}

// Recomendación de Supabase para React Native: renovar el token solo con la app en primer plano.
if (supabase) {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') void supabase.auth.startAutoRefresh();
    else void supabase.auth.stopAutoRefresh();
  });
}
