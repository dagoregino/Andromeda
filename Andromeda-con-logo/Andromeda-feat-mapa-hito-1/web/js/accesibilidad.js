// Accesibilidad física de los destinos: criterios, validación y veredicto. Sin DOM.
import { esCoordenada } from './geo.js';

const ETIQUETAS_CRITERIO = Object.freeze({
  si: 'Se puede', parcial: 'Con ayuda', no: 'No se puede', sinDato: 'Sin información', noAplica: 'No aplica',
});
const ETIQUETAS_VEREDICTO = Object.freeze({
  accesible: 'Accesible', conAyuda: 'Accesible con ayuda', noAccesible: 'No accesible', sinInformacion: 'Sin información',
});
const VEREDICTO_DE = Object.freeze({
  si: 'accesible', parcial: 'conAyuda', no: 'noAccesible', sinDato: 'sinInformacion',
});
const ESTADOS = Object.freeze(Object.keys(ETIQUETAS_CRITERIO));
const PORCENTAJE_MINIMO = 80;
const MESES = Object.freeze(['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']);

const bloque = (id, nombre, criterios, { criticos = [], medidas = {} } = {}) =>
  Object.freeze({ id, nombre, criterios: Object.freeze(criterios), criticos: Object.freeze(criticos), medidas: Object.freeze(medidas) });

// El orden es el de la interfaz. En todos los criterios, "si" es la respuesta favorable.
const BLOQUES = Object.freeze([
  bloque('llegada', 'Llegada', {
    andenContinuo: 'Andén continuo', vado: 'Rebaje en la esquina', cruceSemaforo: 'Cruce con semáforo',
    iluminacion: 'Iluminación', sombra: 'Sombra',
  }),
  bloque('ingreso', 'Ingreso', {
    puertaAccesible: 'Puerta accesible', sinEscalon: 'Entrada sin escalón', rampa: 'Rampa', timbre: 'Timbre',
  }, { criticos: ['sinEscalon'], medidas: { anchoMetros: 'Ancho de la puerta' } }),
  bloque('dentro', 'Dentro', {
    rutaAccesible: 'Ruta accesible', pisoFirme: 'Piso firme', sinObstaculos: 'Paso sin obstáculos', ascensor: 'Ascensor',
  }, { criticos: ['rutaAccesible'], medidas: { anchoMetros: 'Ancho del paso' } }),
  bloque('servicios', 'Servicios', {
    bano: 'Baño accesible', informacion: 'Punto de información', asientos: 'Asientos', agua: 'Agua', sombra: 'Sombra',
  }, { criticos: ['bano'] }),
  bloque('comunicacion', 'Comunicación', {
    pictogramas: 'Dibujos que orientan', braille: 'Braille', lenguajeClaro: 'Lenguaje claro', audio: 'Audio',
    lenguaSenas: 'Lengua de señas',
  }),
  bloque('emergencia', 'Emergencia', {
    evacuacion: 'Salida de emergencia accesible', alarmaVisual: 'Alarma con luz', puntoEncuentro: 'Punto de encuentro',
  }),
]);

const FILAS = Object.freeze([
  { id: 'llegada', nombre: 'Llegada', bloque: 'llegada' },
  { id: 'ingreso', nombre: 'Ingreso', bloque: 'ingreso' },
  { id: 'dentro', nombre: 'Dentro', bloque: 'dentro' },
  { id: 'bano', nombre: 'Baño', bloque: 'servicios', criterio: 'bano' },
]);

export const etiquetaCriterio = (estado) => ETIQUETAS_CRITERIO[estado] ?? ETIQUETAS_CRITERIO.sinDato;
export const etiquetaVeredicto = (valor) => ETIQUETAS_VEREDICTO[valor] ?? ETIQUETAS_VEREDICTO.sinInformacion;

/** Los criterios de un bloque con su estado. Lo que falta o no se entiende cuenta como sin dato. */
function criteriosDe(lugar, { id, criterios, criticos }) {
  return Object.entries(criterios).map(([clave, nombre]) => {
    const valor = lugar?.bloques?.[id]?.[clave];
    const estado = ESTADOS.includes(valor) ? valor : 'sinDato';
    return { clave, nombre, estado, critico: criticos.includes(clave) };
  });
}

const todosDe = (lugar) => BLOQUES.flatMap((definicion) => criteriosDe(lugar, definicion));

/** Reglas del veredicto sobre un grupo de criterios. Devuelve si, parcial, no o sinDato. */
function evaluar(criterios) {
  const criticos = criterios.filter((c) => c.critico).map((c) => c.estado);
  if (criticos.includes('no')) return 'no';
  if (criticos.some((estado) => estado === 'sinDato' || estado === 'noAplica')) return 'sinDato';
  const aplicables = criterios.filter((c) => c.estado !== 'noAplica');
  const cuantos = (estado) => aplicables.filter((c) => c.estado === estado).length;
  if (aplicables.length === 0 || cuantos('sinDato') * 2 > aplicables.length) return 'sinDato';
  if (criticos.includes('parcial') || criterios.some((c) => !c.critico && c.estado === 'no')) return 'parcial';
  return cuantos('si') * 100 >= aplicables.length * PORCENTAJE_MINIMO ? 'si' : 'parcial';
}

export const veredicto = (lugar) => VEREDICTO_DE[evaluar(todosDe(lugar))];

export function resumenAccesibilidad(lugar) {
  const criterios = todosDe(lugar);
  const cuantos = (estado) => criterios.filter((c) => c.estado === estado).length;
  return {
    veredicto: veredicto(lugar),
    cumplen: cuantos('si'),
    parciales: cuantos('parcial'),
    noCumplen: cuantos('no'),
    sinDato: cuantos('sinDato'),
  };
}

/** Una fila resume su bloque; además distingue cuando nada se puede o nada aplica. */
function estadoDeFila(criterios) {
  if (criterios.every((c) => c.estado === 'noAplica')) return 'noAplica';
  const aplicables = criterios.filter((c) => c.estado !== 'noAplica');
  if (aplicables.every((c) => c.estado === 'no')) return 'no';
  const estado = evaluar(criterios);
  if (estado !== 'parcial' || aplicables.some((c) => c.estado === 'parcial' || c.estado === 'no')) return estado;
  // Un dato que falta no es lo mismo que necesitar ayuda: manda el crítico y, si no hay, no se sabe.
  return criterios.some((c) => c.critico) ? 'si' : 'sinDato';
}

/** Las cuatro filas del detalle compacto. */
export function criteriosVisibles(lugar) {
  return FILAS.map(({ id, nombre, bloque: idBloque, criterio }) => {
    const criterios = criteriosDe(lugar, BLOQUES.find((definicion) => definicion.id === idBloque));
    const estado = criterio ? criterios.find((c) => c.clave === criterio).estado : estadoDeFila(criterios);
    return { id, nombre, estado, nota: lugar?.notas?.[id]?.trim() || 'Sin notas.' };
  });
}

const textoDeMetros = (valor) =>
  Number.isFinite(valor) ? `${String(valor).replace('.', ',')} m` : ETIQUETAS_CRITERIO.sinDato;

/** Todos los criterios agrupados por bloque, con sus medidas ya escritas. */
export function criteriosPorBloque(lugar) {
  return BLOQUES.map((definicion) => ({
    id: definicion.id,
    nombre: definicion.nombre,
    criterios: criteriosDe(lugar, definicion).map(({ nombre, estado }) => ({ nombre, estado })),
    medidas: Object.entries(definicion.medidas).map(([clave, nombre]) => ({
      nombre, texto: textoDeMetros(lugar?.bloques?.[definicion.id]?.[clave]),
    })),
  }));
}

// Origen de los datos: data/accesibilidad.json, escrito a mano a partir de una fuente citada en `fuente`
// o de una visita del equipo. Las entradas con `ejemplo: true` son inventadas: nunca llegan a la página.
/** La entrada real del destino, o `null`. */
export function buscarAccesibilidad(datos, destino) {
  if (!destino?.id) return null;
  return datos?.lugares?.find((lugar) => lugar.destinoId === destino.id && lugar.ejemplo === false) ?? null;
}

const esObjeto = (valor) => Boolean(valor) && typeof valor === 'object' && !Array.isArray(valor);
const esTexto = (valor) => typeof valor === 'string' && valor.trim() !== '';
const esHora = (valor) => typeof valor === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(valor);

function esFechaIso(valor) {
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const fecha = new Date(`${valor}T00:00:00Z`);
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().startsWith(valor);
}

export function formatearFecha(iso) {
  if (!esFechaIso(iso)) return 'sin fecha';
  const [anio, mes, dia] = iso.split('-').map(Number);
  return `${dia} ${MESES[mes - 1]} ${anio}`;
}

// Sin barra inicial, protocolo, subida de carpeta, códigos % ni espacios o caracteres de control que los disimulen.
const esRutaRelativa = (ruta) => esTexto(ruta) && ruta === ruta.trim() && !/^[/\\]|[:%]|\.\.|\p{Cc}/u.test(ruta);

const esParada = (parada) =>
  esTexto(parada?.nombre) && Number.isFinite(parada.distanciaMetros) && parada.distanciaMetros >= 0;

const sonNotas = (notas) =>
  esObjeto(notas) && Object.entries(notas).every(([id, texto]) => FILAS.some((f) => f.id === id) && typeof texto === 'string');

const esDireccionSegura = (valor) => typeof valor === 'string' && /^https:\/\/\S+$/.test(valor);
const esFuente = (fuente) =>
  esTexto(fuente?.nombre) && esDireccionSegura(fuente.url) && esFechaIso(fuente.consultado);

// Una entrada con `fuente` cita un informe ajeno; sin ella es una visita propia y debe documentarla.
const CAMPOS_DE_FUENTE = Object.freeze([
  ['fuente', esFuente, 'la fuente necesita nombre, dirección https y fecha de consulta'],
]);
const CAMPOS_DE_VISITA = Object.freeze([
  ['fecha', esFechaIso, 'la fecha debe existir y tener la forma AAAA-MM-DD'],
  ['hora', esHora, 'la hora debe tener la forma HH:MM'],
  ['auditores', (v) => Array.isArray(v) && v.length > 0 && v.every(esTexto), 'faltan los auditores'],
  ['clima', esTexto, 'falta el clima'],
  ['punto', (v) => esCoordenada([v?.lat, v?.lng]), 'el punto no tiene coordenadas válidas'],
  ['parada', esParada, 'la parada necesita nombre y distancia en metros'],
  ['fotos', (v) => Array.isArray(v) && v.every(esRutaRelativa), 'las fotos deben ser una lista de rutas relativas'],
]);
const CAMPOS_COMUNES = Object.freeze([
  ['notas', sonNotas, 'las notas solo admiten texto para llegada, ingreso, dentro y bano'],
  ['ejemplo', (v) => typeof v === 'boolean', 'el campo ejemplo debe ser verdadero o falso'],
]);

function erroresDeBloque(contenido, { id, criterios, criticos, medidas }) {
  if (!esObjeto(contenido)) return [`falta el bloque ${id}`];
  const faltan = criticos
    .filter((clave) => !(clave in contenido))
    .map((clave) => `falta el criterio crítico ${clave} en ${id}`);
  const revisados = Object.entries(contenido).flatMap(([clave, valor]) => {
    if (Object.hasOwn(medidas, clave)) {
      const valida = valor === null || (Number.isFinite(valor) && valor > 0);
      return valida ? [] : [`en ${id}, el ancho debe ser un número de metros mayor que cero, o null`];
    }
    if (!Object.hasOwn(criterios, clave)) return [`el criterio ${clave} de ${id} es desconocido`];
    return ESTADOS.includes(valor) ? [] : [`el criterio ${clave} de ${id} tiene un estado no permitido`];
  });
  return [...faltan, ...revisados];
}

function erroresDeBloques(bloques) {
  if (!esObjeto(bloques)) return ['faltan los bloques de criterios'];
  const desconocidos = Object.keys(bloques)
    .filter((id) => !BLOQUES.some((definicion) => definicion.id === id))
    .map((id) => `el bloque ${id} es desconocido`);
  return [...desconocidos, ...BLOQUES.flatMap((definicion) => erroresDeBloque(bloques[definicion.id], definicion))];
}

function erroresDeDestino(lugar, posicion, lugares, destinos) {
  const id = lugar.destinoId;
  if (!esTexto(id)) return ['falta el identificador del destino'];
  if (!destinos.some((destino) => destino.id === id)) return [`el destino "${id}" no existe`];
  const primero = lugares.findIndex((otro) => otro?.destinoId === id);
  return primero === posicion ? [] : [`el destino "${id}" está repetido`];
}

function erroresDeLugar(lugar, posicion, lugares, destinos) {
  const donde = `Lugar ${posicion + 1}`;
  if (!esObjeto(lugar)) return [`${donde}: no tiene el formato esperado.`];
  const propios = lugar.fuente === undefined ? CAMPOS_DE_VISITA : CAMPOS_DE_FUENTE;
  const deCampos = [...propios, ...CAMPOS_COMUNES]
    .filter(([campo, esValido]) => !esValido(lugar[campo]))
    .map(([, , mensaje]) => mensaje);
  return [
    ...erroresDeDestino(lugar, posicion, lugares, destinos),
    ...deCampos,
    ...erroresDeBloques(lugar.bloques),
  ].map((mensaje) => `${donde}: ${mensaje}.`);
}

/** Devuelve una lista de errores legibles; vacía si los datos sirven. */
export function validarAccesibilidad(datos, destinos) {
  if (!esObjeto(datos) || !Array.isArray(datos.lugares)) return ['Los datos de accesibilidad no tienen el formato esperado.'];
  const generales = [];
  if (!esTexto(datos.nota)) generales.push('Falta la nota sobre el origen de la auditoría.');
  if (!esFechaIso(datos.actualizado)) generales.push('La fecha de actualización debe tener la forma AAAA-MM-DD.');
  if (datos.lugares.length === 0) generales.push('No hay ningún lugar auditado.');
  const porLugar = datos.lugares.flatMap((lugar, posicion) => erroresDeLugar(lugar, posicion, datos.lugares, destinos ?? []));
  return [...generales, ...porLugar];
}
