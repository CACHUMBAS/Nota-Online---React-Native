// Pruebas de concurrencia contra un Supabase REAL de Nota Online.
// Solo usa la URL y la clave publishable (las mismas que la app). No necesita cuenta de profesor,
// pero el profesor debe abrir y cerrar las votaciones a mano desde la app.
//
// Uso (desde la raiz del proyecto, para que lea .env):
//   node --env-file=.env scripts/concurrency-check.mjs race <CODIGO> [ALUMNOS=12] [VENTANA_S=40] [--baseline-count=N --baseline-sum=S]
//   node --env-file=.env scripts/concurrency-check.mjs dups <CODIGO>  [--baseline-count=N --baseline-sum=S]
//
// - Cada alumno es un usuario anonimo NUEVO. Supabase limita los inicios de sesion anonimos
//   (30 por hora y por IP por defecto): con ALUMNOS=12 + 4 de "dups" se gastan 16.
// - Requiere un trabajo ABIERTO en la sesion. Si ese trabajo YA tiene votos de pruebas anteriores,
//   hay que pasar --baseline-count (cuantos votos habia) y --baseline-sum (la suma de sus notas),
//   o las comprobaciones del recuento final daran un falso fallo. Lo ideal es un trabajo sin votos.
// - Crea datos de prueba en el proyecto (usuarios anonimos, participantes y votos): borra la
//   sesion de prueba cuando acabes.

const URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const KEY = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!URL || !KEY) {
  console.error('Faltan EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY (usa --env-file=.env)');
  process.exit(2);
}

const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter((a) => a.startsWith('--')).map((a) => { const [k, v] = a.slice(2).split('='); return [k, v]; }));
const positional = args.filter((a) => !a.startsWith('--'));
const baseCount = Number(flags['baseline-count'] ?? 0);
const baseSum = Number(flags['baseline-sum'] ?? 0);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const now = () => performance.now();

async function signupAnon() {
  const r = await fetch(`${URL}/auth/v1/signup`, {
    method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json' }, body: '{}',
  });
  if (!r.ok) throw new Error(`entrada anonima ${r.status}: ${await r.text()}`);
  return (await r.json()).access_token;
}

async function rpc(token, fn, rpcArgs) {
  const t0 = now();
  const r = await fetch(`${URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: { apikey: KEY, 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(rpcArgs),
  });
  const t1 = now();
  const text = await r.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  return { ok: r.ok, status: r.status, body, t0, t1, msg: r.ok ? null : (body?.message ?? text) };
}

async function newStudents(code, n, prefix) {
  const students = [];
  for (let i = 0; i < n; i++) {
    const token = await signupAnon();
    const j = await rpc(token, 'join_classroom', { p_code: code, p_alias: `${prefix} ${i + 1}` });
    if (!j.ok) throw new Error(`join_classroom fallo: ${j.msg}`);
    students.push({ token, classroom: j.body });
  }
  return students;
}

async function snapshot(student) {
  const s = await rpc(student.token, 'classroom_snapshot', { p_classroom: student.classroom });
  if (!s.ok) throw new Error(`snapshot fallo: ${s.msg}`);
  return s.body;
}

async function waitClosed(student, workId, maxSeconds) {
  const until = Date.now() + maxSeconds * 1000;
  while (Date.now() < until) {
    const snap = await snapshot(student);
    const p = snap.projects.find((x) => x.id === workId);
    if (p && p.status === 'closed') return p;
    await sleep(2000);
  }
  return null;
}

const pct = (arr, q) => { const s = [...arr].sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor(q * s.length))]; };
const check = (label, ok, detail = '') => { console.log(`${ok ? 'PASA ' : 'FALLA'}  ${label}${detail ? '  ' + detail : ''}`); return ok; };
const baselineNote = () => (baseCount ? `incluye ${baseCount} votos previos (suma ${baseSum})` : 'asume un trabajo SIN votos previos');

async function race(code, n, windowSec) {
  console.log(`Creando ${n} alumnos anonimos y uniendolos a ${code}...`);
  const students = await newStudents(code, n, 'Carrera');
  const snap0 = await snapshot(students[0]);
  const work = snap0.projects.find((p) => p.status === 'open');
  if (!work) { console.error('No hay ningun trabajo ABIERTO en la sesion. Abre uno y repite.'); process.exit(3); }
  console.log(`Trabajo abierto: "${work.title}" (${baselineNote()})`);
  console.log('\n================================================');
  console.log(`>>> YA: pulsa "Cerrar votacion" en el movil, en cualquier momento de los proximos ${windowSec} s (mejor a mitad) <<<`);
  console.log('================================================\n');

  const T0 = now();
  const results = [];
  await Promise.all(students.map(async (s, i) => {
    await sleep(Math.random() * windowSec * 1000);
    const score = Math.floor(Math.random() * 11);
    const r = await rpc(s.token, 'submit_score', { p_work: work.id, p_score: score });
    results.push({ i, score, start: (r.t0 - T0) / 1000, end: (r.t1 - T0) / 1000, ms: r.t1 - r.t0, ok: r.ok, msg: r.msg, status: r.status });
  }));
  results.sort((a, b) => a.end - b.end);
  console.log('alumno  nota  inicio(s)  fin(s)   ms   resultado');
  for (const r of results) {
    console.log(`${String(r.i + 1).padStart(6)}  ${String(r.score).padStart(4)}  ${r.start.toFixed(2).padStart(9)}  ${r.end.toFixed(2).padStart(6)}  ${String(Math.round(r.ms)).padStart(4)}   ${r.ok ? 'aceptado' : r.msg}`);
  }

  console.log('\nEsperando a que el trabajo conste como cerrado (hasta 90 s)...');
  const closed = await waitClosed(students[0], work.id, 90);
  if (!closed) { console.log('El trabajo no se cerro en 90 s: no se puede verificar el recuento final.'); process.exit(4); }

  const accepted = results.filter((r) => r.ok);
  const rejected = results.filter((r) => !r.ok);
  const expectedCount = baseCount + accepted.length;
  const expectedMean = expectedCount ? (baseSum + accepted.reduce((a, r) => a + r.score, 0)) / expectedCount : null;
  const firstClosedEnd = rejected.filter((r) => r.msg === 'voting_closed').reduce((m, r) => Math.min(m, r.end), Infinity);
  const late = accepted.filter((r) => r.start > firstClosedEnd);

  console.log(`\nAceptados: ${accepted.length}   Rechazados por cierre: ${rejected.filter((r) => r.msg === 'voting_closed').length}   Otros errores: ${rejected.filter((r) => r.msg !== 'voting_closed').length}`);
  console.log(`Latencia submit_score: p50 ${Math.round(pct(results.map((r) => r.ms), 0.5))} ms, p95 ${Math.round(pct(results.map((r) => r.ms), 0.95))} ms`);
  console.log(`Estado final segun el servidor: vote_count=${closed.vote_count} average=${closed.average}\n`);
  let all = true;
  all = check('El recuento final coincide con los votos esperados', closed.vote_count === expectedCount, `(servidor ${closed.vote_count} / esperado ${expectedCount})`) && all;
  all = check('La media final coincide con la esperada', expectedMean === null ? closed.average === null : Math.abs(Number(closed.average) - expectedMean) < 1e-9, `(servidor ${closed.average} / esperada ${expectedMean})`) && all;
  all = check('Ningun voto empezado DESPUES de ver un cierre fue aceptado', late.length === 0, firstClosedEnd === Infinity ? '(nadie vio el cierre: se cerro tras la ventana)' : `(primer rechazo visto a los ${firstClosedEnd.toFixed(2)} s)`) && all;
  all = check('Todos los rechazos son voting_closed (sin 429/5xx)', rejected.every((r) => r.msg === 'voting_closed'), rejected.filter((r) => r.msg !== 'voting_closed').map((r) => `${r.status}:${r.msg}`).join(' ')) && all;
  console.log(all ? '\nRESULTADO: TODO CORRECTO' : '\nRESULTADO: HAY FALLOS');
  if (firstClosedEnd === Infinity) console.log('AVISO: ningun alumno llego a ver el cierre, asi que la carrera real no se ha ejercitado. Repite cerrando antes.');
  if (rejected.length === 0) console.log('AVISO: no hubo ningun voto rechazado; se cerro despues de todos los votos.');
  console.log('LIMITE: el cierre lo pulsa una persona; salvo que caiga justo entre dos votos, no se estresa el instante limite.');
}

async function dups(code) {
  console.log('Creando 4 alumnos anonimos...');
  const students = await newStudents(code, 4, 'Duplicado');
  const snap0 = await snapshot(students[0]);
  const work = snap0.projects.find((p) => p.status === 'open');
  if (!work) { console.error('No hay ningun trabajo ABIERTO en la sesion. Abre uno y repite.'); process.exit(3); }
  console.log(`Trabajo abierto: "${work.title}" (${baselineNote()})\n`);
  const plans = [
    { name: 'alumno 1: 8 envios paralelos de la MISMA nota (7)', scores: Array(8).fill(7) },
    { name: 'alumno 2: 8 envios paralelos de la MISMA nota (3)', scores: Array(8).fill(3) },
    { name: 'alumno 3: 8 envios paralelos de notas DISTINTAS', scores: [0, 1, 2, 3, 4, 5, 6, 7] },
    { name: 'alumno 4: 8 envios paralelos de notas DISTINTAS', scores: [10, 9, 8, 7, 6, 5, 4, 3] },
  ];
  const acceptedScores = [];
  let all = true;
  for (let k = 0; k < 4; k++) {
    const rs = await Promise.all(plans[k].scores.map((sc) => rpc(students[k].token, 'submit_score', { p_work: work.id, p_score: sc }).then((r) => ({ sc, r }))));
    const oks = rs.filter((x) => x.r.ok);
    const bad = rs.filter((x) => !x.r.ok);
    const returned = new Set(oks.map((x) => x.r.body));
    console.log(`${plans[k].name}: ${oks.length} aceptados, ${bad.length} rechazados (${[...new Set(bad.map((x) => x.r.msg))].join(',') || '-'})`);
    const identical = new Set(plans[k].scores).size === 1;
    if (identical) {
      all = check('  todas las repeticiones devuelven la misma nota', oks.length === 8 && returned.size === 1) && all;
    } else {
      all = check('  exactamente un envio ganador; el resto already_voted', oks.length === 1 && bad.length === 7 && bad.every((x) => x.r.msg === 'already_voted')) && all;
    }
    const mine = (await snapshot(students[k])).projects.find((p) => p.id === work.id).my_score;
    const winner = oks.length ? oks[0].r.body : null;
    all = check('  my_score del servidor coincide con la nota aceptada', mine === winner, `(servidor ${mine} / aceptada ${winner})`) && all;
    if (winner !== null) acceptedScores.push(winner);
  }
  console.log('\n================================================');
  console.log('>>> YA: pulsa "Cerrar votacion" en el movil para poder verificar el recuento <<<');
  console.log('================================================\n');
  const closed = await waitClosed(students[0], work.id, 120);
  if (!closed) { console.log('El trabajo no se cerro en 120 s: no se puede verificar el recuento final.'); process.exit(4); }
  const expectedCount = baseCount + acceptedScores.length;
  const expectedMean = (baseSum + acceptedScores.reduce((a, b) => a + b, 0)) / expectedCount;
  console.log(`Estado final segun el servidor: vote_count=${closed.vote_count} average=${closed.average}`);
  all = check('Un unico voto por alumno pese a los envios paralelos', closed.vote_count === expectedCount, `(servidor ${closed.vote_count}, esperado ${expectedCount})`) && all;
  all = check('La media coincide con las notas aceptadas', Math.abs(Number(closed.average) - expectedMean) < 1e-9, `(servidor ${closed.average} / calculada ${expectedMean})`) && all;
  console.log(all ? '\nRESULTADO: TODO CORRECTO' : '\nRESULTADO: HAY FALLOS');
}

const [mode, code, a, b] = positional;
try {
  if (mode === 'race') await race(code, Number(a ?? 12), Number(b ?? 40));
  else if (mode === 'dups') await dups(code);
  else {
    console.error('Uso: concurrency-check.mjs race <CODIGO> [ALUMNOS] [VENTANA_S] | dups <CODIGO>  [--baseline-count=N --baseline-sum=S]');
    process.exit(2);
  }
} catch (e) {
  console.error('ERROR:', e.message);
  process.exit(1);
}
