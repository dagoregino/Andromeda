import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  validarDatos,
  pasoActual,
  pasosHasta,
  componentesActivos,
  duracionTotal,
  siguienteIndice,
  anteriorIndice,
  formatearMinuto,
} from '../js/escenarios.js';

const leer = async (ruta) => JSON.parse(await readFile(new URL(ruta, import.meta.url), 'utf8'));

const escenario = {
  id: 'prueba',
  nombre: 'Prueba',
  resumen: 'Escenario de prueba',
  pasos: [
    { minuto: 0, componente: 'D', punto: 'p1', accion: 'Alerta', quien: 'Sala' },
    { minuto: 5, componente: 'B', punto: 'p1', accion: 'Atiende', quien: 'Cuadrilla' },
    { minuto: 9, componente: 'D', punto: 'p2', accion: 'Avisa', quien: 'Sala' },
  ],
};
const puntos = [{ id: 'p1' }, { id: 'p2' }];
const componentes = { B: 'B', D: 'D' };

test('los datos reales del simulador son válidos', async () => {
  const p = await leer('../data/puntos.json');
  const e = await leer('../data/escenarios.json');
  assert.deepEqual(validarDatos(p.puntos, e), []);
});

test('detecta un paso que apunta a un punto inexistente', () => {
  const malo = { componentes, escenarios: [{ ...escenario, pasos: [{ ...escenario.pasos[0], punto: 'nada' }] }] };
  const errores = validarDatos(puntos, malo);
  assert.equal(errores.length, 1);
  assert.match(errores[0], /punto "nada"/);
});

test('detecta un componente desconocido y minutos fuera de orden', () => {
  const malo = {
    componentes,
    escenarios: [{ ...escenario, pasos: [{ ...escenario.pasos[1] }, { ...escenario.pasos[0], componente: 'Z' }] }],
  };
  const errores = validarDatos(puntos, malo);
  assert.ok(errores.some((m) => /componente "Z"/.test(m)));
  assert.ok(errores.some((m) => /orden/.test(m)));
});

test('detecta datos sin escenarios o sin pasos', () => {
  assert.match(validarDatos(puntos, { componentes, escenarios: [] })[0], /ningún escenario/);
  assert.match(validarDatos(puntos, { componentes, escenarios: [{ ...escenario, pasos: [] }] })[0], /no tiene pasos/);
  assert.match(validarDatos(null, null)[0], /no tienen el formato/);
});

test('pasoActual devuelve el paso o null fuera de rango', () => {
  assert.equal(pasoActual(escenario, 1).accion, 'Atiende');
  assert.equal(pasoActual(escenario, -1), null);
  assert.equal(pasoActual(escenario, 3), null);
});

test('pasosHasta incluye el paso actual y no modifica el escenario', () => {
  const copia = structuredClone(escenario);
  assert.equal(pasosHasta(escenario, 1).length, 2);
  assert.equal(pasosHasta(escenario, -1).length, 0);
  assert.equal(pasosHasta(escenario, 99).length, 3);
  assert.deepEqual(escenario, copia);
});

test('componentesActivos lista los componentes sin repetir, en orden de aparición', () => {
  assert.deepEqual(componentesActivos(escenario, 2), ['D', 'B']);
  assert.deepEqual(componentesActivos(escenario, -1), []);
});

test('duracionTotal es el minuto del último paso', () => {
  assert.equal(duracionTotal(escenario), 9);
  assert.equal(duracionTotal({ pasos: [] }), 0);
});

test('siguienteIndice y anteriorIndice se quedan dentro de los límites', () => {
  assert.equal(siguienteIndice(escenario, -1), 0);
  assert.equal(siguienteIndice(escenario, 2), 2);
  assert.equal(anteriorIndice(escenario, 0), -1);
  assert.equal(anteriorIndice(escenario, -1), -1);
});

test('formatearMinuto escribe el minuto con su unidad', () => {
  assert.equal(formatearMinuto(0), 'Minuto 0');
  assert.equal(formatearMinuto(45), 'Minuto 45');
  assert.equal(formatearMinuto(75), '1 h 15 min');
});
