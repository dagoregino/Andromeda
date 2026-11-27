import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { leerMalla } from '../js/malla.js';
import { apertura } from '../js/apertura.js';

const leer = (ruta) => readFileSync(new URL(`../${ruta}`, import.meta.url));
const aBuffer = (bytes) => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);

// Una malla mínima con el mismo formato que escribe herramientas/exportar-carcasa.py.
function mallaDePrueba({ parte = {}, indices = [0, 1, 2] } = {}) {
  const datos = new ArrayBuffer(36);
  new Int16Array(datos, 0, 9).set([200, 0, 0, 0, 400, 0, 0, 0, -600]);
  new Int8Array(datos, 20, 9).set([127, 0, 0, 0, 127, 0, 0, 0, -127]);
  new Uint16Array(datos, 30, 3).set(indices);
  const cabecera = {
    escala: 200,
    partes: [{ grupo: 'base', material: 'carcasa', vertices: 3, indices: 3, ancho: 2, posiciones: 0, normales: 20, caras: 30, ...parte }],
  };
  let texto = JSON.stringify(cabecera);
  texto += ' '.repeat((4 - ((4 + texto.length) % 4)) % 4);
  const bytes = new Uint8Array(4 + texto.length + datos.byteLength);
  new DataView(bytes.buffer).setUint32(0, texto.length, true);
  bytes.set(new TextEncoder().encode(texto), 4);
  bytes.set(new Uint8Array(datos), 4 + texto.length);
  return bytes.buffer;
}

test('lee las posiciones en milímetros, las normales y los índices', () => {
  const [parte] = leerMalla(mallaDePrueba());

  assert.equal(parte.grupo, 'base');
  assert.equal(parte.material, 'carcasa');
  assert.deepEqual([...parte.posiciones], [1, 0, 0, 0, 2, 0, 0, 0, -3]);
  assert.deepEqual([...parte.normales], [127, 0, 0, 0, 127, 0, 0, 0, -127]);
  assert.deepEqual([...parte.caras], [0, 1, 2]);
});

test('rechaza un archivo vacío, cortado o que no es una malla', () => {
  const pagina = new TextEncoder().encode('<!doctype html><title>404</title>').buffer;

  assert.throws(() => leerMalla(new ArrayBuffer(0)), /malla/i);
  assert.throws(() => leerMalla(pagina), /malla/i);
  assert.throws(() => leerMalla(mallaDePrueba().slice(0, -12)), /malla/i);
});

test('rechaza una parte con un grupo desconocido o un índice sin vértice', () => {
  assert.throws(() => leerMalla(mallaDePrueba({ parte: { grupo: 'otro' } })), /grupo/i);
  assert.throws(() => leerMalla(mallaDePrueba({ indices: [0, 1, 3] })), /índice/i);
});

test('el modelo exportado trae la tapa, las letras, la base y el interior', () => {
  const partes = leerMalla(aBuffer(leer('modelos/carcasa.bin')));
  const claves = partes.map(({ grupo, material }) => `${grupo}/${material}`);

  for (const clave of ['tapa/carcasa', 'tapa/letras', 'base/carcasa']) assert.ok(claves.includes(clave), clave);
  assert.ok(partes.some(({ grupo }) => grupo === 'interior'));
});

test('la carcasa exportada conserva las medidas del diseño en Fusion', () => {
  const carcasa = leerMalla(aBuffer(leer('modelos/carcasa.bin'))).filter(({ grupo }) => grupo !== 'interior');
  const medida = (eje) => {
    const valores = carcasa.flatMap(({ posiciones }) => [...posiciones].filter((_, i) => i % 3 === eje));
    return valores.reduce((a, b) => Math.max(a, b), -Infinity) - valores.reduce((a, b) => Math.min(a, b), Infinity);
  };

  for (const [eje, esperado] of [[0, 105.8], [1, 76.3], [2, 46.1]]) {
    assert.ok(Math.abs(medida(eje) - esperado) < 0.5, `eje ${eje}: ${medida(eje)}`);
  }
});

test('la tapa se abre al llegar al centro de la ventana y se cierra al alejarse', () => {
  const ventana = 1000;
  const con = (centro) => apertura({ arriba: centro - 250, alto: 500, ventana });

  assert.equal(con(500), 1);
  assert.equal(con(1100), 0);
  assert.equal(con(-100), 0);
  assert.ok(con(750) > 0 && con(750) < 1);
  assert.equal(con(750), con(250));
});

test('la tapa queda cerrada si la ventana no tiene altura', () => {
  assert.equal(apertura({ arriba: 0, alto: 500, ventana: 0 }), 0);
});

const html = leer('index.html').toString('utf8').replace(/<!--[\s\S]*?-->/g, '');
const inicio = html.indexOf('id="prototipo"');
const prototipo = html.slice(inicio, html.indexOf('</section>', inicio));

test('la sección del prototipo va entre el diseño y la demostración', () => {
  assert.ok(inicio > html.indexOf('id="diseno"'));
  assert.ok(inicio < html.indexOf('id="probar"'));
});

test('la sección dice que ya funciona y que la carcasa aún no está impresa', () => {
  assert.match(prototipo, /Ya funciona\./);
  assert.match(prototipo, /La carcasa aún no está impresa\./);
});

test('la sección no entra en detalles técnicos', () => {
  assert.doesNotMatch(prototipo.replace(/<[^>]+>/g, ' '), /ESP32|amplificador|PCB|OLED|MAX98357/i);
});

test('el giro se puede pausar', () => {
  assert.match(prototipo, /<button[^>]*data-pausa-giro/);
});
