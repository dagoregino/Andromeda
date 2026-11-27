// Reglas de las páginas HTML: qué muestra la home, cómo se mueve y que ningún enlace local quede roto.
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

const PAGINAS = ['index.html', 'mapa/index.html', 'punto-lista/index.html', 'cursos/index.html'];
const home = sinComentarios(leer('index.html'));

// Bloque de la home que empieza en la sección con ese id de título.
function seccion(idTitulo) {
  const bloque = home.match(new RegExp(`<section[^>]*aria-labelledby="${idTitulo}"[\\s\\S]*?</section>`));
  assert.ok(bloque, `falta la sección ${idTitulo}`);
  return bloque[0];
}

test('la home no carga scripts, Leaflet ni datos del mapa', () => {
  assert.equal(contar(home, /<script/g), 0);
  assert.doesNotMatch(home, /leaflet|data\/|js\/|<canvas/i);
});

test('la home cuenta la ciudad en general: ni solo moverse ni solo el Mundial', () => {
  const titulo = home.match(/<title>(.*?)<\/title>/)?.[1] ?? '';
  const titular = texto(seccion('titulo').match(/<h1[\s\S]*?<\/h1>/)?.[0] ?? '');

  assert.match(titular, /Barranquilla para su gente/);
  assert.doesNotMatch(`${titulo} ${titular}`, /2034|Mundial|Muévete/i);
});

test('la portada menciona el Mundial como medio y no como el fin', () => {
  assert.match(texto(seccion('titulo')), /Mundial 2034[^.]*no el fin/);
});

test('las secciones van de la ciudad a las herramientas', () => {
  const orden = [...home.matchAll(/<section[^>]*aria-labelledby="([^"]+)"/g)].map((m) => m[1]);

  assert.deepEqual(orden, [
    'titulo', 'partida-titulo', 'propuesta-titulo', 'medio-titulo', 'ruta-titulo', 'legado-titulo',
    'usar-titulo', 'cursos-titulo', 'faq-titulo', 'participa-titulo',
  ]);
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

test('lo que no verificó un tercero lo dice', () => {
  assert.equal(contar(seccion('partida-titulo'), /<p class="dato__aviso">/g), 2);
});

test('la propuesta nombra seis frentes y aclara que son propuestas', () => {
  const propuesta = seccion('propuesta-titulo');

  assert.equal(contar(propuesta, /<li class="frente">/g), 6);
  assert.match(texto(propuesta), /propuestas/i);
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

test('el legado son cuatro líneas como máximo', () => {
  const lineas = contar(seccion('legado-titulo'), /<li[\s>]/g);

  assert.ok(lineas > 0 && lineas <= 4);
});

// Retirados a pedido del usuario el 2026-11-26. No se revisan los comentarios del código.
test('ninguna página muestra los avisos retirados', () => {
  const retirados = [
    /prospectiva|escenario ficticio/i,
    /verificad[ao]s? con las empresas|sin verificar con las empresas/i,
    /(rutas|recorridos|dato)( de bus)? de ejemplo/i,
    /todavía no (hay|tiene) inscripciones|contenido de ejemplo|curso__estado/i,
  ];
  const visibles = [
    ...PAGINAS.map((ruta) => [ruta, sinComentarios(leer(ruta))]),
    // Textos que estos dos archivos escriben en el mapa.
    ...['js/app.js', 'js/listas.js'].map((ruta) => [ruta, leer(ruta)]),
  ];

  for (const [ruta, contenido] of visibles) {
    for (const aviso of retirados) assert.doesNotMatch(contenido, aviso, `${ruta} aún muestra ${aviso}`);
  }
});

test('la barra de arriba enlaza las cuatro páginas y marca la actual', () => {
  const cabecera = home.match(/<header[\s\S]*?<\/header>/)?.[0] ?? '';
  const enlaces = atributos(cabecera, 'href');

  assert.deepEqual(['./', 'mapa/', 'punto-lista/', 'cursos/'].filter((d) => !enlaces.includes(d)), []);
  assert.match(cabecera, /href="\.\/" aria-current="page"/);
});

test('las transiciones solo corren si no se pide reducir el movimiento', () => {
  const movimiento = leer('css/movimiento.css').replace(/\/\*[\s\S]*?\*\//g, '');
  const antes = movimiento.slice(0, movimiento.indexOf('@media (prefers-reduced-motion: no-preference)'));

  assert.ok(atributos(home, 'href').includes('css/movimiento.css'));
  assert.equal(antes.trim(), '', 'hay reglas fuera del bloque de movimiento');
  assert.match(movimiento, /@supports \(animation-timeline: view\(\)\)/);
});

// Un antepasado con overflow: hidden se vuelve el contenedor de desplazamiento y detiene
// las animaciones ligadas al desplazamiento y la columna fija de la ruta.
test('los bloques de la parte de abajo recortan sin crear desplazamiento', () => {
  const abajo = leer('css/abajo.css');

  for (const selector of ['.abajo {', '.abajo .tramo {']) {
    const regla = abajo.slice(abajo.indexOf(selector)).split('}')[0];
    assert.match(regla, /overflow: clip/);
    assert.doesNotMatch(regla, /overflow: hidden/);
  }
});

test('ningún enlace local apunta a un archivo o ancla que no exista', () => {
  for (const pagina of PAGINAS) {
    const html = sinComentarios(leer(pagina));
    const base = new URL(pagina, raiz);
    const enlaces = [...atributos(html, 'href'), ...atributos(html, 'src')].filter((e) => !/^(https?:|data:)/.test(e));

    for (const enlace of enlaces) {
      const destino = new URL(enlace, base);
      destino.search = '';
      if (destino.pathname.endsWith('/')) destino.pathname += 'index.html';
      assert.ok(existsSync(fileURLToPath(destino)), `${pagina}: no existe ${enlace}`);
      // Los temas de cursos (#calor, #arroyos…) los lee cursos.js: no son anclas.
      if (!destino.hash || destino.pathname.endsWith('/cursos/index.html')) continue;
      const ids = atributos(readFileSync(fileURLToPath(destino), 'utf8'), 'id');
      assert.ok(ids.includes(destino.hash.slice(1)), `${pagina}: no existe el ancla ${enlace}`);
    }
  }
});

test('el mapa vive en mapa/ y las páginas se enlazan', () => {
  assert.match(leer('mapa/index.html'), /<script type="module" src="\.\.\/js\/app\.js">/);
  assert.ok(!existsSync(fileURLToPath(new URL('2034/index.html', raiz))), 'la página 2034 se unió a la home');
});
