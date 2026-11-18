import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text } from 'react-native';
import { Notice } from '../../../shared/components/StateViews.tsx';
import { Screen } from '../../../shared/components/Screen.tsx';
import { useAsyncAction } from '../../../shared/hooks/useAsyncAction.ts';
import { colors, fontSize } from '../../../shared/theme/theme.ts';
import type { RootStackParamList } from '../../../navigation/types.ts';
import { JoinForm } from '../components/JoinForm.tsx';
import { joinAsStudent } from '../services/joinFlow.ts';

type Props = NativeStackScreenProps<RootStackParamList, 'StudentJoin'>;

export function StudentJoinScreen({ navigation }: Props) {
  const join = useAsyncAction(joinAsStudent);

  async function handleSubmit(code: string, alias: string) {
    const result = await join.run(code, alias);
    if (result.ok) {
      navigation.reset({ index: 0, routes: [{ name: 'StudentRoom', params: { classroomId: result.value } }] });
    }
  }

  return (
    <Screen>
      <Text style={styles.intro}>Escribe el código que muestra el profesor y un alias para identificarte en la sesión.</Text>
      <JoinForm busy={join.pending} onSubmit={(code, alias) => void handleSubmit(code, alias)} />
      {join.error ? <Notice kind="error" message={join.error.message} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({ intro: { fontSize: fontSize.body, color: colors.text } });
