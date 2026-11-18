import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../shared/components/Button.tsx';
import { FormField } from '../../../shared/components/FormField.tsx';
import { MAX_TITLE_LENGTH } from '../../../shared/lib/config.ts';
import { validationMessage } from '../../../shared/lib/validation.ts';
import { colors, fontSize, radius, spacing } from '../../../shared/theme/theme.ts';
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
    <View style={styles.form}>
      <Text style={styles.heading}>Nueva sesión de clase</Text>
      <FormField
        label="Título de la sesión"
        value={title}
        onChangeText={setTitle}
        error={error}
        editable={!busy}
        maxLength={MAX_TITLE_LENGTH}
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
      />
      <Button label="Crear sesión" loading={busy} onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heading: { fontSize: fontSize.title, fontWeight: '700', color: colors.text },
});
