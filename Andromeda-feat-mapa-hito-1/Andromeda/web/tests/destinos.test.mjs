import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validarDestinos, normalizar, buscarDestinos, coordenadaDe } from '../js/destinos.js';
import { dentroDeZona } from '../js/geo.js';

const leer = async (ruta) => JSON.parse(await readFile(new URL(ruta, import.meta.url), 'utf8'));

const destinos = [
  { id: 'zoo', nombre: 'Zoológico de Barranquilla', zona: 'La Concepción', lat: 11.01, lng: -74.79 },
  { id: 'catedral', nombre: 'Catedral Metropolitana', zona: 'Boston', lat: 10.98, lng: -74.79 },
];

test('los destinos reales son válidos y están dentro de la zona', async () => {
  const datos = await leer('../data/destinos.json');
  assert.deepEqual(validarDestinos(datos), []);
  assert.ok(datos.destinos.every((destino) => dentroDeZona(coordenadaDe(destino))));
});

test('rechaza datos sin el formato esperado o sin destinos', () => {
  assert.match(validarDestinos(null)[0], /formato/);
  assert.match(validarDestinos({ destinos: [] })[0], /ningún destino/);
});

test('señala nombre vacío, coordenadas inválidas e identificador repetido', () => {
  const errores = validarDestinos({
    destinos: [destinos[0], { ...destinos[0], nombre: ' ', lat: 200 }, null],
  });
  assert.ok(errores.some((m) => /nombre/.test(m)));
  assert.ok(errores.some((m) => /coordenadas/.test(m)));
  assert.ok(errores.some((m) => /repetido/.test(m)));
  assert.ok(errores.some((m) => /Destino 3/.test(m)));
});

test('normalizar quita tildes, mayúsculas y espacios sobrantes', () => {
  assert.equal(normalizar('  Zoológico   DE Barranquilla '), 'zoologico de barranquilla');
  assert.equal(normalizar(undefined), '');
});

test('busca sin tildes por nombre y por zona', () => {
  assert.deepEqual(buscarDestinos(destinos, 'zoologico').map((d) => d.id), ['zoo']);
  assert.deepEqual(buscarDestinos(destinos, 'BOSTON').map((d) => d.id), ['catedral']);
});

test('encuentra palabras en cualquier orden', () => {
  assert.deepEqual(buscarDestinos(destinos, 'barranquilla zoo').map((d) => d.id), ['zoo']);
});

test('sin texto devuelve todos y sin coincidencias devuelve una lista vacía', () => {
  assert.equal(buscarDestinos(destinos, '').length, 2);
  assert.deepEqual(buscarDestinos(destinos, 'playa'), []);
});

test('coordenadaDe convierte un destino en par de coordenadas', () => {
  assert.deepEqual(coordenadaDe(destinos[0]), [11.01, -74.79]);
});
