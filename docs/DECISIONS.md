# Registro de Decisiones de Arquitectura (ADR)

## ADR-001: Adopción de Expo con TypeScript
- **Fecha:** 2026-11-17
- **Estado:** Aprobado por el usuario.
- **Motivo:** React Native recomienda oficialmente el uso de un framework como Expo. Acelera la configuración del entorno para cumplir el plazo de 48 horas sin sacrificar componentes nativos. TypeScript garantiza contratos estrictos de datos y props, facilitando la comprensión y defensa del código ante el profesor.

## ADR-002: Alcance Funcional en Dos Roles (Profesor y Alumno)
- **Fecha:** 2026-11-17
- **Estado:** Aprobado por el usuario.
- **Motivo:** Cumple el enunciado de calificar trabajos proyectados en clase. El profesor controla la sesión y apertura/cierre de trabajos; los alumnos acceden con código de sesión y alias para emitir un único voto de 0 a 10 por trabajo expuesto.

## ADR-003: Backend con Supabase para Sincronización Real
- **Fecha:** 2026-11-17
- **Estado:** Aprobado por el usuario.
- **Motivo:** Evita construir un servidor Express/WebSockets desde cero en 48 horas. Proporciona PostgreSQL con Row Level Security (RLS) para integridad de datos en el servidor y capacidades de suscripción en tiempo real entre múltiples dispositivos móviles.
- **Matiz (ver ADR-005):** la primera versión usa sondeo, no Realtime.

## ADR-004: Silenciar solo el aviso MODULE_TYPELESS_PACKAGE_JSON en las pruebas
- **Fecha:** 2026-11-17
- **Estado:** Decisión técnica de implementación.
- **Motivo:** Node avisa porque los `.ts` de prueba usan sintaxis ESM y `package.json` no declara `"type"`. Añadir `"type": "module"` cambiaría cómo Expo/Metro interpretan archivos de configuración futuros (por ejemplo `babel.config.js`). Se usa `--disable-warning=MODULE_TYPELESS_PACKAGE_JSON` solo en el script `test`. El aviso es de rendimiento (reanálisis), no de corrección.

## ADR-005: Actualización por sondeo en lugar de Realtime
- **Fecha:** 2026-11-17
- **Estado:** Decisión de alcance de la primera entrega.
- **Motivo:** Consulta cada 4 s con la pantalla activa y al volver a primer plano. Evita configurar canales con datos sensibles (recuentos ocultos hasta cerrar). No se declara Realtime mientras no esté implementado.

## ADR-006: PGlite como devDependency para probar PostgreSQL localmente
- **Fecha:** 2026-11-17
- **Estado:** Autorizado expresamente por el usuario.
- **Motivo:** Permite probar migración, permisos y transacciones sin depender de que el proyecto Supabase exista. Es PostgreSQL real (WASM), pero no es Supabase: RLS y roles se simulan con `auth.uid()`/`auth.jwt()` mínimos. La verificación contra Supabase real sigue pendiente de crear el proyecto. Limitación: PGlite tiene una sola conexión, así que las carreras reales (voto frente a cierre) se razonan por diseño (bloqueo de la fila de la sesión) pero no se prueban con transacciones concurrentes.

## ADR-007: El servidor es la autoridad; tablas privadas y API solo por funciones
- **Fecha:** 2026-11-17
- **Estado:** Decisión de implementación acorde a las reglas de integridad pedidas.
- **Decisiones y motivo:**
  - Tablas en el esquema `nota_private` (no expuesto), RLS activada sin políticas y sin privilegios para `anon`/`authenticated`. Todo pasa por funciones `SECURITY DEFINER` con `search_path` vacío, ejecutables solo por `authenticated`. Así no hay lectura directa de votos ajenos ni de agregados.
  - Profesor = usuario no anónimo y propietario de la sesión (se comprueba en la tabla, nunca un indicador enviado por el móvil). Limitación: con el registro abierto de Supabase activado (necesario mientras no se confirme que cerrarlo no bloquea la entrada anónima) cualquier persona con la clave pública puede registrarse y crear sus propias sesiones; no puede acceder a las ajenas. Endurecimiento posible: lista de correos autorizados comprobada en `create_classroom`. Ver `SUPABASE_SETUP.md`.
  - Alumno = usuario anónimo que se unió con el código. El código de sala solo permite entrar; no da permisos de profesor.
  - El propietario no puede unirse como alumno a su propia sesión (`owner_cannot_join`): evita que el profesor vote con la misma cuenta. Es una regla añadida, no un requisito del profesor de la asignatura.
  - Unicidad y coherencia en la base de datos: un voto por (trabajo, participante), nota 0–10, un solo trabajo abierto por sesión (índice parcial único) y claves compuestas para que un voto no pueda cruzar de sesión.
  - Un reintento con la misma nota devuelve el voto existente (también tras cerrar); con otra nota, `already_voted`. Nunca se sobrescribe.
  - Ocultación en el servidor: `average` solo con el trabajo cerrado; `vote_count` visible al profesor siempre y al alumno solo tras cerrar; `my_score` solo propio.
  - Transiciones de trabajo: `pending → open → closed`. El cierre es irreversible. Cerrar la sesión cierra el trabajo abierto.

## ADR-008: Dependencias de cliente y navegación
- **Fecha:** 2026-11-17
- **Estado:** Autorizado por el usuario («Sí, instálalas»).
- **Instaladas con `expo install` (SDK 58):** `@supabase/supabase-js`, `@react-native-async-storage/async-storage`, `react-native-url-polyfill`, `@react-navigation/native`, `@react-navigation/native-stack`, `react-native-screens`, `react-native-safe-area-context`. `npx expo install --check`: «Dependencies are up to date».
- **Motivo de la navegación:** React Navigation con stack nativo; son pocas pantallas y evita las rutas basadas en archivos de Expo Router. No se añade gestor de estado: bastan estado local, un contexto pequeño para la sesión y hooks.
- **`react-native-url-polyfill`:** la guía de Supabase para React Native lo recomienda. No se ha comprobado en un dispositivo si es imprescindible con esta versión de React Native; se mantiene por prudencia.
- **Sin pruebas de componentes:** no se ha autorizado `jest-expo` ni Testing Library. La lógica está en dominio puro (probado); la interfaz se prueba a mano en Android.

## ADR-009: `list_classrooms` y reanudación de sesión
- **Fecha:** 2026-11-17
- **Estado:** Decisión de implementación.
- **Motivo:** el profesor debe poder recuperar una votación abierta aunque borre los datos locales; por eso hay una función servidor que lista solo sus sesiones (migración `002`). El alumno reanuda su sala con su identidad anónima y la última sala recordada.

## ADR-010: Dominio compartido en `shared/domain` para evitar dependencias circulares entre funcionalidades
- **Fecha:** 2026-11-18
- **Estado:** Refactor sin cambios de comportamiento, decidido tras revisar el código real.
- **Problema:** el grafo de imports mostraba ciclos entre funcionalidades (por ejemplo `sessions ↔ voting` y `projects ↔ sessions`). Las causas eran piezas mal ubicadas: los tipos `Project`/`SessionSnapshot` vivían en `sessions`, y validaciones y formato genéricos (`cleanText`, `formatAverage`…) vivían en `voting/domain/rules.ts`.
- **Decisión:** los tipos pasan a `shared/domain/classroom.ts`; el texto a `shared/domain/text.ts`; el formato a `shared/domain/format.ts`; las piezas básicas de los parsers (y `parseId`/`parseScore`) a `shared/domain/parsers.ts`; `normalizeCode` a `sessions/domain/code.ts`; `voting/domain/rules.ts` queda solo con `validScore`.
- **Resultado medido con el grafo de imports:** `shared` no depende de ninguna funcionalidad y no hay ciclos. Quedan seis dependencias unidireccionales, casi todas en pantallas (composición). Detalle en `ARCHITECTURE.md`.
- **Comprobación:** `typecheck` sin errores, 16 de 16 pruebas y exportación del bundle Android (939 módulos). Tras fusionar el refactor, el usuario abrió la app en su móvil y confirmó que funciona (comprobado por el usuario, no observado por Claude).
- **Límite:** `RootNavigator` y `AuthContext` siguen tocando el cliente o un servicio directamente; no son componentes visuales y se dejan así.

## ADR-011: Límite de altas anónimas de Supabase subido de 30 a 60 por hora
- **Fecha:** 2026-11-18
- **Estado:** Aprobado por el usuario («Sí, súbelo a 60»); cambio de configuración del proyecto Supabase, no del código.
- **Problema:** cada alumno que entra por primera vez crea un usuario anónimo, y Supabase limita esas altas a 30 por hora y por IP (valor leído en *Authentication → Rate Limits*). En una clase de más de 30 alumnos en la misma wifi, los últimos no podrían entrar durante esa hora. El usuario quiere atender clases de hasta 40 alumnos.
- **Decisión:** subir «Rate limit for anonymous users» a **60**, no a 40, para dejar margen a reentradas (alguien que borra los datos de la app o reinstala la gasta otra alta). Se cambió solo ese campo; el resto de límites quedaron como estaban (comprobado al recargar el panel).
- **Contrapartida:** un límite más alto permite crear más usuarios anónimos por hora desde una misma IP, lo que facilita el abuso. Supabase recomienda además captcha para anónimos; no está activado ni integrado en la app.
- **Reversible:** se puede devolver a 30 en el mismo panel.
- **Sin probar:** que el límite nuevo funcione en la práctica. Comprobarlo exigiría crear más de 30 alumnos anónimos desde una IP y dejaría más datos de prueba.
- **No confundir** con un tope de alumnos por sesión: la app y la base de datos no limitan cuántos alumnos entran en una sesión.

## ADR-012: Borrado de sesiones, solo si están cerradas y solo por su propietario
- **Fecha:** 2026-11-18
- **Estado:** Función añadida a petición del usuario («mete una opción de borrar sesión»). Amplía el alcance original, que no la incluía.
- **Decisión:** nueva función del servidor `delete_classroom` (migración 003) y botón «Borrar sesión» en el panel del profesor, con confirmación.
- **Reglas, impuestas por el servidor:**
  - Solo el propietario. Cualquier otro (otro profesor, un alumno, una sesión inexistente) recibe el mismo `access_denied`, sin revelar si existe.
  - **Solo sesiones cerradas** (`session_not_closed`). Motivo: evitar que se destruya por error una votación en curso; hay que cerrarla antes, y el cierre ya es irreversible por diseño. Es una regla mía, no pedida; se puede quitar si se prefiere borrar sesiones activas.
  - Borrado en cascada de participantes, trabajos y votos (claves foráneas `on delete cascade`). **Irreversible.**
  - Se serializa con el resto de operaciones bloqueando la fila de la sesión.
- **Interfaz:** el botón solo aparece con la sesión cerrada, pide confirmación y, si el servidor borra, vuelve a «Mis sesiones».
- **Comprobado:** prueba con PostgreSQL real (sesión activa, otro profesor, alumno, id inexistente, cascada, efectos visibles y rol `anon`), 17 de 17 pruebas, comprobación por mutación (sin la regla de sesión cerrada la prueba falla) y bundle de Android exportado.
- **Comprobado después, contra el Supabase real (2026-11-18):** la migración se aplicó en el *SQL Editor* y se verificó desde fuera (sin sesión 401, antes 404; un alumno con un id inexistente recibe `access_denied`). El usuario probó el botón en su móvil y funciona (comprobado por el usuario, no observado por Claude), y Claude verificó en el servidor que la sesión borrada ya no existe (`session_not_found`).
- **Aviso al aplicarla:** el SQL Editor muestra «This query includes destructive operations» por el texto `delete from` del cuerpo de la función; la migración solo la define y no borra nada al ejecutarse. Hay que confirmar ese aviso.
- **Sin probar:** el rechazo de borrar una sesión **activa** y el de otro profesor se probaron con PostgreSQL en memoria, pero no contra el servidor real.
- **Contrapartida:** una acción destructiva más en la interfaz. No hay papelera ni deshacer.

## ADR-013: Mejora del diseño y de la guía al profesor, sin librerías nuevas
- **Fecha:** 2026-11-18
- **Estado:** Hecho a petición del usuario («mejorar un poquito el diseño, intuitivo para todos los profes, un diseño chulo»). Solo cambia el aspecto y la guía; no toca el servidor, las reglas de voto ni las migraciones.
- **Decisiones:**
  - **Tokens de diseño en `shared/theme/theme.ts`:** paleta nueva, radios mayores, sombras suaves y escala tipográfica. Cambiar un color ahí lo cambia en toda la app.
  - **Contraste medido, no supuesto.** Todos los pares de texto y fondo usados cumplen WCAG AA (≥ 4,5:1), comprobados con un script (por ejemplo: texto 15,9:1, gris de apoyo 7,3:1, botón primario 6,6:1, estados 5,4 a 6,5:1); el borde de los campos de texto sube de 1,4:1 a 3,57:1.
  - **`Card` común** para todas las tarjetas, en vez de que cada pantalla repita su estilo.
  - **Iconos con emoji decorativos, sin librerías de iconos.** Una dependencia nueva exigiría autorización, y los emojis no llevan coste de empaquetado. Se ocultan al lector de pantalla (`importantForAccessibility="no"`); los botones y tarjetas se anuncian por su texto.
  - **El estado no depende solo del color:** `StatusBadge` añade un símbolo (○ pendiente, ● votando, ✓ cerrado).
  - **Guía «Siguiente paso» para el profesor** (`teacherNextStep`, función pura con 5 pruebas): según el estado que devuelve el servidor, dice qué hacer ahora (añadir el primer trabajo, abrir la votación del siguiente, esperar y cerrar, o terminar). Es la mejora de intuición principal; se comprobó por mutación (si se quita la prioridad de la sesión cerrada, una prueba falla).
  - **Inicio con dos tarjetas de rol** que explican qué hace cada uno; ayudas bajo los campos; botones con icono y más altos; zona de peligro separada con rótulo.
- **Comprobado:** `typecheck` sin errores, 22 de 22 pruebas, bundle de Android exportado (943 módulos), contraste de todos los pares y reglas de arquitectura intactas (sin ciclos, ningún componente llama al servidor, 0 `any`).
- **NO comprobado:** **el aspecto real en el móvil.** El diseño se hizo sin ver la pantalla, guiado por medidas (contraste, arquitectura) y no por la vista; puede haber desajustes de espacio, saltos de línea o tamaños que solo se ven en el dispositivo. Tampoco se ha probado en otros tamaños de pantalla ni con lector de pantalla (TalkBack). Los emojis pueden verse distintos según la versión de Android.
- **Límite:** la app fuerza tema claro (`userInterfaceStyle: light`); no hay modo oscuro.
