import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AppError, codeFromMessage, toAppError, ERROR_MESSAGES } from '../src/shared/lib/errors.ts';
import { parseSnapshot, parseClassroomList } from '../src/features/sessions/domain/parsers.ts';
import { parseId, parseScore } from '../src/shared/domain/parsers.ts';
import { findOpenProject, closedProjects } from '../src/features/projects/domain/projects.ts';
import { cleanOptionalText } from '../src/shared/domain/text.ts';
import { formatVoteCount } from '../src/shared/domain/format.ts';

const session = { id: 's1', title: 'Clase', code: 'ABC234', status: 'active', created_at: '2026-11-17T10:00:00+00:00' };
const project = (over: Record<string, unknown>) =>
  ({ id: 'p1', title: 'Uno', author: '', status: 'pending', vote_count: null, average: null, my_score: null, ...over });

test('los códigos del servidor se traducen y lo demás cae en un error genérico', () => {
  assert.equal(codeFromMessage('already_voted'), 'already_voted');
  assert.equal(codeFromMessage('  voting_closed '), 'voting_closed');
  assert.equal(codeFromMessage('Invalid login credentials'), 'invalid_credentials');
  assert.equal(codeFromMessage('Anonymous sign-ins are disabled'), 'anonymous_disabled');
  assert.equal(codeFromMessage('TypeError: Network request failed'), 'connection');
  assert.equal(codeFromMessage('algo raro'), 'unknown');
  // Un nombre heredado de Object no debe confundirse con un código.
  assert.equal(codeFromMessage('toString'), 'unknown');
});

test('toAppError conserva los AppError y envuelve el resto', () => {
  const original = new AppError('access_denied');
  assert.equal(toAppError(original), original);
  assert.equal(toAppError(new Error('Network request failed')).code, 'connection');
  assert.equal(toAppError('texto').code, 'unknown');
  assert.equal(new AppError('already_voted').message, ERROR_MESSAGES.already_voted);
});

test('parseSnapshot acepta la forma del servidor, con nulos para lo oculto', () => {
  const snapshot = parseSnapshot({
    session, is_owner: false, participant_count: 3,
    projects: [project({ status: 'open', my_score: 0 }), project({ id: 'p2', status: 'closed', vote_count: 2, average: 7.5 })],
  });
  assert.equal(snapshot.projects[0]!.my_score, 0); // un cero es un voto válido, no "sin voto"
  assert.equal(snapshot.projects[0]!.average, null);
  assert.equal(snapshot.projects[1]!.average, 7.5);
  assert.equal(findOpenProject(snapshot.projects)?.id, 'p1');
  assert.deepEqual(closedProjects(snapshot.projects).map((p) => p.id), ['p2']);
});

test('parseSnapshot rechaza respuestas con forma inesperada', () => {
  const valid = { session, is_owner: true, participant_count: 0, projects: [] };
  assert.doesNotThrow(() => parseSnapshot(valid));
  const broken: unknown[] = [
    null, 'texto', [],
    { ...valid, is_owner: 'si' },
    { ...valid, participant_count: '3' },
    { ...valid, projects: 'no' },
    { ...valid, session: { ...session, status: 'otra' } },
    { ...valid, projects: [project({ status: 'abierto' })] },
    { ...valid, projects: [project({ average: '7.5' })] },
    { ...valid, projects: [project({ my_score: Number.NaN })] },
  ];
  for (const value of broken) {
    assert.throws(() => parseSnapshot(value), (error: unknown) => error instanceof AppError && error.code === 'invalid_response');
  }
});

test('parseClassroomList, parseId y parseScore validan lo que devuelven las funciones', () => {
  assert.equal(parseClassroomList([session]).length, 1);
  assert.throws(() => parseClassroomList({}));
  assert.equal(parseId('abc'), 'abc');
  assert.throws(() => parseId(''));
  assert.throws(() => parseId(null));
  assert.equal(parseScore(0), 0);
  assert.throws(() => parseScore(2.5));
  assert.throws(() => parseScore('7'));
});

test('texto opcional y recuento de votos', () => {
  assert.equal(cleanOptionalText('   ', 80), '');
  assert.equal(cleanOptionalText(' Grupo A ', 80), 'Grupo A');
  assert.throws(() => cleanOptionalText('abcd', 3));
  assert.equal(formatVoteCount(1), '1 voto');
  assert.equal(formatVoteCount(0), '0 votos');
  assert.equal(formatVoteCount(12), '12 votos');
});
