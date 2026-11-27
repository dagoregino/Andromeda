// Ayudas para crear los elementos de los recorridos. El texto siempre entra con textContent.

export function crear(etiqueta, clase = '', texto = '') {
  const nodo = document.createElement(etiqueta);
  if (clase) nodo.className = clase;
  if (texto) nodo.textContent = texto;
  return nodo;
}

export function crearBoton(clase, texto, alPulsar) {
  const boton = crear('button', clase, texto);
  boton.type = 'button';
  if (alPulsar) boton.addEventListener('click', alPulsar);
  return boton;
}
