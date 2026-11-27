// Lógica del filtro de cursos, sin DOM, para probarla con node --test.
// Cada curso declara sus edades y su tema en data-edad (varias, separadas por espacio) y data-tema.
import { t } from './idioma.js';

export const TODOS = 'todos';

/** Convierte "ninos jovenes" en ['ninos', 'jovenes']. Vacío o nulo da []. */
export const separar = (texto) => (texto ?? '').split(/\s+/).filter(Boolean);

/**
 * ¿Debe mostrarse el curso con los filtros elegidos?
 * `edad` y `tema` valen TODOS o una clave. Un curso puede servir a varias edades, pero tiene un solo tema.
 */
export const coincide = (curso, edad = TODOS, tema = TODOS) => {
  const sirveEdad = edad === TODOS || separar(curso.edad).includes(edad);
  const sirveTema = tema === TODOS || curso.tema === tema;
  return sirveEdad && sirveTema;
};

/** Texto del contador que se anuncia a los lectores de pantalla. */
export const textoCuenta = (visibles, total) => {
  if (visibles === 0) return t('Ningún curso coincide con estos filtros.');
  if (visibles === total) return t('Mostrando los {total} cursos.', { total });
  return t('Mostrando {visibles} de {total} {nombre}.', { visibles, total, nombre: t(total === 1 ? 'curso' : 'cursos') });
};
