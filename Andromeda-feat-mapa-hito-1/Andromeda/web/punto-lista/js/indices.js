// Posiciones del carrusel. Funciones puras.

export function indiceSiguiente(indice, total) {
  return total > 0 ? (indice + 1) % total : 0;
}

export function indiceMasCercano(desplazamiento, inicios) {
  return inicios.reduce(
    (mejor, inicio, indice) =>
      Math.abs(inicio - desplazamiento) < Math.abs(inicios[mejor] - desplazamiento) ? indice : mejor,
    0,
  );
}
