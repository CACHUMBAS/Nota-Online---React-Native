import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme/theme.ts';

interface ScreenProps {
  children: ReactNode;
  /** Bordes que respetan la zona segura. Por defecto no el superior: lo gestiona la cabecera de navegación. */
  edges?: Edge[];
}

/** Contenedor común: zona segura, desplazamiento y teclado, para que ningún campo quede tapado. */
export function Screen({ children, edges = ['left', 'right', 'bottom'] }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md, flexGrow: 1 },
});
