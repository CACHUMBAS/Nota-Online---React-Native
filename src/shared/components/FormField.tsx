import { useState } from 'react';
import { StyleSheet, Text, TextInput, View, type KeyboardTypeOptions, type ReturnKeyTypeOptions } from 'react-native';
import { colors, fontSize, radius, spacing, touchTarget } from '../theme/theme.ts';

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string | null;
  /** Ayuda breve bajo el campo (qué se espera). Si hay error, se muestra el error en su lugar. */
  hint?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: KeyboardTypeOptions;
  returnKeyType?: ReturnKeyTypeOptions;
  maxLength?: number;
  editable?: boolean;
  onSubmitEditing?: () => void;
}

export function FormField({
  label, value, onChangeText, error, hint, placeholder, secureTextEntry, autoCapitalize = 'sentences',
  keyboardType, returnKeyType, maxLength, editable = true, onSubmitEditing,
}: FormFieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        keyboardType={keyboardType}
        returnKeyType={returnKeyType}
        maxLength={maxLength}
        editable={editable}
        onSubmitEditing={onSubmitEditing}
        style={[styles.input, focused && styles.inputFocused, error ? styles.inputError : null, !editable && styles.inputDisabled]}
      />
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.xs },
  label: { fontSize: fontSize.small, fontWeight: '700', color: colors.text },
  input: {
    minHeight: touchTarget + 4,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: fontSize.body,
  },
  inputFocused: { borderColor: colors.primary, borderWidth: 2 },
  inputError: { borderColor: colors.danger, borderWidth: 2 },
  inputDisabled: { opacity: 0.6 },
  hint: { color: colors.textMuted, fontSize: fontSize.small },
  error: { color: colors.danger, fontSize: fontSize.small, fontWeight: '600' },
});
