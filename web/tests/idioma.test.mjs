// Idiomas: cómo se elige, y que no quede en español nada de lo que se muestra.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { elegirIdioma, traducir, normalizar, idioma } from '../js/idioma.js';
import { TEXTOS, POR_AREA, IGUALES } from '../js/en/textos.js';
import { DETALLES } from '../js/cursos-detalle.js';
import { DETALLES_EN } from '../js/en/cursos-detalle.js';
import { OBJETIVOS, NOTA_EJERCICIO, combinarCurso, contarFrases, textosDelPaso, evaluar, solucion, leerCantidad } from '../js/cursos-recorrido.js';
import { criteriosPorBloque, criteriosVisibles, etiquetaCriterio, etiquetaVeredicto } from '../js/accesibilidad.js';
import { consejosClima } from '../js/clima.js';
import { PREGUNTAS } from '../nova/js/contenido.js';
import { ESCENAS } from '../nova/js/escenas.js';
import { textosDePagina } from './ayudas-textos.mjs';

const raiz = new URL('../', import.meta.url);
const leer = (ruta) => readFileSync(new URL(ruta, raiz), 'utf8');
const leerJson = (ruta) => JSON.parse(leer(ruta));
const PAGINAS = ['index.html', 'mapa/index.html', 'cursos/index.html', 'nova/index.html'];
const traducido = (texto) => Object.hasOwn(TEXTOS, normalizar(texto)) || IGUALES.includes(normalizar(texto));
const sinTraducir = (textos) => textos.filter((texto) => texto && !traducido(texto));
const marcas = (texto) => [...texto.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

test('manda lo pedido en la dirección, luego lo guardado y por último el navegador', () => {
  assert.equal(elegirIdioma({ parametro: 'en', guardado: 'es', navegador: 'es-CO' }), 'en');
  assert.equal(elegirIdioma({ parametro: null, guardado: 'es', navegador: 'en-US' }), 'es');
  assert.equal(elegirIdioma({ navegador: 'es-419' }), 'es');
  assert.equal(elegirIdioma({ navegador: 'en-GB' }), 'en');
  assert.equal(elegirIdioma({ parametro: 'xx', guardado: 'fr', navegador: 'pt-BR' }), 'en');
  assert.equal(elegirIdioma(), 'es');
});

test('traduce, rellena las marcas y deja en español lo que no tiene traducción', () => {
  assert.equal(idioma, 'es');
  assert.equal(traducir('Saltar al contenido', 'en'), 'Skip to content');
  assert.equal(traducir('  Saltar   al contenido ', 'en'), 'Skip to content');
  assert.equal(traducir('Paso {paso} de {total}', 'en', { paso: 2, total: 5 }), 'Step 2 of 5');
  assert.equal(traducir('Paso {paso} de {total}', 'es', { paso: 2, total: 5 }), 'Paso 2 de 5');
  assert.equal(traducir('Carrera 50', 'en'), 'Carrera 50');
  assert.equal(traducir('constructor', 'en'), 'constructor');
  assert.equal(traducir(undefined, 'en'), '');
});

test('todo lo escrito en las cuatro páginas tiene traducción', () => {
  for (const pagina of PAGINAS) assert.deepEqual(sinTraducir(textosDePagina(leer(pagina))), [], pagina);
});

test('cada texto que los scripts pasan a t() tiene traducción', () => {
  const carpetas = ['js/', 'nova/js/'];
  const faltan = carpetas.flatMap((carpeta) => readdirSync(new URL(carpeta, raiz))
    .filter((nombre) => nombre.endsWith('.js'))
    .flatMap((nombre) => [...leer(carpeta + nombre).matchAll(/\bt\(\s*'((?:\\.|[^'\\])*)'/g)]
      .map((m) => m[1]).filter((texto) => !traducido(texto)).map((texto) => `${carpeta}${nombre}: ${texto}`)));
  assert.deepEqual(faltan, []);
});

test('los datos que se muestran tienen traducción', () => {
  const { destinos } = leerJson('data/destinos.json');
  assert.deepEqual(sinTraducir(destinos.flatMap((d) => [d.nombre, d.zona])), []);
  const { lugares } = leerJson('data/accesibilidad.json');
  const deAccesibilidad = lugares.flatMap((lugar) => [
    ...criteriosVisibles(lugar).flatMap((c) => [c.nombre, c.nota, etiquetaCriterio(c.estado)]),
    ...criteriosPorBloque(lugar).flatMap((b) => [b.nombre, ...b.criterios.map((c) => c.nombre), ...b.medidas.map((m) => m.nombre)]),
  ]);
  assert.deepEqual(sinTraducir(deAccesibilidad), []);
  assert.deepEqual(sinTraducir(['accesible', 'conAyuda', 'noAccesible', 'sinInformacion'].map(etiquetaVeredicto)), []);
  const rutas = ['data/rutas.json', 'data/rutas-amb.json'].flatMap((ruta) => leerJson(ruta).rutas);
  assert.deepEqual(sinTraducir([...new Set(rutas.map((r) => r.tipo))]), []);
  const consejos = [[40, 90], [33, 35]].flatMap(([sensacion, lluviaProbabilidad]) =>
    consejosClima({ sensacion, lluviaProbabilidad, lloviendo: false }).map((c) => c.texto));
  assert.deepEqual(sinTraducir(consejos), []);
  const demo = [...PREGUNTAS.flatMap((p) => [p.pregunta, p.respuesta]),
    ...Object.values(ESCENAS).flatMap((e) => [e.pantalla.titulo, e.pantalla.texto])];
  assert.deepEqual(sinTraducir(demo), []);
  assert.deepEqual(sinTraducir([...Object.values(OBJETIVOS), NOTA_EJERCICIO]), []);
});

test('las traducciones conservan las marcas y no se contradicen entre archivos', () => {
  const vistos = new Map();
  for (const [area, textos] of Object.entries(POR_AREA)) {
    for (const [clave, valor] of Object.entries(textos)) {
      assert.ok(valor.trim(), `${area}: ${clave} está vacío`);
      assert.deepEqual(marcas(valor), marcas(clave), `${area}: ${clave}`);
      assert.ok(!vistos.has(clave) || vistos.get(clave) === valor, `${clave} tiene dos traducciones distintas`);
      vistos.set(clave, valor);
    }
  }
});

// Compara la forma de dos valores: mismas claves de texto y mismas cantidades.
const mismaForma = (base, otro, donde) => {
  if (Array.isArray(otro)) assert.equal(otro.length, base.length, donde);
  if (typeof otro !== 'object') return assert.ok(typeof otro === 'string' && otro.trim(), donde);
  for (const [clave, valor] of Object.entries(otro)) {
    if (clave !== 'conectores') mismaForma(base[clave], valor, `${donde}.${clave}`);
  }
  return undefined;
};

const TEXTOS_DE_CURSO = ['llevas', 'evidencia', 'actividades', 'pregunta', 'opciones', 'explicacion'];

test('los 14 cursos tienen todos sus textos en inglés', () => {
  assert.deepEqual(Object.keys(DETALLES_EN).sort(), Object.keys(DETALLES).sort());
  for (const [titulo, ingles] of Object.entries(DETALLES_EN)) {
    const base = DETALLES[titulo];
    assert.ok(traducido(titulo), `${titulo}: sin título en inglés`);
    for (const clave of TEXTOS_DE_CURSO) mismaForma(base[clave], ingles[clave], `${titulo}.${clave}`);
    assert.equal(ingles.pasos.length, base.pasos.length, titulo);
    base.pasos.forEach((paso, i) => {
      const esperadas = ['titulo', 'texto', 'pista', 'nota', 'ideas', 'campos'].filter((clave) => clave in paso);
      assert.deepEqual(Object.keys(ingles.pasos[i]).sort(), esperadas.sort(), `${titulo}, paso ${i + 1}`);
      mismaForma(paso, ingles.pasos[i], `${titulo}, paso ${i + 1}`);
    });
  }
});

test('en inglés las actividades se resuelven y ningún paso pasa de tres frases', () => {
  for (const [titulo, base] of Object.entries(DETALLES)) {
    const curso = combinarCurso(base, DETALLES_EN[titulo]);
    curso.pasos.forEach((paso, i) => {
      for (const acierto of [true, false]) {
        const textos = textosDelPaso(curso, paso, acierto).map((texto) => (texto === NOTA_EJERCICIO ? traducir(texto, 'en') : texto));
        assert.ok(textos.reduce((total, texto) => total + contarFrases(texto), 0) <= 3, `${titulo}, paso ${i + 1}`);
      }
    });
    const paso = curso.pasos.find((p) => p.tipo === 'actividad');
    assert.equal(evaluar(curso, paso, solucion(curso, paso)), true, titulo);
    if (paso.clase === 'respuesta') assert.equal(evaluar(curso, paso, paso.campos.map(() => 'over there')), false, titulo);
  }
});

test('combinar un curso no cambia el original ni sus respuestas correctas', () => {
  const base = DETALLES['Mi cuadra tiene voz'];
  const copia = structuredClone(base);
  const combinado = combinarCurso(base, DETALLES_EN['Mi cuadra tiene voz']);
  assert.deepEqual(base, copia);
  assert.equal(combinado.correcta, base.correcta);
  assert.equal(combinado.pasos[3].campos[0].minimo, base.pasos[3].campos[0].minimo);
  assert.equal(combinarCurso(base, undefined), base);
});

test('las cantidades se entienden con la coma de miles del inglés', () => {
  for (const texto of ['40,000', '$40,000', '40,000 pesos']) assert.equal(leerCantidad(texto), 40000, texto);
  assert.ok(Number.isNaN(leerCantidad('4,5')));
});

test('las cuatro páginas cargan el cambio de idioma después de sus otros scripts', () => {
  for (const pagina of PAGINAS) {
    const scripts = [...leer(pagina).matchAll(/<script[^>]*src="([^"]+)"/g)].map((m) => m[1]);
    assert.match(scripts.at(-1) ?? '', /js\/idioma-pagina\.js$/, pagina);
  }
});
