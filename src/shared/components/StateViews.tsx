import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '../theme/theme.ts';
import { Button } from './Button.tsx';
import { Card } from './Card.tsx';

/** Emoji decorativo: no se anuncia con lector de pantalla, el texto de al lado ya dice lo mismo. */
function Emoji({ children, size }: { children: string; size: number }) {
  return (
    <Text accessible={false} importantForAccessibility="no" accessibilityElementsHidden style={{ fontSize: size }}>
      {children}
    </Text>
  );
}

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
      <Emoji size={40}>⚠️</Emoji>
      <Text accessibilityRole="alert" style={styles.errorText}>{message}</Text>
      {onAction ? <Button label={actionLabel} onPress={onAction} variant="secondary" /> : null}
    </View>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  /** Emoji ilustrativo opcional. */
  icon?: string;
}

/** Pantalla o sección sin contenido: dice qué pasa y qué hacer a continuación. */
export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <Card style={styles.empty}>
      {icon ? <Emoji size={36}>{icon}</Emoji> : null}
      <Text style={styles.emptyTitle}>{title}</Text>
      {description ? <Text style={styles.muted}>{description}</Text> : null}
    </Card>
  );
}

type NoticeKind = 'error' | 'success' | 'info';

const NOTICE_ICONS: Record<NoticeKind, string> = { error: '⚠️', success: '✅', info: 'ℹ️' };

/** Mensaje en línea (error de una acción, confirmación, aviso). */
export function Notice({ kind, message }: { kind: NoticeKind; message: string }) {
  return (
    <View
      accessibilityRole={kind === 'error' ? 'alert' : undefined}
      accessibilityLiveRegion="polite"
      style={[styles.notice, noticeStyles[kind]]}
    >
      <Emoji size={fontSize.title}>{NOTICE_ICONS[kind]}</Emoji>
      <Text style={[styles.noticeText, { color: noticeText[kind] }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.lg },
  muted: { color: colors.textMuted, fontSize: fontSize.body, textAlign: 'center' },
  errorText: { color: colors.danger, fontSize: fontSize.body, textAlign: 'center' },
  empty: { alignItems: 'center', padding: spacing.lg },
  emptyTitle: { color: colors.text, fontSize: fontSize.title, fontWeight: '700', textAlign: 'center' },
  notice: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md },
  noticeText: { flex: 1, fontSize: fontSize.body },
});

const noticeStyles = StyleSheet.create({
  error: { backgroundColor: colors.dangerSoft },
  success: { backgroundColor: colors.successSoft },
  info: { backgroundColor: colors.infoSoft },
});

const noticeText = { error: colors.danger, success: colors.success, info: colors.text } as const;
