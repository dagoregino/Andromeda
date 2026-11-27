// Junta las traducciones al inglés. Una misma clave en dos archivos debe tener el mismo texto
// (lo revisa tests/idioma.test.mjs).
import { INICIO } from './inicio.js';
import { MAPA } from './mapa.js';
import { CURSOS } from './cursos.js';
import { NOVA } from './nova.js';

export const POR_AREA = Object.freeze({ INICIO, MAPA, CURSOS, NOVA });

export const TEXTOS = Object.freeze({ ...INICIO, ...MAPA, ...CURSOS, ...NOVA });

/** Nombres propios y direcciones que se escriben igual en los dos idiomas. */
export const IGUALES = Object.freeze([
  'Barranquilla', 'BaqNova', 'Nova', 'NOVA', 'Gabriel Olier', 'El Tiempo', 'OpenStreetMap',
  'Photon', 'Nominatim', 'Open-Meteo.com', 'CC BY 4.0', 'Gran Malecón del Río', 'Plaza de la Paz', 'Portal de Soledad',
  // Barrios y zonas de data/destinos.json
  'Metropolitana', 'Soledad', 'Norte - Centro Histórico', 'Avenida Circunvalar', 'Riomar', 'Boston', 'El Rosario',
  'Barlovento', 'La Concepción', 'Barranquillita', 'La Playa',
]);
