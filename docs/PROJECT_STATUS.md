# Estado del proyecto
Actualizado: 2026-11-17
Rama actual: chore/native-foundation
Último commit local: ver `git log` (base Expo + reglas de dominio)
Último commit remoto comprobado: ninguno (todavía no se ha subido nada a GitHub)

## Requisitos y permisos confirmados
- React Native obligatorio, entrega en ≤ 2 días, prioridad: estructura por componentes, claridad y funcionamiento.
- Android. Expo Go para desarrollo; falta confirmar si el profesor exige APK (no bloquea el desarrollo).
- Ramas y commits pequeños. Repositorio: https://github.com/CACHUMBAS/Nota-Online---React-Native.git
- Aprobado: Expo + TypeScript, roles profesor/alumno, Supabase (proyecto dedicado, nunca el de Lumemon), PGlite como devDependency para probar PostgreSQL en local.
- NO autorizado todavía: dependencias de cliente (supabase-js, navegación, almacenamiento). Se piden en bloque aparte.

## Implementado y verificado
- Base Expo + TypeScript estricta. `npm run typecheck`: OK (2026-11-17).
- Reglas de dominio (`src/features/voting/domain/rules.ts`): `npm test` → 4/4 pruebas de `test/rules.test.ts` OK.
- Aviso `MODULE_TYPELESS_PACKAGE_JSON` eliminado del script de pruebas con `--disable-warning` (ver DECISIONS ADR-004).

## Implementado sin verificar
- Nada.

## Trabajo en curso
- `test/database.test.ts` (sin commitear): prueba anticipada del backend. Falla ahora mismo con `ERR_MODULE_NOT_FOUND` porque PGlite no está instalado y no existe `supabase/migrations/202611170001_classroom.sql`. No se ha borrado ni desactivado.

## No terminado
- Migración SQL con RLS y funciones transaccionales, pantallas, navegación, cliente/servicios Supabase, autenticación, prueba en Android, APK (solo si se exige), README y guion de demo.

## Bloqueos y decisiones pendientes
- Crear el proyecto Supabase "Nota Online" (plan Free) por el usuario; hasta entonces el código se desarrolla y prueba con PGlite.
- Autorizar dependencias de cliente (navegación, supabase-js, almacenamiento de sesión).
- Confirmar si se exige APK.

## Siguiente paso concreto
- Rama `feat/secure-voting`: instalar PGlite (devDependency), escribir la migración que cumpla `test/database.test.ts` y pasar la prueba.

## Limitaciones conocidas
- Un voto por identidad anónima no garantiza un voto por persona (borrar datos o cambiar de identidad permite votar de nuevo). Se documenta, no se oculta.
- Actualización por sondeo (cada 4 s en pantalla activa y al volver a primer plano), no Realtime.
- Una exportación del bundle Android no equivale a una app probada en Android ni a un APK.
