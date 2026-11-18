# Preparar el proyecto Supabase dedicado

Proyecto **nuevo y exclusivo** para Nota Online (plan Free). No reutilizar el de Lumemon ni ningún otro.
Los nombres de los menús pueden variar ligeramente según la versión del panel de Supabase.

## 1. Crear el proyecto
1. En el panel de Supabase: *New project* → nombre `Nota Online`, plan Free, región cercana.
2. Guardar la contraseña de la base de datos en tu gestor de contraseñas. **No se usa en la app ni se pega en el chat.**

## 2. Aplicar la migración
1. *SQL Editor* → *New query*.
2. Pegar el contenido completo de `supabase/migrations/202611170001_classroom.sql` y ejecutar.
3. Debe terminar sin errores. Comprobación: en *Table Editor* no aparecen tablas en `public` (las tablas están en el esquema privado `nota_private`) y en *Database → Functions* aparecen `create_classroom`, `add_classwork`, `set_classwork_state`, `close_classroom`, `join_classroom`, `submit_score` y `classroom_snapshot`.

## 3. Autenticación
- *Authentication → Sign In / Providers*: activar **Allow anonymous sign-ins** (identidad de los alumnos).
- Proveedor *Email*: **desactivar el registro abierto** (*Allow new users to sign up*), de modo que solo existan las cuentas de profesor que crees tú. Si se deja abierto, cualquiera podría registrarse y crear sesiones.
- *Authentication → Users → Add user*: crear la cuenta del profesor (correo y contraseña de prueba) y marcarla como confirmada.

## 4. Conectar la app (solo claves públicas)
1. *Project Settings → API*: copiar **Project URL** y la clave **publishable** (anon). Estas dos sí son públicas por diseño.
2. En la carpeta del proyecto, copiar `.env.example` a `.env` y rellenar:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://<tu-proyecto>.supabase.co
   EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<clave publishable>
   ```
3. `.env` está en `.gitignore`: no se sube a GitHub.

## Nunca
- Usar en la app la clave `service_role` / secret ni la contraseña de la base de datos. Las variables `EXPO_PUBLIC_*` quedan dentro de la aplicación empaquetada y son públicas.
