import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fontSize, radius, spacing, touchTarget } from '../../../shared/theme/theme.ts';
import type { ClassroomSession } from '../../../shared/domain/classroom.ts';

interface SessionCardProps {
  session: ClassroomSession;
  onPress: () => void;
}

export function SessionCard({ session, onPress }: SessionCardProps) {
  const date = new Date(session.created_at).toLocaleDateString('es-ES');
  const state = session.status === 'active' ? 'Activa' : 'Cerrada';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${session.title}, código ${session.code}, ${state}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Text style={styles.title}>{session.title}</Text>
      <Text style={styles.meta}>Código {session.code} · {state} · {date}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: touchTarget,
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.8 },
  title: { fontSize: fontSize.body, fontWeight: '700', color: colors.text },
  meta: { fontSize: fontSize.small, color: colors.textMuted },
});
