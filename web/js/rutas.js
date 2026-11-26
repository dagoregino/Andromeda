// Qué rutas de bus sirven para ir de un punto a otro, sin transbordos. Sin DOM.
import { esCoordenada, distanciaMetros, proyectarEnTramo, avancesDe, tramoEntre } from './geo.js';
import { normalizar } from './destinos.js';

export const CAMINATA_MAXIMA_M = 800;
const VIAJE_MINIMO_M = 300;
// Un metro en bus "cuesta" la décima parte de uno a pie: evita vueltas largas por ahorrar pocos pasos.
const PESO_DEL_BUS = 0.1;
// Un viaje en bus mucho más largo que el trayecto no sirve: se admite hasta 4 veces la línea recta más 3 km.
const RODEO_MAXIMO = 4;
const RODEO_BASE_M = 3000;
const CERCA_DEL_RECORRIDO_M = 500;

const esTexto = (valor) => typeof valor === 'string' && valor.trim() !== '';

function erroresDeRuta(ruta, posicion, rutas) {
  const donde = `Ruta ${posicion + 1}`;
  if (!ruta || typeof ruta !== 'object') return [`${donde}: no tiene el formato esperado.`];
  const errores = [];
  if (!esTexto(ruta.id)) errores.push(`${donde}: falta el identificador.`);
  else if (rutas.findIndex((otra) => otra?.id === ruta.id) !== posicion) {
    errores.push(`${donde}: el identificador "${ruta.id}" está repetido.`);
  }
  if (!esTexto(ruta.codigo)) errores.push(`${donde}: falta el código.`);
  if (!esTexto(ruta.nombre) || !esTexto(ruta.operador)) errores.push(`${donde}: falta el nombre o el operador.`);
  if (!esTexto(ruta.editado)) errores.push(`${donde}: falta la fecha del dato.`);
  if (!Array.isArray(ruta.recorrido) || ruta.recorrido.length < 2 || !ruta.recorrido.every(esCoordenada)) {
    errores.push(`${donde}: el recorrido necesita al menos dos coordenadas válidas.`);
  }
  const paradaValida = (parada) => esTexto(parada?.nombre) && esCoordenada([parada.lat, parada.lng]);
  if (!Array.isArray(ruta.paradas) || !ruta.paradas.every(paradaValida)) {
    errores.push(`${donde}: hay una parada sin nombre o sin coordenadas.`);
  }
  return errores;
}

/** Devuelve una lista de errores legibles; vacía si los datos sirven. */
export function validarRutas(datos) {
  if (!esTexto(datos?.fuente?.nombre) || !esTexto(datos.fuente.licencia) || !Array.isArray(datos.rutas)) {
    return ['Los datos de rutas no tienen el formato esperado.'];
  }
  if (datos.rutas.length === 0) return ['No hay ninguna ruta.'];
  return datos.rutas.flatMap(erroresDeRuta);
}

function posicionesSobre(recorrido, avances, punto) {
  return recorrido.slice(1).map((fin, indice) => {
    const proyeccion = proyectarEnTramo(punto, recorrido[indice], fin);
    const avance = avances[indice] + proyeccion.fraccion * (avances[indice + 1] - avances[indice]);
    return { indice, avance, punto: proyeccion.punto, distancia: proyeccion.distancia };
  });
}

const masCercana = (posiciones) =>
  posiciones.reduce((mejor, posicion) => (posicion.distancia < mejor.distancia ? posicion : mejor));

/** Lugares donde se podría subir o bajar caminando: las paradas si se conocen, si no el recorrido. */
function accesos(ruta, avances, punto, caminataMaxima) {
  if (ruta.paradas.length === 0) {
    return posicionesSobre(ruta.recorrido, avances, punto)
      .filter((posicion) => posicion.distancia <= caminataMaxima)
      .map(({ distancia, ...posicion }) => ({ ...posicion, nombre: null, caminata: distancia }));
  }
  return ruta.paradas.flatMap((parada) => {
    const ubicacion = [parada.lat, parada.lng];
    const caminata = distanciaMetros(punto, ubicacion);
    if (caminata > caminataMaxima) return [];
    const { indice, avance } = masCercana(posicionesSobre(ruta.recorrido, avances, ubicacion));
    return [{ indice, avance, punto: ubicacion, nombre: parada.nombre, caminata }];
  });
}

const costoDe = (caminata, distanciaBus) => caminata + distanciaBus * PESO_DEL_BUS;

function mejorViaje(ruta, largo, subidas, bajadas, viajeMaximo) {
  let mejor = null;
  for (const subida of subidas) {
    for (const bajada of bajadas) {
      const directo = bajada.avance - subida.avance;
      const daLaVuelta = directo < 0 && ruta.circular;
      const distanciaBus = daLaVuelta ? directo + largo : directo;
      if (distanciaBus < VIAJE_MINIMO_M || distanciaBus > viajeMaximo) continue;
      const costo = costoDe(subida.caminata + bajada.caminata, distanciaBus);
      if (!mejor || costo < mejor.costo) mejor = { subida, bajada, distanciaBus, daLaVuelta, costo };
    }
  }
  return mejor;
}

function opcionDeRuta(ruta, origen, destino, caminataMaxima) {
  const directa = distanciaMetros(origen, destino);
  const avances = avancesDe(ruta.recorrido);
  const subidas = accesos(ruta, avances, origen, caminataMaxima);
  if (subidas.length === 0) return null;
  const bajadas = accesos(ruta, avances, destino, caminataMaxima);
  const viaje = mejorViaje(ruta, avances.at(-1), subidas, bajadas, directa * RODEO_MAXIMO + RODEO_BASE_M);
  if (!viaje) return null;
  const { subida, bajada, distanciaBus, daLaVuelta, costo } = viaje;
  const caminataTotal = subida.caminata + bajada.caminata;
  if (caminataTotal >= directa) return null;
  const tramoBus = tramoEntre(ruta.recorrido, subida, bajada, { daLaVuelta });
  return { ruta, subida, bajada, distanciaBus, caminataTotal, costo, tramoBus };
}

/** Opciones de la más conveniente (poca caminata y viaje corto) a la menos; vacía si ninguna sirve. */
export function buscarRutas(rutas, origen, destino, { caminataMaxima = CAMINATA_MAXIMA_M } = {}) {
  if (!esCoordenada(origen) || !esCoordenada(destino)) return [];
  return rutas
    .map((ruta) => opcionDeRuta(ruta, origen, destino, caminataMaxima))
    .filter(Boolean)
    .sort((a, b) => a.costo - b.costo);
}

/** Nombres de los lugares conocidos junto al recorrido, en el orden en que la ruta pasa por ellos. */
export function lugaresCerca(ruta, lugares) {
  const avances = avancesDe(ruta.recorrido);
  return lugares
    .map((lugar) => ({ lugar, paso: masCercana(posicionesSobre(ruta.recorrido, avances, [lugar.lat, lugar.lng])) }))
    .filter(({ paso }) => paso.distancia <= CERCA_DEL_RECORRIDO_M)
    .sort((a, b) => a.paso.avance - b.paso.avance)
    .map(({ lugar }) => lugar.nombre);
}

/** Las rutas que coinciden con el texto, ordenadas por código (C2 antes que C10). */
export function filtrarCatalogo(rutas, texto) {
  const palabras = normalizar(texto).split(' ').filter(Boolean);
  return rutas
    .filter((ruta) => {
      const contenido = normalizar(`${ruta.codigo} ${ruta.operador} ${ruta.nombre} ${ruta.tipo ?? ''}`);
      return palabras.every((palabra) => contenido.includes(palabra));
    })
    .sort((a, b) => a.codigo.localeCompare(b.codigo, 'es', { numeric: true }) || a.nombre.localeCompare(b.nombre, 'es'));
}

export function paradasEnOrden(ruta) {
  const avances = avancesDe(ruta.recorrido);
  const avanceDe = ({ lat, lng }) => masCercana(posicionesSobre(ruta.recorrido, avances, [lat, lng])).avance;
  return ruta.paradas
    .map((parada) => ({ parada, avance: avanceDe(parada) }))
    .sort((a, b) => a.avance - b.avance)
    .map(({ parada }) => parada);
}
