import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { HomeScreen } from '../features/auth/screens/HomeScreen.tsx';
import { SetupRequiredScreen } from '../features/auth/screens/SetupRequiredScreen.tsx';
import { TeacherLoginScreen } from '../features/auth/screens/TeacherLoginScreen.tsx';
import { useAuth } from '../features/auth/AuthContext.tsx';
import { StudentJoinScreen } from '../features/sessions/screens/StudentJoinScreen.tsx';
import { TeacherRoomScreen } from '../features/sessions/screens/TeacherRoomScreen.tsx';
import { TeacherSessionsScreen } from '../features/sessions/screens/TeacherSessionsScreen.tsx';
import { loadLastClassroom } from '../features/sessions/services/lastClassroomStorage.ts';
import { StudentRoomScreen } from '../features/voting/screens/StudentRoomScreen.tsx';
import { LoadingState } from '../shared/components/StateViews.tsx';
import { isBackendConfigured } from '../shared/lib/supabase.ts';
import { colors } from '../shared/theme/theme.ts';
import type { RootStackParamList } from './types.ts';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Pantalla inicial al abrir la app:
 *  - sin configuración del servidor → explicación;
 *  - profesor con sesión abierta → sus sesiones;
 *  - alumno con sesión anónima y una sesión de clase recordada → esa sesión (el servidor valida el acceso);
 *  - en cualquier otro caso → inicio.
 */
export function RootNavigator() {
  const auth = useAuth();
  const [lastClassroom, setLastClassroom] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    void loadLastClassroom().then((id) => {
      if (!cancelled) setLastClassroom(id);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (auth.status === 'loading' || lastClassroom === undefined) return <LoadingState />;

  let initialRouteName: keyof RootStackParamList = 'Home';
  if (!isBackendConfigured) initialRouteName = 'Setup';
  else if (auth.status === 'signedIn' && !auth.isAnonymous) initialRouteName = 'TeacherSessions';
  else if (auth.status === 'signedIn' && lastClassroom) initialRouteName = 'StudentRoom';

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
          headerTintColor: colors.primary,
          headerTitleStyle: { fontWeight: '800', color: colors.text },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Setup" component={SetupRequiredScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="TeacherLogin" component={TeacherLoginScreen} options={{ title: 'Acceso de profesor' }} />
        <Stack.Screen name="TeacherSessions" component={TeacherSessionsScreen} options={{ title: 'Mis sesiones' }} />
        <Stack.Screen name="TeacherRoom" component={TeacherRoomScreen} options={{ title: 'Sesión' }} />
        <Stack.Screen name="StudentJoin" component={StudentJoinScreen} options={{ title: 'Entrar a una sesión' }} />
        <Stack.Screen
          name="StudentRoom"
          component={StudentRoomScreen}
          options={{ title: 'Sesión', headerBackVisible: false }}
          initialParams={lastClassroom ? { classroomId: lastClassroom } : undefined}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
