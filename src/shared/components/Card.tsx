import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, shadows, spacing } from '../theme/theme.ts';

export type CardTone = 'default' | 'accent' | 'success' | 'warning';

interface CardProps {
  children: ReactNode;
  /** default: tarjeta blanca con sombra; accent/success/warning: fondo suave para destacar un aviso o la acción principal. */
  tone?: CardTone;
  style?: StyleProp<ViewStyle>;
}

/** Contenedor visual único para tarjetas: mismo radio, relleno y sombra en toda la app. */
export function Card({ children, tone = 'default', style }: CardProps) {
  return <View style={[cardStyles.base, toneStyles[tone], style]}>{children}</View>;
}

/** Estilo base reutilizable por tarjetas pulsables (por ejemplo una `Pressable`). */
export const cardStyles = StyleSheet.create({
  base: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
});

const toneStyles = StyleSheet.create({
  default: {},
  accent: { backgroundColor: colors.primarySoft, borderColor: colors.primarySoft, shadowOpacity: 0, elevation: 0 },
  success: { backgroundColor: colors.successSoft, borderColor: colors.successSoft, shadowOpacity: 0, elevation: 0 },
  warning: { backgroundColor: colors.warningSoft, borderColor: colors.warningSoft, shadowOpacity: 0, elevation: 0 },
});
