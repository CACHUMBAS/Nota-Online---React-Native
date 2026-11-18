import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../../shared/components/Screen.tsx';
import { colors, fontSize, radius, shadows, spacing } from '../../../shared/theme/theme.ts';
import type { RootStackParamList } from '../../../navigation/types.ts';
import { useAuth } from '../AuthContext.tsx';
import { RoleCard } from '../components/RoleCard.tsx';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const auth = useAuth();
  const teacherSignedIn = auth.status === 'signedIn' && !auth.isAnonymous;

  return (
    <Screen edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.hero}>
        <View style={styles.logo}>
          <Text accessible={false} importantForAccessibility="no" style={styles.logoEmoji}>🗳️</Text>
        </View>
        <Text style={styles.title} accessibilityRole="header">Nota Online</Text>
        <Text style={styles.subtitle}>Una voz para cada trabajo.</Text>
        <Text style={styles.lead}>Vota la nota de los trabajos que se presentan en clase.</Text>
      </View>

      <View style={styles.actions}>
        <Text style={styles.question}>¿Cómo quieres entrar?</Text>
        <RoleCard
          icon="🎓"
          title="Soy alumno"
          description="Entra con el código de tu profesor y vota."
          onPress={() => navigation.navigate('StudentJoin')}
        />
        <RoleCard
          icon="🏫"
          title="Soy profesor"
          description="Crea sesiones, añade trabajos y abre las votaciones."
          onPress={() => navigation.navigate(teacherSignedIn ? 'TeacherSessions' : 'TeacherLogin')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.sm, paddingTop: spacing.lg },
  logo: {
    width: 88,
    height: 88,
    borderRadius: radius.lg + 6,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    ...shadows.raised,
  },
  logoEmoji: { fontSize: 44 },
  title: { fontSize: fontSize.display, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: fontSize.title, fontWeight: '700', color: colors.primary },
  lead: { fontSize: fontSize.body, color: colors.textMuted, textAlign: 'center', maxWidth: 300 },
  actions: { gap: spacing.md, paddingBottom: spacing.lg },
  question: { fontSize: fontSize.small, fontWeight: '800', color: colors.textMuted, letterSpacing: 0.5, textTransform: 'uppercase' },
});
