import { Pressable, StyleSheet, Text, View } from 'react-native';
import { cardStyles } from '../../../shared/components/Card.tsx';
import { colors, fontSize, radius, spacing } from '../../../shared/theme/theme.ts';

interface RoleCardProps {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
}

/** Tarjeta grande para elegir cómo entrar (alumno o profesor), con una frase que explica qué se puede hacer. */
export function RoleCard({ icon, title, description, onPress }: RoleCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${description}`}
      onPress={onPress}
      style={({ pressed }) => [cardStyles.base, styles.row, pressed && styles.pressed]}
    >
      <View style={styles.iconBox}>
        <Text accessible={false} importantForAccessibility="no" style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.texts}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <Text accessible={false} importantForAccessibility="no" style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md + 4 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 30 },
  texts: { flex: 1, gap: 2 },
  title: { fontSize: fontSize.title, fontWeight: '800', color: colors.text },
  description: { fontSize: fontSize.small, color: colors.textMuted },
  chevron: { fontSize: fontSize.heading, color: colors.textMuted, marginTop: -4 },
});
