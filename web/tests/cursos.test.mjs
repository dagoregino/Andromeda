import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { TODOS, separar, coincide, textoCuenta } from '../js/cursos-filtro.js';
import { DETALLES } from '../js/cursos-detalle.js';
import {
  OBJETIVOS, NOTA_EJERCICIO, textoPublico, contarFrases, textosDelPaso, limitar, mover,
  textoPaso, textoSiguiente, leerCantidad, evaluar, solucion,
} from '../js/cursos-recorrido.js';

test('separar parte las claves por espacios y tolera vacíos', () => {
  assert.deepEqual(separar('ninos  jovenes'), ['ninos', 'jovenes']);
  assert.deepEqual(separar(''), []);
  assert.deepEqual(separar(undefined), []);
});

test('coincide sin filtros muestra todo', () => {
  assert.equal(coincide({ edad: 'ninos', tema: 'calor' }), true);
  assert.equal(coincide({ edad: 'ninos', tema: 'calor' }, TODOS, TODOS), true);
});

test('coincide filtra por edad aunque el curso sirva a varias', () => {
  const curso = { edad: 'jovenes adultos', tema: 'datos' };
  assert.equal(coincide(curso, 'jovenes', TODOS), true);
  assert.equal(coincide(curso, 'adultos', TODOS), true);
  assert.equal(coincide(curso, 'ninos', TODOS), false);
});

test('coincide exige edad y tema a la vez', () => {
  const curso = { edad: 'ninos', tema: 'calor' };
  assert.equal(coincide(curso, 'ninos', 'calor'), true);
  assert.equal(coincide(curso, 'ninos', 'datos'), false);
  assert.equal(coincide(curso, 'adultos', 'calor'), false);
});

test('textoCuenta cubre vacío, todos, parcial y singular', () => {
  assert.equal(textoCuenta(0, 14), 'Ningún curso coincide con estos filtros.');
  assert.equal(textoCuenta(14, 14), 'Mostrando los 14 cursos.');
  assert.equal(textoCuenta(3, 14), 'Mostrando 3 de 14 cursos.');
  assert.equal(textoCuenta(1, 14), 'Mostrando 1 de 14 cursos.');
});

// El HTML y el filtro deben usar las mismas claves, o una tarjeta quedaría fuera de todos los filtros.
test('cada tarjeta de la página de cursos usa edades y temas que existen en los filtros', () => {
  const html = readFileSync(new URL('../cursos/index.html', import.meta.url), 'utf8');
  const opciones = (nombre) =>
    [...html.matchAll(new RegExp(`name="${nombre}" value="([a-z]+)"`, 'g'))].map((m) => m[1]).filter((v) => v !== TODOS);
  const edades = opciones('edad');
  const temas = opciones('tema');
  const tarjetas = [...html.matchAll(/<li class="curso" data-edad="([^"]+)" data-tema="([^"]+)">/g)];
  assert.ok(tarjetas.length > 0);
  for (const [, edad, tema] of tarjetas) {
    for (const e of separar(edad)) assert.ok(edades.includes(e), `edad desconocida: ${e}`);
    assert.ok(temas.includes(tema), `tema desconocido: ${tema}`);
  }
  for (const e of edades) assert.ok(tarjetas.some(([, ed]) => separar(ed).includes(e)), `sin cursos de edad ${e}`);
  for (const t of temas) assert.ok(tarjetas.some(([, , tm]) => tm === t), `sin cursos de tema ${t}`);
});

test('cada curso de la página tiene actividades y una pregunta con respuesta válida', () => {
  const html = readFileSync(new URL('../cursos/index.html', import.meta.url), 'utf8');
  const lista = html.slice(html.indexOf('id="lista-cursos"'), html.indexOf('id="cursos-vacio"'));
  const titulos = [...lista.matchAll(/<h2>([^<]+)<\/h2>/g)].map((m) => m[1]);
  assert.deepEqual(Object.keys(DETALLES).sort(), titulos.sort());
  for (const d of Object.values(DETALLES)) {
    assert.ok(d.actividades.length > 0 && d.pregunta && d.explicacion);
    assert.ok(d.opciones[d.correcta], 'respuesta correcta fuera de rango');
  }
});

// ---------- Recorridos: cada curso se hace paso a paso dentro de la ventana ----------
const cursos = Object.entries(DETALLES);
const CLASES = ['opciones', 'marcar', 'orden', 'calculo', 'respuesta'];
const pasoActividad = (curso) => curso.pasos.find((paso) => paso.tipo === 'actividad');
const frases = (textos) => textos.reduce((total, texto) => total + contarFrases(texto), 0);
const leerPagina = () => readFileSync(new URL('../cursos/index.html', import.meta.url), 'utf8');
// Una respuesta equivocada para cada clase de actividad.
const equivocada = (curso, paso) => ({
  opciones: () => (curso.correcta + 1) % curso.opciones.length,
  marcar: () => paso.correctas.slice(1),
  orden: () => paso.inicio,
  calculo: () => String(paso.resultado + 1),
  respuesta: () => paso.campos.map(() => 'aquí'),
})[paso.clase]();

test('cada curso es un recorrido de 5 o 6 pasos que empieza en la portada y termina en el cierre', () => {
  assert.equal(cursos.length, 14);
  for (const [titulo, curso] of cursos) {
    const tipos = curso.pasos.map((paso) => paso.tipo);
    assert.ok(tipos.length === 5 || tipos.length === 6, `${titulo}: ${tipos.length} pasos`);
    assert.equal(tipos[0], 'portada', titulo);
    assert.equal(tipos.at(-1), 'cierre', titulo);
    assert.equal(tipos.at(-2), 'actividad', titulo);
    assert.ok(tipos.slice(1, -2).every((tipo) => tipo === 'idea'), titulo);
    for (const paso of curso.pasos.filter((p) => p.tipo === 'idea')) {
      assert.ok(paso.titulo && paso.texto, `${titulo}: idea incompleta`);
    }
  }
});

test('cada curso declara objetivo, duración de hasta 8 minutos, evidencia y cierre', () => {
  for (const [titulo, curso] of cursos) {
    assert.ok(OBJETIVOS[curso.objetivo], `${titulo}: objetivo ${curso.objetivo}`);
    assert.ok(Number.isInteger(curso.minutos) && curso.minutos > 0 && curso.minutos <= 8, titulo);
    assert.ok(curso.llevas && curso.evidencia && curso.actividades[0], titulo);
    const { ideas } = curso.pasos.at(-1);
    assert.equal(ideas.length, 3, titulo);
    // Son etiquetas cortas, no frases: así el cierre no pasa de tres frases.
    assert.ok(ideas.every((idea) => idea && !/[.!?]$/.test(idea)), titulo);
  }
});

test('cada curso tiene una actividad con respuesta, explicación y pista para reintentar', () => {
  for (const [titulo, curso] of cursos) {
    const paso = pasoActividad(curso);
    assert.ok(CLASES.includes(paso.clase), `${titulo}: ${paso.clase}`);
    assert.ok(curso.pregunta && curso.explicacion && paso.pista, titulo);
    assert.equal(evaluar(curso, paso, solucion(curso, paso)), true, `${titulo}: la solución no se acepta`);
    assert.equal(evaluar(curso, paso, equivocada(curso, paso)), false, `${titulo}: acepta un error`);
  }
});

test('los cursos usan las cinco clases de actividad', () => {
  assert.deepEqual([...new Set(cursos.map(([, c]) => pasoActividad(c).clase))].sort(), [...CLASES].sort());
});

test('el orden inicial de las actividades de ordenar no está resuelto ni pierde elementos', () => {
  for (const [titulo, curso] of cursos) {
    const paso = pasoActividad(curso);
    if (paso.clase !== 'orden') continue;
    assert.notDeepEqual(paso.inicio, solucion(curso, paso), titulo);
    assert.deepEqual([...paso.inicio].sort(), solucion(curso, paso), titulo);
  }
});

test('ningún paso tiene más de tres frases, ni al acertar ni al fallar', () => {
  for (const [titulo, curso] of cursos) {
    for (const [i, paso] of curso.pasos.entries()) {
      const donde = `${titulo}, paso ${i + 1}`;
      assert.ok(frases(textosDelPaso(curso, paso, true)) <= 3, donde);
      assert.ok(frases(textosDelPaso(curso, paso, false)) <= 3, `${donde} con pista`);
    }
  }
});

test('los textos no usan palabras de resultado ni emojis', () => {
  const textos = [JSON.stringify(DETALLES), NOTA_EJERCICIO, leerPagina()].join(' ');
  assert.doesNotMatch(textos, /\b(cumplid|logrado|ejecutad)[ao]?s?\b/i);
  assert.doesNotMatch(textos, /\p{Extended_Pictographic}/u);
});

test('la entrada dice que se hacen aquí, que son de ejemplo y que no hay docente ni certificado', () => {
  const html = leerPagina();
  assert.match(html, /Puedes hacerlos aquí mismo, a tu ritmo/);
  assert.match(html, /No necesitas inscribirte: entras y lo haces/);
  assert.match(html, /propuesta de ejercicios educativos de ejemplo: no hay docente, inscripción ni certificado/);
});

test('los cursos no guardan ni envían lo que se escribe', () => {
  const archivos = ['detalle', 'recorrido', 'dom', 'actividadVista', 'pasosVista', 'ventana'].map((n) => `cursos-${n}.js`);
  for (const archivo of archivos) {
    const codigo = readFileSync(new URL(`../js/${archivo}`, import.meta.url), 'utf8');
    assert.doesNotMatch(codigo, /localStorage|sessionStorage|indexedDB|document\.cookie|fetch\(|sendBeacon|innerHTML/, archivo);
  }
});

test('contarFrases no parte las cifras con punto', () => {
  assert.equal(contarFrases('Son 100.000 menos 60.000. ¿Cuánto queda?'), 2);
  assert.equal(contarFrases('Usa «porque» o «para».'), 1);
  assert.equal(contarFrases(''), 0);
});

test('la navegación se queda dentro del recorrido y nombra el paso y el botón', () => {
  assert.deepEqual([limitar(-1, 5), limitar(2, 5), limitar(9, 5)], [0, 2, 4]);
  assert.equal(textoPaso(1, 5), 'Paso 2 de 5');
  assert.deepEqual([textoSiguiente(0, 5), textoSiguiente(2, 5), textoSiguiente(4, 5)],
    ['Empezar', 'Siguiente', 'Volver a los cursos']);
});

test('textoPublico nombra las edades del curso', () => {
  assert.equal(textoPublico('ninos'), 'Niños (6 a 12 años)');
  assert.equal(textoPublico('jovenes adultos'), 'Jóvenes (13 a 17 años) y adultos (18 o más)');
  assert.equal(textoPublico(''), '');
});

test('mover sube o baja un elemento sin modificar la lista', () => {
  const lista = [0, 1, 2];
  assert.deepEqual(mover(lista, 1, -1), [1, 0, 2]);
  assert.deepEqual(mover(lista, 1, 1), [0, 2, 1]);
  assert.deepEqual(mover(lista, 0, -1), [0, 1, 2]);
  assert.deepEqual(lista, [0, 1, 2]);
});

test('leerCantidad entiende pesos escritos de varias formas', () => {
  for (const texto of ['40000', '40.000', '$ 40.000', '40 000 pesos']) assert.equal(leerCantidad(texto), 40000, texto);
  for (const texto of ['', 'cuarenta mil', '-40000', '40 mil']) assert.ok(Number.isNaN(leerCantidad(texto)), texto);
});

test('la respuesta breve exige palabras con contenido y, si se pide, una razón', () => {
  const reporte = { clase: 'respuesta', campos: [{ minimo: 2 }, { minimo: 2 }] };
  assert.equal(evaluar({}, reporte, ['Alcantarilla sin tapa', 'frente a la tienda']), true);
  assert.equal(evaluar({}, reporte, ['Alcantarilla sin tapa', 'por ahí']), false);
  assert.equal(evaluar({}, reporte, ['', '']), false);
  const razon = { clase: 'respuesta', campos: [{ minimo: 5, conectores: ['porque', 'para'] }] };
  assert.equal(evaluar({}, razon, ['Más sombra PORQUE jugamos al sol']), true);
  assert.equal(evaluar({}, razon, ['Más sombra en toda la cuadra']), false);
});

test('marcar exige exactamente las casillas correctas, en cualquier orden', () => {
  const paso = { clase: 'marcar', correctas: [0, 2] };
  assert.equal(evaluar({}, paso, [2, 0]), true);
  assert.equal(evaluar({}, paso, [0, 1, 2]), false);
  assert.equal(evaluar({}, paso, []), false);
});
