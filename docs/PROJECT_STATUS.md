# Estado del proyecto
Actualizado: 2026-11-17
Rama actual: feat/native-classroom (creada desde feat/secure-voting, de la que depende)
Último commit: ver `git log --oneline -1`
Ramas en GitHub: `chore/native-foundation` (d414da7) y `feat/secure-voting` (00b4d63), verificadas con `git ls-remote`. `feat/native-classroom`: comprobar con `git ls-remote --heads origin` (un commit local no equivale a estar subido).

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

## Implementado sin verificar
- **Toda la interfaz** (pantallas, navegación, hooks de sondeo, servicios): escrita y compilada, **nunca ejecutada** en Android ni en emulador.
- Cliente Supabase: nunca ha hablado con un Supabase real (el proyecto aún no existe). Sin `.env` la app muestra la pantalla «Falta conectar el servidor».
- Las migraciones no se han ejecutado en Supabase real; PGlite simula `auth.uid()`/`auth.jwt()`.
- Carreras reales (voto frente a cierre): razonadas por diseño, no probadas con concurrencia.
- Reanudación al reabrir la app, sondeo con la app en segundo plano y errores de red en dispositivo: sin comprobar.

## No terminado
- Prueba en Android (Expo Go) con dos dispositivos o instancias; APK solo si se exige.
- README final, guion de demostración, revisión de accesibilidad en dispositivo.
- Integración de ramas (PR / merge a `main`): no se ha hecho; `main` no existe aún en el remoto.

## Bloqueos que requieren al usuario
1. Crear el proyecto Supabase dedicado (`docs/SUPABASE_SETUP.md`) y rellenar `.env`.
2. Probar en un móvil Android con Expo Go y decirme qué falla.
3. Confirmar si se exige APK.

## Siguiente paso concreto
- Con el Supabase creado: aplicar las dos migraciones, crear la cuenta de profesor y probar el recorrido completo (profesor ↔ alumno) con `npx expo start`.
- Sin Supabase todavía: README y guion de demostración (rama `docs/delivery`).

## Limitaciones conocidas
- Un voto por identidad anónima no garantiza un voto por persona (borrar datos de la app o cambiar de identidad permite votar otra vez).
- Actualización por sondeo cada 4 s, no Realtime (ADR-005).
- Regla añadida no pedida por la asignatura: el profesor no puede unirse como alumno a su propia sesión (ADR-007).
- No hay pruebas automáticas de componentes (ADR-008).
- Con `.env` mal rellenado la app no puede diagnosticar la causa; mostrará errores de conexión.
