import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fontSize, spacing, touchTarget } from '../theme/theme.ts';

/** Acción de texto para la cabecera de navegación (por ejemplo «Salir»). */
export function HeaderButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={8} style={styles.button}>
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: touchTarget, justifyContent: 'center', paddingHorizontal: spacing.sm },
  text: { color: colors.primary, fontSize: fontSize.body, fontWeight: '700' },
});
