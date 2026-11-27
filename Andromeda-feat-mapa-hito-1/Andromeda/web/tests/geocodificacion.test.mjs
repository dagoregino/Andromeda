// Pruebas de geocodificación: funciones puras y lógica de búsqueda.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { _enriquecerTexto, _extraerZona, _convertir, _convertirPhoton, _sinRepetidos, obtenerRecientes, guardarReciente, moverIndice, DEBOUNCE_MS } from '../js/geocodificacion.js';

// --- enriquecerTexto ---

test('agrega Barranquilla si el usuario no mencionó ninguna ciudad del área', () => {
  assert.equal(_enriquecerTexto('estadio'), 'estadio, Barranquilla');
  assert.equal(_enriquecerTexto('museo del caribe'), 'museo del caribe, Barranquilla');
  assert.equal(_enriquecerTexto('parque'), 'parque, Barranquilla');
});

test('no agrega Barranquilla si ya la incluyó', () => {
  assert.equal(_enriquecerTexto('estadio barranquilla'), 'estadio barranquilla');
  assert.equal(_enriquecerTexto('Estadio Barranquilla'), 'Estadio Barranquilla');
});

test('no agrega Barranquilla si menciona otra ciudad del área', () => {
  assert.equal(_enriquecerTexto('calle 30 Soledad'), 'calle 30 Soledad');
  assert.equal(_enriquecerTexto('Malambo centro'), 'Malambo centro');
  assert.equal(_enriquecerTexto('playa Puerto Colombia'), 'playa Puerto Colombia');
  assert.equal(_enriquecerTexto('Galapa'), 'Galapa');
});

test('no agrega a un texto vacío o muy corto', () => {
  assert.equal(_enriquecerTexto(''), ', Barranquilla');
  assert.equal(_enriquecerTexto('  '), ', Barranquilla');
});

// --- extraerZona ---

test('extrae el barrio del address de Nominatim', () => {
  assert.equal(_extraerZona({ address: { suburb: 'Riomar', city: 'Barranquilla' } }), 'Riomar');
  assert.equal(_extraerZona({ address: { neighbourhood: 'El Prado' } }), 'El Prado');
  assert.equal(_extraerZona({ address: { city: 'Soledad' } }), 'Soledad');
  assert.equal(_extraerZona({ address: {} }), '');
  assert.equal(_extraerZona({}), '');
});

test('prefiere suburb sobre neighbourhood y city', () => {
  const lugar = { address: { suburb: 'Boston', neighbourhood: 'Centro', city: 'Barranquilla' } };
  assert.equal(_extraerZona(lugar), 'Boston');
});

// --- convertir ---

test('convierte un resultado de Nominatim al formato interno', () => {
  const nominatim = {
    display_name: 'Estadio Metropolitano, Calle 50, Barranquilla, Atlántico, Colombia',
    lat: '10.92695',
    lon: '-74.80051',
    type: 'stadium',
    osm_id: 123456,
    address: { suburb: 'Metropolitana', city: 'Barranquilla' },
  };
  const resultado = _convertir(nominatim);
  assert.equal(resultado.nombre, 'Estadio Metropolitano');
  assert.equal(resultado.zona, 'Metropolitana');
  assert.strictEqual(resultado.lat, 10.92695);
  assert.strictEqual(resultado.lng, -74.80051);
  assert.equal(resultado.tipo, 'stadium');
});

// --- Recientes (localStorage) ---
// Nota: en Node no hay localStorage, así que probamos que las funciones no exploten.

test('obtenerRecientes devuelve una lista vacía sin localStorage', () => {
  const recientes = obtenerRecientes();
  assert.ok(Array.isArray(recientes));
  assert.equal(recientes.length, 0);
});

test('guardarReciente no explota sin localStorage', () => {
  assert.doesNotThrow(() => guardarReciente({ nombre: 'Test', zona: '', lat: 10, lng: -74 }));
});

// --- Constantes ---

test('el debounce es de al menos 400 ms para respetar Nominatim', () => {
  assert.ok(DEBOUNCE_MS >= 400, `DEBOUNCE_MS es ${DEBOUNCE_MS}, debe ser >= 400`);
});

// --- moverIndice (flechas del desplegable) ---

test('la flecha abajo avanza y da la vuelta al final', () => {
  assert.equal(moverIndice(-1, 3, 1), 0);
  assert.equal(moverIndice(0, 3, 1), 1);
  assert.equal(moverIndice(2, 3, 1), 0);
});

test('la flecha arriba retrocede y da la vuelta al principio', () => {
  assert.equal(moverIndice(-1, 3, -1), 2);
  assert.equal(moverIndice(2, 3, -1), 1);
  assert.equal(moverIndice(0, 3, -1), 2);
});

test('sin opciones no hay índice activo', () => {
  assert.equal(moverIndice(-1, 0, 1), -1);
});

// --- Photon ---

const featurePhoton = (propiedades, coordenadas = [-74.79, 10.99]) => ({
  type: 'Feature',
  geometry: { type: 'Point', coordinates: coordenadas },
  properties: propiedades,
});

test('convierte un resultado de Photon al formato interno (lon, lat en ese orden)', () => {
  const lugar = _convertirPhoton(featurePhoton({
    name: 'Portal del Prado', district: 'El Prado', city: 'Barranquilla', state: 'Atlántico', osm_id: 77, osm_value: 'mall',
  }));
  assert.equal(lugar.nombre, 'Portal del Prado');
  assert.equal(lugar.zona, 'El Prado');
  assert.strictEqual(lugar.lat, 10.99);
  assert.strictEqual(lugar.lng, -74.79);
  assert.equal(lugar.tipo, 'mall');
  assert.equal(lugar.osm_id, 77);
});

test('Photon: sin nombre usa la calle y el número; sin ninguno, descarta el resultado', () => {
  assert.equal(_convertirPhoton(featurePhoton({ street: 'Carrera 54', housenumber: '70-10' })).nombre, 'Carrera 54 70-10');
  assert.equal(_convertirPhoton(featurePhoton({ city: 'Barranquilla' })), null);
});

test('Photon: descarta resultados sin coordenadas válidas', () => {
  assert.equal(_convertirPhoton({ properties: { name: 'X' } }), null);
  assert.equal(_convertirPhoton(featurePhoton({ name: 'X' }, [])), null);
});

test('Photon: la zona cae a la localidad o a la ciudad si no hay barrio', () => {
  assert.equal(_convertirPhoton(featurePhoton({ name: 'A', locality: 'Boston', city: 'Barranquilla' })).zona, 'Boston');
  assert.equal(_convertirPhoton(featurePhoton({ name: 'A', city: 'Soledad' })).zona, 'Soledad');
});

test('quita los resultados repetidos del mismo sitio', () => {
  const a = { nombre: 'Catedral', lat: 10.9881, lng: -74.7902 };
  const b = { nombre: 'catedral', lat: 10.98812, lng: -74.79021 };
  const c = { nombre: 'Catedral', lat: 11.02, lng: -74.8 };
  assert.deepEqual(_sinRepetidos([a, b, c]), [a, c]);
});
