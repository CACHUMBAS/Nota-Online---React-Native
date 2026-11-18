import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

export const IDS = {
  teacherA: '00000000-0000-0000-0000-0000000000a1',
  teacherB: '00000000-0000-0000-0000-0000000000b1',
  studentOne: '00000000-0000-0000-0000-0000000000c1',
  studentTwo: '00000000-0000-0000-0000-0000000000c2',
};

/**
 * PostgreSQL real en memoria (PGlite) con un esquema `auth` mínimo que imita a Supabase:
 * `auth.uid()` y `auth.jwt()` leen los mismos ajustes de sesión que PostgREST rellena con el JWT.
 * Limitación: PGlite tiene una sola conexión, así que aquí no se prueban transacciones concurrentes reales.
 */
export async function createDb() {
  const db = new PGlite();
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE SCHEMA auth;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$ SELECT jsonb_build_object('is_anonymous',current_setting('request.jwt.claim.anonymous',true)::boolean) $$;
    GRANT USAGE ON SCHEMA auth TO authenticated; GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO authenticated;`);
  await db.exec(await readFile(new URL('../../supabase/migrations/202611170001_classroom.sql', import.meta.url), 'utf8'));

  /** Cambia la identidad con la que se ejecutan las siguientes llamadas (rol `authenticated`). */
  async function as(id: string, anonymous: boolean): Promise<void> {
    await db.exec('RESET ROLE');
    await db.query(
      "SELECT set_config('request.jwt.claim.sub',$1,false), set_config('request.jwt.claim.anonymous',$2,false)",
      [id, String(anonymous)],
    );
    await db.exec('SET ROLE authenticated');
  }

  /** Llama a una función de la API pública, como lo haría `supabase.rpc`. */
  async function call<T = unknown>(name: string, args: unknown[] = []): Promise<T> {
    const placeholders = args.map((_, index) => `$${index + 1}`).join(',');
    const result = await db.query<{ data: T }>(`SELECT public.${name}(${placeholders}) AS data`, args);
    return result.rows[0]!.data;
  }

  /** Vuelve al rol dueño de las tablas para probar las restricciones sin pasar por las funciones. */
  async function asOwner(): Promise<void> {
    await db.exec('RESET ROLE');
  }

  return { db, as, call, asOwner };
}
