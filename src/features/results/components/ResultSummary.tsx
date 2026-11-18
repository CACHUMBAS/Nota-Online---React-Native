import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '../../../shared/theme/theme.ts';
import { formatAverage, formatVoteCount } from '../../../shared/domain/format.ts';

interface ResultSummaryProps {
  /** null = sin votos. El servidor solo envía la media con el trabajo cerrado. */
  average: number | null;
  voteCount: number | null;
}

/** Media y número de votos de un trabajo cerrado. Sin votos se muestra «Sin votos», nunca un 0. */
export function ResultSummary({ average, voteCount }: ResultSummaryProps) {
  const label =
    average === null
      ? 'Sin votos'
      : `Media ${formatAverage(average)}${voteCount === null ? '' : `, ${formatVoteCount(voteCount)}`}`;
  const empty = average === null;
  return (
    <View accessible accessibilityLabel={label} style={[styles.pill, empty ? styles.pillEmpty : styles.pillValue]}>
      <Text style={[styles.average, empty && styles.averageEmpty]}>{formatAverage(average)}</Text>
      {!empty && voteCount !== null ? <Text style={styles.count}>{formatVoteCount(voteCount)}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: 0,
    minWidth: 76,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  pillValue: { backgroundColor: colors.primarySoft },
  pillEmpty: { backgroundColor: colors.pendingSoft },
  average: { fontSize: fontSize.heading, fontWeight: '800', color: colors.primaryDark },
  averageEmpty: { fontSize: fontSize.body + 1, color: colors.textMuted },
  count: { fontSize: fontSize.caption + 1, fontWeight: '700', color: colors.textMuted },
});
