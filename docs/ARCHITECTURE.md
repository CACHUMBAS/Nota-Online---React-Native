# Arquitectura (lo realmente implementado)

Flujo: **pantalla → hook / servicio → servidor → respuesta validada → estado de pantalla → componentes**.

```text
App.tsx                         # solo compone SafeAreaProvider + AuthProvider + RootNavigator
src/
  navigation/                   # RootNavigator (pantalla inicial según configuración/sesión) y tipos de rutas
  features/
    auth/                       # AuthContext (estado de la sesión), authService, pantallas Home/Login/Setup, TeacherLoginForm
    sessions/                   # sesiones de clase: servicios, hooks de carga y sondeo, JoinForm/SessionForm/SessionCard,
      domain/parsers.ts         #   pantallas TeacherSessions/TeacherRoom/StudentJoin; parsers = validación de respuestas
    projects/                   # trabajos: ProjectCard/StatusBadge/ProjectForm, projectsService, domain/projects.ts
    voting/                     # voto: ScoreSelector/VotePanel, votingService, StudentRoomScreen, domain/rules.ts (reglas puras)
    results/                    # ResultSummary/ResultsList (media, «Sin votos»)
  shared/
    components/                 # Button, FormField, Screen, estados (carga/error/vacío/aviso), HeaderButton
    hooks/                      # useAsyncAction (sin doble envío), useAppActive
    lib/                        # supabase (cliente), rpc (única puerta al servidor), errors (códigos tipados), config, confirm, validation
    theme/                      # colores, espacios, tipografía
supabase/migrations/            # SQL: tablas privadas, funciones RPC, permisos
test/                           # dominio y cliente (Node) + base de datos con PGlite
```

## Responsabilidades
| Capa | Qué hace | Qué NO hace |
|---|---|---|
| Pantalla | Coordina el recorrido: hooks, qué estado mostrar, confirmaciones | SQL, cálculo de medias, JSX repetido |
| Componente | Muestra datos y emite acciones por props; valida formularios con el dominio | Llamar al servidor |
| Hook | Carga, sondeo, estado de acciones (en curso/error) | Reglas de negocio |
| Servicio | Llama a una función del servidor con `callRpc` y valida la respuesta | Estado de interfaz |
| Dominio | Funciones puras (nota 0–10, código, textos, formato de media, parsers) | Depender de React Native |

## Cómo se sabe quién es quién
- **Profesor**: usuario no anónimo (cuenta preparada en Supabase) y propietario de la sesión. Lo comprueba el servidor en cada función; el móvil no envía ningún «soy profesor».
- **Alumno**: usuario anónimo del backend con identidad persistente en el móvil, unido con el código. El código solo permite entrar.

## Datos que ve cada rol (decidido en el servidor)
| Dato | Profesor | Alumno |
|---|---|---|
| Código, participantes | sí | sí |
| Nº de votos de un trabajo abierto | sí | no (`null`) |
| Media de un trabajo abierto | no | no |
| Media y nº de votos de un trabajo cerrado | sí | sí |
| Notas individuales de otros | no | no |
| Su propia nota | — | sí |

## Si se pierde la conexión al votar
1. La nota elegida se conserva en pantalla.
2. Siempre se vuelve a consultar el estado: si el voto sí llegó, aparece como registrado (`my_score`).
3. Si no llegó, se muestra el error y se puede reintentar: repetir la misma nota es seguro (el servidor devuelve el voto ya registrado, no duplica).

## Qué se mantiene al reabrir la app
- Alumno: identidad anónima (sesión de Supabase en AsyncStorage) + última sala recordada. El servidor sigue decidiendo si tiene acceso. Si se borran los datos de la app se pierde la identidad: es la limitación conocida de la identidad anónima.
- Profesor: la sesión de Supabase y la lista de sus sesiones (`list_classrooms`), sin depender de datos locales.
