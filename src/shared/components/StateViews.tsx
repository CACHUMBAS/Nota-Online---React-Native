import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '../theme/theme.ts';
import { Button } from './Button.tsx';

export function LoadingState({ label = 'Cargando…' }: { label?: string }) {
  return (
    <View style={styles.center} accessibilityRole="progressbar" accessibilityLabel={label}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.muted}>{label}</Text>
    </View>
  );
}

interface ErrorStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Error que impide mostrar la pantalla. Con `onAction` ofrece una salida (reintentar, volver…). */
export function ErrorState({ message, actionLabel = 'Reintentar', onAction }: ErrorStateProps) {
  return (
    <View style={styles.center}>
      <Text accessibilityRole="alert" style={styles.errorText}>{message}</Text>
      {onAction ? <Button label={actionLabel} onPress={onAction} variant="secondary" /> : null}
    </View>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {description ? <Text style={styles.muted}>{description}</Text> : null}
    </View>
  );
}

type NoticeKind = 'error' | 'success' | 'info';

/** Mensaje en línea (error de una acción, confirmación, aviso). */
export function Notice({ kind, message }: { kind: NoticeKind; message: string }) {
  return (
    <View
      accessibilityRole={kind === 'error' ? 'alert' : undefined}
      accessibilityLiveRegion="polite"
      style={[styles.notice, noticeStyles[kind]]}
    >
      <Text style={[styles.noticeText, { color: noticeText[kind] }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.lg },
  muted: { color: colors.textMuted, fontSize: fontSize.body, textAlign: 'center' },
  errorText: { color: colors.danger, fontSize: fontSize.body, textAlign: 'center' },
  empty: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: { color: colors.text, fontSize: fontSize.title, fontWeight: '700', textAlign: 'center' },
  notice: { padding: spacing.md, borderRadius: radius.md },
  noticeText: { fontSize: fontSize.body },
});

const noticeStyles = StyleSheet.create({
  error: { backgroundColor: colors.dangerSoft },
  success: { backgroundColor: colors.successSoft },
  info: { backgroundColor: colors.infoSoft },
});

const noticeText = { error: colors.danger, success: colors.success, info: colors.text } as const;
