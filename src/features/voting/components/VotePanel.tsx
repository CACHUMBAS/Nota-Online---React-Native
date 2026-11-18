import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../shared/components/Button.tsx';
import { Notice } from '../../../shared/components/StateViews.tsx';
import { colors, fontSize, radius, spacing } from '../../../shared/theme/theme.ts';
import type { Project } from '../../sessions/types.ts';
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
      <View style={styles.confirmed} accessible accessibilityLiveRegion="polite">
        <Text style={styles.confirmedTitle}>Voto registrado</Text>
        <Text style={styles.confirmedScore}>{project.my_score}</Text>
        <Text style={styles.hint}>Tu voto ya está guardado en el servidor y no se puede cambiar.</Text>
      </View>
    );
  }

  return (
    <View style={styles.panel}>
      <Text style={styles.prompt}>Elige tu nota</Text>
      <ScoreSelector value={selected} onChange={setSelected} disabled={submitting} />
      {errorMessage ? <Notice kind="error" message={errorMessage} /> : null}
      <Button
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
  prompt: { fontSize: fontSize.title, fontWeight: '700', color: colors.text },
  confirmed: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.successSoft,
  },
  confirmedTitle: { fontSize: fontSize.title, fontWeight: '700', color: colors.success },
  confirmedScore: { fontSize: 56, fontWeight: '800', color: colors.success },
  hint: { fontSize: fontSize.small, color: colors.textMuted, textAlign: 'center' },
});
