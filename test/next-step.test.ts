import { test } from 'node:test';
import assert from 'node:assert/strict';
import { teacherNextStep } from '../src/features/sessions/domain/nextStep.ts';
import type { ClassroomSession, Project } from '../src/shared/domain/classroom.ts';

const session = (status: ClassroomSession['status']): ClassroomSession =>
  ({ id: 's1', title: 'Clase', code: 'ABC234', status, created_at: '2026-11-18T10:00:00+00:00' });
const project = (over: Partial<Project>): Project =>
  ({ id: 'p', title: 'Trabajo', author: '', status: 'pending', vote_count: 0, average: null, my_score: null, ...over });

test('sin trabajos pide añadir el primero y avisa si aún no ha entrado nadie', () => {
  const empty = teacherNextStep({ session: session('active'), projects: [], participant_count: 3 });
  assert.equal(empty.title, 'Añade el primer trabajo');
  assert.equal(empty.tone, 'accent');
  assert.doesNotMatch(empty.detail, /ningún alumno/);
  const alone = teacherNextStep({ session: session('active'), projects: [], participant_count: 0 });
  assert.match(alone.detail, /ningún alumno/);
});

test('con trabajos pendientes propone abrir el primero pendiente, no uno ya cerrado', () => {
  const step = teacherNextStep({
    session: session('active'),
    participant_count: 2,
    projects: [project({ id: 'a', title: 'Cerrado', status: 'closed', average: 7 }), project({ id: 'b', title: 'Siguiente' }), project({ id: 'c', title: 'Otro' })],
  });
  assert.equal(step.title, 'Abre la votación de «Siguiente»');
});

test('con una votación abierta muestra cuántos han votado y cómo seguir', () => {
  const step = teacherNextStep({
    session: session('active'),
    participant_count: 5,
    projects: [project({ title: 'En curso', status: 'open', vote_count: 1 }), project({ id: 'b', title: 'Pendiente' })],
  });
  assert.equal(step.title, 'Se está votando «En curso»');
  assert.match(step.detail, /1 voto\b/);
  assert.match(step.detail, /Cerrar votación/);
  assert.equal(step.tone, 'warning');
  // Un recuento nulo no debe romper el texto.
  assert.match(
    teacherNextStep({ session: session('active'), participant_count: 5, projects: [project({ status: 'open', vote_count: null })] }).detail,
    /0 votos/,
  );
});

test('con todos los trabajos cerrados propone terminar o añadir más', () => {
  const step = teacherNextStep({
    session: session('active'),
    participant_count: 4,
    projects: [project({ status: 'closed', average: 8 }), project({ id: 'b', status: 'closed', average: null })],
  });
  assert.equal(step.title, 'Todos los trabajos están valorados');
  assert.equal(step.tone, 'success');
});

test('una sesión cerrada manda sobre todo lo demás, incluso con trabajos pendientes', () => {
  const step = teacherNextStep({
    session: session('closed'),
    participant_count: 0,
    projects: [project({ status: 'pending' })],
  });
  assert.equal(step.title, 'La sesión ha terminado');
  assert.match(step.detail, /borrar la sesión/);
});
