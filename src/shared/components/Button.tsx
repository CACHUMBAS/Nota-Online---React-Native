import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, fontSize, radius, shadows, spacing } from '../theme/theme.ts';

type Variant = 'primary' | 'secondary' | 'danger';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  /** Mientras se procesa: muestra un indicador y bloquea nuevas pulsaciones. */
  loading?: boolean;
  /** Emoji decorativo antes del texto. No se lee con lector de pantalla: el botón se anuncia por su `label`. */
  icon?: string;
  accessibilityHint?: string;
}

export function Button({ label, onPress, variant = 'primary', disabled = false, loading = false, icon, accessibilityHint }: ButtonProps) {
  const inactive = disabled || loading;
  const textColor = variant === 'secondary' ? colors.primary : colors.onPrimary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [styles.base, variantStyles[variant], inactive && styles.inactive, pressed && styles.pressed]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {icon ? <Text style={[styles.icon, { color: textColor }]}>{icon}</Text> : null}
          <Text style={[styles.label, { color: textColor }]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: fontSize.body, fontWeight: '700' },
  icon: { fontSize: fontSize.title },
  inactive: { opacity: 0.45 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: colors.primary, ...shadows.raised },
  secondary: { backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.primary },
  danger: { backgroundColor: colors.danger },
});
