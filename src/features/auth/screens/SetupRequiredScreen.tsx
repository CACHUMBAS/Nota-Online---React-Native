import { StyleSheet, Text } from 'react-native';
import { Screen } from '../../../shared/components/Screen.tsx';
import { colors, fontSize, spacing } from '../../../shared/theme/theme.ts';

/** Se muestra cuando faltan las variables de Supabase. No simula datos: la app necesita su backend. */
export function SetupRequiredScreen() {
  return (
    <Screen edges={['top', 'left', 'right', 'bottom']}>
      <Text style={styles.title}>Falta conectar el servidor</Text>
      <Text style={styles.body}>
        Nota Online guarda las votaciones en un proyecto de Supabase para que profesor y alumnos compartan los datos.
      </Text>
      <Text style={styles.body}>1. Crea el proyecto siguiendo docs/SUPABASE_SETUP.md.</Text>
      <Text style={styles.body}>
        2. Copia .env.example a .env y rellena EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.
      </Text>
      <Text style={styles.body}>3. Reinicia Expo con: npx expo start -c</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.heading, fontWeight: '800', color: colors.text, marginTop: spacing.lg },
  body: { fontSize: fontSize.body, color: colors.text },
});
