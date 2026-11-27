// Bloque de accesibilidad del destino: una línea, y el detalle solo si se pide. Todo texto entra con textContent.
// Pendiente (fase posterior): filtro «¿Qué necesitas?».
import {
  veredicto, etiquetaVeredicto, etiquetaCriterio, criteriosVisibles, criteriosPorBloque, formatearFecha,
} from './accesibilidad.js';
import { t } from './idioma.js';

const TEXTOS = Object.freeze({
  detalle: Object.freeze({ abrir: 'Ver detalle', cerrar: 'Ocultar detalle' }),
  todos: Object.freeze({ abrir: 'Ver todos los criterios', cerrar: 'Ocultar criterios' }),
});

function crear(etiqueta, clase, texto) {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

function filaDe({ nombre, estado, nota }) {
  const fila = crear('li', 'acceso__fila');
  fila.dataset.estado = estado;
  const titular = crear('p');
  titular.append(`${t(nombre)}: `, crear('strong', '', t(etiquetaCriterio(estado))));
  fila.append(titular, crear('p', 'ayuda', t(nota)));
  return fila;
}

function grupoDe({ nombre, criterios, medidas }) {
  const lista = crear('ul');
  lista.append(
    ...criterios.map((c) => crear('li', '', `${t(c.nombre)}: ${t(etiquetaCriterio(c.estado))}`)),
    ...medidas.map((m) => crear('li', '', `${t(m.nombre)}: ${t(m.texto)}`)),
  );
  const grupo = crear('div', 'acceso__grupo');
  grupo.append(crear('h3', '', t(nombre)), lista);
  return grupo;
}

/** De dónde sale la información: el informe citado o la visita del equipo. La dirección ya viene validada. */
function origenDe(fuente) {
  if (!fuente) return [crear('p', 'ayuda', t('Revisión hecha por el equipo Andromeda.'))];
  const enlace = crear('a', '', fuente.nombre);
  enlace.href = fuente.url;
  const cita = crear('p', 'ayuda', t('Fuente: '));
  cita.append(enlace);
  return [cita, crear('p', 'ayuda', t('La fuente no indica cuándo se revisó el lugar.'))];
}

function plegar(boton, abierto, textos) {
  boton.setAttribute('aria-expanded', String(abierto));
  boton.querySelector('[data-texto]').textContent = t(abierto ? textos.cerrar : textos.abrir);
  document.getElementById(boton.getAttribute('aria-controls')).hidden = !abierto;
}

function conectar(boton, textos) {
  boton.addEventListener('click', () => plegar(boton, boton.getAttribute('aria-expanded') !== 'true', textos));
}

function llenar(parte, lugar) {
  parte('veredicto').textContent = t(etiquetaVeredicto(veredicto(lugar)));
  // Con una fuente externa solo se conoce el día en que se consultó, no el de la visita.
  parte('fecha').textContent = lugar.fuente
    ? t('Consultado: {fecha}', { fecha: formatearFecha(lugar.fuente.consultado) })
    : t('Revisión: {fecha}', { fecha: formatearFecha(lugar.fecha) });
  parte('origen').replaceChildren(...origenDe(lugar.fuente));
  parte('filas').replaceChildren(...criteriosVisibles(lugar).map(filaDe));
  parte('criterios').replaceChildren(...criteriosPorBloque(lugar).map(grupoDe));
}

/** Devuelve `{ pintar }`. Sin auditoría el bloque se oculta y no afirma nada. */
export function crearVistaAccesibilidad(contenedor) {
  const parte = (nombre) => contenedor.querySelector(`[data-acceso-${nombre}]`);
  const botones = [[parte('ver-detalle'), TEXTOS.detalle], [parte('ver-todos'), TEXTOS.todos]];
  let pintado = null;
  botones.forEach(([boton, textos]) => conectar(boton, textos));

  return {
    pintar(lugar) {
      contenedor.hidden = !lugar;
      // Con el mismo lugar no se repinta: se respeta lo que la persona tenga abierto.
      if (lugar === pintado) return;
      pintado = lugar;
      botones.forEach(([boton, textos]) => plegar(boton, false, textos));
      if (lugar) llenar(parte, lugar);
    },
  };
}
