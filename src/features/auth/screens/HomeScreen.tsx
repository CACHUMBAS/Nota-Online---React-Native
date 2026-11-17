import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../shared/components/Button.tsx';
import { Screen } from '../../../shared/components/Screen.tsx';
import { colors, fontSize, spacing } from '../../../shared/theme/theme.ts';
import type { RootStackParamList } from '../../../navigation/types.ts';
import { useAuth } from '../AuthContext.tsx';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const auth = useAuth();
  const teacherSignedIn = auth.status === 'signedIn' && !auth.isAnonymous;

  return (
    <Screen edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.hero}>
        <Text style={styles.title}>Nota Online</Text>
        <Text style={styles.subtitle}>Una voz para cada trabajo.</Text>
      </View>
      <View style={styles.actions}>
        <Button label="Soy alumno" onPress={() => navigation.navigate('StudentJoin')} />
        <Button
          label="Soy profesor"
          variant="secondary"
          onPress={() => navigation.navigate(teacherSignedIn ? 'TeacherSessions' : 'TeacherLogin')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { flex: 1, justifyContent: 'center', gap: spacing.sm },
  title: { fontSize: 36, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: fontSize.title, color: colors.textMuted },
  actions: { gap: spacing.md, paddingBottom: spacing.lg },
});
