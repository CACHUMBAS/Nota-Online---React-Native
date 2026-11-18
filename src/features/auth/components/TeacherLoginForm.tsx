import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '../../../shared/components/Button.tsx';
import { FormField } from '../../../shared/components/FormField.tsx';
import { spacing } from '../../../shared/theme/theme.ts';

interface TeacherLoginFormProps {
  busy: boolean;
  onSubmit: (email: string, password: string) => void;
}

export function TeacherLoginForm({ busy, onSubmit }: TeacherLoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  function handleSubmit() {
    const next: { email?: string; password?: string } = {};
    if (!email.trim()) next.email = 'Introduce tu correo.';
    if (!password) next.password = 'Introduce tu contraseña.';
    setErrors(next);
    if (next.email || next.password) return;
    onSubmit(email, password);
  }

  return (
    <View style={styles.form}>
      <FormField
        label="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!busy}
        returnKeyType="next"
      />
      <FormField
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        secureTextEntry
        autoCapitalize="none"
        editable={!busy}
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
      />
      <Button label="Iniciar sesión" loading={busy} onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({ form: { gap: spacing.md } });
