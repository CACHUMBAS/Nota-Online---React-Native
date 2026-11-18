import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useLayoutEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { signOut } from '../../auth/services/authService.ts';
import { HeaderButton } from '../../../shared/components/HeaderButton.tsx';
import { Screen } from '../../../shared/components/Screen.tsx';
import { EmptyState, ErrorState, LoadingState, Notice } from '../../../shared/components/StateViews.tsx';
import { useAsyncAction } from '../../../shared/hooks/useAsyncAction.ts';
import { colors, fontSize, spacing } from '../../../shared/theme/theme.ts';
import type { RootStackParamList } from '../../../navigation/types.ts';
import { SessionCard } from '../components/SessionCard.tsx';
import { SessionForm } from '../components/SessionForm.tsx';
import { useClassroomList } from '../hooks/useClassroomList.ts';
import { createClassroom } from '../services/sessionsService.ts';

type Props = NativeStackScreenProps<RootStackParamList, 'TeacherSessions'>;

export function TeacherSessionsScreen({ navigation }: Props) {
  const { rooms, error, reload } = useClassroomList();
  const create = useAsyncAction(createClassroom);
  const leave = useAsyncAction(signOut);
  const runSignOut = leave.run;

  const handleSignOut = useCallback(async () => {
    const result = await runSignOut();
    if (result.ok) navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  }, [runSignOut, navigation]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <HeaderButton label="Cerrar sesión" onPress={() => void handleSignOut()} />,
    });
  }, [navigation, handleSignOut]);

  async function handleCreate(title: string) {
    const result = await create.run(title);
    if (result.ok) navigation.navigate('TeacherRoom', { classroomId: result.value.id });
  }

  if (rooms === null) {
    return (
      <Screen>
        {error ? <ErrorState message={error.message} onAction={() => void reload()} /> : <LoadingState />}
      </Screen>
    );
  }

  return (
    <Screen>
      <SessionForm busy={create.pending} onSubmit={(title) => void handleCreate(title)} />
      {create.error ? <Notice kind="error" message={create.error.message} /> : null}
      {leave.error ? <Notice kind="error" message={leave.error.message} /> : null}
      {error ? <Notice kind="error" message={error.message} /> : null}

      <Text style={styles.heading}>Tus sesiones</Text>
      {rooms.length === 0 ? (
        <EmptyState title="Todavía no tienes sesiones" description="Crea una arriba y comparte su código con los alumnos." />
      ) : (
        <View style={styles.list}>
          {rooms.map((room) => (
            <SessionCard key={room.id} session={room} onPress={() => navigation.navigate('TeacherRoom', { classroomId: room.id })} />
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: fontSize.title, fontWeight: '700', color: colors.text },
  list: { gap: spacing.sm },
});
