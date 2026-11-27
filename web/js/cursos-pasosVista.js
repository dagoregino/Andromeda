// Dibuja cada paso del recorrido de un curso: portada, ideas, actividad y cierre.
// El collage (ráfaga, recortes y franja) solo va en la portada y en el cierre.
import { OBJETIVOS, NOTA_EJERCICIO, textoPublico } from './cursos-recorrido.js';
import { crearActividad } from './cursos-actividadVista.js';
import { crear } from './cursos-dom.js';

// Ráfaga de abajo.css que acompaña a cada tema.
const RAFAGAS = Object.freeze({
  calor: 'amarilla', arroyos: 'negra', movilidad: 'roja', datos: 'negra', barrio: 'verde', participacion: 'amarilla',
});

const decorar = (clase) => {
  const nodo = crear('span', clase);
  nodo.setAttribute('aria-hidden', 'true');
  return nodo;
};

function collage(tema, contenido) {
  const nodo = crear('div', 'recorrido__collage');
  nodo.append(decorar(`rafaga rafaga--${RAFAGAS[tema]}`), contenido);
  return nodo;
}

/** Párrafo con una etiqueta destacada: «Te llevas: …». */
function destacado(etiqueta, texto) {
  const parrafo = crear('p', 'recorrido__texto');
  parrafo.append(crear('strong', '', `${etiqueta}: `), texto);
  return parrafo;
}

function portada({ curso, tema, edad }) {
  const datos = crear('dl', 'recorrido__recorte');
  const filas = [
    ['Para', textoPublico(edad)],
    ['Duración', `Unos ${curso.minutos} minutos`],
    [`Aporta al objetivo ${curso.objetivo}`, OBJETIVOS[curso.objetivo]],
  ];
  for (const [nombre, valor] of filas) {
    const fila = crear('div');
    fila.append(crear('dt', '', nombre), crear('dd', '', valor));
    datos.append(fila);
  }
  return [
    collage(tema, datos),
    destacado('Te llevas', curso.llevas),
    crear('p', 'recorrido__nota', NOTA_EJERCICIO),
    decorar('franja'),
  ];
}

function cierre({ curso, paso, tema }) {
  const ideas = crear('ul', 'recorrido__ideas');
  ideas.setAttribute('aria-label', 'Tres ideas para llevar');
  ideas.append(...paso.ideas.map((texto) => crear('li', '', texto)));
  return [
    collage(tema, ideas),
    destacado('En tu barrio', curso.actividades[0]),
    destacado('Evidencia esperada', curso.evidencia),
    decorar('franja'),
  ];
}

const PASOS = Object.freeze({
  portada: { titulo: () => 'Antes de empezar', cuerpo: portada },
  idea: { titulo: (paso) => paso.titulo, cuerpo: ({ paso }) => [crear('p', 'recorrido__texto', paso.texto)] },
  actividad: { titulo: () => 'Tu turno', cuerpo: ({ curso, paso, id }) => crearActividad(curso, paso, id) },
  cierre: { titulo: () => 'Para llevar', cuerpo: cierre },
});

/** Devuelve el bloque de un paso y su título, que recibe el foco al llegar. */
export function crearPaso({ curso, paso, indice, tema, edad }) {
  const id = `paso-${indice}`;
  const nodo = crear('section', 'recorrido__paso');
  nodo.dataset.tipo = paso.tipo;
  const titulo = crear('h3', '', PASOS[paso.tipo].titulo(paso));
  titulo.id = `${id}-titulo`;
  titulo.tabIndex = -1;
  titulo.setAttribute('aria-describedby', 'ventana-paso');
  nodo.setAttribute('aria-labelledby', titulo.id);
  nodo.append(titulo, ...PASOS[paso.tipo].cuerpo({ curso, paso, id, tema, edad }));
  return { nodo, titulo };
}
