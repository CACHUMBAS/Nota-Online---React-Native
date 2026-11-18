# Pruebas de concurrencia contra Supabase real

Fecha: 2026-11-18. Script: [`scripts/concurrency-check.mjs`](../scripts/concurrency-check.mjs).

## Por qué hacen falta
Las pruebas con PGlite (`npm test`) comprueban permisos, duplicados y cierre sobre PostgreSQL real, pero PGlite tiene **una sola conexión**: no puede ejercitar peticiones simultáneas. Estas pruebas se hacen contra un Supabase real, con peticiones HTTP verdaderamente paralelas.

## Cómo se hicieron
- **Alumnos:** usuarios anónimos reales creados al momento con la clave publishable (la misma que usa la app). No hace falta ninguna clave secreta.
- **Profesor:** la propia app en un Android con Expo Go. La persona abre y cierra las votaciones a mano; el script lo espera y después verifica.
- **Entorno:** plan Free de Supabase, red wifi doméstica, un solo PC lanzando las peticiones.

## Resultados

| Prueba | Qué se hizo | Resultado |
|---|---|---|
| Duplicados, misma nota | 2 alumnos × 8 envíos paralelos de la misma nota | 8 aceptados por alumno, todos devuelven esa nota; la nota guardada coincide |
| Duplicados, notas distintas | 2 alumnos × 8 envíos paralelos de notas distintas | **Exactamente 1 aceptado** por alumno; el resto `already_voted`; la nota guardada es la aceptada |
| Recuento tras cerrar (4 alumnos) | Cierre manual después | `vote_count = 4`, `average = 5,25` = (7+3+1+10)/4 |
| Votos casi simultáneos | 12 alumnos votando repartidos en 40 s | 12 de 12 aceptados, sin errores; latencia de `submit_score`: mediana ≈ 220 ms, p95 ≈ 550 ms |
| Voto frente a cierre | 8 alumnos repartidos en 90 s; cierre manual a mitad | 1 aceptado antes del cierre; 7 `voting_closed` después; ningún voto aceptado tras ver un cierre; ningún error distinto de `voting_closed`. Latencia: mediana ≈ 276 ms, p95 ≈ 1,35 s (una petición lenta de 1,35 s) |
| Recuento tras ese cierre | Trabajo con 12 votos previos + 1 | `vote_count = 13`, `average = 2,5384…` = 33/13 (suma previa 32 + 1) |

## Lo que NO demuestran
- **No se estresó el instante exacto de la carrera voto↔cierre.** El cierre lo pulsa una persona y cayó lejos de cualquier voto (entre el voto de los 7,8 s y el siguiente de los 26,2 s). Lo observado es coherente con el diseño (bloqueo de la fila de la sesión: el voto toma un bloqueo compartido y el cierre uno exclusivo), pero esta prueba no lo demuestra. Probarlo de verdad exigiría disparar el cierre y los votos desde el mismo script con la cuenta de profesor.
- Solo se probó con una persona cerrando, un PC y una red doméstica. No es una prueba de carga con decenas de alumnos reales.
- La interfaz no interviene: los alumnos de estas pruebas son peticiones directas al servidor.

## Hallazgo: límite de inicios de sesión anónimos
En el panel de Supabase, *Authentication → Rate Limits*, el límite de **inicios de sesión anónimos es de 30 por hora y por dirección IP** (valor leído al hacer estas pruebas, que se ejecutaron con ese límite de 30; después, el 2026-11-18, se subió a 60 para una clase de hasta 40 alumnos, ver ADR-011). En una clase de más de 30 alumnos en la misma red, el 31.º no podría entrar durante esa hora. Opciones:
- Subir el límite en el panel (aumenta la exposición a abusos; Supabase recomienda además activar captcha para anónimos).
- Que parte de los alumnos use datos móviles (otra IP).
- En una clase de 30 alumnos o menos no hace falta ningún cambio.

## Un error del propio script, corregido
La primera versión daba dos «FALLA» falsos porque comparaba el recuento final con los votos de la tanda actual e ignoraba los 12 votos de una tanda anterior en el mismo trabajo. La aritmética lo confirmó (suma previa 32; (32+1)/13 = la media devuelta por el servidor). Ahora el script admite `--baseline-count` y `--baseline-sum`. Con esos parámetros las comprobaciones de ese trabajo habrían pasado; no se ha vuelto a ejecutar con ellos, solo se ha comprobado a mano.

## Cómo repetirlo
```bash
node --env-file=.env scripts/concurrency-check.mjs race <CODIGO> 12 40
node --env-file=.env scripts/concurrency-check.mjs dups <CODIGO>
```
Antes, el profesor abre un trabajo (idealmente sin votos previos). Cuando el script muestre «YA», pulsa *Cerrar votación* en la app. Cada ejecución crea alumnos anónimos reales: 12 + 4 gastan 16 de las altas por hora (30 por defecto; 60 en este proyecto desde el 2026-11-18).

## Datos de prueba que deja
Usuarios anónimos, participantes y votos en la sesión de prueba. Borra esa sesión del proyecto cuando termines.
