import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  esCoordenada,
  distanciaMetros,
  proyectarEnTramo,
  avancesDe,
  tramoEntre,
  dentroDeZona,
  formatearDistancia,
} from '../js/geo.js';

const cerca = (real, esperado, margen) =>
  assert.ok(Math.abs(real - esperado) <= margen, `${real} no está a ${margen} de ${esperado}`);

// Una milésima de grado de latitud son unos 111 m.
const LINEA = [[10.0, -74.0], [10.001, -74.0], [10.002, -74.0]];

test('esCoordenada acepta pares válidos y rechaza lo demás', () => {
  assert.equal(esCoordenada([10.9, -74.8]), true);
  for (const malo of [null, [], [10], [91, 0], [0, 181], ['10', '-74'], [Number.NaN, 0], { lat: 1, lng: 2 }]) {
    assert.equal(esCoordenada(malo), false, JSON.stringify(malo));
  }
});

test('distanciaMetros mide cero en el mismo punto y unos 111 m por milésima de latitud', () => {
  assert.equal(distanciaMetros(LINEA[0], LINEA[0]), 0);
  cerca(distanciaMetros(LINEA[0], LINEA[1]), 111, 1);
});

test('proyectarEnTramo encuentra el punto perpendicular dentro del tramo', () => {
  const r = proyectarEnTramo([10.0005, -74.001], LINEA[0], LINEA[1]);
  cerca(r.fraccion, 0.5, 0.01);
  cerca(r.distancia, 109.5, 1.5);
});

test('proyectarEnTramo se queda en el extremo cuando el punto cae fuera', () => {
  const r = proyectarEnTramo([9.999, -74.0], LINEA[0], LINEA[1]);
  assert.equal(r.fraccion, 0);
  assert.deepEqual(r.punto, LINEA[0]);
});

test('proyectarEnTramo admite un tramo de longitud cero', () => {
  const r = proyectarEnTramo([10.001, -74.0], LINEA[0], LINEA[0]);
  assert.equal(r.fraccion, 0);
  cerca(r.distancia, 111, 1);
});

test('avancesDe acumula la distancia a lo largo del recorrido', () => {
  const avances = avancesDe(LINEA);
  assert.equal(avances[0], 0);
  cerca(avances[2], 222, 2);
  assert.deepEqual(avancesDe([LINEA[0]]), [0]);
});

test('tramoEntre corta el recorrido entre dos posiciones sin modificarlo', () => {
  const copia = structuredClone(LINEA);
  const desde = { indice: 0, punto: [10.0005, -74.0] };
  const hasta = { indice: 1, punto: [10.0015, -74.0] };
  assert.deepEqual(tramoEntre(LINEA, desde, hasta), [[10.0005, -74.0], [10.001, -74.0], [10.0015, -74.0]]);
  assert.deepEqual(LINEA, copia);
});

test('tramoEntre da la vuelta cuando la bajada va antes que la subida', () => {
  const desde = { indice: 1, punto: [10.0015, -74.0] };
  const hasta = { indice: 0, punto: [10.0005, -74.0] };
  const tramo = tramoEntre(LINEA, desde, hasta, { daLaVuelta: true });
  assert.deepEqual(tramo.at(0), desde.punto);
  assert.deepEqual(tramo.at(-1), hasta.punto);
  assert.ok(tramo.length > 2);
});

test('dentroDeZona distingue Barranquilla de otras ciudades', () => {
  assert.equal(dentroDeZona([10.9685, -74.7813]), true);
  assert.equal(dentroDeZona([4.711, -74.0721]), false);
  assert.equal(dentroDeZona(null), false);
});

test('formatearDistancia usa metros redondeados y kilómetros con coma', () => {
  assert.equal(formatearDistancia(4), '10 m');
  assert.equal(formatearDistancia(347), '350 m');
  assert.equal(formatearDistancia(996), '1,0 km');
  assert.equal(formatearDistancia(2438), '2,4 km');
});
