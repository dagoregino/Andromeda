// Geometría sobre coordenadas [latitud, longitud]. Sin DOM, para probarla con node --test.
// Usa una proyección plana, suficiente para las distancias de una ciudad.

const RADIO_TIERRA_M = 6371000;
const GRADOS_A_RAD = Math.PI / 180;
const METROS_POR_KM = 1000;
const REDONDEO_METROS = 10;

/** Rectángulo que cubre Barranquilla, Soledad y la zona de Mallorquín. */
export const ZONA = Object.freeze({ sur: 10.82, norte: 11.08, oeste: -74.95, este: -74.7 });

export const esCoordenada = (valor) =>
  Array.isArray(valor) &&
  valor.length === 2 &&
  Number.isFinite(valor[0]) &&
  Number.isFinite(valor[1]) &&
  Math.abs(valor[0]) <= 90 &&
  Math.abs(valor[1]) <= 180;

export function distanciaMetros([latA, lngA], [latB, lngB]) {
  const x = (lngB - lngA) * GRADOS_A_RAD * Math.cos(((latA + latB) / 2) * GRADOS_A_RAD);
  const y = (latB - latA) * GRADOS_A_RAD;
  return Math.hypot(x, y) * RADIO_TIERRA_M;
}

/** Punto del tramo a–b más cercano a `punto`; `fraccion` va de 0 (en a) a 1 (en b). */
export function proyectarEnTramo(punto, a, b) {
  const escala = Math.cos(a[0] * GRADOS_A_RAD);
  const dx = (b[1] - a[1]) * escala;
  const dy = b[0] - a[0];
  const largo = dx * dx + dy * dy;
  const bruto = largo === 0 ? 0 : ((punto[1] - a[1]) * escala * dx + (punto[0] - a[0]) * dy) / largo;
  const fraccion = Math.min(1, Math.max(0, bruto));
  const proyectado = [a[0] + fraccion * (b[0] - a[0]), a[1] + fraccion * (b[1] - a[1])];
  return { fraccion, punto: proyectado, distancia: distanciaMetros(punto, proyectado) };
}

/** Metros recorridos desde el inicio hasta cada vértice. */
export function avancesDe(recorrido) {
  // Un solo arreglo local: copiarlo en cada paso hacía lenta la búsqueda con recorridos largos.
  const avances = [0];
  for (let i = 1; i < recorrido.length; i += 1) {
    avances.push(avances[i - 1] + distanciaMetros(recorrido[i - 1], recorrido[i]));
  }
  return avances;
}

/**
 * Parte del recorrido entre dos posiciones `{ indice, punto }`, donde `indice` es el tramo.
 * Con `daLaVuelta` sigue hasta el final y continúa desde el inicio (recorridos circulares).
 */
export function tramoEntre(recorrido, desde, hasta, { daLaVuelta = false } = {}) {
  const intermedios = daLaVuelta
    ? [...recorrido.slice(desde.indice + 1), ...recorrido.slice(1, hasta.indice + 1)]
    : recorrido.slice(desde.indice + 1, hasta.indice + 1);
  return [desde.punto, ...intermedios, hasta.punto];
}

export const dentroDeZona = (punto) =>
  esCoordenada(punto) &&
  punto[0] >= ZONA.sur &&
  punto[0] <= ZONA.norte &&
  punto[1] >= ZONA.oeste &&
  punto[1] <= ZONA.este;

export function formatearDistancia(metros) {
  const redondeados = Math.max(REDONDEO_METROS, Math.round(metros / REDONDEO_METROS) * REDONDEO_METROS);
  if (redondeados < METROS_POR_KM) return `${redondeados} m`;
  return `${(metros / METROS_POR_KM).toFixed(1).replace('.', ',')} km`;
}
