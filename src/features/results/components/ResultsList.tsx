import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '../../../shared/theme/theme.ts';
import type { Project } from '../../sessions/types.ts';
import { ResultSummary } from './ResultSummary.tsx';

interface ResultsListProps {
  /** Trabajos ya cerrados. */
  projects: readonly Project[];
  /** Muestra «Tu nota» (solo tiene sentido para el alumno). */
  showMyScore?: boolean;
}

export function ResultsList({ projects, showMyScore = false }: ResultsListProps) {
  return (
    <View style={styles.list}>
      {projects.map((project) => (
        <View key={project.id} style={styles.item}>
          <View style={styles.text}>
            <Text style={styles.title}>{project.title}</Text>
            {project.author ? <Text style={styles.author}>{project.author}</Text> : null}
            {showMyScore ? (
              <Text style={styles.author}>{project.my_score === null ? 'No votaste este trabajo' : `Tu nota: ${project.my_score}`}</Text>
            ) : null}
          </View>
          <ResultSummary average={project.average} voteCount={project.vote_count} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: { flex: 1, gap: 2 },
  title: { fontSize: fontSize.body, fontWeight: '700', color: colors.text },
  author: { fontSize: fontSize.small, color: colors.textMuted },
});
