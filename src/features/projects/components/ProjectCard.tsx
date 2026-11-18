import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../shared/components/Button.tsx';
import { colors, fontSize, radius, spacing } from '../../../shared/theme/theme.ts';
import { ResultSummary } from '../../results/components/ResultSummary.tsx';
import { formatVoteCount } from '../../voting/domain/rules.ts';
import type { Project } from '../../../shared/domain/classroom.ts';
import { StatusBadge } from './StatusBadge.tsx';

interface ProjectCardProps {
  project: Project;
  /** false si la sesión está cerrada o ya hay otra votación abierta (el servidor también lo impide). */
  canOpen: boolean;
  /** Hay una acción en curso: se bloquean los botones. */
  busy: boolean;
  onOpen: () => void;
  onClose: () => void;
}

/** Trabajo visto por el profesor, con la acción que corresponde a su estado. */
export function ProjectCard({ project, canOpen, busy, onOpen, onClose }: ProjectCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titles}>
          <Text style={styles.title}>{project.title}</Text>
          {project.author ? <Text style={styles.author}>{project.author}</Text> : null}
        </View>
        <StatusBadge status={project.status} />
      </View>

      {project.status === 'open' ? (
        <Text style={styles.votes}>Han votado: {formatVoteCount(project.vote_count ?? 0)}</Text>
      ) : null}
      {project.status === 'closed' ? <ResultSummary average={project.average} voteCount={project.vote_count} /> : null}

      {project.status === 'pending' ? (
        <Button
          label="Abrir votación"
          disabled={!canOpen || busy}
          accessibilityHint={canOpen ? undefined : 'No disponible: hay otra votación abierta o la sesión está cerrada.'}
          onPress={onOpen}
        />
      ) : null}
      {project.status === 'open' ? <Button label="Cerrar votación" variant="danger" disabled={busy} onPress={onClose} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  titles: { flex: 1, gap: 2 },
  title: { fontSize: fontSize.body, fontWeight: '700', color: colors.text },
  author: { fontSize: fontSize.small, color: colors.textMuted },
  votes: { fontSize: fontSize.body, color: colors.text },
});
