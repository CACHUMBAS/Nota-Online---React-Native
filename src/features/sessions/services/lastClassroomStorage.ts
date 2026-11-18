import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'nota-online:last-classroom';

/**
 * Recuerda la última sesión del alumno para reabrirla al volver a la app. No es una fuente de
 * verdad: el servidor sigue decidiendo si ese alumno tiene acceso. Un fallo de almacenamiento
 * no debe romper la app, solo se pierde la reanudación automática.
 */
export async function saveLastClassroom(classroomId: string): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, classroomId);
  } catch {
    // Sin almacenamiento disponible: se ignora.
  }
}

export async function loadLastClassroom(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export async function clearLastClassroom(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    // Se ignora por la misma razón.
  }
}
