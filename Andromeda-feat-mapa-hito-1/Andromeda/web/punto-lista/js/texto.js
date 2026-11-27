// Ajuste de texto para la pantalla del dispositivo. Sin DOM: recibe la función que mide.

function cortarPalabra(palabra, anchoMax, medir) {
  const trozos = [];
  let trozo = '';
  for (const letra of palabra) {
    if (trozo && medir(trozo + letra) > anchoMax) {
      trozos.push(trozo);
      trozo = letra;
    } else {
      trozo += letra;
    }
  }
  return trozo ? [...trozos, trozo] : trozos;
}

export function ajustarLineas(texto, anchoMax, medir) {
  const palabras = String(texto)
    .split(/\s+/)
    .filter(Boolean)
    .flatMap((palabra) => (medir(palabra) > anchoMax ? cortarPalabra(palabra, anchoMax, medir) : [palabra]));

  return palabras.reduce((lineas, palabra) => {
    const ultima = lineas.at(-1);
    const unida = ultima === undefined ? palabra : `${ultima} ${palabra}`;
    if (ultima !== undefined && medir(unida) <= anchoMax) {
      return [...lineas.slice(0, -1), unida];
    }
    return [...lineas, palabra];
  }, []);
}
