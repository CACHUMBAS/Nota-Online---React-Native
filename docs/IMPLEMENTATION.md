# Nota Online: alcance y ejecución

Se conserva el stack y el alcance registrados por Antigravity en DECISIONS.md. El usuario ha encargado continuar el desarrollo el 17/11/2026. Repositorio: CACHUMBAS/Nota-Online---React-Native. La aplicación usa React Native real con Expo y TypeScript.

## Diseño de la entrega

Docente autenticado por correo y contraseña: crea sesiones, añade trabajos, abre y cierra votaciones, consulta recuentos y resultados. Estudiante: sesión anónima persistente del backend, acceso con código y alias, nota entera 0–10 confirmada en servidor. Un voto por identidad y trabajo; borrar la identidad permite otra participación, limitación declarada. No se promete un voto por persona.

Una sola votación abierta por sesión. Cierre irreversible. Resultados agregados visibles tras cerrar, sin votos ajenos individuales. Los votos y cambios de estado se serializan bloqueando la sesión en PostgreSQL. Ningún cliente posee privilegios administrativos. El código de sala no confiere permisos de docente.

Navegación con stack nativo. Componentes visuales compartidos, pantallas por funcionalidad, hooks de carga/acciones, servicios de datos y dominio puro. Backend dedicado pendiente de provisionar por el usuario; nunca reutilizar Lumemon. Sin credenciales aparece una pantalla explicativa, no una demo disfrazada de conexión real.

## Secuencia de trabajo

1. `chore/native-foundation`: configuración compatible del SDK, contratos y reglas, pruebas de límites.
2. `feat/secure-voting`: migración, permisos, RPC transaccionales y pruebas SQL; servicios cliente.
3. `feat/native-classroom`: pantallas de acceso, sesiones, trabajos, voto y resultados; manejo de red y ciclo de vida.
4. `docs/delivery`: guía de Supabase/Expo, defensa, comprobaciones y límites reales. Integrar y subir ramas comprobadas.

## Verificación

Validación de nota y textos; medias sin votos; SQL con identidades distintas, duplicados, permisos y cierre; tipado estricto y exportación del bundle Android. Revisión visual en el entorno disponible. La exportación no sustituye la prueba en móvil ni genera un APK. Probar con dos móviles requiere el proyecto Supabase y la participación del usuario.

## Decisiones acotadas

Sin registro abierto de docentes: cuenta preparada en Supabase. Sin QR, chat ni archivos. Actualización de estado mediante sondeo cada 4 segundos en pantalla activa y refresco al volver al primer plano; evita configurar canales con datos sensibles en la primera entrega. Los datos se guardan online; se describe esta decisión respecto de la propuesta inicial de Realtime. No se declara confirmada una escritura hasta recibir respuesta válida.
