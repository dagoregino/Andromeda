// Listas de la interfaz. Todo texto de los datos entra con textContent.
import { formatearDistancia } from './geo.js';
import { paradasEnOrden, lugaresCerca } from './rutas.js';

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
      boton.append(crear('span', 'lugar__nombre', destino.nombre), crear('span', 'lugar__zona', destino.zona));
      return enLista(boton);
    }),
  );
}

export function llenarSelector(selector, destinos) {
  selector.append(
    ...destinos.map((destino) => {
      const opcion = crear('option', '', destino.nombre);
      opcion.value = destino.id;
      return opcion;
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

const lugarDeAcceso = (acceso) => acceso.nombre ?? 'un punto aproximado del recorrido';

/** Avisos comunes sobre lo que no sabemos de una ruta. */
function advertenciasDe(ruta) {
  const textos = [];
  if (ruta.sentidoVerificado === false) textos.push('El sentido de viaje no está confirmado: pregunta antes de subir.');
  textos.push(`Dato de ejemplo con fecha ${ruta.editado}.`);
  return textos.map((texto) => crear('p', 'ruta__nota', texto));
}

function detalleDeRuta({ ruta, subida, bajada, distanciaBus }) {
  const pasos = crear('ol', 'ruta__pasos');
  pasos.append(
    crear('li', '', `Camina ${formatearDistancia(subida.caminata)} y sube en ${lugarDeAcceso(subida)}.`),
    crear('li', '', `Viaja en bus cerca de ${formatearDistancia(distanciaBus)}.`),
    crear('li', '', `Baja en ${lugarDeAcceso(bajada)} y camina ${formatearDistancia(bajada.caminata)}.`),
  );
  const notas = [pasos];
  if (ruta.paradas.length === 0) {
    notas.push(crear('p', 'ruta__nota', 'No tenemos las paradas de esta ruta: confirma dónde se aborda.'));
  }
  return [...notas, ...advertenciasDe(ruta)];
}

function tarjetaDeRuta(ruta, resumen, elegida, alPulsar) {
  const boton = crearBoton('ruta__boton', alPulsar);
  boton.setAttribute('aria-pressed', String(elegida));
  const textos = crear('span', 'ruta__textos');
  textos.append(crear('span', 'ruta__nombre', ruta.nombre), crear('span', 'ruta__resumen', resumen));
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
      const resumen = `${ruta.operador} · ${formatearDistancia(caminataTotal)} a pie · ${formatearDistancia(distanciaBus)} en bus`;
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
  if (cercanos.length) partes.push(crear('p', 'ruta__cerca', `Pasa cerca de: ${cercanos.join(', ')}.`));
  if (paradas.length) {
    const lista = crear('ol', 'ruta__paradas');
    lista.setAttribute('aria-label', `Paradas de la ruta ${ruta.codigo}`);
    lista.append(...paradas.map((parada) => crear('li', '', parada.nombre)));
    partes.push(lista);
  } else {
    partes.push(crear('p', 'ruta__nota', 'No tenemos las paradas de esta ruta. El mapa muestra su recorrido.'));
  }
  return [...partes, ...advertenciasDe(ruta)];
}

export function dibujarCatalogo(lista, rutas, { idElegida, lugares, alElegir }) {
  lista.replaceChildren(
    ...rutas.map((ruta) => {
      const elegida = ruta.id === idElegida;
      const item = tarjetaDeRuta(ruta, `${ruta.operador} · ${ruta.tipo}`, elegida, () => alElegir(ruta.id));
      if (elegida) item.append(...fichaDeRuta(ruta, lugares));
      return item;
    }),
  );
}
