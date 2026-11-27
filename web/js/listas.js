// Listas de la interfaz. Todo texto de los datos entra con textContent.
import { formatearDistancia } from './geo.js';
import { paradasEnOrden, lugaresCerca } from './rutas.js';
import { t } from './idioma.js';

function crear(etiqueta, clase, texto) {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

function crearBoton(clase, alPulsar) {
  const boton = crear('button', clase);
  boton.type = 'button';
  boton.addEventListener('click', alPulsar);
  return boton;
}

function enLista(contenido) {
  const item = crear('li');
  item.append(contenido);
  return item;
}

export function dibujarLugares(lista, destinos, alElegir) {
  lista.replaceChildren(
    ...destinos.map((destino) => {
      const boton = crearBoton('lugar', () => alElegir(destino));
      boton.append(crear('span', 'lugar__nombre', t(destino.nombre ?? '')), crear('span', 'lugar__zona', t(destino.zona ?? '')));
      return enLista(boton);
    }),
  );
}

/** Desplegable de sugerencias de geocodificación. El prefijo hace únicos los ids de cada campo. */
export function dibujarSugerencias(lista, resultados, indiceActivo, alSeleccionar, prefijo = 'sugerencia') {
  lista.replaceChildren(
    ...resultados.map((resultado, indice) => {
      const boton = crearBoton('sugerencia', () => alSeleccionar(resultado));
      boton.id = `${prefijo}-${indice}`;
      boton.setAttribute('role', 'option');
      boton.setAttribute('aria-selected', String(indice === indiceActivo));
      boton.append(
        crear('span', 'sugerencia__nombre', resultado.nombre),
        crear('span', 'sugerencia__zona', resultado.zona),
      );
      const item = document.createElement('li');
      item.setAttribute('role', 'presentation');
      item.append(boton);
      return item;
    }),
  );
}

export function llenarEmpresas(selector, empresas) {
  selector.append(
    ...empresas.map((empresa) => {
      const opcion = crear('option', '', empresa);
      opcion.value = empresa;
      return opcion;
    }),
  );
}

const lugarDeAcceso = (acceso) => acceso.nombre ?? t('un punto aproximado del recorrido');
// «Ruta 4112» pasa a «Route 4112»; los demás nombres son de lugares y no cambian.
const nombreDeRuta = (nombre) => nombre.replace(/^Ruta(?= )/, () => t('Ruta'));

/** Avisos comunes sobre lo que no sabemos de una ruta. */
function advertenciasDe(ruta) {
  const textos = [];
  if (ruta.sentidoVerificado === false) textos.push(t('El sentido de viaje no está confirmado: pregunta antes de subir.'));
  textos.push(t('Dato con fecha {fecha}.', { fecha: ruta.editado }));
  return textos.map((texto) => crear('p', 'ruta__nota', texto));
}

function detalleDeRuta({ ruta, subida, bajada, distanciaBus }) {
  const pasos = crear('ol', 'ruta__pasos');
  pasos.append(
    crear('li', '', t('Camina {distancia} y sube en {lugar}.', { distancia: formatearDistancia(subida.caminata), lugar: lugarDeAcceso(subida) })),
    crear('li', '', t('Viaja en bus cerca de {distancia}.', { distancia: formatearDistancia(distanciaBus) })),
    crear('li', '', t('Baja en {lugar} y camina {distancia}.', { lugar: lugarDeAcceso(bajada), distancia: formatearDistancia(bajada.caminata) })),
  );
  const notas = [pasos];
  if (ruta.paradas.length === 0) {
    notas.push(crear('p', 'ruta__nota', t('No tenemos las paradas de esta ruta: confirma dónde se aborda.')));
  }
  return [...notas, ...advertenciasDe(ruta)];
}

function tarjetaDeRuta(ruta, resumen, elegida, alPulsar) {
  const boton = crearBoton('ruta__boton', alPulsar);
  boton.setAttribute('aria-pressed', String(elegida));
  const textos = crear('span', 'ruta__textos');
  textos.append(crear('span', 'ruta__nombre', nombreDeRuta(ruta.nombre)), crear('span', 'ruta__resumen', resumen));
  boton.append(crear('span', 'ruta__codigo', ruta.codigo), textos);
  const item = enLista(boton);
  item.className = 'ruta';
  item.dataset.ruta = ruta.id;
  return item;
}

export function dibujarRutas(lista, opciones, elegida, alElegir) {
  lista.replaceChildren(
    ...opciones.map((opcion, posicion) => {
      const { ruta, caminataTotal, distanciaBus } = opcion;
      const resumen = t('{operador} · {caminata} a pie · {bus} en bus', {
        operador: ruta.operador, caminata: formatearDistancia(caminataTotal), bus: formatearDistancia(distanciaBus),
      });
      const item = tarjetaDeRuta(ruta, resumen, posicion === elegida, () => alElegir(posicion));
      if (posicion === elegida) item.append(...detalleDeRuta(opcion));
      return item;
    }),
  );
}

function fichaDeRuta(ruta, lugares) {
  const paradas = paradasEnOrden(ruta);
  const cercanos = lugaresCerca(ruta, lugares);
  const partes = [];
  if (cercanos.length) {
    const nombres = cercanos.map((nombre) => t(nombre)).join(', ');
    partes.push(crear('p', 'ruta__cerca', t('Pasa cerca de: {lugares}.', { lugares: nombres })));
  }
  if (paradas.length) {
    const lista = crear('ol', 'ruta__paradas');
    lista.setAttribute('aria-label', t('Paradas de la ruta {codigo}', { codigo: ruta.codigo }));
    lista.append(...paradas.map((parada) => crear('li', '', parada.nombre)));
    partes.push(lista);
  } else {
    partes.push(crear('p', 'ruta__nota', t('No tenemos las paradas de esta ruta. El mapa muestra su recorrido.')));
  }
  return [...partes, ...advertenciasDe(ruta)];
}

export function dibujarCatalogo(lista, rutas, { idElegida, lugares, alElegir }) {
  lista.replaceChildren(
    ...rutas.map((ruta) => {
      const elegida = ruta.id === idElegida;
      const item = tarjetaDeRuta(ruta, `${ruta.operador} · ${t(ruta.tipo)}`, elegida, () => alElegir(ruta.id));
      if (elegida) item.append(...fichaDeRuta(ruta, lugares));
      return item;
    }),
  );
}
