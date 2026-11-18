import { StyleSheet, Text, View } from 'react-native';
import { Card } from '../../../shared/components/Card.tsx';
import { colors, fontSize, spacing } from '../../../shared/theme/theme.ts';
import type { NextStep } from '../domain/nextStep.ts';

/** «Qué hago ahora»: un paso claro y destacado, calculado por `teacherNextStep`. */
export function NextStepCard({ step }: { step: NextStep }) {
  return (
    <Card tone={step.tone} style={styles.card}>
      <View accessible accessibilityLabel={`Siguiente paso. ${step.title}. ${step.detail}`} accessibilityLiveRegion="polite" style={styles.row}>
        <Text accessible={false} importantForAccessibility="no" style={styles.icon}>{step.icon}</Text>
        <View style={styles.texts}>
          <Text style={styles.kicker}>Siguiente paso</Text>
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.detail}>{step.detail}</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.md },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  icon: { fontSize: 32 },
  texts: { flex: 1, gap: 2 },
  kicker: { fontSize: fontSize.caption, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', color: colors.textMuted },
  title: { fontSize: fontSize.title, fontWeight: '800', color: colors.text },
  detail: { fontSize: fontSize.body, color: colors.text },
});
