// Interfaz del simulador. La lógica pura vive en escenarios.js; aquí solo se dibuja y se escucha.
import {
  validarDatos,
  pasoActual,
  pasosHasta,
  componentesActivos,
  duracionTotal,
  siguienteIndice,
  anteriorIndice,
  formatearMinuto,
} from './escenarios.js';

const CENTRO_MAPA = [10.963, -74.799];
const ZOOM_INICIAL = 12;
const PAUSA_REPRODUCCION_MS = 2800;
const TEXTO_SIN_COMPONENTES = 'Ninguno';
const MAX_TESELAS_FALLIDAS = 4;

const $ = (selector) => document.querySelector(selector);

function crear(etiqueta, clase, texto) {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

async function cargarJson(ruta) {
  const respuesta = await fetch(ruta);
  if (!respuesta.ok) throw new Error(`No se pudo leer ${ruta} (${respuesta.status}).`);
  return respuesta.json();
}

function mostrarError(mensaje) {
  const estado = $('[data-estado]');
  estado.textContent = mensaje;
  estado.classList.add('is-error');
  document.querySelectorAll('.sim-controls button').forEach((boton) => { boton.disabled = true; });
}

function crearMapa(puntos, alSeleccionar) {
  if (typeof window.L === 'undefined') {
    $('[data-error-mapa]').hidden = false;
    return null;
  }
  const mapa = window.L.map('mapa', { scrollWheelZoom: false, zoomControl: true }).setView(CENTRO_MAPA, ZOOM_INICIAL);
  const capa = window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  });
  let teselasFallidas = 0;
  let teselasCargadas = 0;
  capa.on('tileload', () => { teselasCargadas += 1; });
  capa.on('tileerror', () => {
    teselasFallidas += 1;
    if (teselasCargadas === 0 && teselasFallidas >= MAX_TESELAS_FALLIDAS) $('[data-error-mapa]').hidden = false;
  });
  capa.addTo(mapa);
  const marcadores = new Map(
    puntos.map((punto, posicion) => {
      const icono = window.L.divIcon({ className: 'pin', html: `<span>${posicion + 1}</span>`, iconSize: [36, 36] });
      const marcador = window.L.marker([punto.lat, punto.lng], { icon: icono, title: punto.nombre, alt: punto.nombre, keyboard: true })
        .addTo(mapa)
        .bindTooltip(punto.nombre, { direction: 'top', offset: [0, -16] });
      marcador.on('click', () => alSeleccionar(punto.id));
      return [punto.id, marcador];
    }),
  );
  return { mapa, marcadores };
}

function resaltarPunto(vista, idPunto, centrar) {
  if (!vista) return;
  vista.marcadores.forEach((marcador, id) => {
    marcador.getElement()?.classList.toggle('is-active', id === idPunto);
  });
  const activo = vista.marcadores.get(idPunto);
  if (activo && centrar) vista.mapa.panTo(activo.getLatLng(), { animate: true });
}

function dibujarPuntos(puntos, alSeleccionar) {
  const lista = $('[data-puntos]');
  lista.replaceChildren(
    ...puntos.map((punto, posicion) => {
      const item = crear('li', 'sim-point');
      const boton = crear('button', 'sim-point__btn');
      boton.type = 'button';
      boton.dataset.punto = punto.id;
      boton.append(
        crear('span', 'sim-point__num', String(posicion + 1)),
        crear('span', 'sim-point__name', punto.nombre),
        crear('span', 'sim-point__why', punto.motivo),
        crear('span', 'sim-point__comp', `Componentes: ${punto.componentes.join(', ')}`),
      );
      boton.addEventListener('click', () => alSeleccionar(punto.id));
      item.append(boton);
      return item;
    }),
  );
}

function dibujarEscenarios(escenarios, alElegir) {
  const contenedor = $('[data-escenarios]');
  contenedor.replaceChildren(
    ...escenarios.map((escenario) => {
      const boton = crear('button', 'sim-scenario', escenario.nombre);
      boton.type = 'button';
      boton.dataset.escenario = escenario.id;
      boton.setAttribute('aria-pressed', 'false');
      boton.addEventListener('click', () => alElegir(escenario.id));
      return boton;
    }),
  );
}

function dibujarPasos(escenario, indice, datos, nombresPuntos) {
  const lista = $('[data-pasos]');
  lista.replaceChildren(
    ...escenario.pasos.map((paso, posicion) => {
      const estado = posicion < indice ? 'is-done' : posicion === indice ? 'is-current' : 'is-next';
      const item = crear('li', `sim-step ${estado}`);
      if (posicion === indice) item.setAttribute('aria-current', 'step');
      const cabeza = crear('div', 'sim-step__head');
      cabeza.append(
        crear('span', 'sim-step__comp', paso.componente),
        crear('span', 'sim-step__time', formatearMinuto(paso.minuto)),
        crear('span', 'sim-step__place', nombresPuntos.get(paso.punto)),
      );
      item.append(
        cabeza,
        crear('p', 'sim-step__action', paso.accion),
        crear('p', 'sim-step__who', `${datos.componentes[paso.componente]} · ${paso.quien}`),
      );
      return item;
    }),
  );
}

function iniciar(puntos, datos) {
  const nombresPuntos = new Map(puntos.map((punto) => [punto.id, punto.nombre]));
  const estado = { escenario: datos.escenarios[0], indice: -1, temporizador: null };
  const estadoTexto = $('[data-estado]');
  const botonReproducir = $('[data-reproducir]');

  const seleccionarPunto = (id) => {
    resaltarPunto(vista, id, true);
    document.querySelectorAll('[data-punto]').forEach((boton) => {
      boton.setAttribute('aria-pressed', String(boton.dataset.punto === id));
    });
  };

  const vista = crearMapa(puntos, seleccionarPunto);

  const detener = () => {
    clearInterval(estado.temporizador);
    estado.temporizador = null;
    botonReproducir.setAttribute('aria-pressed', 'false');
    botonReproducir.textContent = 'Reproducir';
  };

  const pintar = () => {
    const { escenario, indice } = estado;
    $('[data-resumen]').textContent = escenario.resumen;
    dibujarPasos(escenario, indice, datos, nombresPuntos);
    document.querySelectorAll('[data-escenario]').forEach((boton) => {
      boton.setAttribute('aria-pressed', String(boton.dataset.escenario === escenario.id));
    });
    const activos = componentesActivos(escenario, indice);
    $('[data-activos]').textContent = activos.length ? activos.join(', ') : TEXTO_SIN_COMPONENTES;
    $('[data-duracion]').textContent = formatearMinuto(duracionTotal(escenario));
    $('[data-anterior]').disabled = indice < 0;
    $('[data-siguiente]').disabled = indice >= escenario.pasos.length - 1;
    const paso = pasoActual(escenario, indice);
    if (paso) {
      seleccionarPunto(paso.punto);
      estadoTexto.textContent = `Paso ${indice + 1} de ${escenario.pasos.length}: ${paso.accion}`;
    } else {
      resaltarPunto(vista, null, false);
      estadoTexto.textContent = `${escenario.nombre}: ${escenario.pasos.length} pasos. Pulse Siguiente paso para empezar.`;
    }
    const completados = pasosHasta(escenario, indice).length;
    if (completados === escenario.pasos.length) detener();
  };

  const elegir = (id) => {
    detener();
    estado.escenario = datos.escenarios.find((escenario) => escenario.id === id) ?? datos.escenarios[0];
    estado.indice = -1;
    pintar();
  };

  const avanzar = () => {
    estado.indice = siguienteIndice(estado.escenario, estado.indice);
    pintar();
  };

  $('[data-siguiente]').addEventListener('click', () => { detener(); avanzar(); });
  $('[data-anterior]').addEventListener('click', () => {
    detener();
    estado.indice = anteriorIndice(estado.escenario, estado.indice);
    pintar();
  });
  botonReproducir.addEventListener('click', () => {
    if (estado.temporizador) { detener(); return; }
    if (estado.indice >= estado.escenario.pasos.length - 1) estado.indice = -1;
    botonReproducir.setAttribute('aria-pressed', 'true');
    botonReproducir.textContent = 'Pausar';
    avanzar();
    estado.temporizador = setInterval(avanzar, PAUSA_REPRODUCCION_MS);
  });

  dibujarPuntos(puntos, seleccionarPunto);
  dibujarEscenarios(datos.escenarios, elegir);
  pintar();
}

async function arrancar() {
  try {
    const [puntosJson, datos] = await Promise.all([cargarJson('data/puntos.json'), cargarJson('data/escenarios.json')]);
    const errores = validarDatos(puntosJson.puntos, datos);
    if (errores.length) {
      mostrarError(`Los datos del simulador tienen errores: ${errores[0]}`);
      return;
    }
    iniciar(puntosJson.puntos, datos);
  } catch (error) {
    const detalle = error instanceof Error ? error.message : 'Error desconocido.';
    mostrarError(`No se pudo abrir el simulador. ${detalle} Si abrió el archivo directamente, use un servidor local.`);
  }
}

arrancar();
