// Interfaz: escucha al usuario, guarda el viaje y lo pinta. La lógica vive en geo, destinos y rutas.
import { distanciaMetros, dentroDeZona, formatearDistancia } from './geo.js';
import { validarDestinos, coordenadaDe } from './destinos.js';
import { validarRutas, buscarRutas, filtrarCatalogo } from './rutas.js';
import { crearMapa } from './mapa.js';
import { llenarEmpresas, dibujarRutas, dibujarCatalogo } from './listas.js';
import { validarAccesibilidad, buscarAccesibilidad } from './accesibilidad.js';
import { crearVistaAccesibilidad } from './accesibilidadVista.js';
import { urlClima, validarClima, resumenClima } from './clima.js';
import { crearVistaClima } from './climaVista.js';
import { buscarDireccion } from './geocodificacion.js';
import { crearCampoBusqueda } from './campoBusqueda.js';

const ESPERA_UBICACION_MS = 10000;
const ESPERA_CLIMA_MS = 8000;
// Pasado este tiempo el pronóstico se considera viejo: se oculta y se vuelve a pedir.
const VIGENCIA_CLIMA_MS = 60 * 60 * 1000;
const NOMBRE_PUNTO_MARCADO = 'Punto marcado en el mapa';
const MENSAJE_FUERA = 'Ese punto está fuera de la zona de Barranquilla. Elige otro.';
const PERMISO_DENEGADO = 1;
const OPCIONES_INICIALES = 8;
// Lo que vuelve a empezar cuando cambia el destino o la salida.
const RESULTADOS_NUEVOS = Object.freeze({ rutasVisibles: false, elegida: 0, todasLasOpciones: false });
const TITULOS = Object.freeze({ viaje: '¿A dónde vas?', rutas: 'Rutas de bus' });

const $ = (selector) => document.querySelector(selector);
// El id permite buscar la accesibilidad; un punto marcado en el mapa no lo tiene.
const lugarDe = (destino) => ({ id: destino.id, nombre: destino.nombre, punto: coordenadaDe(destino) });

let estado = Object.freeze({
  modo: 'viaje', rutaVista: null, origen: null, destino: null, ...RESULTADOS_NUEVOS, mensaje: '', esError: false,
});
let datos = { destinos: [], rutas: [] };
let vista = null;
let accesibilidad = null;
let clima = null;
let cargandoClima = false;
let solicitudUbicacion = 0;
const vistaAccesibilidad = crearVistaAccesibilidad($('[data-acceso]'));
const vistaClima = crearVistaClima($('[data-clima]'));

// Dos campos con el mismo buscador: el destino y la salida.
const campoDestino = crearCampoBusqueda({
  raiz: $('[data-buscador]'),
  populares: () => datos.destinos,
  alElegir: (lugar) => elegirDestino(lugar),
  alFueraDeZona: () => avisar(MENSAJE_FUERA, true),
});
const campoOrigen = crearCampoBusqueda({
  raiz: $('[data-buscador-origen]'),
  populares: () => datos.destinos,
  alElegir: (lugar) => elegirOrigen(lugar),
  alFueraDeZona: () => avisar(MENSAJE_FUERA, true),
});

function cambiar(parcial) {
  estado = Object.freeze({ ...estado, mensaje: '', esError: false, ...parcial });
  pintar();
}

const avisar = (mensaje, esError = false) => cambiar({ mensaje, esError });

const opcionesActuales = () =>
  estado.origen && estado.destino ? buscarRutas(datos.rutas, estado.origen.punto, estado.destino.punto) : [];

function pintarPasos() {
  const { origen, destino } = estado;
  $('[data-buscador]').hidden = Boolean(destino);
  $('[data-destino]').hidden = !destino;
  $('[data-origen-pedir]').hidden = !destino || Boolean(origen);
  $('[data-origen]').hidden = !origen;
  $('[data-viaje]').hidden = !(origen && destino);
  $('[data-destino-nombre]').textContent = destino?.nombre ?? '';
  $('[data-origen-nombre]').textContent = origen?.nombre ?? '';
}

function pintarViaje(opciones) {
  const { origen, destino, rutasVisibles, elegida } = estado;
  if (!origen || !destino) return;
  $('[data-distancia]').textContent = formatearDistancia(distanciaMetros(origen.punto, destino.punto));
  const boton = $('[data-ver-rutas]');
  boton.textContent = rutasVisibles ? 'Ocultar rutas de bus' : 'Ver rutas de bus';
  boton.setAttribute('aria-expanded', String(rutasVisibles));
  $('#rutas').hidden = !rutasVisibles;
  $('[data-sin-rutas]').hidden = opciones.length > 0;
  $('[data-nota-caminata]').hidden = opciones.length === 0;
  pintarCuantas(opciones.length);
  const visibles = estado.todasLasOpciones ? opciones : opciones.slice(0, OPCIONES_INICIALES);
  dibujarRutas($('[data-rutas]'), visibles, elegida, (posicion) => {
    cambiar({ elegida: posicion });
    $('[data-rutas] [aria-pressed="true"]')?.focus();
  });
}

function pintarAccesibilidad() {
  vistaAccesibilidad.pintar(buscarAccesibilidad(accesibilidad, estado.destino));
}

function pintarClima() {
  const vigente = clima && Date.now() - clima.consultadoEn < VIGENCIA_CLIMA_MS ? clima : null;
  vistaClima.pintar(vigente);
  if (clima && !vigente) cargarClima();
}

function pintarCuantas(total) {
  const hayMas = total > OPCIONES_INICIALES;
  const resumen = $('[data-cuantas]');
  resumen.hidden = total === 0;
  resumen.textContent = hayMas && !estado.todasLasOpciones
    ? `Las ${OPCIONES_INICIALES} más convenientes de ${total} rutas.`
    : `${total} ${total === 1 ? 'ruta te sirve' : 'rutas te sirven'}.`;
  const boton = $('[data-mas-rutas]');
  boton.hidden = !hayMas;
  boton.textContent = estado.todasLasOpciones ? 'Ver menos' : `Ver las ${total}`;
}

function pintar() {
  const opciones = opcionesActuales();
  const texto = $('[data-estado]');
  texto.textContent = estado.mensaje;
  texto.classList.toggle('es-error', estado.esError);
  pintarModo();
  pintarPasos();
  pintarViaje(opciones);
  pintarClima();
  pintarAccesibilidad();
  pintarCatalogo();
  vista?.pintar(contenidoDelMapa(opciones));
}

function contenidoDelMapa(opciones) {
  if (estado.modo === 'rutas') return { ruta: datos.rutas.find((ruta) => ruta.id === estado.rutaVista) ?? null };
  return {
    origen: estado.origen,
    destino: estado.destino,
    opcion: estado.rutasVisibles ? opciones[estado.elegida] ?? null : null,
  };
}

function pintarModo() {
  $('#titulo').textContent = TITULOS[estado.modo];
  document.querySelectorAll('[data-modo]').forEach((boton) => {
    boton.setAttribute('aria-pressed', String(boton.dataset.modo === estado.modo));
  });
  document.querySelectorAll('[data-vista]').forEach((seccion) => {
    seccion.hidden = seccion.dataset.vista !== estado.modo;
  });
}

function pintarCatalogo() {
  if (estado.modo !== 'rutas') return;
  const empresa = $('#empresa').value;
  const deLaEmpresa = datos.rutas.filter((ruta) => !empresa || ruta.operador === empresa);
  const encontradas = filtrarCatalogo(deLaEmpresa, $('#buscar-ruta').value);
  $('[data-total-rutas]').textContent = encontradas.length
    ? `${encontradas.length} de ${datos.rutas.length} recorridos. Toca uno para verlo en el mapa.`
    : 'Ninguna ruta coincide con la búsqueda.';
  dibujarCatalogo($('[data-catalogo]'), encontradas, {
    idElegida: estado.rutaVista, lugares: datos.destinos, alElegir: verRuta,
  });
}

function verRuta(id) {
  cambiar({ rutaVista: estado.rutaVista === id ? null : id });
  $(`[data-catalogo] [data-ruta="${CSS.escape(id)}"] button`)?.focus();
}

function elegirDestino(lugar) {
  cambiar({ destino: lugar, ...RESULTADOS_NUEVOS });
  (estado.origen ? $('[data-ver-rutas]') : $('#titulo-origen')).focus();
}

function elegirOrigen(lugar) {
  solicitudUbicacion += 1;
  $('[data-ubicacion]').disabled = false;
  cambiar({ origen: lugar, ...RESULTADOS_NUEVOS });
  if (estado.destino) $('[data-ver-rutas]').focus();
}

// Un punto marcado nace con nombre genérico; el nombre real llega después, si hay conexión.
function nombrarPunto(clave, punto, campo) {
  buscarDireccion(punto[0], punto[1]).then((info) => {
    // Si el usuario ya cambió ese punto, la respuesta tardía no debe pisarlo.
    if (estado[clave]?.punto !== punto) return;
    const nombre = info.nombre || NOMBRE_PUNTO_MARCADO;
    estado = Object.freeze({ ...estado, [clave]: { ...estado[clave], nombre, zona: info.zona || '' } });
    campo.poner(nombre);
    pintar();
  }).catch(() => { /* sin conexión: el punto se queda con el nombre genérico */ });
}

function tocarMapa(punto) {
  if (estado.modo === 'rutas') {
    avisar('Para marcar un punto, pasa a "Cómo llegar".');
    return;
  }
  if (estado.destino && estado.origen) {
    avisar('Para marcar otro punto, pulsa antes "Cambiar destino" o "Cambiar salida".');
    return;
  }
  if (!dentroDeZona(punto)) {
    avisar(MENSAJE_FUERA, true);
    return;
  }
  const lugar = { nombre: NOMBRE_PUNTO_MARCADO, punto };
  if (estado.destino) {
    elegirOrigen(lugar);
    nombrarPunto('origen', punto, campoOrigen);
  } else {
    elegirDestino(lugar);
    nombrarPunto('destino', punto, campoDestino);
  }
}

function recibirUbicacion({ coords }) {
  const punto = [coords.latitude, coords.longitude];
  if (!dentroDeZona(punto)) {
    $('[data-ubicacion]').disabled = false;
    avisar('Tu ubicación está fuera de la zona de Barranquilla. Elige un lugar o toca el mapa.', true);
    return;
  }
  elegirOrigen({ nombre: 'Mi ubicación', punto });
}

function fallarUbicacion({ code }) {
  $('[data-ubicacion]').disabled = false;
  const motivo = code === PERMISO_DENEGADO ? 'No diste permiso para usar tu ubicación.' : 'No pudimos obtener tu ubicación.';
  avisar(`${motivo} Elige un lugar o toca el mapa.`, true);
}

function pedirUbicacion() {
  if (!navigator.geolocation) {
    avisar('Este navegador no permite usar la ubicación. Elige un lugar o toca el mapa.', true);
    return;
  }
  solicitudUbicacion += 1;
  const solicitud = solicitudUbicacion;
  // Una respuesta tardía no debe pisar lo que el usuario eligió mientras esperaba.
  const siSigueVigente = (accion) => (respuesta) => { if (solicitud === solicitudUbicacion) accion(respuesta); };
  $('[data-ubicacion]').disabled = true;
  avisar('Buscando tu ubicación…');
  navigator.geolocation.getCurrentPosition(siSigueVigente(recibirUbicacion), siSigueVigente(fallarUbicacion), {
    timeout: ESPERA_UBICACION_MS,
  });
}

function escuchar() {
  document.querySelectorAll('[data-modo]').forEach((boton) => {
    boton.addEventListener('click', () => cambiar({ modo: boton.dataset.modo }));
  });
  $('#buscar-ruta').addEventListener('input', pintarCatalogo);
  $('#empresa').addEventListener('change', pintarCatalogo);
  $('[data-mas-rutas]').addEventListener('click', () => cambiar({ todasLasOpciones: !estado.todasLasOpciones, elegida: 0 }));
  $('[data-ubicacion]').addEventListener('click', pedirUbicacion);
  $('[data-ver-rutas]').addEventListener('click', () => cambiar({ rutasVisibles: !estado.rutasVisibles }));
  $('[data-cambiar-destino]').addEventListener('click', () => {
    cambiar({ destino: null, ...RESULTADOS_NUEVOS });
    campoDestino.limpiar();
  });
  $('[data-cambiar-origen]').addEventListener('click', () => {
    cambiar({ origen: null, ...RESULTADOS_NUEVOS });
    campoOrigen.limpiar({ enfocar: Boolean(estado.destino) });
  });
}

async function cargarJson(ruta) {
  const respuesta = await fetch(ruta);
  if (!respuesta.ok) throw new Error(`No se pudo leer ${ruta} (${respuesta.status}).`);
  return respuesta.json();
}

async function cargarDatos() {
  const [destinos, transmetro, tradicionales] = await Promise.all(
    ['../data/destinos.json', '../data/rutas.json', '../data/rutas-amb.json'].map(cargarJson),
  );
  const errores = [...validarDestinos(destinos), ...validarRutas(transmetro), ...validarRutas(tradicionales)];
  if (errores.length) throw new Error(errores[0]);
  $('[data-consultado-osm]').textContent = transmetro.fuente.consultado;
  $('[data-consultado-amb]').textContent = tradicionales.fuente.consultado;
  return { destinos: destinos.destinos, rutas: [...transmetro.rutas, ...tradicionales.rutas] };
}

// Es un complemento: si falla, el viaje sigue igual y no se afirma nada sobre accesibilidad.
async function cargarAccesibilidad() {
  try {
    const leido = await cargarJson('../data/accesibilidad.json');
    const errores = validarAccesibilidad(leido, datos.destinos);
    if (errores.length) throw new Error(errores.join(' '));
    accesibilidad = leido;
    pintarAccesibilidad();
  } catch (error) {
    console.warn('No se muestra la accesibilidad.', error);
  }
}

// Es un complemento: si falla o tarda, el viaje sigue igual y no se muestra nada del clima.
async function cargarClima() {
  if (cargandoClima) return;
  cargandoClima = true;
  const control = new AbortController();
  const plazo = setTimeout(() => control.abort(), ESPERA_CLIMA_MS);
  try {
    const respuesta = await fetch(urlClima(), { signal: control.signal });
    if (!respuesta.ok) throw new Error(`No se pudo leer el clima (${respuesta.status}).`);
    const leido = await respuesta.json();
    const errores = validarClima(leido);
    if (errores.length) throw new Error(errores.join(' '));
    clima = resumenClima(leido);
  } catch (error) {
    clima = null;
    console.warn('No se muestra el clima.', error);
  } finally {
    clearTimeout(plazo);
    cargandoClima = false;
  }
  pintarClima();
}

async function arrancar() {
  try {
    datos = await cargarDatos();
  } catch (error) {
    const detalle = error instanceof Error ? error.message : 'Error desconocido.';
    $('[data-buscador]').hidden = true;
    $('[data-origen-pedir]').hidden = true;
    $('.pestanas').hidden = true;
    const texto = $('[data-estado]');
    texto.textContent = `No se pudieron cargar los lugares y las rutas. ${detalle} Si abriste el archivo directamente, usa un servidor local.`;
    texto.classList.add('es-error');
    return;
  }
  vista = crearMapa('mapa', { alTocar: tocarMapa, alFallar: () => { $('[data-error-mapa]').hidden = false; } });
  llenarEmpresas($('#empresa'), [...new Set(datos.rutas.map((ruta) => ruta.operador))].sort((a, b) => a.localeCompare(b, 'es')));
  escuchar();
  campoDestino.habilitar();
  campoOrigen.habilitar();
  pintar();
  // Un enlace como mapa/?destino=malecon llega con el destino ya elegido.
  const destinoDelEnlace = datos.destinos.find((destino) => destino.id === new URLSearchParams(location.search).get('destino'));
  if (destinoDelEnlace) cambiar({ destino: lugarDe(destinoDelEnlace), ...RESULTADOS_NUEVOS });
  cargarAccesibilidad();
  cargarClima();
}

arrancar();
