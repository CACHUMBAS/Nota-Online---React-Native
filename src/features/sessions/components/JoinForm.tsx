import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '../../../shared/components/Button.tsx';
import { FormField } from '../../../shared/components/FormField.tsx';
import { MAX_ALIAS_LENGTH } from '../../../shared/lib/config.ts';
import { validationMessage } from '../../../shared/lib/validation.ts';
import { spacing } from '../../../shared/theme/theme.ts';
import { cleanText } from '../../../shared/domain/text.ts';
import { normalizeCode } from '../domain/code.ts';

interface JoinFormProps {
  busy: boolean;
  /** Recibe el código normalizado y el alias ya recortado. */
  onSubmit: (code: string, alias: string) => void;
}

export function JoinForm({ busy, onSubmit }: JoinFormProps) {
  const [code, setCode] = useState('');
  const [alias, setAlias] = useState('');
  const [errors, setErrors] = useState<{ code?: string; alias?: string }>({});

  function handleSubmit() {
    const next: { code?: string; alias?: string } = {};
    let cleanCode = '';
    let cleanAlias = '';
    try {
      cleanCode = normalizeCode(code);
    } catch (error) {
      next.code = validationMessage(error);
    }
    try {
      cleanAlias = cleanText(alias, MAX_ALIAS_LENGTH);
    } catch (error) {
      next.alias = validationMessage(error);
    }
    setErrors(next);
    if (next.code || next.alias) return;
    onSubmit(cleanCode, cleanAlias);
  }

  return (
    <View style={styles.form}>
      <FormField
        label="Código de la sesión"
        value={code}
        onChangeText={setCode}
        error={errors.code}
        autoCapitalize="characters"
        maxLength={6}
        editable={!busy}
        returnKeyType="next"
      />
      <FormField
        label="Tu alias"
        value={alias}
        onChangeText={setAlias}
        error={errors.alias}
        maxLength={MAX_ALIAS_LENGTH}
        editable={!busy}
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
      />
      <Button label="Entrar" loading={busy} onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({ form: { gap: spacing.md } });
