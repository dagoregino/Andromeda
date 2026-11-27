// Cálculos de cámara y movimiento. Funciones puras.

export function limitar(valor, minimo, maximo) {
  return Math.min(Math.max(valor, minimo), maximo);
}

// Salida suave (cúbica): rápido al empezar y lento al llegar.
export function suavizar(avance) {
  return 1 - (1 - limitar(avance, 0, 1)) ** 3;
}

export function interpolarPose(desde, hasta, avance) {
  const claves = new Set([...Object.keys(desde), ...Object.keys(hasta)]);
  return Object.fromEntries(
    [...claves].map((clave) => {
      const inicio = desde[clave] ?? 0;
      const fin = hasta[clave] ?? 0;
      return [clave, inicio + (fin - inicio) * avance];
    }),
  );
}

// Altura que debe ver la cámara para que el objeto ocupe la fracción pedida del lienzo.
export function alturaVisible({ alto, ancho, aspecto, ocupa }) {
  return Math.max(alto / ocupa, ancho / (ocupa * aspecto));
}

export function distanciaCamara(altura, anguloGrados) {
  return altura / (2 * Math.tan((anguloGrados * Math.PI) / 360));
}
