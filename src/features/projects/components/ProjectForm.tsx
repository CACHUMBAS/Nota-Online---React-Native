import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../shared/components/Button.tsx';
import { FormField } from '../../../shared/components/FormField.tsx';
import { MAX_TITLE_LENGTH } from '../../../shared/lib/config.ts';
import { validationMessage } from '../../../shared/lib/validation.ts';
import { colors, fontSize, radius, spacing } from '../../../shared/theme/theme.ts';
import { cleanOptionalText, cleanText } from '../../voting/domain/rules.ts';

interface ProjectFormProps {
  busy: boolean;
  /** Devuelve true si el servidor aceptó el trabajo; entonces el formulario se vacía. */
  onSubmit: (title: string, author: string) => Promise<boolean>;
}

export function ProjectForm({ busy, onSubmit }: ProjectFormProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [errors, setErrors] = useState<{ title?: string; author?: string }>({});

  async function handleSubmit() {
    const next: { title?: string; author?: string } = {};
    let cleanTitle = '';
    let cleanAuthor = '';
    try {
      cleanTitle = cleanText(title, MAX_TITLE_LENGTH);
    } catch (error) {
      next.title = validationMessage(error);
    }
    try {
      cleanAuthor = cleanOptionalText(author, MAX_TITLE_LENGTH);
    } catch (error) {
      next.author = validationMessage(error);
    }
    setErrors(next);
    if (next.title || next.author) return;
    if (await onSubmit(cleanTitle, cleanAuthor)) {
      setTitle('');
      setAuthor('');
    }
  }

  return (
    <View style={styles.form}>
      <Text style={styles.heading}>Añadir trabajo</Text>
      <FormField label="Título del trabajo" value={title} onChangeText={setTitle} error={errors.title} editable={!busy} maxLength={MAX_TITLE_LENGTH} />
      <FormField label="Autor o grupo (opcional)" value={author} onChangeText={setAuthor} error={errors.author} editable={!busy} maxLength={MAX_TITLE_LENGTH} />
      <Button label="Añadir trabajo" variant="secondary" loading={busy} onPress={() => void handleSubmit()} />
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
