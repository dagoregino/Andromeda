import { test } from 'node:test';
import assert from 'node:assert/strict';

import { ajustarLineas } from '../js/texto.js';
import { interpolarPose, suavizar, alturaVisible, distanciaCamara, limitar } from '../js/pose.js';
import { indiceSiguiente, indiceMasCercano } from '../js/indices.js';
import { PREGUNTAS, validarPreguntas } from '../js/contenido.js';
import { ESCENAS, DIMENSIONES } from '../js/escenas.js';

const medirPorLetra = (texto) => texto.length * 10;

test('parte el texto en líneas que caben en el ancho', () => {
  assert.deepEqual(ajustarLineas('uno dos tres cuatro', 80, medirPorLetra), ['uno dos', 'tres', 'cuatro']);
});

test('corta una palabra más larga que la línea', () => {
  assert.deepEqual(ajustarLineas('abcdefghij', 40, medirPorLetra), ['abcd', 'efgh', 'ij']);
});

test('devuelve una lista vacía para un texto vacío', () => {
  assert.deepEqual(ajustarLineas('   ', 80, medirPorLetra), []);
});

test('limita un valor al rango indicado', () => {
  assert.equal(limitar(-1, 0, 1), 0);
  assert.equal(limitar(2, 0, 1), 1);
  assert.equal(limitar(0.4, 0, 1), 0.4);
});

test('suaviza de 0 a 1 sin salirse del rango', () => {
  assert.equal(suavizar(0), 0);
  assert.equal(suavizar(1), 1);
  assert.equal(suavizar(5), 1);
  assert.ok(suavizar(0.5) > 0.5);
});

test('interpola cada valor de la pose sin modificar las originales', () => {
  const desde = Object.freeze({ ry: 0, ocupa: 0.5 });
  const hasta = Object.freeze({ ry: 2, ocupa: 1 });
  assert.deepEqual(interpolarPose(desde, hasta, 0.5), { ry: 1, ocupa: 0.75 });
});

test('trata como cero un valor que falta en una pose', () => {
  assert.deepEqual(interpolarPose({ dx: 1 }, { dy: 2 }, 0.5), { dx: 0.5, dy: 1 });
});

test('aleja la cámara cuando el lienzo es angosto', () => {
  const base = { alto: 4, ancho: 3, ocupa: 1 };
  assert.equal(alturaVisible({ ...base, aspecto: 2 }), 4);
  assert.equal(alturaVisible({ ...base, aspecto: 0.5 }), 6);
});

test('calcula la distancia de la cámara a partir del ángulo de visión', () => {
  assert.ok(Math.abs(distanciaCamara(2, 90) - 1) < 1e-9);
});

test('el carrusel vuelve al inicio después de la última tarjeta', () => {
  assert.equal(indiceSiguiente(0, 3), 1);
  assert.equal(indiceSiguiente(2, 3), 0);
  assert.equal(indiceSiguiente(0, 0), 0);
});

test('encuentra la tarjeta más cercana al desplazamiento', () => {
  assert.equal(indiceMasCercano(480, [0, 500, 1000]), 1);
  assert.equal(indiceMasCercano(0, []), 0);
});

test('las preguntas de ejemplo son válidas', () => {
  assert.deepEqual(validarPreguntas(PREGUNTAS), []);
});

test('rechaza preguntas incompletas, repetidas o con un tipo desconocido', () => {
  const errores = validarPreguntas([
    { id: 'a', pregunta: '¿Hola?', respuesta: '', tipo: 'respuesta' },
    { id: 'a', pregunta: '¿Hola?', respuesta: 'Sí', tipo: 'otro' },
  ]);
  assert.equal(errores.length, 3);
});

test('rechaza una lista vacía de preguntas', () => {
  assert.equal(validarPreguntas([]).length, 1);
});

test('todas las escenas definen pose y pantalla', () => {
  for (const [nombre, escena] of Object.entries(ESCENAS)) {
    assert.ok(Number.isFinite(escena.pose.ocupa), `${nombre} sin pose.ocupa`);
    assert.ok(typeof escena.pantalla.tipo === 'string', `${nombre} sin pantalla.tipo`);
  }
  assert.ok(DIMENSIONES.alto > DIMENSIONES.ancho);
});
