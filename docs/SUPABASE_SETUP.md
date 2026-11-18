# Preparar el Supabase de Nota Online (paso a paso)

**Qué es Supabase:** un servicio online (con plan gratuito) que aquí hace de base de datos compartida y de sistema de usuarios. Gracias a él, el móvil del profesor y los de los alumnos ven los mismos datos.

Usa un proyecto **nuevo y exclusivo** para esta app. No reutilices el de Lumemon ni ningún otro.
Los nombres de los menús pueden cambiar un poco con el tiempo; si algo no coincide, busca el equivalente.

## 1. Cuenta y proyecto
1. Entra en https://supabase.com y crea una cuenta gratuita (puedes usar tu cuenta de GitHub). Ese paso lo haces tú.
2. *New project* (si pide una organización, crea una personal) y rellena:
   - **Name:** `Nota Online`.
   - **Database password:** pulsa *Generate a password* y guárdala en un lugar privado. No se usa en la app y no debes pegarla en ningún chat ni archivo del proyecto.
   - **Region:** una de Europa.
   - **Plan:** Free.
3. *Create new project* y espera un par de minutos hasta que termine de prepararse.

## 2. Crear las tablas y funciones (SQL)
Se hace **tres veces, en este orden**, con un archivo cada vez (si tu proyecto ya tenía la 001 y la 002, basta con la 003):

1. Menú lateral → **SQL Editor** → *New query*.
2. Abre en tu ordenador `supabase/migrations/202611170001_classroom.sql`, selecciona todo (`Ctrl+A`), copia (`Ctrl+C`), pega en el editor de Supabase y pulsa **Run**.
   - Resultado esperado: *Success. No rows returned*.
3. Repite con una consulta nueva (*New query*) para `supabase/migrations/202611170002_list_classrooms.sql`.
4. Repite otra vez para `supabase/migrations/202611180003_delete_classroom.sql` (es la que activa el botón **Borrar sesión**; sin ella el botón dará error). El editor avisará de «operaciones destructivas» por el texto `delete from` del cuerpo de la función: es normal, la migración solo define la función y no borra nada al ejecutarse; confirma el aviso.

Comprobación: *Database → Functions* debe listar `create_classroom`, `add_classwork`, `set_classwork_state`, `close_classroom`, `join_classroom`, `submit_score`, `classroom_snapshot`, `list_classrooms` y `delete_classroom`. En *Table Editor* no verás tablas de la app: están a propósito en un esquema privado.

## 3. Usuarios (autenticación)
1. Menú lateral → **Authentication** → **Sign In / Providers**.
2. Activa **Allow anonymous sign-ins**. Así entran los alumnos sin correo.
3. Deja activado **Allow new users to sign up** (ver la nota de abajo).
4. Menú **Authentication → Users → Add user → Create new user**: pon un correo y una contraseña para el profesor y marca **Auto Confirm User**. Anótalos: son los datos con los que el profesor entra en la app.

> **Nota sobre el registro abierto.** Lo lógico sería cerrar el registro para que solo exista tu cuenta de profesor, pero no he podido confirmar en la documentación oficial si hacerlo impediría también la entrada anónima de los alumnos (una fuente de terceros indica que probablemente sí). Por eso se deja activado.
> Consecuencia real: cualquiera que consiga la clave pública podría registrarse con un correo y crear sus **propias** sesiones. No podría ver ni modificar las de otros (el servidor comprueba el propietario), pero «profesor» no equivale a «cuenta autorizada».
> Si quieres cerrarlo: desactiva el registro, prueba a entrar como alumno y, si falla, vuelve a activarlo.

## 4. Conectar la app: dos datos públicos
1. En el proyecto, pulsa **Connect** (arriba) o ve a **Settings → API Keys**.
2. Copia:
   - **Project URL** (`https://xxxxxxxx.supabase.co`).
   - **Publishable key** (empieza por `sb_publishable_`). Si tu panel solo muestra la clave `anon` (una cadena larga que empieza por `eyJ`), vale igual.
3. En la carpeta del proyecto crea el archivo `.env` copiando el de ejemplo y rellénalo:
   ```powershell
   Copy-Item .env.example .env
   ```
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```
4. `.env` está en `.gitignore`: no se sube a GitHub.
5. Arranca con `npx expo start -c` (el `-c` limpia la caché para que lea el `.env`). La pantalla «Falta conectar el servidor» debe desaparecer.

## Qué NO hay que usar nunca
- La clave **secret / `service_role`** ni la contraseña de la base de datos. Las variables `EXPO_PUBLIC_*` acaban dentro de la aplicación empaquetada y cualquiera puede leerlas. Solo se usan la URL y la clave publishable.
- No pegues claves secretas ni contraseñas en el chat con una IA. La URL y la clave publishable sí son públicas por diseño.

## Si algo falla
| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| La app sigue diciendo «Falta conectar el servidor» | `.env` mal puesto o Expo con caché | Revisa nombres y valores; `npx expo start -c` |
| «El acceso de alumnos no está activado» | Anónimos desactivados | Paso 3.2 |
| Mensaje de que no se permiten nuevos registros | Registro desactivado | Paso 3.3 |
| «Correo o contraseña incorrectos» | Cuenta mal escrita o no confirmada | Paso 3.4 (*Auto Confirm User*) |
| «permission denied for function …» o error inesperado al crear sesión | Falta alguna migración | Repite el paso 2 completo |
| «No hay conexión con el servidor» | URL mal copiada o sin internet | Revisa la URL del `.env` |
