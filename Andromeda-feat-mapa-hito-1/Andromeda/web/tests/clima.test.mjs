import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  PUNTO_CLIMA, HORAS_LLUVIA, UMBRALES, NIVEL_CALOR, NIVEL_LLUVIA,
  urlClima, validarClima, formatearHora, nivelCalor, nivelLluvia, resumenClima, textosClima, consejosClima,
} from '../js/clima.js';

/** Una respuesta válida de Open-Meteo; `cambios` se mezcla encima de cada parte. */
const respuesta = ({ current = {}, hourly = {} } = {}) => ({
  current: { time: '2026-11-26T21:45', temperature_2m: 30.4, apparent_temperature: 35.6, precipitation: 0, ...current },
  hourly: { precipitation_probability: [10, 20, 5], ...hourly },
});

const resumen = (cambios = {}) => ({
  temperatura: 30, sensacion: 30, lluviaProbabilidad: 0, lloviendo: false, hora: '9:45 p. m.', consultadoEn: 0, ...cambios,
});

test('urlClima pide lo necesario, sin clave y en hora de Colombia', () => {
  const url = new URL(urlClima());
  assert.equal(url.origin + url.pathname, 'https://api.open-meteo.com/v1/forecast');
  assert.equal(url.searchParams.get('latitude'), String(PUNTO_CLIMA[0]));
  assert.equal(url.searchParams.get('longitude'), String(PUNTO_CLIMA[1]));
  assert.equal(url.searchParams.get('current'), 'temperature_2m,apparent_temperature,precipitation');
  assert.equal(url.searchParams.get('hourly'), 'precipitation_probability');
  assert.equal(url.searchParams.get('forecast_hours'), String(HORAS_LLUVIA));
  assert.equal(url.searchParams.get('timezone'), 'America/Bogota');
  assert.equal([...url.searchParams.keys()].some((nombre) => /key|token/i.test(nombre)), false);
});

test('urlClima acepta otro punto', () => {
  assert.equal(new URL(urlClima([1.5, -2.5])).searchParams.get('latitude'), '1.5');
});

test('validarClima acepta una respuesta completa', () => {
  assert.deepEqual(validarClima(respuesta()), []);
});

test('validarClima rechaza lo que no es una respuesta', () => {
  for (const malo of [null, undefined, 42, 'texto', {}, { current: null }, { current: 'x' }]) {
    assert.deepEqual(validarClima(malo), ['Falta el clima actual.'], String(malo));
  }
});

test('validarClima señala cada dato inválido', () => {
  const casos = [
    [{ current: { temperature_2m: '30' } }, 'La temperatura no es válida.'],
    [{ current: { temperature_2m: NaN } }, 'La temperatura no es válida.'],
    [{ current: { temperature_2m: 99 } }, 'La temperatura no es válida.'],
    [{ current: { temperature_2m: null } }, 'La temperatura no es válida.'],
    [{ current: { apparent_temperature: -50 } }, 'La sensación térmica no es válida.'],
    [{ current: { precipitation: -1 } }, 'La lluvia actual no es válida.'],
    [{ current: { precipitation: undefined } }, 'La lluvia actual no es válida.'],
    [{ current: { time: '21:45' } }, 'La hora no es válida.'],
    [{ current: { time: 2145 } }, 'La hora no es válida.'],
    [{ hourly: { precipitation_probability: [] } }, 'La probabilidad de lluvia no es válida.'],
    [{ hourly: { precipitation_probability: [10, null] } }, 'La probabilidad de lluvia no es válida.'],
    [{ hourly: { precipitation_probability: [101] } }, 'La probabilidad de lluvia no es válida.'],
    [{ hourly: { precipitation_probability: [-1] } }, 'La probabilidad de lluvia no es válida.'],
    [{ hourly: { precipitation_probability: 'alta' } }, 'La probabilidad de lluvia no es válida.'],
  ];
  for (const [cambios, mensaje] of casos) {
    assert.deepEqual(validarClima(respuesta(cambios)), [mensaje], mensaje);
  }
});

test('validarClima falla si falta toda la parte por horas', () => {
  const sinHoras = { current: respuesta().current };
  assert.deepEqual(validarClima(sinHoras), ['La probabilidad de lluvia no es válida.']);
});

test('formatearHora usa a. m. y p. m. con 12 horas', () => {
  assert.equal(formatearHora('2026-11-26T21:45'), '9:45 p. m.');
  assert.equal(formatearHora('2026-11-26T09:05'), '9:05 a. m.');
  assert.equal(formatearHora('2026-11-26T00:10'), '12:10 a. m.');
  assert.equal(formatearHora('2026-11-26T12:00'), '12:00 p. m.');
  assert.equal(formatearHora('2026-11-26T23:59'), '11:59 p. m.');
});

test('formatearHora devuelve vacío si el formato no sirve', () => {
  for (const malo of ['', 'ayer', '21:45', undefined]) assert.equal(formatearHora(malo), '', String(malo));
});

test('nivelCalor cambia justo en los umbrales', () => {
  assert.equal(nivelCalor(UMBRALES.calorFuerte - 0.1), NIVEL_CALOR.NORMAL);
  assert.equal(nivelCalor(UMBRALES.calorFuerte), NIVEL_CALOR.FUERTE);
  assert.equal(nivelCalor(UMBRALES.calorPeligroso - 0.1), NIVEL_CALOR.FUERTE);
  assert.equal(nivelCalor(UMBRALES.calorPeligroso), NIVEL_CALOR.PELIGROSO);
  assert.equal(nivelCalor(20), NIVEL_CALOR.NORMAL);
});

test('los umbrales de calor equivalen a 90 y 103 °F', () => {
  const aFahrenheit = (c) => (c * 9) / 5 + 32;
  assert.ok(Math.abs(aFahrenheit(UMBRALES.calorFuerte) - 90) < 1);
  assert.ok(Math.abs(aFahrenheit(UMBRALES.calorPeligroso) - 103) < 1);
});

test('nivelLluvia: si llueve ya es probable, sin importar el porcentaje', () => {
  assert.equal(nivelLluvia({ lloviendo: true, lluviaProbabilidad: 0 }), NIVEL_LLUVIA.PROBABLE);
});

test('nivelLluvia cambia justo en los umbrales', () => {
  const nivel = (lluviaProbabilidad) => nivelLluvia({ lloviendo: false, lluviaProbabilidad });
  assert.equal(nivel(UMBRALES.lluviaPosible - 1), NIVEL_LLUVIA.BAJA);
  assert.equal(nivel(UMBRALES.lluviaPosible), NIVEL_LLUVIA.POSIBLE);
  assert.equal(nivel(UMBRALES.lluviaProbable - 1), NIVEL_LLUVIA.POSIBLE);
  assert.equal(nivel(UMBRALES.lluviaProbable), NIVEL_LLUVIA.PROBABLE);
});

test('resumenClima redondea, toma la lluvia más alta y da la hora', () => {
  const r = resumenClima(respuesta(), 1234);
  assert.equal(r.temperatura, 30);
  assert.equal(r.sensacion, 36);
  assert.equal(r.lluviaProbabilidad, 20);
  assert.equal(r.lloviendo, false);
  assert.equal(r.hora, '9:45 p. m.');
  assert.equal(r.consultadoEn, 1234);
});

test('resumenClima: precipitación mayor que cero significa que llueve', () => {
  assert.equal(resumenClima(respuesta({ current: { precipitation: 0.2 } })).lloviendo, true);
});

test('resumenClima no se puede modificar', () => {
  const r = resumenClima(respuesta());
  assert.ok(Object.isFrozen(r));
});

test('textosClima: sensación y lluvia', () => {
  assert.deepEqual({ ...textosClima(resumen({ temperatura: 33, sensacion: 39, lluviaProbabilidad: 20 })) }, {
    temperatura: '33 °C', sensacion: 'Sensación de 39 °C', lluvia: 'Lluvia en las próximas horas: 20 %',
  });
  assert.equal(textosClima(resumen({ lloviendo: true })).lluvia, 'Está lloviendo');
});

test('consejosClima: sin calor ni lluvia no hay consejos', () => {
  assert.deepEqual(consejosClima(resumen({ sensacion: 28, lluviaProbabilidad: 10 })), []);
});

test('consejosClima: calor fuerte y calor peligroso son consejos distintos', () => {
  const fuerte = consejosClima(resumen({ sensacion: 35 }));
  const peligroso = consejosClima(resumen({ sensacion: 41 }));
  assert.deepEqual(fuerte.map((c) => c.tipo), ['calor']);
  assert.deepEqual(peligroso.map((c) => c.tipo), ['calor-peligroso']);
  assert.match(fuerte[0].texto, /menos caminata/);
  assert.match(peligroso[0].texto, /menos caminata/);
});

test('consejosClima: lluvia posible solo pide paraguas; probable también avisa de los arroyos', () => {
  const posible = consejosClima(resumen({ lluviaProbabilidad: 40 }));
  const probable = consejosClima(resumen({ lluviaProbabilidad: 80 }));
  assert.deepEqual(posible.map((c) => c.tipo), ['lluvia']);
  assert.doesNotMatch(posible[0].texto, /arroyos/);
  assert.match(probable[0].texto, /arroyos/);
});

test('consejosClima: calor y lluvia juntos dan dos consejos, calor primero', () => {
  const consejos = consejosClima(resumen({ sensacion: 36, lloviendo: true }));
  assert.deepEqual(consejos.map((c) => c.tipo), ['calor', 'lluvia']);
});
