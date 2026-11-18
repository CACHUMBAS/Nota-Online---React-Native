import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('PostgreSQL: permisos, ciclo de votación y reintentos', async () => {
  const { PGlite } = await import('@electric-sql/pglite');
  const db = new PGlite();
  try {
    await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE SCHEMA auth;
      CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$ SELECT jsonb_build_object('is_anonymous',current_setting('request.jwt.claim.anonymous',true)::boolean) $$;
      GRANT USAGE ON SCHEMA auth TO authenticated; GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO authenticated;`);
    await db.exec(await readFile(new URL('../supabase/migrations/202611170001_classroom.sql', import.meta.url), 'utf8'));
    const teacher = '00000000-0000-0000-0000-000000000001';
    const student = '00000000-0000-0000-0000-000000000002';
    const other = '00000000-0000-0000-0000-000000000003';
    async function identity(id: string, anonymous: boolean) {
      await db.exec('RESET ROLE');
      await db.query("SELECT set_config('request.jwt.claim.sub',$1,false), set_config('request.jwt.claim.anonymous',$2,false)", [id,String(anonymous)]);
      await db.exec('SET ROLE authenticated');
    }
    async function call(name: string, args: unknown[] = []) {
      const result = await db.query<{data: any}>(`SELECT public.${name}(${args.map((_, i) => `$${i+1}`).join(',')}) AS data`,args);
      return result.rows[0]!.data;
    }
    await identity(teacher,false);
    const room = await call('create_classroom',['Clase de prueba']);
    const project = await call('add_classwork',[room.id,'Proyecto uno','Grupo A']);
    const second = await call('add_classwork',[room.id,'Proyecto dos','']);
    await call('set_classwork_state',[project,'open']);
    await assert.rejects(call('set_classwork_state',[second,'open']), /already_open/);
    await identity(student,true);
    await assert.rejects(call('create_classroom',['Ataque']), /teacher_required/);
    await assert.rejects(call('classroom_snapshot',[room.id]), /access_denied/);
    await assert.rejects(db.query('SELECT * FROM nota_private.votes'), /permission denied/);
    await call('join_classroom',[room.code,'Ana']);
    await call('join_classroom',[room.code,'Ana']);
    await assert.rejects(call('set_classwork_state',[project,'closed']), /access_denied/);
    for (const score of [-1,11,2.5,null]) await assert.rejects(call('submit_score',[project,score]), /invalid_score/);
    assert.equal(await call('submit_score',[project,0]),0);
    assert.equal(await call('submit_score',[project,0]),0);
    await assert.rejects(call('submit_score',[project,9]), /already_voted/);
    let snapshot = await call('classroom_snapshot',[room.id]);
    assert.equal(snapshot.projects[0].average,null);
    assert.equal(snapshot.projects[0].my_score,0);
    assert.equal(snapshot.participant_count,1);
    await identity(other,false);
    await assert.rejects(call('classroom_snapshot',[room.id]), /access_denied/);
    await assert.rejects(call('close_classroom',[room.id]), /access_denied/);
    await identity(teacher,false);
    snapshot = await call('classroom_snapshot',[room.id]);
    assert.equal(snapshot.projects[0].vote_count,1);
    assert.equal(snapshot.projects[0].average,null);
    await call('set_classwork_state',[project,'closed']);
    await assert.rejects(call('set_classwork_state',[project,'open']), /invalid_transition/);
    snapshot = await call('classroom_snapshot',[room.id]);
    assert.equal(snapshot.projects[0].average,0);
    assert.equal(snapshot.projects[1].average,null);
    await identity(student,true);
    assert.equal(await call('submit_score',[project,0]),0); // Acuse de un voto ya confirmado, incluso tras cerrar.
    await identity(other,true);
    await call('join_classroom',[room.code,'Luis']);
    await assert.rejects(call('submit_score',[project,8]), /voting_closed/);
    await identity(teacher,false);
    await call('set_classwork_state',[second,'open']);
    await identity(other,true);
    await call('submit_score',[second,9]);
    await identity(student,true);
    await call('submit_score',[second,6]);
    await identity(teacher,false);
    await call('close_classroom',[room.id]);
    snapshot = await call('classroom_snapshot',[room.id]);
    assert.equal(snapshot.session.status,'closed');
    assert.equal(snapshot.projects[1].status,'closed');
    assert.equal(snapshot.projects[1].average,7.5);
    await assert.rejects(call('add_classwork',[room.id,'Tarde','']), /session_closed/);
    await db.exec('RESET ROLE; SET ROLE anon');
    await assert.rejects(call('classroom_snapshot',[room.id]), /permission denied/);
  } finally { await db.close(); }
});
