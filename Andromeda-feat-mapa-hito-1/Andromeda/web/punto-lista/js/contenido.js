// Preguntas de demostración. Son ejemplos escritos para esta página: no son datos reales.

const TIPOS = ['respuesta', 'aviso'];
const CAMPOS = ['id', 'pregunta', 'respuesta'];

export const PREGUNTAS = Object.freeze([
  {
    id: 'estadio',
    pregunta: '¿Cómo llego al estadio?',
    respuesta: 'Camina a la parada más cercana y toma la ruta de ejemplo hacia el Metropolitano.',
    tipo: 'respuesta',
  },
  {
    id: 'agua',
    pregunta: '¿Dónde hay agua y sombra?',
    respuesta: 'Junto al parque más cercano hay un punto de descanso con agua.',
    tipo: 'respuesta',
  },
  {
    id: 'avisos',
    pregunta: '¿Hay avisos cerca?',
    respuesta: 'Hay un arroyo activo en una calle cercana. Toma otro camino. En una emergencia, llama al 123.',
    tipo: 'aviso',
  },
  {
    id: 'comercio',
    pregunta: '¿Dónde compro algo del barrio?',
    respuesta: 'A pocos pasos de la entrada hay un puesto de vendedores locales.',
    tipo: 'respuesta',
  },
]);

export function validarPreguntas(preguntas) {
  if (!Array.isArray(preguntas) || preguntas.length === 0) {
    return ['No hay preguntas de ejemplo.'];
  }
  return preguntas.flatMap((pregunta, indice) => {
    const faltantes = CAMPOS.filter((campo) => !String(pregunta?.[campo] ?? '').trim()).map(
      (campo) => `Pregunta ${indice + 1}: falta "${campo}".`,
    );
    const repetida = preguntas.findIndex((otra) => otra?.id === pregunta?.id) < indice;
    return [
      ...faltantes,
      ...(repetida ? [`Pregunta ${indice + 1}: el id "${pregunta.id}" está repetido.`] : []),
      ...(TIPOS.includes(pregunta?.tipo) ? [] : [`Pregunta ${indice + 1}: tipo desconocido.`]),
    ];
  });
}
