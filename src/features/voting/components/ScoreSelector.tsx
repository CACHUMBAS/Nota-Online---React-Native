import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, shadows, spacing } from '../../../shared/theme/theme.ts';

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
            style={({ pressed }) => [
              styles.cell,
              selected && styles.cellSelected,
              pressed && !selected && styles.cellPressed,
              disabled && styles.cellDisabled,
            ]}
          >
            <Text style={[styles.cellText, selected && styles.cellTextSelected]}>{score}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm + 2 },
  cell: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
    transform: [{ scale: 1.08 }],
    ...shadows.raised,
  },
  cellPressed: { backgroundColor: colors.primarySoft },
  cellDisabled: { opacity: 0.5 },
  cellText: { fontSize: fontSize.title + 2, fontWeight: '800', color: colors.text },
  cellTextSelected: { color: colors.onPrimary },
});
