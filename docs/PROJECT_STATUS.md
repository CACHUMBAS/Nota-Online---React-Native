# Estado del proyecto
Actualizado: 2026-11-17
Rama actual: docs/delivery (apilada: chore/native-foundation → feat/secure-voting → feat/native-classroom → docs/delivery)
Último commit: ver `git log --oneline -1`
Ramas en GitHub, verificadas con `git ls-remote --heads origin` el 2026-11-17: `chore/native-foundation` d414da7, `feat/secure-voting` 00b4d63, `feat/native-classroom` 80d4406, `docs/delivery` 9d99e1f (los commits posteriores a este archivo se comprueban con ese mismo comando; un commit local no equivale a estar subido).

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
  - NO probado todavía: un profesor real, crear sesión, votar, cerrar (el recorrido completo) ni la concurrencia.

## Implementado sin verificar
- **Toda la interfaz** (pantallas, navegación, hooks de sondeo, servicios): escrita y compilada, **nunca ejecutada** en Android ni en emulador.
- La **app** (cliente) todavía no se ha ejecutado contra Supabase: el `.env` está creado (proyecto NotaOnline-ReactNative) y Expo arranca leyéndolo, pero falta abrirla en un móvil.
- Cuenta de profesor: creada por el usuario, no verificada (no se tiene su contraseña).
- Carreras reales (voto frente a cierre): razonadas por diseño, no probadas con concurrencia.
- Reanudación al reabrir la app, sondeo con la app en segundo plano y errores de red en dispositivo: sin comprobar.

## No terminado
- Prueba en Android (Expo Go) con dos dispositivos o instancias; APK solo si se exige.
- README y guion de demostración (`docs/DEMO.md`) escritos, pero el guion **nunca se ha ejecutado** en un móvil; revisarlos tras la primera prueba real. Revisión de accesibilidad en dispositivo pendiente.
- Decidir si se cierra el registro abierto de Supabase (no se ha podido confirmar que no bloquee la entrada anónima) o se añade una lista de profesores autorizados.
- Integración de ramas (PR / merge a `main`): no se ha hecho; `main` no existe aún en el remoto.

## Bloqueos que requieren al usuario
1. (Hecho) Proyecto Supabase dedicado creado y `.env` rellenado.
2. Probar en un móvil Android con Expo Go (`npx expo start -c`, escanear el QR) y decir qué falla. Comprobar antes que la versión de Expo Go admite el SDK 58.
3. Confirmar si se exige APK.

## Siguiente paso concreto
- Con el Supabase creado: aplicar las dos migraciones, crear la cuenta de profesor y probar el recorrido completo (profesor ↔ alumno) con `npx expo start`.
- Tras la primera prueba real: corregir lo que falle, actualizar README/DEMO/este archivo y abrir los PR para integrar las ramas en `main` (no hecho; `main` no existe en el remoto).

## Limitaciones conocidas
- Un voto por identidad anónima no garantiza un voto por persona (borrar datos de la app o cambiar de identidad permite votar otra vez).
- Actualización por sondeo cada 4 s, no Realtime (ADR-005).
- Regla añadida no pedida por la asignatura: el profesor no puede unirse como alumno a su propia sesión (ADR-007).
- No hay pruebas automáticas de componentes (ADR-008).
- Con `.env` mal rellenado la app no puede diagnosticar la causa; mostrará errores de conexión.
