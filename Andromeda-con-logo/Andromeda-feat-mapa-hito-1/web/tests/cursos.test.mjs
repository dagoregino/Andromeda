import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { TODOS, separar, coincide, textoCuenta } from '../js/cursos-filtro.js';

test('separar parte las claves por espacios y tolera vacíos', () => {
  assert.deepEqual(separar('ninos  jovenes'), ['ninos', 'jovenes']);
  assert.deepEqual(separar(''), []);
  assert.deepEqual(separar(undefined), []);
});

test('coincide sin filtros muestra todo', () => {
  assert.equal(coincide({ edad: 'ninos', tema: 'calor' }), true);
  assert.equal(coincide({ edad: 'ninos', tema: 'calor' }, TODOS, TODOS), true);
});

test('coincide filtra por edad aunque el curso sirva a varias', () => {
  const curso = { edad: 'jovenes adultos', tema: 'datos' };
  assert.equal(coincide(curso, 'jovenes', TODOS), true);
  assert.equal(coincide(curso, 'adultos', TODOS), true);
  assert.equal(coincide(curso, 'ninos', TODOS), false);
});

test('coincide exige edad y tema a la vez', () => {
  const curso = { edad: 'ninos', tema: 'calor' };
  assert.equal(coincide(curso, 'ninos', 'calor'), true);
  assert.equal(coincide(curso, 'ninos', 'datos'), false);
  assert.equal(coincide(curso, 'adultos', 'calor'), false);
});

test('textoCuenta cubre vacío, todos, parcial y singular', () => {
  assert.equal(textoCuenta(0, 14), 'Ningún curso coincide con estos filtros.');
  assert.equal(textoCuenta(14, 14), 'Mostrando los 14 cursos.');
  assert.equal(textoCuenta(3, 14), 'Mostrando 3 de 14 cursos.');
  assert.equal(textoCuenta(1, 14), 'Mostrando 1 de 14 cursos.');
});

// El HTML y el filtro deben usar las mismas claves, o una tarjeta quedaría fuera de todos los filtros.
test('cada tarjeta de la página de cursos usa edades y temas que existen en los filtros', () => {
  const html = readFileSync(new URL('../cursos/index.html', import.meta.url), 'utf8');
  const opciones = (nombre) =>
    [...html.matchAll(new RegExp(`name="${nombre}" value="([a-z]+)"`, 'g'))].map((m) => m[1]).filter((v) => v !== TODOS);
  const edades = opciones('edad');
  const temas = opciones('tema');
  const tarjetas = [...html.matchAll(/<li class="curso" data-edad="([^"]+)" data-tema="([^"]+)">/g)];
  assert.ok(tarjetas.length > 0);
  for (const [, edad, tema] of tarjetas) {
    for (const e of separar(edad)) assert.ok(edades.includes(e), `edad desconocida: ${e}`);
    assert.ok(temas.includes(tema), `tema desconocido: ${tema}`);
  }
  for (const e of edades) assert.ok(tarjetas.some(([, ed]) => separar(ed).includes(e)), `sin cursos de edad ${e}`);
  for (const t of temas) assert.ok(tarjetas.some(([, , tm]) => tm === t), `sin cursos de tema ${t}`);
});
