import { Alert } from 'react-native';

/** Pide confirmación antes de una acción irreversible (cerrar una votación o una sesión). */
export function confirmAction(title: string, message: string, confirmLabel: string, onConfirm: () => void): void {
  Alert.alert(title, message, [
    { text: 'Cancelar', style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
}
