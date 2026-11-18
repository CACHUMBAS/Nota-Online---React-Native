import { Pressable, StyleSheet, Text, View } from 'react-native';
import { cardStyles } from '../../../shared/components/Card.tsx';
import { colors, fontSize, radius, spacing, touchTarget } from '../../../shared/theme/theme.ts';
import type { ClassroomSession } from '../../../shared/domain/classroom.ts';

interface SessionCardProps {
  session: ClassroomSession;
  onPress: () => void;
}

export function SessionCard({ session, onPress }: SessionCardProps) {
  const date = new Date(session.created_at).toLocaleDateString('es-ES');
  const active = session.status === 'active';
  const state = active ? 'Activa' : 'Cerrada';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${session.title}, código ${session.code}, ${state}`}
      onPress={onPress}
      style={({ pressed }) => [cardStyles.base, styles.row, pressed && styles.pressed]}
    >
      <View style={styles.texts}>
        <Text style={styles.title} numberOfLines={2}>{session.title}</Text>
        <Text style={styles.meta}>Código {session.code} · {date}</Text>
      </View>
      <View style={[styles.chip, active ? styles.chipActive : styles.chipClosed]}>
        <Text style={[styles.chipText, { color: active ? colors.success : colors.textMuted }]}>{active ? '● Activa' : 'Cerrada'}</Text>
      </View>
      <Text accessible={false} importantForAccessibility="no" style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: touchTarget + 16 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  texts: { flex: 1, gap: 2 },
  title: { fontSize: fontSize.body, fontWeight: '800', color: colors.text },
  meta: { fontSize: fontSize.small, color: colors.textMuted },
  chip: { borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  chipActive: { backgroundColor: colors.successSoft },
  chipClosed: { backgroundColor: colors.pendingSoft },
  chipText: { fontSize: fontSize.caption + 1, fontWeight: '800' },
  chevron: { fontSize: fontSize.heading, color: colors.textMuted, marginTop: -4 },
});
