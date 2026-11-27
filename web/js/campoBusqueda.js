// Campo de búsqueda con autocompletado. Sirve igual para el destino y para la salida:
// cada uno tiene su propio bloque de HTML (input, desplegable, recientes y populares).
import { dentroDeZona } from './geo.js';
import { buscarDestinos, coordenadaDe } from './destinos.js';
import { crearBuscador, obtenerRecientes, guardarReciente, moverIndice } from './geocodificacion.js';
import { dibujarLugares, dibujarSugerencias } from './listas.js';
import { t } from './idioma.js';

const MENSAJE_SIN_RESULTADOS = 'No encontramos ese lugar, prueba con otro nombre o toca el mapa.';

// El id permite buscar la accesibilidad; un punto marcado en el mapa no lo tiene.
const lugarDeDestino = (destino) => ({ id: destino.id, nombre: destino.nombre, punto: coordenadaDe(destino) });

/**
 * @param {object} opciones
 * @param {Element} opciones.raiz - Bloque que contiene los elementos [data-entrada], [data-sugerencias], etc.
 * @param {function} opciones.populares - Devuelve la lista de lugares populares.
 * @param {function} opciones.alElegir - Recibe `{ nombre, punto, zona?, id? }`.
 * @param {function} opciones.alFueraDeZona - Se llama si el resultado queda fuera del área metropolitana.
 */
export function crearCampoBusqueda({ raiz, populares, alElegir, alFueraDeZona }) {
  const q = (selector) => raiz.querySelector(selector);
  const entrada = q('[data-entrada]');
  const botonLimpiar = q('[data-limpiar-buscar]');
  const estadoBuscar = q('[data-estado-buscar]');
  const desplegable = q('[data-sugerencias]');
  const bloqueRecientes = q('[data-recientes]');
  const listaRecientes = q('[data-lista-recientes]');
  const bloquePopulares = q('[data-populares]');
  const listaPopulares = q('[data-lugares]');
  const prefijo = `${desplegable.id}-opcion`;

  let sugerencias = [];
  let indice = -1;

  const decir = (texto, esError = false) => {
    estadoBuscar.textContent = texto;
    estadoBuscar.classList.toggle('es-error', esError);
  };

  function pintarSugerencias() {
    const hay = sugerencias.length > 0;
    desplegable.hidden = !hay;
    entrada.setAttribute('aria-expanded', String(hay));
    entrada.setAttribute('aria-activedescendant', hay && indice >= 0 ? `${prefijo}-${indice}` : '');
    dibujarSugerencias(desplegable, sugerencias, indice, seleccionar, prefijo);
    // Con el teclado, la opción activa debe quedar a la vista dentro del desplegable.
    if (indice >= 0) desplegable.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }

  function cerrar() {
    sugerencias = [];
    indice = -1;
    pintarSugerencias();
    decir('');
    buscador.cancelar();
  }

  function seleccionar(resultado) {
    const punto = [resultado.lat, resultado.lng];
    if (!dentroDeZona(punto)) {
      alFueraDeZona();
      return;
    }
    guardarReciente(resultado);
    cerrar();
    entrada.value = resultado.nombre;
    botonLimpiar.hidden = false;
    alElegir({ nombre: resultado.nombre, punto, zona: resultado.zona });
  }

  const elegirPopular = (destino) => alElegir(lugarDeDestino(destino));

  const buscador = crearBuscador({
    alResultado(resultados) {
      sugerencias = resultados;
      indice = -1;
      pintarSugerencias();
      decir(resultados.length === 0 && entrada.value.trim().length >= 3 ? t(MENSAJE_SIN_RESULTADOS) : '');
    },
    alBuscar: () => decir(t('Buscando…')),
    alError(mensaje) {
      sugerencias = [];
      indice = -1;
      pintarSugerencias();
      decir(t(mensaje), true);
    },
  });

  function pintarRecientes() {
    const recientes = obtenerRecientes();
    bloqueRecientes.hidden = recientes.length === 0 || entrada.value.trim() !== '';
    if (recientes.length === 0) return;
    dibujarLugares(listaRecientes, recientes, (r) => alElegir({ nombre: r.nombre, punto: [r.lat, r.lng], zona: r.zona }));
  }

  /** Recientes y populares cuando el campo está vacío; con texto, solo los populares que coinciden. */
  function pintarListas() {
    const texto = entrada.value.trim();
    botonLimpiar.hidden = entrada.value.length === 0;
    if (texto === '') {
      bloquePopulares.hidden = false;
      dibujarLugares(listaPopulares, populares(), elegirPopular);
      pintarRecientes();
      return;
    }
    bloqueRecientes.hidden = true;
    const encontrados = buscarDestinos(populares(), texto);
    bloquePopulares.hidden = encontrados.length === 0;
    if (encontrados.length > 0) dibujarLugares(listaPopulares, encontrados, elegirPopular);
  }

  function alEscribir() {
    pintarListas();
    if (entrada.value.trim() === '') cerrar();
    else buscador.buscar(entrada.value);
  }

  function alPulsarTecla(evento) {
    if (evento.key === 'Escape' && sugerencias.length > 0) {
      evento.preventDefault();
      cerrar();
      return;
    }
    if (sugerencias.length === 0) return;
    if (evento.key === 'ArrowDown' || evento.key === 'ArrowUp') {
      evento.preventDefault();
      indice = moverIndice(indice, sugerencias.length, evento.key === 'ArrowDown' ? 1 : -1);
      pintarSugerencias();
    } else if (evento.key === 'Enter' && indice >= 0) {
      evento.preventDefault();
      seleccionar(sugerencias[indice]);
    }
  }

  function limpiar({ enfocar = true } = {}) {
    entrada.value = '';
    cerrar();
    pintarListas();
    if (enfocar) entrada.focus();
  }

  entrada.addEventListener('input', alEscribir);
  entrada.addEventListener('keydown', alPulsarTecla);
  entrada.addEventListener('focus', () => { if (entrada.value.trim() === '') pintarListas(); });
  botonLimpiar.addEventListener('click', () => limpiar());

  return {
    habilitar() { entrada.disabled = false; pintarListas(); },
    limpiar,
    enfocar: () => entrada.focus(),
    /** Pone un texto sin buscar (por ejemplo, el nombre de un punto marcado en el mapa). */
    poner(texto) { entrada.value = texto; botonLimpiar.hidden = texto === ''; },
  };
}
