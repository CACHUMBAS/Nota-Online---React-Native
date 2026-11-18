import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Button } from '../../../shared/components/Button.tsx';
import { Card } from '../../../shared/components/Card.tsx';
import { FormField } from '../../../shared/components/FormField.tsx';
import { MAX_TITLE_LENGTH } from '../../../shared/lib/config.ts';
import { validationMessage } from '../../../shared/lib/validation.ts';
import { colors, fontSize, spacing } from '../../../shared/theme/theme.ts';
import { cleanText } from '../../../shared/domain/text.ts';

interface SessionFormProps {
  busy: boolean;
  onSubmit: (title: string) => void;
}

export function SessionForm({ busy, onSubmit }: SessionFormProps) {
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    try {
      const clean = cleanText(title, MAX_TITLE_LENGTH);
      setError(null);
      onSubmit(clean);
    } catch (caught) {
      setError(validationMessage(caught));
    }
  }

  return (
    <Card style={styles.form}>
      <Text style={styles.heading} accessibilityRole="header">Nueva sesión de clase</Text>
      <FormField
        label="Título de la sesión"
        hint="Por ejemplo: «3º B · Presentaciones de Historia». Lo verán los alumnos."
        value={title}
        onChangeText={setTitle}
        error={error}
        editable={!busy}
        maxLength={MAX_TITLE_LENGTH}
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
      />
      <Button icon="➕" label="Crear sesión" loading={busy} onPress={handleSubmit} />
    </Card>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.md },
  heading: { fontSize: fontSize.title, fontWeight: '800', color: colors.text },
});
