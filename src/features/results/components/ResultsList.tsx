import { StyleSheet, Text, View } from 'react-native';
import { Card } from '../../../shared/components/Card.tsx';
import { colors, fontSize, spacing } from '../../../shared/theme/theme.ts';
import type { Project } from '../../../shared/domain/classroom.ts';
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
        <Card key={project.id} style={styles.item}>
          <View style={styles.text}>
            <Text style={styles.title}>{project.title}</Text>
            {project.author ? <Text style={styles.author}>{project.author}</Text> : null}
            {showMyScore ? (
              <Text style={[styles.author, project.my_score !== null && styles.myScore]}>
                {project.my_score === null ? 'No votaste este trabajo' : `Tu nota: ${project.my_score}`}
              </Text>
            ) : null}
          </View>
          <ResultSummary average={project.average} voteCount={project.vote_count} />
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md },
  text: { flex: 1, gap: 2 },
  title: { fontSize: fontSize.body, fontWeight: '800', color: colors.text },
  author: { fontSize: fontSize.small, color: colors.textMuted },
  myScore: { fontWeight: '800', color: colors.primaryDark },
});
