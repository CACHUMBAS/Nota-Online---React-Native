import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../shared/components/Button.tsx';
import { Screen } from '../../../shared/components/Screen.tsx';
import { EmptyState, ErrorState, LoadingState, Notice } from '../../../shared/components/StateViews.tsx';
import { useAsyncAction } from '../../../shared/hooks/useAsyncAction.ts';
import { ERROR_MESSAGES } from '../../../shared/lib/errors.ts';
import { confirmAction } from '../../../shared/lib/confirm.ts';
import { colors, fontSize, radius, spacing } from '../../../shared/theme/theme.ts';
import type { RootStackParamList } from '../../../navigation/types.ts';
import { ProjectCard } from '../../projects/components/ProjectCard.tsx';
import { ProjectForm } from '../../projects/components/ProjectForm.tsx';
import { findOpenProject } from '../../projects/domain/projects.ts';
import { addProject, setProjectState } from '../../projects/services/projectsService.ts';
import { useClassroomSnapshot } from '../hooks/useClassroomSnapshot.ts';
import { closeClassroom } from '../services/sessionsService.ts';
import type { Project } from '../types.ts';

type Props = NativeStackScreenProps<RootStackParamList, 'TeacherRoom'>;

/** Panel del profesor: código, trabajos, apertura/cierre de votaciones, recuento y cierre de la sesión. */
export function TeacherRoomScreen({ route }: Props) {
  const { classroomId } = route.params;
  const { snapshot, error, loading, refresh } = useClassroomSnapshot(classroomId);
  const add = useAsyncAction(addProject);
  const changeState = useAsyncAction(setProjectState);
  const close = useAsyncAction(closeClassroom);

  if (!snapshot) {
    return (
      <Screen>
        {loading ? <LoadingState /> : <ErrorState message={error?.message ?? ERROR_MESSAGES.unknown} onAction={() => void refresh()} />}
      </Screen>
    );
  }
  if (!snapshot.is_owner) {
    return (
      <Screen>
        <ErrorState message={ERROR_MESSAGES.access_denied} />
      </Screen>
    );
  }

  const { session, projects } = snapshot;
  const active = session.status === 'active';
  const canOpen = active && findOpenProject(projects) === null;
  const busy = add.pending || changeState.pending || close.pending;
  const actionError = add.error ?? changeState.error ?? close.error;

  async function handleAdd(title: string, author: string): Promise<boolean> {
    const result = await add.run(classroomId, title, author);
    if (result.ok) await refresh();
    return result.ok;
  }

  // Tras abrir/cerrar se vuelve a pedir el estado también si falla: el servidor decide qué es válido.
  async function handleState(project: Project, state: 'open' | 'closed') {
    await changeState.run(project.id, state);
    await refresh();
  }

  async function handleCloseSession() {
    await close.run(classroomId);
    await refresh();
  }

  return (
    <Screen>
      <View style={styles.codeCard}>
        <Text style={styles.codeLabel}>Código para los alumnos</Text>
        <Text selectable accessibilityLabel={`Código ${session.code.split('').join(' ')}`} style={styles.code}>
          {session.code}
        </Text>
        <Text style={styles.meta}>
          {snapshot.participant_count === 1 ? '1 alumno ha entrado' : `${snapshot.participant_count} alumnos han entrado`}
        </Text>
      </View>

      {error ? <Notice kind="info" message={`No se pudo actualizar: ${error.message} Se reintentará solo.`} /> : null}
      {actionError ? <Notice kind="error" message={actionError.message} /> : null}
      {!active ? <Notice kind="info" message="La sesión está cerrada. Ya no se pueden añadir trabajos ni votar." /> : null}

      {active ? <ProjectForm busy={add.pending} onSubmit={handleAdd} /> : null}

      <Text style={styles.heading}>Trabajos</Text>
      {projects.length === 0 ? (
        <EmptyState title="Aún no hay trabajos" description="Añade el primero para poder abrir su votación." />
      ) : (
        <View style={styles.list}>
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              canOpen={canOpen}
              busy={busy}
              onOpen={() => void handleState(project, 'open')}
              onClose={() =>
                confirmAction(
                  'Cerrar votación',
                  `Se cerrará la votación de «${project.title}» y se mostrarán los resultados. No se puede reabrir.`,
                  'Cerrar votación',
                  () => void handleState(project, 'closed'),
                )
              }
            />
          ))}
        </View>
      )}

      {active ? (
        <Button
          label="Cerrar la sesión de clase"
          variant="danger"
          loading={close.pending}
          disabled={busy && !close.pending}
          onPress={() =>
            confirmAction(
              'Cerrar la sesión',
              'Se cerrará la votación abierta y los alumnos ya no podrán votar. No se puede deshacer.',
              'Cerrar sesión',
              () => void handleCloseSession(),
            )
          }
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  codeCard: {
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  codeLabel: { fontSize: fontSize.small, color: colors.textMuted },
  code: { fontSize: 44, fontWeight: '800', letterSpacing: 6, color: colors.primary },
  meta: { fontSize: fontSize.small, color: colors.textMuted },
  heading: { fontSize: fontSize.title, fontWeight: '700', color: colors.text },
  list: { gap: spacing.sm },
});
