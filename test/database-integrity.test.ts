import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createDb, IDS } from './support/pglite.ts';
import type { ClassroomSession, SessionSnapshot } from '../src/features/sessions/types.ts';

test('aislamiento entre sesiones: nadie opera ni lee en una sesión ajena', async () => {
  const t = await createDb();
  try {
    await t.as(IDS.teacherA, false);
    const roomA = await t.call<ClassroomSession>('create_classroom', ['Aula A']);
    const workA = await t.call<string>('add_classwork', [roomA.id, 'Trabajo A', '']);
    await t.call('set_classwork_state', [workA, 'open']);

    await t.as(IDS.teacherB, false);
    const roomB = await t.call<ClassroomSession>('create_classroom', ['Aula B']);
    const workB = await t.call<string>('add_classwork', [roomB.id, 'Trabajo B', '']);
    await t.call('set_classwork_state', [workB, 'open']);

    // El profesor A no puede gestionar la sesión del profesor B.
    await t.as(IDS.teacherA, false);
    await assert.rejects(t.call('add_classwork', [roomB.id, 'Intruso', '']), /access_denied/);
    await assert.rejects(t.call('set_classwork_state', [workB, 'closed']), /access_denied/);
    await assert.rejects(t.call('close_classroom', [roomB.id]), /access_denied/);

    // Un alumno de A no vota ni lee en B, pero sí en A.
    await t.as(IDS.studentOne, true);
    await t.call('join_classroom', [roomA.code, 'Ana']);
    await assert.rejects(t.call('submit_score', [workB, 7]), /access_denied/);
    await assert.rejects(t.call('classroom_snapshot', [roomB.id]), /access_denied/);
    assert.equal(await t.call('submit_score', [workA, 7]), 7);

    // El voto en A no aparece en la sesión B.
    await t.as(IDS.teacherB, false);
    const snapshotB = await t.call<SessionSnapshot>('classroom_snapshot', [roomB.id]);
    assert.equal(snapshotB.participant_count, 0);
    assert.equal(snapshotB.projects[0]!.vote_count, 0);
  } finally {
    await t.db.close();
  }
});

test('los resultados no se exponen antes del cierre; la media la calcula el servidor', async () => {
  const t = await createDb();
  try {
    await t.as(IDS.teacherA, false);
    const room = await t.call<ClassroomSession>('create_classroom', ['Resultados']);
    const first = await t.call<string>('add_classwork', [room.id, 'Uno', '']);
    const second = await t.call<string>('add_classwork', [room.id, 'Dos', '']);
    await t.call('add_classwork', [room.id, 'Tres', '']); // se queda pendiente
    await t.call('set_classwork_state', [first, 'open']);

    await t.as(IDS.studentOne, true);
    await t.call('join_classroom', [room.code, 'Ana']);
    await t.as(IDS.studentTwo, true);
    await t.call('join_classroom', [room.code, 'Luis']);

    // Un trabajo pendiente no admite votos.
    await assert.rejects(t.call('submit_score', [second, 5]), /voting_not_open/);

    await t.call('submit_score', [first, 9]);
    await t.as(IDS.studentOne, true);
    await t.call('submit_score', [first, 6]);

    // El alumno, con la votación abierta: ni recuento ni media, solo su propio voto.
    let snapshot = await t.call<SessionSnapshot>('classroom_snapshot', [room.id]);
    assert.deepEqual(
      [snapshot.projects[0]!.vote_count, snapshot.projects[0]!.average, snapshot.projects[0]!.my_score],
      [null, null, 6],
    );
    assert.equal(snapshot.projects[2]!.vote_count, null);

    // El profesor ve cuántos han votado, pero tampoco la media mientras está abierta.
    await t.as(IDS.teacherA, false);
    snapshot = await t.call<SessionSnapshot>('classroom_snapshot', [room.id]);
    assert.equal(snapshot.projects[0]!.vote_count, 2);
    assert.equal(snapshot.projects[0]!.average, null);
    assert.equal(snapshot.projects[0]!.my_score, null);

    // Tras cerrar, todos ven recuento y media.
    await t.call('set_classwork_state', [first, 'closed']);
    await t.as(IDS.studentOne, true);
    snapshot = await t.call<SessionSnapshot>('classroom_snapshot', [room.id]);
    assert.equal(snapshot.projects[0]!.vote_count, 2);
    assert.equal(snapshot.projects[0]!.average, 7.5);

    // Un trabajo cerrado sin votos devuelve media null ("Sin votos"), no un cero.
    await t.as(IDS.teacherA, false);
    await t.call('set_classwork_state', [second, 'open']);
    await t.call('set_classwork_state', [second, 'closed']);
    await t.as(IDS.studentOne, true);
    snapshot = await t.call<SessionSnapshot>('classroom_snapshot', [room.id]);
    assert.equal(snapshot.projects[1]!.status, 'closed');
    assert.equal(snapshot.projects[1]!.vote_count, 0);
    assert.equal(snapshot.projects[1]!.average, null);
    assert.equal(snapshot.projects[2]!.status, 'pending');
  } finally {
    await t.db.close();
  }
});

test('la base de datos impone sola la unicidad, el rango y la coherencia entre sesiones', async () => {
  const t = await createDb();
  try {
    await t.as(IDS.teacherA, false);
    const roomA = await t.call<ClassroomSession>('create_classroom', ['Aula A']);
    const workA1 = await t.call<string>('add_classwork', [roomA.id, 'A1', '']);
    const workA2 = await t.call<string>('add_classwork', [roomA.id, 'A2', '']);
    await t.call('set_classwork_state', [workA1, 'open']);
    await t.as(IDS.teacherB, false);
    const roomB = await t.call<ClassroomSession>('create_classroom', ['Aula B']);
    const workB = await t.call<string>('add_classwork', [roomB.id, 'B1', '']);
    await t.as(IDS.studentOne, true);
    await t.call('join_classroom', [roomA.code, 'Ana']);
    await t.call('submit_score', [workA1, 5]);

    // A partir de aquí se salta la API: se escribe directamente como dueño de las tablas.
    await t.asOwner();
    const participant = await t.db.query<{ id: string }>(
      'SELECT id FROM nota_private.participants WHERE classroom_id = $1', [roomA.id]);
    const participantId = participant.rows[0]!.id;
    const insertVote = (classroom: string, work: string, score: number) => t.db.query(
      'INSERT INTO nota_private.votes (classroom_id, work_id, participant_id, score) VALUES ($1,$2,$3,$4)',
      [classroom, work, participantId, score]);

    await assert.rejects(insertVote(roomA.id, workA1, 3), /duplicate key/); // un voto por trabajo y participante
    await assert.rejects(insertVote(roomA.id, workA2, 11), /check constraint/); // nota fuera de 0-10
    await assert.rejects(insertVote(roomB.id, workB, 5), /foreign key/); // participante de A votando en un trabajo de B
    await assert.rejects(
      t.db.query("UPDATE nota_private.works SET status = 'open' WHERE id = $1", [workA2]),
      /duplicate key/, // dos trabajos abiertos en la misma sesión
    );
  } finally {
    await t.db.close();
  }
});

test('list_classrooms devuelve solo las sesiones propias y no está disponible para alumnos', async () => {
  const t = await createDb();
  try {
    await t.as(IDS.teacherA, false);
    assert.deepEqual(await t.call<ClassroomSession[]>('list_classrooms'), []);
    await t.call('create_classroom', ['Primera']);
    await t.call('create_classroom', ['Segunda']);
    const own = await t.call<ClassroomSession[]>('list_classrooms');
    assert.deepEqual(own.map((room) => room.title).sort(), ['Primera', 'Segunda']);

    await t.as(IDS.teacherB, false);
    assert.deepEqual(await t.call<ClassroomSession[]>('list_classrooms'), []);

    await t.as(IDS.studentOne, true);
    await assert.rejects(t.call('list_classrooms'), /teacher_required/);
    await t.asOwner();
    await t.db.exec('SET ROLE anon');
    await assert.rejects(t.call('list_classrooms'), /permission denied/);
  } finally {
    await t.db.close();
  }
});

test('acceso a sesiones: código, alias, propietario y sesión cerrada', async () => {
  const t = await createDb();
  try {
    await t.as(IDS.teacherA, false);
    const room = await t.call<ClassroomSession>('create_classroom', ['Acceso']);
    assert.match(room.code, /^[A-Z0-9]{6}$/);
    await assert.rejects(t.call('create_classroom', ['   ']), /invalid_title/);
    // El profesor no puede unirse como alumno a su propia sesión (no votaría con otra identidad).
    await assert.rejects(t.call('join_classroom', [room.code, 'Profe']), /owner_cannot_join/);

    await t.as(IDS.studentOne, true);
    await assert.rejects(t.call('join_classroom', ['abc', 'Ana']), /invalid_code/);
    await assert.rejects(t.call('join_classroom', ['ZZZZZZ', 'Ana']), /session_not_found/);
    await assert.rejects(t.call('join_classroom', [room.code, '   ']), /invalid_alias/);
    // El código se acepta sin importar mayúsculas ni espacios.
    const joined = await t.call<string>('join_classroom', [` ${room.code.toLowerCase()} `, 'Ana']);
    assert.equal(joined, room.id);

    await t.as(IDS.teacherA, false);
    await t.call('close_classroom', [room.id]);
    await t.call('close_classroom', [room.id]); // cerrar dos veces no falla

    // Con la sesión cerrada: un alumno nuevo no entra; el que ya estaba sigue pudiendo consultarla.
    await t.as(IDS.studentTwo, true);
    await assert.rejects(t.call('join_classroom', [room.code, 'Luis']), /session_closed/);
    await t.as(IDS.studentOne, true);
    assert.equal(await t.call<string>('join_classroom', [room.code, 'Ana']), room.id);
    const snapshot = await t.call<SessionSnapshot>('classroom_snapshot', [room.id]);
    assert.equal(snapshot.session.status, 'closed');
  } finally {
    await t.db.close();
  }
});
