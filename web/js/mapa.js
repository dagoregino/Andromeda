// Dibujo del mapa con Leaflet. Recibe el viaje ya calculado y lo pinta; no decide nada.
import { t } from './idioma.js';

const CENTRO = [10.975, -74.8];
const ZOOM_INICIAL = 12;
const ZOOM_PUNTO = 15;
const MARGEN_PX = [48, 48];
const MAX_TESELAS_FALLIDAS = 4;

function crearBase(L, mapa, alFallar) {
  const capa = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  });
  let cargadas = 0;
  let fallidas = 0;
  capa.on('tileload', () => { cargadas += 1; });
  capa.on('tileerror', () => {
    fallidas += 1;
    if (cargadas === 0 && fallidas >= MAX_TESELAS_FALLIDAS) alFallar();
  });
  capa.addTo(mapa);
}

function marcador(L, punto, letra, clase, titulo) {
  const icon = L.divIcon({ className: `pin ${clase}`, html: `<span>${letra}</span>`, iconSize: [36, 36] });
  // Los nombres vienen de los datos: se pasan como texto, nunca como HTML.
  const etiqueta = document.createElement('span');
  etiqueta.textContent = titulo;
  return L.marker(punto, { icon, title: titulo, alt: titulo }).bindTooltip(etiqueta, { direction: 'top', offset: [0, -18] });
}

function capasDelBus(L, origen, destino, opcion) {
  const { subida, bajada, tramoBus } = opcion;
  const linea = (puntos, clase) => L.polyline(puntos, { className: clase, interactive: false });
  const parada = (punto) => L.circleMarker(punto, { radius: 7, className: 'parada', interactive: false });
  return [
    linea([origen, subida.punto], 'linea-pie'),
    linea([bajada.punto, destino], 'linea-pie'),
    linea(tramoBus, 'linea-borde'),
    linea(tramoBus, 'linea-bus'),
    parada(subida.punto),
    parada(bajada.punto),
  ];
}

/** Una ruta completa del catálogo: recorrido, paradas, inicio y final. */
function capasDeLaRuta(L, ruta) {
  const linea = (clase) => L.polyline(ruta.recorrido, { className: clase, interactive: false });
  const paradas = ruta.paradas.map(({ nombre, lat, lng }) => {
    const etiqueta = document.createElement('span');
    etiqueta.textContent = nombre;
    return L.circleMarker([lat, lng], { radius: 6, className: 'parada' }).bindTooltip(etiqueta);
  });
  const { codigo } = ruta;
  const extremos = [marcador(L, ruta.recorrido[0], t('I'), 'pin--origen', t('Inicio de la ruta {codigo}', { codigo }))];
  if (!ruta.circular) {
    extremos.push(marcador(L, ruta.recorrido.at(-1), t('F'), 'pin--destino', t('Final de la ruta {codigo}', { codigo })));
  }
  return [linea('linea-borde'), linea('linea-bus'), ...paradas, ...extremos];
}

// Sin animación: Leaflet descarta un encuadre pedido mientras otro zoom sigue en marcha.
function encuadrar(mapa, puntos) {
  const animate = false;
  if (puntos.length === 0) mapa.setView(CENTRO, ZOOM_INICIAL, { animate });
  else if (puntos.length === 1) mapa.setView(puntos[0], ZOOM_PUNTO, { animate });
  else mapa.fitBounds(puntos, { padding: MARGEN_PX, maxZoom: ZOOM_PUNTO, animate });
}

/** Devuelve `{ pintar }`, o `null` si Leaflet no está disponible. */
export function crearMapa(idContenedor, { alTocar, alFallar }) {
  const L = window.L;
  if (!L) {
    alFallar();
    return null;
  }
  const mapa = L.map(idContenedor, { zoomControl: true }).setView(CENTRO, ZOOM_INICIAL);
  crearBase(L, mapa, alFallar);
  const capas = L.layerGroup().addTo(mapa);
  mapa.on('click', ({ latlng }) => alTocar([latlng.lat, latlng.lng]));
  let dibujado = [null, null, null, null];

  return {
    pintar({ origen = null, destino = null, opcion = null, ruta = null }) {
      // Un aviso no cambia el viaje: no se redibuja, para respetar dónde dejó el mapa el usuario.
      const viaje = [origen, destino, opcion?.ruta.id ?? null, ruta?.id ?? null];
      if (viaje.every((parte, i) => parte === dibujado[i])) return;
      dibujado = viaje;
      capas.clearLayers();
      if (ruta) capasDeLaRuta(L, ruta).forEach((capa) => capas.addLayer(capa));
      if (opcion && origen && destino) {
        capasDelBus(L, origen.punto, destino.punto, opcion).forEach((capa) => capas.addLayer(capa));
      }
      if (origen) capas.addLayer(marcador(L, origen.punto, 'A', 'pin--origen', t('Salida: {nombre}', { nombre: t(origen.nombre) })));
      if (destino) capas.addLayer(marcador(L, destino.punto, 'B', 'pin--destino', t('Destino: {nombre}', { nombre: t(destino.nombre) })));
      const extremos = [origen, destino].filter(Boolean).map((lugar) => lugar.punto);
      encuadrar(mapa, [...extremos, ...(opcion?.tramoBus ?? []), ...(ruta?.recorrido ?? [])]);
    },
  };
}
