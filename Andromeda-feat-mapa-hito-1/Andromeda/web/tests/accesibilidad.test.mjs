import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  validarAccesibilidad, resumenAccesibilidad, veredicto, etiquetaVeredicto, etiquetaCriterio,
  criteriosVisibles, criteriosPorBloque, buscarAccesibilidad, formatearFecha,
} from '../js/accesibilidad.js';

const leer = async (ruta) => JSON.parse(await readFile(new URL(ruta, import.meta.url), 'utf8'));

// El contrato se escribe aquí aparte: si la lógica pierde un criterio, las pruebas lo notan.
const CLAVES = {
  llegada: ['andenContinuo', 'vado', 'cruceSemaforo', 'iluminacion', 'sombra'],
  ingreso: ['puertaAccesible', 'sinEscalon', 'rampa', 'timbre'],
  dentro: ['rutaAccesible', 'pisoFirme', 'sinObstaculos', 'ascensor'],
  servicios: ['bano', 'informacion', 'asientos', 'agua', 'sombra'],
  comunicacion: ['pictogramas', 'braille', 'lenguajeClaro', 'audio', 'lenguaSenas'],
  emergencia: ['evacuacion', 'alarmaVisual', 'puntoEncuentro'],
};
const CRITICOS = ['ingreso.sinEscalon', 'dentro.rutaAccesible', 'servicios.bano'];
const TODOS = Object.entries(CLAVES).flatMap(([bloque, claves]) => claves.map((clave) => `${bloque}.${clave}`));
const NO_CRITICOS = TODOS.filter((camino) => !CRITICOS.includes(camino));

const congelar = (valor) => {
  if (valor && typeof valor === 'object') Object.values(valor).forEach(congelar);
  return Object.freeze(valor);
};

/** Un lugar con todo en "si", salvo lo que se indique como { 'bloque.criterio': estado }. */
function lugar(cambios = {}, extra = {}) {
  const bloques = Object.fromEntries(Object.entries(CLAVES).map(([bloque, claves]) => [
    bloque,
    Object.fromEntries(claves.map((clave) => [clave, cambios[`${bloque}.${clave}`] ?? 'si'])),
  ]));
  bloques.ingreso.anchoMetros = 1.2;
  bloques.dentro.anchoMetros = null;
  return {
    destinoId: 'zoo', ejemplo: true, fecha: '2026-11-20', hora: '09:30',
    auditores: ['Persona de ejemplo'], clima: 'Soleado', punto: { lat: 11.01, lng: -74.79 },
    parada: { nombre: 'Paradero de ejemplo', distanciaMetros: 120 },
    bloques, fotos: ['fotos/zoo/entrada.jpg'], notas: { llegada: 'Andén amplio.' }, ...extra,
  };
}

const archivo = (lugares = [lugar()]) => ({ nota: 'Auditoría propia.', actualizado: '2026-11-26', lugares });
const DESTINOS = congelar([{ id: 'zoo' }, { id: 'catedral' }]);
const errores = (datos) => validarAccesibilidad(datos, DESTINOS);
const marcar = (caminos, estado) => Object.fromEntries(caminos.map((camino) => [camino, estado]));
const hay = (lista, patron) => assert.ok(lista.some((m) => patron.test(m)), `${patron} no está en: ${lista.join(' | ')}`);

test('acepta un archivo completo sin modificarlo', () => {
  assert.deepEqual(errores(congelar(archivo())), []);
});

test('rechaza un archivo vacío o sin lugares', () => {
  [null, undefined, '', [], {}].forEach((datos) => assert.ok(errores(datos).length > 0));
  hay(errores(archivo([])), /ningún lugar/);
  hay(errores({ ...archivo(), nota: ' ' }), /nota/);
  hay(errores({ ...archivo(), actualizado: 'ayer' }), /actualización/);
});

test('rechaza un estado que no está permitido', () => {
  hay(errores(archivo([lugar({ 'llegada.vado': 'quizás' })])), /vado.*estado/);
});

test('rechaza un destino inexistente o sin identificador', () => {
  hay(errores(archivo([lugar({}, { destinoId: 'marte' })])), /marte.*no existe/);
  hay(errores(archivo([lugar({}, { destinoId: '' })])), /destino/);
});

test('rechaza dos auditorías del mismo destino', () => {
  hay(errores(archivo([lugar(), lugar()])), /repetido/);
});

test('rechaza fechas que no son ISO o que no existen', () => {
  ['20/11/2026', '2026-02-30', '2026-13-01', 20261120].forEach((fecha) => {
    hay(errores(archivo([lugar({}, { fecha })])), /fecha/);
  });
});

/** Un lugar tomado de una fuente externa: la cita en vez de los datos de una visita propia. */
function lugarDeFuente(extra = {}) {
  const { bloques, notas } = lugar();
  const fuente = { nombre: 'Fuente citada', url: 'https://ejemplo.test/ficha', consultado: '2026-11-26' };
  return { destinoId: 'zoo', ejemplo: false, fuente, bloques, notas, ...extra };
}

test('una entrada con fuente no necesita datos de una visita propia', () => {
  assert.deepEqual(errores(congelar(archivo([lugarDeFuente()]))), []);
});

test('la fuente necesita nombre, dirección https y fecha de consulta', () => {
  const { fuente } = lugarDeFuente();
  [
    null, 'TUR4all', { ...fuente, nombre: ' ' }, { ...fuente, url: 'http://ejemplo.test' },
    { ...fuente, url: 'javascript:alert(1)' }, { ...fuente, url: 'https://ejemplo.test/a b' },
    { ...fuente, consultado: 'hoy' },
  ].forEach((mala) => hay(errores(archivo([lugarDeFuente({ fuente: mala })])), /fuente/));
});

test('una entrada con fuente también exige los criterios críticos', () => {
  const incompleto = lugarDeFuente();
  delete incompleto.bloques.servicios.bano;
  hay(errores(archivo([incompleto])), /crítico.*bano/);
});

test('exige los tres criterios críticos', () => {
  CRITICOS.forEach((camino) => {
    const [bloque, clave] = camino.split('.');
    const incompleto = lugar();
    delete incompleto.bloques[bloque][clave];
    hay(errores(archivo([incompleto])), new RegExp(`crítico.*${clave}`));
  });
});

test('señala los campos generales de un lugar que están mal', () => {
  const casos = [
    [{ hora: '25:00' }, /hora/], [{ auditores: [] }, /auditores/], [{ auditores: [' '] }, /auditores/],
    [{ clima: '' }, /clima/], [{ punto: { lat: 200, lng: 0 } }, /punto/], [{ punto: null }, /punto/],
    [{ parada: { nombre: '', distanciaMetros: 10 } }, /parada/],
    [{ parada: { nombre: 'Paradero', distanciaMetros: -1 } }, /parada/],
    [{ ejemplo: 'sí' }, /ejemplo/], [{ fotos: 'foto.jpg' }, /fotos/],
    [{ notas: null }, /notas/], [{ notas: { llegada: 3 } }, /notas/], [{ notas: { techo: 'x' } }, /notas/],
    [{ bloques: null }, /bloques/],
  ];
  casos.forEach(([cambio, patron]) => hay(errores(archivo([lugar({}, cambio)])), patron));
  hay(errores(archivo([null])), /Lugar 1/);
});

test('solo admite fotos con rutas relativas', () => {
  [
    '/fotos/a.jpg', 'https://otro.sitio/a.jpg', '../a.jpg', 'data:image/png;base64,AA', '\\\\equipo\\a.jpg', '',
    ' //otro.sitio/a.jpg', '\t//otro.sitio/a.jpg', 'fotos/a.jpg ', '%2e%2e/a.jpg', 'fotos/\n../a.jpg',
  ].forEach((foto) => {
    hay(errores(archivo([lugar({}, { fotos: [foto] })])), /fotos/);
  });
});

test('rechaza un bloque desconocido, para que no se pierda lo que dice', () => {
  const conExtra = lugar();
  conExtra.bloques.emergencias = { evacuacion: 'no' };
  hay(errores(archivo([conExtra])), /emergencias.*desconocido/);
});

test('señala bloques ausentes, criterios desconocidos y anchos inválidos', () => {
  const sinBloque = lugar();
  delete sinBloque.bloques.emergencia;
  hay(errores(archivo([sinBloque])), /emergencia/);
  const conError = lugar();
  conError.bloques.llegada.andenContinuoo = 'si';
  conError.bloques.ingreso.anchoMetros = '1,2';
  conError.bloques.dentro.anchoMetros = 0;
  const lista = errores(archivo([conError]));
  hay(lista, /andenContinuoo.*desconocido/);
  hay(lista, /ingreso.*ancho/);
  hay(lista, /dentro.*ancho/);
});

test('un crítico en no vuelve el lugar no accesible, aunque falten otros datos', () => {
  CRITICOS.forEach((camino) => assert.equal(veredicto(lugar({ [camino]: 'no' })), 'noAccesible'));
  const mezcla = { 'ingreso.sinEscalon': 'sinDato', 'servicios.bano': 'no' };
  assert.equal(veredicto(lugar(mezcla)), 'noAccesible');
});

test('un crítico sin dato o que no aplica deja el lugar sin información', () => {
  CRITICOS.forEach((camino) => {
    assert.equal(veredicto(lugar({ [camino]: 'sinDato' })), 'sinInformacion');
    assert.equal(veredicto(lugar({ [camino]: 'noAplica' })), 'sinInformacion');
  });
});

test('con todo en sí el lugar es accesible', () => {
  assert.equal(veredicto(congelar(lugar())), 'accesible');
});

test('un crítico parcial o un no crítico en no piden ayuda', () => {
  assert.equal(veredicto(lugar({ 'dentro.rutaAccesible': 'parcial' })), 'conAyuda');
  assert.equal(veredicto(lugar({ 'comunicacion.braille': 'no' })), 'conAyuda');
});

test('más de la mitad sin dato deja el lugar sin información; la mitad exacta no', () => {
  // Hay 26 criterios: 14 es más de la mitad y 13 es la mitad exacta.
  assert.equal(veredicto(lugar(marcar(NO_CRITICOS.slice(0, 14), 'sinDato'))), 'sinInformacion');
  assert.equal(veredicto(lugar(marcar(NO_CRITICOS.slice(0, 13), 'sinDato'))), 'conAyuda');
});

test('exige el 80 por ciento en sí entre los criterios que aplican', () => {
  assert.equal(veredicto(lugar(marcar(NO_CRITICOS.slice(0, 5), 'parcial'))), 'accesible');
  assert.equal(veredicto(lugar(marcar(NO_CRITICOS.slice(0, 6), 'parcial'))), 'conAyuda');
  // El 80 % exacto alcanza: 20 en sí de 25 que aplican.
  const exacto = { ...marcar(NO_CRITICOS.slice(0, 5), 'parcial'), [NO_CRITICOS[5]]: 'noAplica' };
  assert.equal(veredicto(lugar(exacto)), 'accesible');
});

test('lo que no aplica no cuenta contra el lugar', () => {
  assert.equal(veredicto(lugar(marcar(NO_CRITICOS, 'noAplica'))), 'accesible');
});

test('un criterio ausente cuenta como sin dato', () => {
  const incompleto = lugar();
  delete incompleto.bloques.comunicacion;
  delete incompleto.bloques.emergencia;
  assert.equal(resumenAccesibilidad(incompleto).sinDato, 8);
  assert.equal(veredicto(undefined), 'sinInformacion');
});

test('el resumen cuenta lo que cumple, es parcial, no cumple o no tiene dato', () => {
  const entrada = congelar(lugar({
    'llegada.vado': 'parcial', 'llegada.sombra': 'no', 'comunicacion.audio': 'sinDato',
    'dentro.ascensor': 'noAplica', 'emergencia.alarmaVisual': 'parcial',
  }));
  assert.deepEqual(resumenAccesibilidad(entrada), {
    veredicto: 'conAyuda', cumplen: 21, parciales: 2, noCumplen: 1, sinDato: 1,
  });
});

test('cada veredicto y cada estado tienen un texto claro', () => {
  assert.deepEqual(
    ['accesible', 'conAyuda', 'noAccesible', 'sinInformacion'].map(etiquetaVeredicto),
    ['Accesible', 'Accesible con ayuda', 'No accesible', 'Sin información'],
  );
  assert.deepEqual(
    ['si', 'parcial', 'no', 'sinDato', 'noAplica'].map(etiquetaCriterio),
    ['Se puede', 'Con ayuda', 'No se puede', 'Sin información', 'No aplica'],
  );
  assert.equal(etiquetaVeredicto('otro'), 'Sin información');
  assert.equal(etiquetaCriterio(undefined), 'Sin información');
});

test('el detalle compacto tiene cuatro filas en orden, con estado y nota', () => {
  const filas = criteriosVisibles(congelar(lugar({ 'servicios.bano': 'parcial' }, {
    notas: { llegada: 'Andén amplio.', bano: 'Puerta angosta.' },
  })));
  assert.deepEqual(filas.map((f) => f.nombre), ['Llegada', 'Ingreso', 'Dentro', 'Baño']);
  assert.deepEqual(filas.map((f) => f.estado), ['si', 'si', 'si', 'parcial']);
  assert.deepEqual(filas.map((f) => f.nota), ['Andén amplio.', 'Sin notas.', 'Sin notas.', 'Puerta angosta.']);
});

const estadoDe = (cambios, id) => criteriosVisibles(lugar(cambios)).find((f) => f.id === id).estado;

test('un dato que falta no convierte una fila en "con ayuda"', () => {
  assert.equal(estadoDe({ 'ingreso.rampa': 'sinDato', 'ingreso.timbre': 'sinDato' }, 'ingreso'), 'si');
  // Sin criterio crítico, lo que falta no alcanza para afirmar que se puede.
  assert.equal(estadoDe({ 'llegada.vado': 'sinDato', 'llegada.sombra': 'sinDato' }, 'llegada'), 'sinDato');
  assert.equal(estadoDe({ 'ingreso.rampa': 'parcial', 'ingreso.timbre': 'sinDato' }, 'ingreso'), 'parcial');
});

test('cada fila resume los criterios de su bloque', () => {
  const llegada = CLAVES.llegada.map((clave) => `llegada.${clave}`);
  assert.equal(estadoDe(marcar(llegada, 'no'), 'llegada'), 'no');
  assert.equal(estadoDe(marcar(llegada, 'noAplica'), 'llegada'), 'noAplica');
  assert.equal(estadoDe(marcar(llegada, 'sinDato'), 'llegada'), 'sinDato');
  assert.equal(estadoDe({ 'llegada.vado': 'no' }, 'llegada'), 'parcial');
  assert.equal(estadoDe({ 'ingreso.sinEscalon': 'no' }, 'ingreso'), 'no');
  assert.equal(estadoDe({ 'dentro.rutaAccesible': 'sinDato' }, 'dentro'), 'sinDato');
  assert.equal(estadoDe({ 'servicios.bano': 'noAplica' }, 'bano'), 'noAplica');
});

test('la lista completa agrupa los criterios por bloque, con los anchos en metros', () => {
  const bloques = criteriosPorBloque(congelar(lugar()));
  assert.deepEqual(bloques.map((b) => b.nombre), [
    'Llegada', 'Ingreso', 'Dentro', 'Servicios', 'Comunicación', 'Emergencia',
  ]);
  assert.equal(bloques.flatMap((b) => b.criterios).length, TODOS.length);
  assert.deepEqual(bloques[1].medidas, [{ nombre: 'Ancho de la puerta', texto: '1,2 m' }]);
  assert.deepEqual(bloques[2].medidas, [{ nombre: 'Ancho del paso', texto: 'Sin información' }]);
  assert.deepEqual(bloques[0].medidas, []);
});

test('busca la auditoría del destino elegido', () => {
  const datos = congelar(archivo([lugar({}, { ejemplo: false })]));
  assert.equal(buscarAccesibilidad(datos, { id: 'zoo' }), datos.lugares[0]);
  assert.equal(buscarAccesibilidad(datos, { id: 'catedral' }), null);
  assert.equal(buscarAccesibilidad(datos, { nombre: 'Punto marcado' }), null);
  assert.equal(buscarAccesibilidad(datos, null), null);
  assert.equal(buscarAccesibilidad(null, { id: 'zoo' }), null);
});

test('nunca entrega una entrada de ejemplo: sus datos son inventados', () => {
  const datos = congelar(archivo([lugar({}, { ejemplo: true })]));
  assert.equal(buscarAccesibilidad(datos, { id: 'zoo' }), null);
});

test('la fecha se escribe en español', () => {
  assert.equal(formatearFecha('2026-11-05'), '5 nov 2026');
  assert.equal(formatearFecha('2026-01-31'), '31 ene 2026');
  assert.equal(formatearFecha('ayer'), 'sin fecha');
});

test('los datos reales son válidos y sus destinos existen', async () => {
  const datos = await leer('../data/accesibilidad.json');
  const { destinos } = await leer('../data/destinos.json');
  assert.deepEqual(validarAccesibilidad(datos, destinos), []);
  const ids = new Set(destinos.map((d) => d.id));
  assert.ok(datos.lugares.every((l) => ids.has(l.destinoId)));
});

const CON_FUENTE = ['metropolitano', 'malecon', 'zoologico', 'joe-arroyo', 'ventana-al-mundo', 'mallorquin'];

test('los datos publicados citan su fuente, no son ejemplos y no inventan una auditoría', async () => {
  const datos = await leer('../data/accesibilidad.json');
  assert.deepEqual(datos.lugares.map((l) => l.destinoId), CON_FUENTE);
  datos.lugares.forEach((entrada) => {
    assert.equal(entrada.ejemplo, false);
    assert.match(entrada.fuente.url, /^https:\/\/www\.tur4all\.com\/resources\//);
    ['fecha', 'hora', 'auditores', 'clima', 'parada'].forEach((campo) => assert.equal(entrada[campo], undefined));
    assert.equal(buscarAccesibilidad(datos, { id: entrada.destinoId }), entrada);
  });
  assert.equal(buscarAccesibilidad(datos, { id: 'aeropuerto' }), null);
});

test('las fuentes de hoy no alcanzan para un veredicto, pero cada fila dice lo que sí informan', async () => {
  const datos = await leer('../data/accesibilidad.json');
  assert.ok(datos.lugares.every((entrada) => veredicto(entrada) === 'sinInformacion'));
  const filas = Object.fromEntries(datos.lugares.map((l) => [l.destinoId, criteriosVisibles(l).map((f) => f.estado)]));
  assert.deepEqual(filas, {
    metropolitano: ['sinDato', 'si', 'si', 'si'],
    malecon: ['sinDato', 'sinDato', 'si', 'sinDato'],
    zoologico: ['sinDato', 'si', 'si', 'si'],
    'joe-arroyo': ['sinDato', 'si', 'sinDato', 'parcial'],
    'ventana-al-mundo': ['sinDato', 'sinDato', 'si', 'sinDato'],
    mallorquin: ['sinDato', 'si', 'si', 'si'],
  });
});
