// Reglas de las páginas HTML: qué muestra la home y que ningún enlace local quede roto.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const raiz = new URL('../', import.meta.url);
const leer = (ruta) => readFileSync(new URL(ruta, raiz), 'utf8');
const sinComentarios = (html) => html.replace(/<!--[\s\S]*?-->/g, '');
const texto = (html) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const contar = (html, patron) => (html.match(patron) ?? []).length;
const atributos = (html, nombre) => [...html.matchAll(new RegExp(`\\s${nombre}="([^"]*)"`, 'g'))].map((m) => m[1]);

const PAGINAS = ['index.html', 'mapa.html', 'punto-lista/index.html'];
const home = sinComentarios(leer('index.html'));

// Bloque de la home que empieza en la sección con ese id de título.
function seccion(idTitulo) {
  const bloque = home.match(new RegExp(`<section[^>]*aria-labelledby="${idTitulo}"[\\s\\S]*?</section>`));
  assert.ok(bloque, `falta la sección ${idTitulo}`);
  return bloque[0];
}

test('la home no carga scripts, Leaflet ni datos del mapa', () => {
  assert.equal(contar(home, /<script/g), 0);
  assert.doesNotMatch(home, /leaflet|data\/|js\/|<img|<canvas/i);
});

test('la portada presenta el plan y no las herramientas', () => {
  const portada = seccion('titulo');

  assert.match(texto(portada), /Barranquilla 2034: lo que cambia antes del Mundial\./);
  assert.match(texto(portada), /Escenario ficticio/);
  assert.doesNotMatch(portada, /\bmapa\b|punto lista|\bapp\b|aplicación/i);
  assert.deepEqual(atributos(portada, 'href'), [
    '#ruta', '#participa', '#hito-2026', '#hito-2028', '#hito-2031', '#hito-2034', '#hito-despues',
  ]);
});

test('las herramientas se enlazan en la barra de arriba y no en el pie', () => {
  const cabecera = home.match(/<header[\s\S]*?<\/header>/)?.[0] ?? '';
  const pie = home.match(/<footer[\s\S]*?<\/footer>/)?.[0] ?? '';

  assert.deepEqual(atributos(cabecera, 'href'), [
    'mapa.html', 'punto-lista/', 'https://github.com/dagoregino/Andromeda/issues',
  ]);
  assert.ok(home.indexOf('<header') < home.indexOf('<main'));
  assert.equal(contar(pie, /<a[\s>]/g), 0);
});

test('los datos de partida son tres como máximo, cada uno con fuente y año', () => {
  const datos = seccion('partida-titulo').match(/<li class="dato">[\s\S]*?<\/li>/g) ?? [];

  assert.ok(datos.length > 0 && datos.length <= 3);
  for (const dato of datos) {
    const fuente = dato.match(/<p class="dato__fuente">[\s\S]*?<\/p>/)?.[0] ?? '';
    assert.match(fuente, /href="https:\/\//);
    assert.match(texto(fuente), /\b20\d\d\b/);
  }
});

test('la ruta tiene cinco hitos propuestos con tres viñetas como máximo', () => {
  const hitos = seccion('ruta-titulo').split(/<li class="hito"[^>]*>/).slice(1);
  const periodos = hitos.map((h) => texto(h.match(/<span class="hito__periodo">(.*?)<\/span>/)?.[1] ?? ''));

  assert.deepEqual(periodos, ['2026–2027', '2028–2030', '2031–2033', '2034', 'Después de 2034']);
  for (const hito of hitos) {
    assert.match(hito, />Propuesta</);
    const vinetas = contar(hito, /<li>/g);
    assert.ok(vinetas > 0 && vinetas <= 3);
  }
});

test('el legado es una frase y cuatro líneas como máximo', () => {
  const legado = seccion('legado-titulo');

  assert.equal(contar(legado, /<p[\s>]/g), 1);
  assert.ok(contar(legado, /<li[\s>]/g) <= 4);
  assert.doesNotMatch(legado, /<table|<a[\s>]/);
});

test('la home no usa etiquetas de componentes ni contenido pendiente', () => {
  assert.doesNotMatch(texto(home), /Generación 2034|Aprende|frentes?\b|currículo|kit escolar|Qué hay cerca/i);
  assert.doesNotMatch(texto(home), /\bcomponente [A-G]\b/i);
});

test('ningún enlace local apunta a un archivo o ancla que no exista', () => {
  for (const pagina of PAGINAS) {
    const html = sinComentarios(leer(pagina));
    const base = new URL(pagina, raiz);
    const enlaces = [...atributos(html, 'href'), ...atributos(html, 'src')].filter((e) => !/^(https?:|data:)/.test(e));

    for (const enlace of enlaces) {
      const destino = new URL(enlace, base);
      if (destino.pathname.endsWith('/')) destino.pathname += 'index.html';
      assert.ok(existsSync(fileURLToPath(destino)), `${pagina}: no existe ${enlace}`);
      if (!destino.hash) continue;
      const ids = atributos(readFileSync(fileURLToPath(destino), 'utf8'), 'id');
      assert.ok(ids.includes(destino.hash.slice(1)), `${pagina}: no existe el ancla ${enlace}`);
    }
  }
});

test('el mapa vive en mapa.html y las tres páginas se enlazan', () => {
  const mapa = leer('mapa.html');
  const punto = leer('punto-lista/index.html');

  assert.match(mapa, /<script type="module" src="js\/app\.js">/);
  assert.match(mapa, /href="mapa\.html" aria-current="page"/);
  assert.match(mapa, /class="barra__marca" href="\.\/"/);
  assert.equal(contar(punto, /href="\.\.\/mapa\.html"/g), 2);
  assert.equal(contar(punto, /href="\.\.\/index\.html"/g), 2);
  assert.deepEqual(
    ['mapa.html', 'punto-lista/'].filter((destino) => !atributos(home, 'href').includes(destino)),
    [],
  );
});
