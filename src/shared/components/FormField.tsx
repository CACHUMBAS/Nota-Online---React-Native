import { StyleSheet, Text, TextInput, View, type KeyboardTypeOptions, type ReturnKeyTypeOptions } from 'react-native';
import { colors, fontSize, radius, spacing, touchTarget } from '../theme/theme.ts';

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string | null;
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
  label, value, onChangeText, error, placeholder, secureTextEntry, autoCapitalize = 'sentences',
  keyboardType, returnKeyType, maxLength, editable = true, onSubmitEditing,
}: FormFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
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
        style={[styles.input, error ? styles.inputError : null, !editable && styles.inputDisabled]}
      />
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.xs },
  label: { fontSize: fontSize.small, fontWeight: '700', color: colors.text },
  input: {
    minHeight: touchTarget,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: fontSize.body,
  },
  inputError: { borderColor: colors.danger },
  inputDisabled: { opacity: 0.6 },
  error: { color: colors.danger, fontSize: fontSize.small },
});
