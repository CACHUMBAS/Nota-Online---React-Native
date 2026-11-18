import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '../../../shared/theme/theme.ts';
import type { ProjectStatus } from '../../../shared/domain/classroom.ts';
import { STATUS_LABELS } from '../domain/projects.ts';

/** Fondo, color del texto y símbolo de cada estado. El símbolo ayuda a distinguirlos sin depender solo del color. */
const LOOK: Record<ProjectStatus, { background: string; color: string; symbol: string }> = {
  pending: { background: colors.pendingSoft, color: colors.textMuted, symbol: '○' },
  open: { background: colors.warningSoft, color: colors.warning, symbol: '●' },
  closed: { background: colors.successSoft, color: colors.success, symbol: '✓' },
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const look = LOOK[status];
  return (
    <View accessible accessibilityLabel={STATUS_LABELS[status]} style={[styles.badge, { backgroundColor: look.background }]}>
      <Text style={[styles.text, { color: look.color }]}>
        {look.symbol} {STATUS_LABELS[status]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', borderRadius: radius.sm, paddingHorizontal: spacing.sm + 2, paddingVertical: spacing.xs },
  text: { fontSize: fontSize.small, fontWeight: '800' },
});
