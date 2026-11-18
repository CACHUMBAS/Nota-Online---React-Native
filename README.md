# Nota Online

Aplicación móvil en **React Native (Expo + TypeScript)** para que los alumnos voten la nota de los trabajos que se presentan en clase. Referencia funcional: https://pollunit.com/es/vota

- **Profesor:** inicia sesión, crea una sesión de clase (con código), añade trabajos, abre y cierra la votación de cada uno, ve cuántos han votado y, al cerrar, la media.
- **Alumno:** entra con el código y un alias, ve el trabajo que se está votando, elige una nota entera de 0 a 10 y la confirma. El voto solo cuenta cuando el servidor lo acepta.

> **Estado:** consulta [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md). Ahí se distingue lo escrito, lo comprobado con pruebas y lo probado en un móvil.

## Requisitos
- **Node.js 24 o superior** (`node -v`) y npm.
- Un móvil **Android** con la app **Expo Go**, en la misma red Wi‑Fi que el ordenador. Comprueba que tu versión de Expo Go admite el SDK 58 de Expo.
- Un proyecto **Supabase** propio y gratuito, preparado con [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md).

## Puesta en marcha
```bash
npm install
```
1. Prepara Supabase (migraciones, usuarios) siguiendo [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md).
2. Crea `.env` a partir de `.env.example` con la **URL** y la clave **publishable** de tu proyecto. Son datos públicos; no uses nunca la clave secret / `service_role` ni la contraseña de la base de datos.
3. Arranca:
```bash
npx expo start -c
```
4. Escanea el código QR con Expo Go. Sin `.env` la app muestra «Falta conectar el servidor»: no simula datos.

Para probar el recorrido completo hacen falta dos instancias: una como profesor y otra como alumno (dos móviles, o un móvil y un emulador). Guion en [docs/DEMO.md](docs/DEMO.md).

## Comandos
| Comando | Qué hace |
|---|---|
| `npm start` | Arranca Expo |
| `npm run typecheck` | Comprueba tipos (TypeScript estricto) |
| `npm test` | Pruebas de dominio, validadores y base de datos |
| `npm run check` | `typecheck` + `test` |
| `npm run export:android` | Genera el bundle de Android (comprueba que Metro lo resuelve; **no** genera un APK) |

## Pruebas
- **Dominio y cliente** (Node): notas 0–10, códigos, textos, medias («Sin votos» no es un 0), traducción de errores y validación de las respuestas del servidor.
- **Base de datos** ([PGlite](https://pglite.dev), PostgreSQL real en memoria): las migraciones se aplican de verdad y se prueban con identidades distintas — permisos de profesor y alumno, aislamiento entre sesiones, un voto por participante, reintentos sin duplicar, cierre irreversible, un solo trabajo abierto, resultados ocultos hasta cerrar y restricciones de la propia base de datos.
- **Concurrencia real:** PGlite tiene una sola conexión, así que la concurrencia se prueba aparte contra un Supabase real con `scripts/concurrency-check.mjs` (alumnos anónimos reales votando en paralelo). Método, resultados y límites en [docs/CONCURRENCY.md](docs/CONCURRENCY.md). No estresa el instante exacto de la carrera voto↔cierre.
- **Límites:** PGlite simula `auth.uid()` y los roles de Supabase y no sustituye a probar contra Supabase. La interfaz no tiene pruebas automáticas; se prueba a mano en Android.

## Estructura
Organizada por funcionalidades (`auth`, `sessions`, `projects`, `voting`, `results`) más `shared`. Una pantalla coordina; un componente presenta y emite acciones por props; un hook gestiona estado y ciclo de vida; un servicio llama al servidor; el dominio son funciones puras. Detalle en [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

```text
src/features/<funcionalidad>/{screens,components,hooks,services,domain}
src/shared/{components,hooks,lib,theme}
src/navigation/
supabase/migrations/        # SQL: tablas privadas + funciones + permisos
```

## Cómo se garantiza la integridad
El **servidor es la autoridad**; deshabilitar un botón en el móvil no basta.
- Las tablas están en un esquema privado, con RLS activada y sin acceso directo para los usuarios de la app. Todo pasa por funciones del servidor que comprueban quién llama.
- El profesor es el **propietario** de la sesión (comprobado en la base de datos), no un «soy profesor» enviado por el móvil. El código de sala solo sirve para entrar.
- Un voto por participante y trabajo, nota 0–10 y un solo trabajo abierto por sesión: lo impone la base de datos.
- Apertura, cierre y voto se serializan bloqueando la fila de la sesión.
- Un reintento con la misma nota devuelve el voto ya registrado; con otra nota se rechaza. Nunca se sobrescribe.
- Los resultados se ocultan en el servidor hasta cerrar el trabajo: el móvil no descarga votos ajenos ni calcula la media.

## Limitaciones conocidas
- **Un voto por identidad anónima no garantiza un voto por persona:** borrar los datos de la app o cambiar de identidad permite votar de nuevo. No se promete protección absoluta.
- **Sondeo, no Realtime:** la pantalla consulta al servidor cada 4 s mientras está activa y al volver a primer plano. No hay notificaciones push.
- **Límite de alumnos anónimos de Supabase:** por defecto 30 altas por hora y por IP. En una clase de más de 30 alumnos en la misma red hay que subir ese límite en el panel (ver [docs/CONCURRENCY.md](docs/CONCURRENCY.md)).
- **Registro abierto:** con el registro de Supabase activado, cualquiera con la clave pública puede crear sus propias sesiones (no acceder a las ajenas). Detalle en [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md).
- El profesor no puede unirse como alumno a su propia sesión (regla añadida, no un requisito de la asignatura).
- No hay ponderaciones, comentarios, archivos ni chat.
- No se ha generado un APK; la entrega se ejecuta con Expo Go.
