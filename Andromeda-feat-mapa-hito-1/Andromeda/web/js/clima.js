// Clima de Barranquilla para la línea «Antes de salir». Sin DOM, para probarlo con node --test.
// Fuente: Open-Meteo (https://open-meteo.com), licencia CC BY 4.0. El uso gratuito es solo no comercial.
// Es un pronóstico para toda la ciudad, no para un barrio. Si algo falla, no se muestra nada.

/** Centro aproximado de Barranquilla. El pronóstico es el de esa zona, no el del destino. */
export const PUNTO_CLIMA = Object.freeze([10.97, -74.8]);

/** Cuántas horas de pronóstico se miran para la lluvia (cuenta desde la hora actual). */
export const HORAS_LLUVIA = 3;

/**
 * Criterios del equipo para los consejos. Son fáciles de cambiar aquí.
 * Calor: sensación térmica en °C. Los cortes de 32 y 39 °C equivalen a 90 y 103 °F, los límites de
 * «precaución extrema» y «peligro» del índice de calor del Servicio Meteorológico de EE. UU. (weather.gov).
 * La sensación térmica de Open-Meteo no es idéntica a ese índice: es una referencia, no un aviso oficial.
 * Lluvia: probabilidad máxima (%) en las próximas horas.
 */
export const UMBRALES = Object.freeze({
  calorFuerte: 32,
  calorPeligroso: 39,
  lluviaPosible: 30,
  lluviaProbable: 60,
});

export const NIVEL_CALOR = Object.freeze({ NORMAL: 'normal', FUERTE: 'fuerte', PELIGROSO: 'peligroso' });
export const NIVEL_LLUVIA = Object.freeze({ BAJA: 'baja', POSIBLE: 'posible', PROBABLE: 'probable' });

const TEMPERATURA_MINIMA = -20;
const TEMPERATURA_MAXIMA = 60;
const FORMATO_HORA = /^\d{4}-\d{2}-\d{2}T(\d{2}):(\d{2})$/;

/** Dirección de la consulta. No lleva clave: la API gratuita no la pide. */
export function urlClima(punto = PUNTO_CLIMA) {
  const [latitud, longitud] = punto;
  const consulta = new URLSearchParams({
    latitude: String(latitud),
    longitude: String(longitud),
    current: 'temperature_2m,apparent_temperature,precipitation',
    hourly: 'precipitation_probability',
    forecast_hours: String(HORAS_LLUVIA),
    timezone: 'America/Bogota',
  });
  return `https://api.open-meteo.com/v1/forecast?${consulta}`;
}

const esNumero = (valor) => typeof valor === 'number' && Number.isFinite(valor);
const esTemperatura = (valor) => esNumero(valor) && valor >= TEMPERATURA_MINIMA && valor <= TEMPERATURA_MAXIMA;
const esProbabilidad = (valor) => esNumero(valor) && valor >= 0 && valor <= 100;

/** Lista de problemas de la respuesta. Vacía si se puede usar. */
export function validarClima(datos) {
  const errores = [];
  const actual = datos?.current;
  const probabilidades = datos?.hourly?.precipitation_probability;
  if (!actual || typeof actual !== 'object') return ['Falta el clima actual.'];
  if (!esTemperatura(actual.temperature_2m)) errores.push('La temperatura no es válida.');
  if (!esTemperatura(actual.apparent_temperature)) errores.push('La sensación térmica no es válida.');
  if (!esNumero(actual.precipitation) || actual.precipitation < 0) errores.push('La lluvia actual no es válida.');
  if (typeof actual.time !== 'string' || !FORMATO_HORA.test(actual.time)) errores.push('La hora no es válida.');
  if (!Array.isArray(probabilidades) || probabilidades.length === 0 || !probabilidades.every(esProbabilidad)) {
    errores.push('La probabilidad de lluvia no es válida.');
  }
  return errores;
}

/** «21:45» pasa a «9:45 p. m.». La hora ya viene en hora de Colombia. */
export function formatearHora(texto) {
  const [, horas, minutos] = FORMATO_HORA.exec(texto) ?? [];
  if (horas === undefined) return '';
  const hora = Number(horas);
  const sufijo = hora < 12 ? 'a. m.' : 'p. m.';
  return `${hora % 12 || 12}:${minutos} ${sufijo}`;
}

export function nivelCalor(sensacion) {
  if (sensacion >= UMBRALES.calorPeligroso) return NIVEL_CALOR.PELIGROSO;
  if (sensacion >= UMBRALES.calorFuerte) return NIVEL_CALOR.FUERTE;
  return NIVEL_CALOR.NORMAL;
}

export function nivelLluvia({ lloviendo, lluviaProbabilidad }) {
  if (lloviendo || lluviaProbabilidad >= UMBRALES.lluviaProbable) return NIVEL_LLUVIA.PROBABLE;
  if (lluviaProbabilidad >= UMBRALES.lluviaPosible) return NIVEL_LLUVIA.POSIBLE;
  return NIVEL_LLUVIA.BAJA;
}

/** Los números de la respuesta ya validada, redondeados y listos para mostrar. */
export function resumenClima(datos, ahora = Date.now()) {
  const { current: actual, hourly } = datos;
  return Object.freeze({
    temperatura: Math.round(actual.temperature_2m),
    sensacion: Math.round(actual.apparent_temperature),
    lluviaProbabilidad: Math.round(Math.max(...hourly.precipitation_probability)),
    lloviendo: actual.precipitation > 0,
    hora: formatearHora(actual.time),
    consultadoEn: ahora,
  });
}

/** Los textos de la línea: temperatura, sensación y lluvia. */
export function textosClima(resumen) {
  return Object.freeze({
    temperatura: `${resumen.temperatura} °C`,
    sensacion: `Sensación de ${resumen.sensacion} °C`,
    lluvia: resumen.lloviendo
      ? 'Está lloviendo'
      : `Lluvia en las próximas horas: ${resumen.lluviaProbabilidad} %`,
  });
}

/** Consejos cortos según el calor y la lluvia. Si no hay nada que advertir, la lista queda vacía. */
export function consejosClima(resumen) {
  const consejos = [];
  const calor = nivelCalor(resumen.sensacion);
  if (calor === NIVEL_CALOR.PELIGROSO) {
    consejos.push({ tipo: 'calor-peligroso', texto: 'Calor muy fuerte. Evita caminar al sol: elige la ruta con menos caminata, busca sombra y toma agua.' });
  } else if (calor === NIVEL_CALOR.FUERTE) {
    consejos.push({ tipo: 'calor', texto: 'Hace calor. Elige la ruta con menos caminata, busca sombra y toma agua.' });
  }
  const lluvia = nivelLluvia(resumen);
  if (lluvia === NIVEL_LLUVIA.PROBABLE) {
    consejos.push({ tipo: 'lluvia', texto: 'Es probable que llueva. Los arroyos pueden crecer: no los cruces a pie. Lleva paraguas.' });
  } else if (lluvia === NIVEL_LLUVIA.POSIBLE) {
    consejos.push({ tipo: 'lluvia', texto: 'Puede llover. Lleva paraguas.' });
  }
  return consejos;
}
