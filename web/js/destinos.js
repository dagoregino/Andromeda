// Lugares a los que se puede ir: validación y búsqueda. Sin DOM.
import { esCoordenada } from './geo.js';

const esTexto = (valor) => typeof valor === 'string' && valor.trim() !== '';

export const coordenadaDe = (destino) => [destino.lat, destino.lng];

function erroresDeDestino(destino, posicion, destinos) {
  const donde = `Destino ${posicion + 1}`;
  if (!destino || typeof destino !== 'object') return [`${donde}: no tiene el formato esperado.`];
  const errores = [];
  if (!esTexto(destino.nombre)) errores.push(`${donde}: falta el nombre.`);
  if (!esCoordenada(coordenadaDe(destino))) errores.push(`${donde}: las coordenadas no son válidas.`);
  const primero = destinos.findIndex((otro) => otro?.id === destino.id);
  if (!esTexto(destino.id)) errores.push(`${donde}: falta el identificador.`);
  else if (primero !== posicion) errores.push(`${donde}: el identificador "${destino.id}" está repetido.`);
  return errores;
}

/** Devuelve una lista de errores legibles; vacía si los datos sirven. */
export function validarDestinos(datos) {
  if (!Array.isArray(datos?.destinos)) return ['La lista de destinos no tiene el formato esperado.'];
  if (datos.destinos.length === 0) return ['No hay ningún destino.'];
  return datos.destinos.flatMap(erroresDeDestino);
}

export const normalizar = (texto) =>
  String(texto ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

/** Destinos cuyo nombre o zona contienen todas las palabras buscadas, sin importar tildes. */
export function buscarDestinos(destinos, texto) {
  const palabras = normalizar(texto).split(' ').filter(Boolean);
  return destinos.filter((destino) => {
    const contenido = normalizar(`${destino.nombre} ${destino.zona ?? ''}`);
    return palabras.every((palabra) => contenido.includes(palabra));
  });
}
