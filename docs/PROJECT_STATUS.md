# Estado del proyecto
Actualizado: 2026-11-18
Rama de trabajo más reciente: `test/concurrency-check` (desde `main`; ver el PR correspondiente)
`main` en `6b2b934` al escribir esto (verificado con `git ls-remote --heads origin` el 2026-11-18): contiene las cuatro ramas de trabajo y la corrección del estado, y todas se conservan en el remoto. Un commit local no equivale a estar subido; comprobarlo siempre con ese comando.

## Requisitos y permisos confirmados
- React Native obligatorio, entrega en ≤ 2 días; prioridad: estructura por componentes, claridad y funcionamiento.
- Android. Expo Go para desarrollar; falta confirmar si el profesor exige APK (no bloquea).
- Ramas y commits pequeños. Repositorio: https://github.com/CACHUMBAS/Nota-Online---React-Native.git
- Autorizado: Expo + TypeScript, roles profesor/alumno, Supabase dedicado (nunca el de Lumemon), PGlite (devDependency) y dependencias de cliente (ADR-008).

## Implementado y verificado (2026-11-17)
- `npm run typecheck`: OK. `npm test`: **16/16** (dominio, validadores y errores del cliente, 10 pruebas de base de datos con PGlite).
- Migraciones `001` (tablas, RPC, permisos) y `002` (`list_classrooms`) aplicadas sobre PostgreSQL real en memoria (PGlite).
- `npm run export:android`: el bundle se genera (935 módulos, `.hbc` de 2,7 MB). Eso demuestra que Metro resuelve la app, **no** que funcione en un móvil.
- `npx expo install --check`: dependencias compatibles con el SDK 58.
- **Contra el Supabase real** (2026-11-17, con la clave publishable por la API REST, sin la app):
  - Las 8 funciones existen y rechazan a quien no tiene sesión (HTTP 401 `permission denied`): migraciones 001 y 002 aplicadas.
  - Inicios de sesión anónimos activados (estaban desactivados; los activó Claude en el panel con permiso del usuario).
  - Una sesión anónima real llega con `is_anonymous=true`: `create_classroom` y `list_classrooms` dan `teacher_required`, `join_classroom` con un código inexistente da `session_not_found` y `classroom_snapshot` de una sesión ajena da `access_denied`.
  - Esas pruebas crearon 2 usuarios anónimos de prueba en el proyecto (inofensivos).
- **Recorrido profesor + alumno contra el Supabase real** (2026-11-17), profesor en un Android con Expo Go y alumno simulado por la API REST (no por la interfaz del alumno):
  - Profesor en el móvil: Expo Go admite el SDK 58 y la app arranca leyendo el `.env`; acceso con la cuenta de profesor; crear sesión (código `LE5SXN`); añadir un trabajo; abrir la votación; ver «Han votado: 1 voto» sin media (sondeo); cerrar y ver «8,0 · 1 voto».
  - Alumno (API): unirse con el código (idempotente, también en minúsculas y con espacio); voto 8 aceptado; reintento del mismo 8 devuelve 8 sin duplicar; cambiar a 3 → `already_voted`; nota 11 → `invalid_score`; con la votación abierta no ve recuento ni media; tras cerrar ve `vote_count=1`, `average=8` y su `my_score=8`; un alumno que llega tarde y vota → `voting_closed`.
  - Datos de prueba que quedan en el proyecto: la sesión «Clase pa probar» con 4 trabajos cerrados, unos 28 participantes de prueba y unos 30 usuarios anónimos. Conviene borrar esa sesión antes de la demo.
  - **Interfaz del alumno en el móvil** (comprobada por el usuario, no observada por Claude): entrar con el código, votar y, tras cerrar Expo Go por completo y reabrirlo, volver a la sesión guardada mostrando su voto (reanudación).
  - NO probado: el caso «Sin votos» en pantalla, errores de red en dispositivo (cortar la conexión al votar), la apariencia en distintos tamaños de pantalla y con el teclado abierto y varias sesiones a la vez. Los detalles de lo que el usuario vio en cada pantalla del alumno no están registrados paso a paso.
- **Concurrencia contra el Supabase real** (2026-11-18; detalle y límites en [docs/CONCURRENCY.md](CONCURRENCY.md); script en `scripts/concurrency-check.mjs`): envíos paralelos duplicados de un mismo alumno → un único voto y ninguna sobrescritura (`already_voted`); 12 alumnos votando casi a la vez, todos aceptados; recuento y media finales coinciden con los votos aceptados (13 votos / 2,538… en «Concurrencia A»; 4 votos / 5,25 en «Concurrencia B»); ningún voto aceptado tras ver el cierre. **No se estresó el instante exacto de la carrera voto↔cierre** (el cierre lo pulsa una persona y cayó lejos de los votos).
- **Hallazgo:** Supabase limita los inicios de sesión anónimos a 30 por hora y por IP (valor leído en el panel). En una clase de más de 30 alumnos en la misma wifi, el 31.º no podría entrar durante esa hora. Se puede subir en *Authentication → Rate Limits* (decisión del usuario; no se ha tocado).

## Implementado sin verificar
- La interfaz se ejecutó en un Android con Expo Go (profesor y alumno, ver arriba), pero **sin pruebas automáticas de componentes**: lo comprobado en el móvil no queda registrado paso a paso.
- Diseño visual en varios tamaños de pantalla, teclado en formularios, accesibilidad con lector de pantalla y comportamiento sin red: sin comprobar. La interfaz del alumno se probó en un solo móvil.
- Carrera voto↔cierre en el instante límite: diseño por bloqueo de fila y sin fallos observados, pero sin una prueba que dispare ambos a la vez con precisión (exigiría una cuenta de profesor en un script).
- Sondeo con la app en segundo plano y errores de red en dispositivo: sin comprobar.

## No terminado
- Prueba en Android (Expo Go) con dos dispositivos o instancias; APK solo si se exige.
- README y guion de demostración (`docs/DEMO.md`) escritos, pero el guion **nunca se ha ejecutado** en un móvil; revisarlos tras la primera prueba real. Revisión de accesibilidad en dispositivo pendiente.
- Decidir si se cierra el registro abierto de Supabase (no se ha podido confirmar que no bloquee la entrada anónima) o se añade una lista de profesores autorizados.
- Rama predeterminada del repositorio: **hecho el 2026-11-18**, ahora es `main` (verificado por la API de GitHub y con `git ls-remote --symref`).

## Integración en `main` (hecha el 2026-11-18)
`main` se creó en `e2587a4` (primer commit del proyecto, único ancestro común válido para los PR). Se fusionaron los cuatro PR apilados con «merge commit» (conserva los 30 commits pequeños) y sin borrar ramas. Tras fusionar cada uno hubo que cambiar la base del siguiente a `main`.

| PR | Rama | Commit de fusión |
|---|---|---|
| [#1](https://github.com/CACHUMBAS/Nota-Online---React-Native/pull/1) | `chore/native-foundation` | `3bef847` |
| [#2](https://github.com/CACHUMBAS/Nota-Online---React-Native/pull/2) | `feat/secure-voting` | `8a95727` |
| [#3](https://github.com/CACHUMBAS/Nota-Online---React-Native/pull/3) | `feat/native-classroom` | `dc07435` |
| [#4](https://github.com/CACHUMBAS/Nota-Online---React-Native/pull/4) | `docs/delivery` | `4e85f1d` |

Verificado con Git: las cuatro ramas están contenidas en `origin/main` y el árbol de `main` en `4e85f1d` es idéntico al de `docs/delivery`. Este archivo se actualizó en la rama `docs/status-after-merge`.

## Bloqueos que requieren al usuario
1. (Hecho) Proyecto Supabase dedicado creado y `.env` rellenado.
2. (Hecho para el profesor) Probar la **interfaz del alumno** en el móvil: con un solo teléfono se puede cerrar la sesión de profesor, pulsar «Soy alumno» y entrar con el código; para votar hace falta que el profesor tenga un trabajo abierto.
3. Confirmar si se exige APK.

## Siguiente paso concreto
- Probar lo que falta: caso «Sin votos» en pantalla, cortar la red al votar y otros tamaños de pantalla; después revisar `docs/DEMO.md` con lo que se observe.
- Decidir con el profesor si se exige un APK (EAS Build o compilación local).
- Decidir si se sube el límite de inicios de sesión anónimos de Supabase para clases de más de 30 alumnos (ver el hallazgo arriba).

## Limitaciones conocidas
- Un voto por identidad anónima no garantiza un voto por persona (borrar datos de la app o cambiar de identidad permite votar otra vez).
- Actualización por sondeo cada 4 s, no Realtime (ADR-005).
- Límite de Supabase: 30 inicios de sesión anónimos por hora y por IP (ver «Concurrencia contra el Supabase real»): una clase de más de 30 alumnos en la misma red necesita subir ese límite.
- Regla añadida no pedida por la asignatura: el profesor no puede unirse como alumno a su propia sesión (ADR-007).
- No hay pruebas automáticas de componentes (ADR-008).
- Con `.env` mal rellenado la app no puede diagnosticar la causa; mostrará errores de conexión.
