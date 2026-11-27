// Idioma de la web: español o inglés. Los textos se escriben en español y su traducción se busca en
// en/textos.js. Si falta una, se muestra el texto en español. Sin DOM salvo para saber qué idioma usar.
import { TEXTOS } from './en/textos.js';

export const IDIOMAS = Object.freeze(['es', 'en']);
export const CLAVE_IDIOMA = 'baqnova-idioma';

export const normalizar = (texto) => texto.replace(/\s+/g, ' ').trim();

/**
 * Manda lo que se pida en la dirección (?lang=en), después lo elegido antes y, si no hay nada,
 * el navegador: en español si está en español y en inglés para cualquier otro idioma.
 */
export function elegirIdioma({ parametro, guardado, navegador } = {}) {
  const elegido = [parametro, guardado].find((codigo) => IDIOMAS.includes(codigo));
  if (elegido) return elegido;
  if (!navegador) return 'es';
  return navegador.toLowerCase().startsWith('es') ? 'es' : 'en';
}

/** Traduce y rellena las marcas como {total}. */
export function traducir(texto, idioma, valores = {}) {
  if (typeof texto !== 'string') return '';
  const clave = normalizar(texto);
  const base = idioma !== 'es' && Object.hasOwn(TEXTOS, clave) ? TEXTOS[clave] : texto;
  return base.replace(/\{(\w+)\}/g, (marca, nombre) => (Object.hasOwn(valores, nombre) ? String(valores[nombre]) : marca));
}

/** Lo elegido antes en este navegador, o null si no se puede leer. */
function leerGuardado() {
  try {
    return window.localStorage.getItem(CLAVE_IDIOMA);
  } catch {
    return null;
  }
}

// Fuera del navegador (las pruebas) la web habla español.
export const idioma = typeof window === 'undefined' ? 'es' : elegirIdioma({
  parametro: new URLSearchParams(window.location.search).get('lang'),
  guardado: leerGuardado(),
  navegador: window.navigator.language,
});

export const t = (texto, valores) => traducir(texto, idioma, valores);

/** Separador de decimales del idioma en uso: «1,2 km» o «1.2 km». */
export const DECIMAL = idioma === 'es' ? ',' : '.';
