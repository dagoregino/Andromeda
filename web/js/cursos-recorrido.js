// Lógica de los recorridos de cursos, sin DOM, para probarla con node --test.
// No guarda ni envía nada: recibe la respuesta y dice si está bien.
import { separar } from './cursos-filtro.js';

/** Objetivos del programa, según «sprint 1/README.md». */
export const OBJETIVOS = Object.freeze({
  A: 'Ciudad fresca y verde',
  B: 'Ciudad que no se detiene',
  C: 'Moverse fácil y accesible',
  D: 'Ciudad que avisa y responde',
  E: 'El Mundial también vende en el barrio',
  F: 'Legado que se vigila',
  G: 'Escuela de ciudad',
});

export const NOTA_EJERCICIO = 'Es un ejercicio educativo de ejemplo: no reemplaza una clase, no certifica y no promete cupos ni sedes.';

const EDADES = Object.freeze({
  ninos: 'Niños (6 a 12 años)',
  jovenes: 'Jóvenes (13 a 17 años)',
  adultos: 'Adultos (18 o más)',
});

// Palabras que no ubican ni explican nada por sí solas.
const PALABRAS_VAGAS = new Set(['aquí', 'aqui', 'ahí', 'ahi', 'allí', 'alli', 'allá', 'alla', 'acá', 'aca', 'por']);

/** «Jóvenes (13 a 17 años) y adultos (18 o más)» a partir de "jovenes adultos". */
export const textoPublico = (edad) =>
  separar(edad)
    .map((clave) => EDADES[clave])
    .filter(Boolean)
    .map((nombre, i) => (i === 0 ? nombre : nombre.charAt(0).toLowerCase() + nombre.slice(1)))
    .join(' y ');

/** Cuenta frases. El punto de una cifra como 100.000 no parte la frase. */
export const contarFrases = (texto) =>
  (texto ?? '').split(/(?<=[.!?][»")]?)\s+/).filter((parte) => parte.trim()).length;

/** Textos corridos que muestra un paso. En la actividad cambian según se acierte o no. */
export const textosDelPaso = (curso, paso, acierto = true) => {
  if (paso.tipo === 'portada') return [curso.llevas, NOTA_EJERCICIO];
  if (paso.tipo === 'idea') return [paso.texto];
  if (paso.tipo === 'cierre') return [curso.actividades[0], curso.evidencia];
  return [curso.pregunta, paso.nota ?? '', acierto ? curso.explicacion : paso.pista];
};

export const limitar = (indice, total) => Math.min(Math.max(indice, 0), total - 1);

export const textoPaso = (indice, total) => `Paso ${indice + 1} de ${total}`;

export const textoSiguiente = (indice, total) => {
  if (indice === 0) return 'Empezar';
  return indice === total - 1 ? 'Volver a los cursos' : 'Siguiente';
};

/** Copia de la lista con el elemento de `posicion` movido un lugar (`delta` es -1 o 1). */
export const mover = (lista, posicion, delta) => {
  const destino = posicion + delta;
  if (destino < 0 || destino >= lista.length) return [...lista];
  return lista.map((elemento, i) => {
    if (i === posicion) return lista[destino];
    return i === destino ? lista[posicion] : elemento;
  });
};

/** Lee una cantidad en pesos: «$ 40.000», «40 000 pesos». NaN si no es solo una cantidad. */
export const leerCantidad = (texto) => {
  const limpio = String(texto).replace(/pesos/i, '').replace(/,00\b/, '').replace(/[\s$.]/g, '');
  return /^\d+$/.test(limpio) ? Number(limpio) : Number.NaN;
};

const palabrasDe = (texto) => (String(texto).toLowerCase().match(/\p{L}{2,}/gu) ?? []);

/** Un campo escrito está completo si tiene palabras suficientes y, si se pide, un conector. */
const campoCompleto = (campo, texto) => {
  const palabras = palabrasDe(texto);
  const utiles = palabras.filter((palabra) => !PALABRAS_VAGAS.has(palabra));
  const conRazon = !campo.conectores || campo.conectores.some((conector) => palabras.includes(conector));
  return utiles.length >= campo.minimo && conRazon;
};

const mismosElementos = (a, b) => a.length === b.length && a.every((elemento) => b.includes(elemento));

const REVISIONES = Object.freeze({
  opciones: (curso, paso, respuesta) => respuesta === curso.correcta,
  marcar: (curso, paso, respuesta) => mismosElementos(respuesta, paso.correctas),
  orden: (curso, paso, respuesta) => respuesta.every((elemento, i) => elemento === i),
  calculo: (curso, paso, respuesta) => leerCantidad(respuesta) === paso.resultado,
  respuesta: (curso, paso, respuesta) => paso.campos.every((campo, i) => campoCompleto(campo, respuesta[i])),
});

/** ¿La respuesta a la actividad está bien? */
export const evaluar = (curso, paso, respuesta) => REVISIONES[paso.clase](curso, paso, respuesta);

const SOLUCIONES = Object.freeze({
  opciones: (curso) => curso.correcta,
  marcar: (curso, paso) => [...paso.correctas],
  orden: (curso) => curso.opciones.map((_, i) => i),
  calculo: (curso, paso) => String(paso.resultado),
  respuesta: (curso, paso) => paso.campos.map((campo) => campo.ejemplo),
});

/** Una respuesta correcta de la actividad. Las pruebas la usan para revisar cada curso. */
export const solucion = (curso, paso) => SOLUCIONES[paso.clase](curso, paso);
