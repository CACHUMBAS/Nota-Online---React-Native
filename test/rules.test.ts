import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validScore } from '../src/features/voting/domain/rules.ts';
import { normalizeCode } from '../src/features/sessions/domain/code.ts';
import { cleanText } from '../src/shared/domain/text.ts';
import { formatAverage } from '../src/shared/domain/format.ts';

test('acepta los extremos y rechaza notas inválidas sin coerción', () => {
  assert.equal(validScore(0), true); assert.equal(validScore(10), true);
  for (const value of [-1, 11, 2.5, NaN, Infinity, null, '', '5']) assert.equal(validScore(value), false);
});
test('normaliza códigos y rechaza longitudes inválidas', () => {
  assert.equal(normalizeCode(' ab12cd '), 'AB12CD');
  assert.throws(() => normalizeCode('abcd')); assert.throws(() => normalizeCode('ab 12c'));
});
test('valida textos vacíos y límites después de recortar', () => {
  assert.equal(cleanText(' Trabajo ', 80), 'Trabajo');
  assert.throws(() => cleanText('   ', 80)); assert.throws(() => cleanText('abcd', 3));
});
test('distingue cero votos de una media igual a cero', () => {
  assert.equal(formatAverage(null), 'Sin votos'); assert.equal(formatAverage(0), '0,0');
  assert.equal(formatAverage(7.5), '7,5');
});
