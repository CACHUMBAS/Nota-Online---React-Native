import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../shared/components/Button.tsx';
import { Card } from '../../../shared/components/Card.tsx';
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
import { NextStepCard } from '../components/NextStepCard.tsx';
import { teacherNextStep } from '../domain/nextStep.ts';
import { useClassroomSnapshot } from '../hooks/useClassroomSnapshot.ts';
import { closeClassroom, deleteClassroom } from '../services/sessionsService.ts';
import type { Project } from '../../../shared/domain/classroom.ts';

type Props = NativeStackScreenProps<RootStackParamList, 'TeacherRoom'>;

/** Panel del profesor: código, trabajos, apertura/cierre de votaciones, recuento, cierre y borrado de la sesión. */
export function TeacherRoomScreen({ navigation, route }: Props) {
  const { classroomId } = route.params;
  const { snapshot, error, loading, refresh } = useClassroomSnapshot(classroomId);
  const add = useAsyncAction(addProject);
  const changeState = useAsyncAction(setProjectState);
  const close = useAsyncAction(closeClassroom);
  const remove = useAsyncAction(deleteClassroom);

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
  const busy = add.pending || changeState.pending || close.pending || remove.pending;
  const actionError = add.error ?? changeState.error ?? close.error ?? remove.error;
  const participantsLabel =
    snapshot.participant_count === 1 ? '1 alumno ha entrado' : `${snapshot.participant_count} alumnos han entrado`;

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

  // Si el servidor la borra, esta pantalla ya no tiene nada que mostrar: se vuelve a «Mis sesiones».
  async function handleDeleteSession() {
    const result = await remove.run(classroomId);
    if (result.ok) navigation.navigate('TeacherSessions');
  }

  return (
    <Screen>
      <Card tone="accent" style={styles.codeCard}>
        <Text style={styles.codeLabel}>Código de la sesión</Text>
        <Text selectable accessibilityLabel={`Código ${session.code.split('').join(' ')}`} style={styles.code}>
          {session.code}
        </Text>
        <Text style={styles.codeHelp}>Enséñalo en la pizarra: los alumnos pulsan «Soy alumno» y lo escriben.</Text>
        <View style={styles.chip} accessible accessibilityLabel={participantsLabel}>
          <Text style={styles.chipText}>👥 {participantsLabel}</Text>
        </View>
      </Card>

      <NextStepCard step={teacherNextStep(snapshot)} />

      {error ? <Notice kind="info" message={`No se pudo actualizar: ${error.message} Se reintentará solo.`} /> : null}
      {actionError ? <Notice kind="error" message={actionError.message} /> : null}

      {active ? <ProjectForm busy={add.pending} onSubmit={handleAdd} /> : null}

      <Text style={styles.heading} accessibilityRole="header">
        Trabajos{projects.length > 0 ? ` (${projects.length})` : ''}
      </Text>
      {projects.length === 0 ? (
        <EmptyState icon="📋" title="Aún no hay trabajos" description="Añade el primero con el formulario de arriba para poder abrir su votación." />
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

      <Text style={styles.caption}>{active ? 'Cuando acabes la clase' : 'Zona de peligro'}</Text>
      {active ? (
        <Button
          icon="🏁"
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

      {!active ? (
        <Button
          icon="🗑️"
          label="Borrar sesión"
          variant="danger"
          loading={remove.pending}
          disabled={busy && !remove.pending}
          accessibilityHint="Borra la sesión, sus trabajos y sus votos para siempre."
          onPress={() =>
            confirmAction(
              'Borrar la sesión',
              `Se borrarán para siempre «${session.title}», sus trabajos, sus participantes y sus votos. No se puede deshacer.`,
              'Borrar sesión',
              () => void handleDeleteSession(),
            )
          }
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  codeCard: { alignItems: 'center', gap: spacing.xs, padding: spacing.lg },
  codeLabel: { fontSize: fontSize.small, fontWeight: '700', color: colors.textMuted },
  code: { fontSize: fontSize.display, fontWeight: '800', letterSpacing: 8, color: colors.primaryDark },
  codeHelp: { fontSize: fontSize.small, color: colors.textMuted, textAlign: 'center' },
  chip: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  chipText: { fontSize: fontSize.small, fontWeight: '700', color: colors.text },
  heading: { fontSize: fontSize.title, fontWeight: '800', color: colors.text, marginTop: spacing.sm },
  caption: { fontSize: fontSize.caption, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', color: colors.textMuted, marginTop: spacing.md },
  list: { gap: spacing.sm },
});
