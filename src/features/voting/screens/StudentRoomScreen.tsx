import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useLayoutEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '../../../shared/components/Card.tsx';
import { HeaderButton } from '../../../shared/components/HeaderButton.tsx';
import { Screen } from '../../../shared/components/Screen.tsx';
import { EmptyState, ErrorState, LoadingState, Notice } from '../../../shared/components/StateViews.tsx';
import { useAsyncAction } from '../../../shared/hooks/useAsyncAction.ts';
import { ERROR_MESSAGES } from '../../../shared/lib/errors.ts';
import { colors, fontSize, radius, spacing } from '../../../shared/theme/theme.ts';
import type { RootStackParamList } from '../../../navigation/types.ts';
import { closedProjects, findOpenProject } from '../../projects/domain/projects.ts';
import { ResultsList } from '../../results/components/ResultsList.tsx';
import { useClassroomSnapshot } from '../../sessions/hooks/useClassroomSnapshot.ts';
import { clearLastClassroom } from '../../sessions/services/lastClassroomStorage.ts';
import { VotePanel } from '../components/VotePanel.tsx';
import { submitScore } from '../services/votingService.ts';

type Props = NativeStackScreenProps<RootStackParamList, 'StudentRoom'>;

/** Pantalla del alumno: trabajo activo y voto, estado de espera o resultados de los trabajos cerrados. */
export function StudentRoomScreen({ navigation, route }: Props) {
  const { classroomId } = route.params;
  const { snapshot, error, loading, refresh } = useClassroomSnapshot(classroomId);
  const vote = useAsyncAction(submitScore);
  const clearVoteError = vote.clearError;
  const openProject = snapshot ? findOpenProject(snapshot.projects) : null;
  const openProjectId = openProject?.id;
  const sessionTitle = snapshot?.session.title ?? 'Sesión';

  const leave = useCallback(async () => {
    await clearLastClassroom();
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  }, [navigation]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: sessionTitle,
      headerRight: () => <HeaderButton label="Salir" onPress={() => void leave()} />,
    });
  }, [navigation, leave, sessionTitle]);

  // Un error de voto de un trabajo no debe arrastrarse al siguiente.
  useEffect(() => {
    clearVoteError();
  }, [openProjectId, clearVoteError]);

  async function handleConfirm(project: { id: string }, score: number) {
    await vote.run(project.id, score);
    // Siempre se vuelve a consultar: si falló la red pero el voto llegó, aparecerá como registrado.
    await refresh();
  }

  if (!snapshot) {
    if (loading) {
      return (
        <Screen>
          <LoadingState />
        </Screen>
      );
    }
    const lostAccess = error?.code === 'access_denied';
    return (
      <Screen>
        <ErrorState
          message={error?.message ?? ERROR_MESSAGES.unknown}
          actionLabel={lostAccess ? 'Volver al inicio' : 'Reintentar'}
          onAction={() => void (lostAccess ? leave() : refresh())}
        />
      </Screen>
    );
  }

  const { session, projects } = snapshot;
  const finished = closedProjects(projects);

  return (
    <Screen>
      {error ? <Notice kind="info" message={`No se pudo actualizar: ${error.message} Se reintentará solo.`} /> : null}
      {session.status === 'closed' ? <Notice kind="info" message="La sesión ha terminado. Estos son los resultados." /> : null}

      {openProject && session.status === 'active' ? (
        <Card style={styles.card}>
          <Text style={styles.label}>🗳️ Se está votando</Text>
          <Text style={styles.title}>{openProject.title}</Text>
          {openProject.author ? <Text style={styles.author}>{openProject.author}</Text> : null}
          <VotePanel
            key={openProject.id}
            project={openProject}
            submitting={vote.pending}
            errorMessage={vote.error?.message ?? null}
            onConfirm={(score) => void handleConfirm(openProject, score)}
          />
        </Card>
      ) : session.status === 'active' ? (
        <EmptyState icon="⏳" title="Esperando el siguiente trabajo" description="El profesor abrirá la votación enseguida. Esta pantalla se actualiza sola." />
      ) : null}

      {finished.length > 0 ? (
        <>
          <Text style={styles.heading}>Resultados</Text>
          <ResultsList projects={finished} showMyScore />
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md, padding: spacing.lg },
  label: { fontSize: fontSize.small, fontWeight: '800', color: colors.warning },
  title: { fontSize: fontSize.heading, fontWeight: '800', color: colors.text },
  author: { fontSize: fontSize.body, color: colors.textMuted },
  heading: { fontSize: fontSize.title, fontWeight: '800', color: colors.text, marginTop: spacing.sm },
});
