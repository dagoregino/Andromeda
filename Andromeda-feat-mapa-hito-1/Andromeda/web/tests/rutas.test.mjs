import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validarRutas, buscarRutas, filtrarCatalogo, paradasEnOrden, lugaresCerca } from '../js/rutas.js';
import { coordenadaDe } from '../js/destinos.js';

const leer = async (ruta) => JSON.parse(await readFile(new URL(ruta, import.meta.url), 'utf8'));

// Recorrido recto de sur a norte: unos 4,4 km.
const recta = {
  id: 'recta',
  codigo: 'R',
  nombre: 'Sur → Norte',
  operador: 'Prueba',
  tipo: 'bus tradicional',
  circular: false,
  editado: '2026-01-01',
  paradas: [],
  recorrido: [[10.9, -74.8], [10.91, -74.8], [10.92, -74.8], [10.93, -74.8], [10.94, -74.8]],
};
const SUR = [10.901, -74.801];
const NORTE = [10.939, -74.801];

test('los datos de Transmetro son válidos y tienen crédito', async () => {
  const datos = await leer('../data/rutas.json');
  assert.deepEqual(validarRutas(datos), []);
  assert.equal(datos.fuente.licencia, 'ODbL 1.0');
  assert.deepEqual(datos.rutas.map((r) => r.codigo), ['B1', 'S2', 'GM', 'VM']);
});

test('los recorridos del AMB son válidos, circulares, sin sentido verificado y con fuente', async () => {
  const datos = await leer('../data/rutas-amb.json');
  assert.deepEqual(validarRutas(datos), []);
  assert.match(datos.fuente.nombre, /Área Metropolitana de Barranquilla/);
  assert.equal(datos.rutas.length, 87);
  assert.ok(datos.rutas.every((r) => r.circular && r.sentidoVerificado === false));
});

test('ningún identificador se repite entre las dos fuentes', async () => {
  const [osm, amb] = await Promise.all([leer('../data/rutas.json'), leer('../data/rutas-amb.json')]);
  const ids = [...osm.rutas, ...amb.rutas].map((r) => r.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('prefiere un viaje corto aunque haya que caminar un poco más', () => {
  const rodeo = {
    ...recta,
    id: 'rodeo',
    recorrido: [[10.901, -74.801], [10.901, -74.77], [10.939, -74.77], [10.939, -74.801]],
  };
  assert.deepEqual(buscarRutas([rodeo, recta], SUR, NORTE).map((o) => o.ruta.id), ['recta', 'rodeo']);
});

test('descarta una vuelta desproporcionada frente a la distancia del viaje', () => {
  const anillo = {
    ...recta,
    circular: true,
    recorrido: [[10.85, -74.8], [10.95, -74.8], [10.95, -74.78], [10.85, -74.78], [10.85, -74.8]],
  };
  const abajo = [10.885, -74.801];
  const arriba = [10.9, -74.801];
  assert.equal(buscarRutas([anillo], abajo, arriba).length, 1);
  assert.deepEqual(buscarRutas([anillo], arriba, abajo), []);
});

test('lugaresCerca nombra los lugares junto al recorrido, en el orden en que pasa', () => {
  const lugares = [
    { id: 'n', nombre: 'Al norte', lat: 10.935, lng: -74.801 },
    { id: 'lejos', nombre: 'Lejos', lat: 10.92, lng: -74.83 },
    { id: 's', nombre: 'Al sur', lat: 10.902, lng: -74.801 },
  ];
  assert.deepEqual(lugaresCerca(recta, lugares), ['Al sur', 'Al norte']);
  assert.deepEqual(lugaresCerca(recta, []), []);
});

test('con los datos reales, el B1 lleva del Portal de Soledad al Museo del Caribe', async () => {
  const { rutas } = await leer('../data/rutas.json');
  const { destinos } = await leer('../data/destinos.json');
  const museo = coordenadaDe(destinos.find((d) => d.id === 'museo-del-caribe'));
  const opciones = buscarRutas(rutas, [10.9075, -74.8003], museo);
  assert.equal(opciones[0].ruta.codigo, 'B1');
  assert.equal(opciones[0].subida.nombre, 'Portal de Soledad');
});

test('rechaza datos de rutas sin formato, sin fuente o incompletos', () => {
  assert.match(validarRutas(null)[0], /formato/);
  const fuente = { nombre: 'x', licencia: 'x' };
  assert.match(validarRutas({ fuente, rutas: [] })[0], /ninguna ruta/);
  assert.match(validarRutas({ rutas: [recta] })[0], /formato/);
  const errores = validarRutas({
    fuente,
    rutas: [{ ...recta, codigo: '', editado: '', recorrido: [[10.9, -74.8]], paradas: [{ nombre: '', lat: 0 }] }, recta, null],
  });
  for (const patron of [/código/, /fecha/, /recorrido/, /parada/, /repetido/, /Ruta 3/]) {
    assert.ok(errores.some((m) => patron.test(m)), String(patron));
  }
});

test('encuentra una ruta que pasa cerca del origen y del destino', () => {
  const [opcion] = buscarRutas([recta], SUR, NORTE);
  assert.equal(opcion.ruta.id, 'recta');
  assert.ok(opcion.subida.caminata < 150 && opcion.bajada.caminata < 150);
  assert.ok(opcion.distanciaBus > 4000 && opcion.distanciaBus < 4500);
  assert.equal(opcion.subida.nombre, null);
  assert.deepEqual(opcion.tramoBus.at(0), opcion.subida.punto);
  assert.deepEqual(opcion.tramoBus.at(-1), opcion.bajada.punto);
});

test('respeta el sentido del recorrido', () => {
  assert.deepEqual(buscarRutas([recta], NORTE, SUR), []);
});

test('en un recorrido circular permite dar la vuelta', () => {
  const circular = {
    ...recta,
    circular: true,
    recorrido: [[10.9, -74.8], [10.94, -74.8], [10.94, -74.78], [10.9, -74.78], [10.9, -74.8]],
  };
  const [opcion] = buscarRutas([circular], [10.935, -74.78], [10.935, -74.801]);
  assert.ok(opcion, 'debe encontrar la ruta');
  assert.ok(opcion.distanciaBus > 0);
});

test('descarta la ruta si queda más lejos que la caminata máxima', () => {
  const lejos = [10.901, -74.83];
  assert.deepEqual(buscarRutas([recta], lejos, NORTE), []);
  assert.equal(buscarRutas([recta], lejos, NORTE, { caminataMaxima: 4000 }).length, 1);
});

test('no sugiere el bus cuando caminar directo es más corto', () => {
  assert.deepEqual(buscarRutas([recta], [10.901, -74.801], [10.9012, -74.801]), []);
});

test('si hay paradas, solo se sube y se baja en ellas', () => {
  const conParadas = {
    ...recta,
    paradas: [
      { nombre: 'Primera', lat: 10.905, lng: -74.8 },
      { nombre: 'Última', lat: 10.935, lng: -74.8 },
    ],
  };
  const [opcion] = buscarRutas([conParadas], SUR, NORTE);
  assert.equal(opcion.subida.nombre, 'Primera');
  assert.equal(opcion.bajada.nombre, 'Última');
  assert.deepEqual(opcion.subida.punto, [10.905, -74.8]);
});

test('entre dos pasos por el mismo sitio elige el viaje corto', () => {
  // Va al norte, regresa por una calle paralela y vuelve a subir: el origen se toca dos veces.
  const rizo = {
    ...recta,
    recorrido: [[10.9, -74.8], [10.94, -74.8], [10.94, -74.799], [10.9, -74.799], [10.9, -74.7985], [10.94, -74.7985]],
  };
  const [opcion] = buscarRutas([rizo], SUR, NORTE);
  assert.ok(opcion.distanciaBus < 5000, String(opcion.distanciaBus));
});

test('ordena por menor caminata y no modifica las rutas', () => {
  const corrida = { ...recta, id: 'corrida', recorrido: recta.recorrido.map(([lat]) => [lat, -74.805]) };
  const rutas = [corrida, recta];
  const copia = structuredClone(rutas);
  assert.deepEqual(buscarRutas(rutas, SUR, NORTE).map((o) => o.ruta.id), ['recta', 'corrida']);
  assert.deepEqual(rutas, copia);
});

test('devuelve una lista vacía con coordenadas inválidas', () => {
  assert.deepEqual(buscarRutas([recta], null, NORTE), []);
  assert.deepEqual(buscarRutas([recta], SUR, [200, 0]), []);
});

const catalogo = [
  { ...recta, id: 'c10', codigo: 'C10', operador: 'Coolitoral', nombre: 'Centro' },
  { ...recta, id: 'c2', codigo: 'C2', operador: 'Sobusa', nombre: 'Malecón' },
  { ...recta, id: 'b1', codigo: 'B1', operador: 'Transmetro', nombre: 'Portal', tipo: 'troncal' },
];

test('el catálogo se ordena por código contando los números', () => {
  assert.deepEqual(filtrarCatalogo(catalogo, '').map((r) => r.codigo), ['B1', 'C2', 'C10']);
});

test('el catálogo se filtra por código, empresa, nombre o tipo sin tildes', () => {
  assert.deepEqual(filtrarCatalogo(catalogo, 'c10').map((r) => r.id), ['c10']);
  assert.deepEqual(filtrarCatalogo(catalogo, 'sobusa').map((r) => r.id), ['c2']);
  assert.deepEqual(filtrarCatalogo(catalogo, 'malecon').map((r) => r.id), ['c2']);
  assert.deepEqual(filtrarCatalogo(catalogo, 'troncal').map((r) => r.id), ['b1']);
  assert.deepEqual(filtrarCatalogo(catalogo, 'nada'), []);
});

test('filtrar el catálogo no modifica la lista original', () => {
  const copia = structuredClone(catalogo);
  filtrarCatalogo(catalogo, '');
  assert.deepEqual(catalogo, copia);
});

test('las paradas se listan en el sentido del recorrido', () => {
  const desordenada = {
    ...recta,
    paradas: [
      { nombre: 'Tercera', lat: 10.935, lng: -74.8 },
      { nombre: 'Primera', lat: 10.9, lng: -74.8 },
      { nombre: 'Segunda', lat: 10.915, lng: -74.8001 },
    ],
  };
  assert.deepEqual(paradasEnOrden(desordenada).map((p) => p.nombre), ['Primera', 'Segunda', 'Tercera']);
  assert.equal(desordenada.paradas[0].nombre, 'Tercera');
  assert.deepEqual(paradasEnOrden(recta), []);
});
