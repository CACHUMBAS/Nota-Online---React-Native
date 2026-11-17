import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing } from '../../../shared/theme/theme.ts';
import { formatAverage, formatVoteCount } from '../../voting/domain/rules.ts';

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
  return (
    <View accessible accessibilityLabel={label} style={styles.row}>
      <Text style={styles.average}>{formatAverage(average)}</Text>
      {average !== null && voteCount !== null ? <Text style={styles.count}>{formatVoteCount(voteCount)}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  average: { fontSize: fontSize.title, fontWeight: '800', color: colors.text },
  count: { fontSize: fontSize.small, color: colors.textMuted },
});
