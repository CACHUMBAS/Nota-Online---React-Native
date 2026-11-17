import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '../../../shared/theme/theme.ts';

const SCORES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

interface ScoreSelectorProps {
  /** Nota elegida; null mientras no se haya elegido ninguna (no hay valor preseleccionado). */
  value: number | null;
  onChange: (score: number) => void;
  disabled?: boolean;
}

export function ScoreSelector({ value, onChange, disabled = false }: ScoreSelectorProps) {
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel="Nota de 0 a 10" style={styles.grid}>
      {SCORES.map((score) => {
        const selected = value === score;
        return (
          <Pressable
            key={score}
            accessibilityRole="radio"
            accessibilityLabel={`Nota ${score}`}
            accessibilityState={{ selected, disabled }}
            disabled={disabled}
            onPress={() => onChange(score)}
            style={[styles.cell, selected && styles.cellSelected, disabled && styles.cellDisabled]}
          >
            <Text style={[styles.cellText, selected && styles.cellTextSelected]}>{score}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  cell: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  cellDisabled: { opacity: 0.5 },
  cellText: { fontSize: fontSize.title, fontWeight: '700', color: colors.text },
  cellTextSelected: { color: colors.onPrimary },
});
