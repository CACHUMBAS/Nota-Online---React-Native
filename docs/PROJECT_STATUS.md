# Estado del proyecto
Actualizado: 2026-11-17
Rama actual: feat/secure-voting (creada desde chore/native-foundation)
Último commit: ver `git log --oneline -1` en la rama
Último commit remoto comprobado: `chore/native-foundation` en d414da7 (verificado con `git ls-remote`). `feat/secure-voting`: ver sección de subida abajo.

## Requisitos y permisos confirmados
- React Native obligatorio, entrega en ≤ 2 días; prioridad: estructura por componentes, claridad y funcionamiento.
- Android. Expo Go para desarrollo; falta confirmar si el profesor exige APK (no bloquea el desarrollo).
- Ramas y commits pequeños. Repositorio: https://github.com/CACHUMBAS/Nota-Online---React-Native.git
- Aprobado: Expo + TypeScript, roles profesor/alumno, Supabase (proyecto dedicado, nunca el de Lumemon), PGlite como devDependency.
- NO autorizado todavía: dependencias de cliente (supabase-js, navegación, almacenamiento de sesión).

## Implementado y verificado (2026-11-17)
- Base Expo + TypeScript estricta: `npm run typecheck` OK.
- Reglas de dominio (`src/features/voting/domain/rules.ts`): 4 pruebas OK.
- Migración `supabase/migrations/202611170001_classroom.sql` aplicada sobre PostgreSQL real en memoria (PGlite): `npm run check` → typecheck OK y **9/9 pruebas OK**.
  - `test/database.test.ts` (contrato original): permisos, ciclo de votación, reintentos, `anon` sin acceso.
  - `test/database-integrity.test.ts` (nuevo): aislamiento entre sesiones, ocultación de resultados, restricciones propias de la BD, casos de acceso.
  - Mutación comprobada: si el servidor mostrara la media con la votación abierta, 2 pruebas fallan.

## Implementado sin verificar
- La migración **no se ha ejecutado contra Supabase real** (el proyecto aún no existe). PGlite no es Supabase: simula `auth.uid()`/`auth.jwt()` y los roles.
- Carreras reales (voto frente a cierre) razonadas por diseño (bloqueo de la fila de sesión), **no probadas con transacciones concurrentes** (PGlite tiene una sola conexión).

## No terminado
- Cliente y servicios Supabase, autenticación, hooks, navegación, pantallas de profesor y alumno, sondeo cada 4 s.
- Prueba en Android (Expo Go), APK solo si se exige, README final y guion de demostración.

## Bloqueos que requieren al usuario
1. Crear el proyecto Supabase dedicado siguiendo `docs/SUPABASE_SETUP.md` y rellenar `.env` (solo URL y clave publishable).
2. Autorizar las dependencias de cliente (lista en el último mensaje de la sesión).
3. Confirmar si se exige APK.

## Siguiente paso concreto
- Con las dependencias autorizadas: rama `feat/native-classroom`, cliente Supabase + servicios + hooks, y pantallas.
- Mientras tanto, sin dependencias nuevas: componentes compartidos y tema.

## Limitaciones conocidas
- Un voto por identidad anónima no garantiza un voto por persona (borrar datos o cambiar de identidad permite votar de nuevo).
- Actualización por sondeo, no Realtime (ADR-005).
- Una exportación del bundle Android no equivale a una app probada en Android ni a un APK.
