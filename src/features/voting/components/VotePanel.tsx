import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../shared/components/Button.tsx';
import { Card } from '../../../shared/components/Card.tsx';
import { Notice } from '../../../shared/components/StateViews.tsx';
import { colors, fontSize, spacing } from '../../../shared/theme/theme.ts';
import type { Project } from '../../../shared/domain/classroom.ts';
import { ScoreSelector } from './ScoreSelector.tsx';

interface VotePanelProps {
  /** Trabajo abierto a votación. `my_score` lo envía el servidor: si no es null, el voto ya está registrado. */
  project: Project;
  submitting: boolean;
  /** Error del último envío, ya traducido; solo se muestra mientras el voto no conste en el servidor. */
  errorMessage: string | null;
  onConfirm: (score: number) => void;
}

/**
 * Elegir y confirmar la nota. La nota elegida es solo estado de pantalla; el voto se considera
 * confirmado únicamente cuando el servidor lo devuelve en `my_score`. Debe montarse con
 * `key={project.id}` para que cada trabajo empiece sin nota seleccionada.
 */
export function VotePanel({ project, submitting, errorMessage, onConfirm }: VotePanelProps) {
  const [selected, setSelected] = useState<number | null>(null);

  if (project.my_score !== null) {
    return (
      <Card tone="success" style={styles.confirmed}>
        <View accessible accessibilityLiveRegion="polite" accessibilityLabel={`Voto registrado. Tu nota: ${project.my_score}`} style={styles.confirmedInner}>
          <Text accessible={false} importantForAccessibility="no" style={styles.check}>✅</Text>
          <Text style={styles.confirmedTitle}>Voto registrado</Text>
          <Text style={styles.confirmedScore}>{project.my_score}</Text>
          <Text style={styles.hint}>Tu voto ya está guardado y no se puede cambiar. Cuando el profesor cierre la votación verás la media.</Text>
        </View>
      </Card>
    );
  }

  return (
    <View style={styles.panel}>
      <Text style={styles.prompt}>Elige tu nota</Text>
      <Text style={styles.hint}>De 0 (la más baja) a 10 (la más alta).</Text>
      <ScoreSelector value={selected} onChange={setSelected} disabled={submitting} />
      <Text accessibilityLiveRegion="polite" style={styles.selection}>
        {selected === null ? 'Todavía no has elegido ninguna nota' : `Tu nota: ${selected}`}
      </Text>
      {errorMessage ? <Notice kind="error" message={errorMessage} /> : null}
      <Button
        icon="✅"
        label="Confirmar voto"
        loading={submitting}
        disabled={selected === null}
        accessibilityHint="Envía tu nota. Una vez registrada no se puede cambiar."
        onPress={() => {
          if (selected !== null) onConfirm(selected);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { gap: spacing.md },
  prompt: { fontSize: fontSize.title, fontWeight: '800', color: colors.text },
  selection: { fontSize: fontSize.body, fontWeight: '700', color: colors.text },
  confirmed: { alignItems: 'center', padding: spacing.lg },
  confirmedInner: { alignItems: 'center', gap: spacing.sm },
  check: { fontSize: 36 },
  confirmedTitle: { fontSize: fontSize.title, fontWeight: '800', color: colors.success },
  confirmedScore: { fontSize: 64, fontWeight: '800', color: colors.success },
  hint: { fontSize: fontSize.small, color: colors.textMuted, textAlign: 'center' },
});
