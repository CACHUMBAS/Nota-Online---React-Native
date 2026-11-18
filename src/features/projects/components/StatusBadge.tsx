import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '../../../shared/theme/theme.ts';
import type { ProjectStatus } from '../../../shared/domain/classroom.ts';
import { STATUS_LABELS } from '../domain/projects.ts';

const BACKGROUNDS: Record<ProjectStatus, string> = {
  pending: colors.pendingSoft,
  open: colors.successSoft,
  closed: colors.infoSoft,
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <View style={[styles.badge, { backgroundColor: BACKGROUNDS[status] }]}>
      <Text style={styles.text}>{STATUS_LABELS[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  text: { fontSize: fontSize.small, fontWeight: '700', color: colors.text },
});
