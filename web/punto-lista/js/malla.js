// Lee modelos/carcasa.bin, escrito por herramientas/exportar-carcasa.py. Función pura.
const GRUPOS = Object.freeze(['base', 'tapa', 'interior']);

function leerCabecera(buffer) {
  const largo = buffer.byteLength >= 4 ? new DataView(buffer).getUint32(0, true) : 0;
  if (!largo || 4 + largo > buffer.byteLength) throw new Error('El archivo no es una malla del prototipo.');
  try {
    const cabecera = JSON.parse(new TextDecoder().decode(new Uint8Array(buffer, 4, largo)));
    return { ...cabecera, inicio: 4 + largo };
  } catch (error) {
    throw new Error('La cabecera de la malla está dañada.', { cause: error });
  }
}

function leerParte(buffer, { inicio, escala }, parte) {
  const { grupo, material, vertices, indices, ancho } = parte;
  if (!GRUPOS.includes(grupo)) throw new Error(`La malla tiene un grupo desconocido: ${grupo}`);
  const bloque = (Tipo, desde, cantidad) => {
    const comienzo = inicio + desde;
    if (comienzo + cantidad * Tipo.BYTES_PER_ELEMENT > buffer.byteLength) {
      throw new Error('La malla está incompleta.');
    }
    return new Tipo(buffer, comienzo, cantidad);
  };

  const caras = bloque(ancho === 4 ? Uint32Array : Uint16Array, parte.caras, indices);
  if (caras.some((indice) => indice >= vertices)) throw new Error('La malla tiene un índice sin vértice.');

  return Object.freeze({
    grupo,
    material,
    posiciones: Float32Array.from(bloque(Int16Array, parte.posiciones, vertices * 3), (v) => v / escala),
    normales: bloque(Int8Array, parte.normales, vertices * 3),
    caras,
  });
}

// Devuelve las partes con posiciones en milímetros, centradas en la carcasa.
export function leerMalla(buffer) {
  const cabecera = leerCabecera(buffer);
  if (!(cabecera.escala > 0) || !Array.isArray(cabecera.partes)) {
    throw new Error('La malla no indica su escala o sus partes.');
  }
  return cabecera.partes.map((parte) => leerParte(buffer, cabecera, parte));
}
