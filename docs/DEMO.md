# Guion de demostración (3–5 minutos)

Necesitas **dos instancias** de la app con Expo Go: **A = profesor** y **B = alumno** (dos móviles, o un móvil y un emulador), con el Supabase preparado ([SUPABASE_SETUP.md](SUPABASE_SETUP.md)) y la cuenta de profesor creada.

> Este guion aún no se ha ejecutado en un móvil. Cuando lo pruebes, anota en `PROJECT_STATUS.md` qué pasos funcionaron y cuáles no.

## Antes de empezar
- Ordenador y móviles en la misma red; `npx expo start -c` en marcha.
- Tener a mano 2 o 3 títulos de trabajos ficticios.

## Recorrido
| # | Dispositivo | Acción | Resultado esperado |
|---|---|---|---|
| 1 | A | **Soy profesor** → correo y contraseña → *Iniciar sesión* | Pantalla «Mis sesiones», vacía |
| 2 | A | Título «Clase de prueba» → *Crear sesión* | Panel de la sesión con un **código de 6 caracteres** |
| 3 | A | *Añadir trabajo* ×2 («Proyecto uno», «Proyecto dos») | Ambos aparecen como **Pendiente** |
| 4 | B | **Soy alumno** → código + alias → *Entrar* | «Esperando el siguiente trabajo» |
| 5 | A | En «Proyecto uno»: *Abrir votación* | Estado **Votando**. «Proyecto dos» no se puede abrir |
| 6 | B | (se actualiza solo, hasta 4 s) | Aparece «Proyecto uno» con las notas 0–10, **ninguna seleccionada** |
| 7 | B | Elegir una nota → *Confirmar voto* | «Voto registrado» con la nota. No se puede cambiar |
| 8 | A | Mirar el trabajo abierto | «Han votado: 1 voto». **No se ve la media** |
| 9 | B | Cerrar y reabrir la app | Entra directo a la sesión y sigue «Voto registrado» (estado recuperado del servidor) |
| 10 | A | *Cerrar votación* → confirmar | Aparece la media y el número de votos |
| 11 | B | (se actualiza solo) | Sección «Resultados» con la media y «Tu nota» |
| 12 | A | Abrir «Proyecto dos» y cerrarlo sin votos | Muestra **«Sin votos»**, no un 0 |
| 13 | A | *Cerrar la sesión de clase* → confirmar | La sesión queda cerrada; B ve «La sesión ha terminado» |
| 14 | A | *Borrar sesión* (solo aparece con la sesión cerrada) → confirmar | Vuelve a «Mis sesiones» sin esa sesión; con su código, B ya no puede entrar (`session_not_found`). Probado en el móvil por el usuario el 2026-11-18 (la sesión de prueba se borró y desapareció de «Mis sesiones») |

## Comprobar el duplicado y los permisos (en el ordenador)
La interfaz ya impide votar dos veces, pero la garantía está en el servidor. Se enseña con las pruebas:
```bash
npm test
```
Muestran, con PostgreSQL real, que un segundo voto con otra nota da `already_voted`, que repetir la misma nota no duplica, que tras cerrar se rechaza con `voting_closed`, y que otro profesor o un alumno de otra sesión reciben `access_denied`.

## Preguntas que pueden hacerte
| Pregunta | Respuesta corta | Dónde verlo |
|---|---|---|
| ¿Qué hace cada componente? | La pantalla coordina; el componente presenta y emite acciones; el hook gestiona estado; el servicio llama al servidor | [ARCHITECTURE.md](ARCHITECTURE.md) |
| ¿Por qué una pantalla no llama a las tablas? | Los componentes no conocen Supabase; solo `shared/lib/rpc.ts` habla con el servidor y cada servicio valida la respuesta | `src/shared/lib/rpc.ts`, `src/features/*/services` |
| ¿Dónde se valida la nota? | En el móvil para avisar rápido (`validScore`) y **otra vez en el servidor**, que es el que manda | `rules.ts`, función `submit_score` de la migración 001 |
| ¿Qué impide dos votos de la misma identidad? | Una restricción única (trabajo, participante) en la base de datos | tabla `votes` de la migración 001 |
| ¿Y borrando la app? | Se crea otra identidad anónima y podría votar de nuevo. Es una limitación conocida | README, «Limitaciones» |
| ¿Si se pierde la conexión al votar? | La nota se conserva, se vuelve a consultar el estado y reintentar es seguro | `StudentRoomScreen.tsx`, `submit_score` |
| ¿Cómo sabe el servidor quién es profesor? | Es el propietario de la sesión en la base de datos; el móvil no manda ningún «soy profesor» | `lock_owned_classroom` en la migración 001 |
| ¿Qué enseñan las pruebas y qué no cubren? | Permisos, aislamiento, duplicados y cierre con PostgreSQL real. No cubren carreras concurrentes ni la interfaz | README, «Pruebas» |
