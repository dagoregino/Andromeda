// Geocodificación sobre datos de OpenStreetMap. Sin DOM.
// Búsqueda al escribir: Photon (busca por prefijo, sirve para autocompletar) y, si falla o no
// encuentra nada, Nominatim. Búsqueda inversa (nombrar un punto del mapa): Nominatim.
// Respeta el límite de 1 petición por segundo con debounce y AbortController.
import { idioma } from './idioma.js';

const BASE = 'https://nominatim.openstreetmap.org';
const BASE_PHOTON = 'https://photon.komoot.io/api/';
// Área metropolitana de Barranquilla: Barranquilla, Soledad, Malambo, Puerto Colombia, Galapa.
const VIEWBOX = '-74.95,11.15,-74.65,10.85'; // Nominatim: oeste,norte,este,sur
const BBOX_PHOTON = '-74.95,10.85,-74.65,11.15'; // Photon: oeste,sur,este,norte
const CENTRO_PHOTON = { lat: 10.975, lon: -74.8 };
const LIMITE_PHOTON = 8; // se piden más y se descartan los resultados sin nombre
const LIMITE = 6;
const DEBOUNCE_MS = 450;

/** Agrega "Barranquilla" al texto si el usuario no lo incluyó, para mejorar la precisión. */
function enriquecerTexto(texto) {
  const limpio = texto.trim();
  const sinTildes = limpio.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  if (sinTildes.includes('barranquilla') || sinTildes.includes('soledad') ||
      sinTildes.includes('malambo') || sinTildes.includes('puerto colombia') ||
      sinTildes.includes('galapa')) {
    return limpio;
  }
  return `${limpio}, Barranquilla`;
}

/** Extrae el barrio o zona del resultado de Nominatim. */
function extraerZona(lugar) {
  const addr = lugar.address ?? {};
  return addr.suburb ?? addr.neighbourhood ?? addr.quarter ??
         addr.city_district ?? addr.town ?? addr.city ?? '';
}

/** Convierte un resultado de Nominatim al formato que usa la aplicación. */
function convertir(lugar) {
  return {
    nombre: lugar.display_name.split(',')[0].trim(),
    nombreCompleto: lugar.display_name,
    zona: extraerZona(lugar),
    lat: parseFloat(lugar.lat),
    lng: parseFloat(lugar.lon),
    tipo: lugar.type ?? '',
    osm_id: lugar.osm_id,
  };
}

/** Convierte un resultado (feature GeoJSON) de Photon al formato que usa la aplicación. */
function convertirPhoton(feature) {
  const [lng, lat] = feature?.geometry?.coordinates ?? [];
  const p = feature?.properties ?? {};
  const calle = [p.street, p.housenumber].filter(Boolean).join(' ');
  const nombre = (p.name ?? calle).trim();
  if (!nombre || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const zona = p.district ?? p.locality ?? p.city ?? '';
  return {
    nombre,
    nombreCompleto: [nombre, calle && calle !== nombre ? calle : '', zona, p.city, p.state].filter(Boolean).join(', '),
    zona,
    lat,
    lng,
    tipo: p.osm_value ?? '',
    osm_id: p.osm_id,
  };
}

/** Quita resultados repetidos (mismo nombre y casi el mismo punto). */
function sinRepetidos(resultados) {
  const vistos = new Set();
  return resultados.filter((r) => {
    const clave = `${r.nombre.toLowerCase()}|${r.lat.toFixed(3)}|${r.lng.toFixed(3)}`;
    if (vistos.has(clave)) return false;
    vistos.add(clave);
    return true;
  });
}

async function buscarEnPhoton(texto, signal) {
  const params = new URLSearchParams({
    q: texto,
    bbox: BBOX_PHOTON,
    lat: String(CENTRO_PHOTON.lat),
    lon: String(CENTRO_PHOTON.lon),
    limit: String(LIMITE_PHOTON),
  });
  const respuesta = await fetch(`${BASE_PHOTON}?${params}`, { signal });
  if (!respuesta.ok) throw new Error(`Photon respondió ${respuesta.status}`);
  const datos = await respuesta.json();
  const lugares = (datos.features ?? []).map(convertirPhoton).filter(Boolean);
  return sinRepetidos(lugares).slice(0, LIMITE);
}

async function buscarEnNominatim(texto, signal) {
  const params = new URLSearchParams({
    format: 'json',
    q: enriquecerTexto(texto),
    countrycodes: 'co',
    viewbox: VIEWBOX,
    bounded: '1',
    limit: String(LIMITE),
    addressdetails: '1',
  });

  const respuesta = await fetch(`${BASE}/search?${params}`, {
    signal,
    headers: { 'Accept-Language': idioma },
  });

  if (!respuesta.ok) throw new Error(`Nominatim respondió ${respuesta.status}`);
  const datos = await respuesta.json();
  return datos.map(convertir);
}

/**
 * Busca lugares mientras el usuario escribe. Devuelve una lista de resultados convertidos.
 * Prueba primero con Photon; si falla o no encuentra nada, usa Nominatim.
 * @param {string} texto - Lo que escribió el usuario.
 * @param {AbortSignal} [signal] - Para cancelar la petición.
 * @returns {Promise<Array>}
 */
export async function buscarLugar(texto, signal) {
  const limpio = texto.trim();
  if (limpio.length < 3) return [];
  try {
    const resultados = await buscarEnPhoton(limpio, signal);
    if (resultados.length > 0) return resultados;
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    // Photon caído o con error: se intenta con Nominatim.
  }
  return buscarEnNominatim(limpio, signal);
}

/**
 * Geocodificación inversa: dado un punto, devuelve el nombre aproximado.
 * @param {number} lat
 * @param {number} lng
 * @param {AbortSignal} [signal]
 * @returns {Promise<{nombre: string, zona: string}>}
 */
export async function buscarDireccion(lat, lng, signal) {
  const params = new URLSearchParams({
    format: 'json',
    lat: String(lat),
    lon: String(lng),
    addressdetails: '1',
    zoom: '18',
  });

  const respuesta = await fetch(`${BASE}/reverse?${params}`, {
    signal,
    headers: { 'Accept-Language': idioma },
  });

  if (!respuesta.ok) throw new Error(`Nominatim respondió ${respuesta.status}`);
  const dato = await respuesta.json();
  if (dato.error) return { nombre: 'Punto en el mapa', zona: '' };

  const nombre = dato.display_name?.split(',')[0]?.trim() ?? 'Punto en el mapa';
  return { nombre, zona: extraerZona(dato) };
}

/** Mueve la opción activa del desplegable con las flechas, dando la vuelta en los extremos. */
export function moverIndice(actual, total, paso) {
  if (total <= 0) return -1;
  if (actual < 0) return paso > 0 ? 0 : total - 1;
  return (actual + paso + total) % total;
}

/**
 * Crea un buscador con debounce y cancelación automática.
 * @param {function} alResultado - Recibe la lista de resultados.
 * @param {function} alBuscar - Se llama cuando empieza la búsqueda.
 * @param {function} alError - Se llama con el mensaje de error.
 * @returns {{ buscar: function, cancelar: function }}
 */
export function crearBuscador({ alResultado, alBuscar, alError }) {
  let temporizador = null;
  let controlador = null;

  function cancelar() {
    clearTimeout(temporizador);
    controlador?.abort();
    controlador = null;
  }

  function buscar(texto) {
    cancelar();
    const limpio = texto.trim();
    if (limpio.length < 3) {
      alResultado([]);
      return;
    }
    temporizador = setTimeout(async () => {
      controlador = new AbortController();
      alBuscar();
      try {
        const resultados = await buscarLugar(limpio, controlador.signal);
        alResultado(resultados);
      } catch (error) {
        if (error.name === 'AbortError') return;
        alError('Error de conexión, intenta de nuevo.');
      }
    }, DEBOUNCE_MS);
  }

  return { buscar, cancelar };
}

// --- Recientes en localStorage ---

const CLAVE_RECIENTES = 'baqnova-recientes';
const MAX_RECIENTES = 5;

/** Devuelve las últimas búsquedas guardadas. */
export function obtenerRecientes() {
  try {
    const guardados = JSON.parse(localStorage.getItem(CLAVE_RECIENTES) ?? '[]');
    return Array.isArray(guardados) ? guardados.slice(0, MAX_RECIENTES) : [];
  } catch {
    return [];
  }
}

/** Guarda un lugar en las recientes (al principio, sin repetir). */
export function guardarReciente(lugar) {
  try {
    const recientes = obtenerRecientes().filter((r) => r.nombre !== lugar.nombre || r.lat !== lugar.lat);
    recientes.unshift({ nombre: lugar.nombre, zona: lugar.zona, lat: lugar.lat, lng: lugar.lng });
    localStorage.setItem(CLAVE_RECIENTES, JSON.stringify(recientes.slice(0, MAX_RECIENTES)));
  } catch { /* localStorage lleno o no disponible */ }
}

// Funciones internas exportadas solo para las pruebas.
export { enriquecerTexto as _enriquecerTexto, extraerZona as _extraerZona, convertir as _convertir, convertirPhoton as _convertirPhoton, sinRepetidos as _sinRepetidos, DEBOUNCE_MS };
