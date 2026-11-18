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
- **Motivo:** Permite probar migración, permisos y transacciones sin depender de que el proyecto Supabase exista. Es PostgreSQL real (WASM), pero no es Supabase: RLS y roles se simulan con `auth.uid()`/`auth.jwt()` mínimos. La verificación contra Supabase real sigue pendiente de crear el proyecto.
