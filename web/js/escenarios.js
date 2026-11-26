// Lógica pura del simulador: sin DOM, para poder probarla con node --test.

const MINUTOS_POR_HORA = 60;

const esTexto = (valor) => typeof valor === 'string' && valor.trim() !== '';

function erroresDePaso(paso, posicion, contexto) {
  const { idsPuntos, componentes, nombre, minutoPrevio } = contexto;
  const donde = `Escenario "${nombre}", paso ${posicion + 1}`;
  const errores = [];
  if (!idsPuntos.has(paso.punto)) errores.push(`${donde}: el punto "${paso.punto}" no existe.`);
  if (!(paso.componente in componentes)) errores.push(`${donde}: el componente "${paso.componente}" no existe.`);
  if (!Number.isFinite(paso.minuto) || paso.minuto < 0) errores.push(`${donde}: el minuto debe ser un número positivo.`);
  else if (paso.minuto < minutoPrevio) errores.push(`${donde}: los minutos no están en orden.`);
  if (!esTexto(paso.accion) || !esTexto(paso.quien)) errores.push(`${donde}: falta la acción o el responsable.`);
  return errores;
}

function erroresDeEscenario(escenario, idsPuntos, componentes) {
  const nombre = escenario?.nombre ?? escenario?.id ?? 'sin nombre';
  if (!Array.isArray(escenario?.pasos) || escenario.pasos.length === 0) {
    return [`Escenario "${nombre}": no tiene pasos.`];
  }
  return escenario.pasos.flatMap((paso, posicion) =>
    erroresDePaso(paso, posicion, {
      idsPuntos,
      componentes,
      nombre,
      minutoPrevio: posicion === 0 ? 0 : escenario.pasos[posicion - 1].minuto,
    }),
  );
}

/** Devuelve una lista de errores legibles; vacía si los datos sirven. */
export function validarDatos(puntos, datos) {
  if (!Array.isArray(puntos) || !datos || typeof datos.componentes !== 'object' || !Array.isArray(datos.escenarios)) {
    return ['Los datos del simulador no tienen el formato esperado.'];
  }
  if (datos.escenarios.length === 0) return ['No hay ningún escenario para simular.'];
  const idsPuntos = new Set(puntos.map((punto) => punto.id));
  return datos.escenarios.flatMap((escenario) => erroresDeEscenario(escenario, idsPuntos, datos.componentes));
}

export const pasoActual = (escenario, indice) => escenario.pasos[indice] ?? null;

export const pasosHasta = (escenario, indice) => escenario.pasos.slice(0, Math.max(0, indice + 1));

export const componentesActivos = (escenario, indice) => [
  ...new Set(pasosHasta(escenario, indice).map((paso) => paso.componente)),
];

export const duracionTotal = (escenario) => escenario.pasos.at(-1)?.minuto ?? 0;

export const siguienteIndice = (escenario, indice) => Math.min(indice + 1, escenario.pasos.length - 1);

export const anteriorIndice = (_escenario, indice) => Math.max(indice - 1, -1);

export function formatearMinuto(minuto) {
  if (minuto < MINUTOS_POR_HORA) return `Minuto ${minuto}`;
  const horas = Math.floor(minuto / MINUTOS_POR_HORA);
  return `${horas} h ${minuto % MINUTOS_POR_HORA} min`;
}
