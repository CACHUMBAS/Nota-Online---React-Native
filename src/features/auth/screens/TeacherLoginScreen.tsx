import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text } from 'react-native';
import { Notice } from '../../../shared/components/StateViews.tsx';
import { Screen } from '../../../shared/components/Screen.tsx';
import { useAsyncAction } from '../../../shared/hooks/useAsyncAction.ts';
import { colors, fontSize } from '../../../shared/theme/theme.ts';
import type { RootStackParamList } from '../../../navigation/types.ts';
import { TeacherLoginForm } from '../components/TeacherLoginForm.tsx';
import { signInTeacher } from '../services/authService.ts';

type Props = NativeStackScreenProps<RootStackParamList, 'TeacherLogin'>;

export function TeacherLoginScreen({ navigation }: Props) {
  const login = useAsyncAction(signInTeacher);

  async function handleSubmit(email: string, password: string) {
    const result = await login.run(email, password);
    if (result.ok) navigation.reset({ index: 0, routes: [{ name: 'TeacherSessions' }] });
  }

  return (
    <Screen>
      <Text style={styles.intro}>Accede con la cuenta de profesor preparada para esta asignatura.</Text>
      <TeacherLoginForm busy={login.pending} onSubmit={(email, password) => void handleSubmit(email, password)} />
      {login.error ? <Notice kind="error" message={login.error.message} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({ intro: { fontSize: fontSize.body, color: colors.text } });
