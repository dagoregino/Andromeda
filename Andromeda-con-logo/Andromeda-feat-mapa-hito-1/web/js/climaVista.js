// Línea «Antes de salir»: temperatura, sensación, lluvia y consejos. Todo texto entra con textContent.
// Sin datos no se muestra nada: el bloque queda oculto.
import { textosClima, consejosClima } from './clima.js';

function crear(etiqueta, texto) {
  const elemento = document.createElement(etiqueta);
  elemento.textContent = texto;
  return elemento;
}

/** `raiz` es el bloque [data-clima]; sus partes se buscan por data-clima-*. */
export function crearVistaClima(raiz) {
  const parte = (nombre) => raiz.querySelector(`[data-clima-${nombre}]`);

  function pintar(resumen) {
    raiz.hidden = !resumen;
    if (!resumen) return;
    const textos = textosClima(resumen);
    parte('temperatura').textContent = textos.temperatura;
    parte('sensacion').textContent = textos.sensacion;
    parte('lluvia').textContent = textos.lluvia;
    parte('hora').textContent = resumen.hora;
    const lista = parte('consejos');
    lista.replaceChildren(...consejosClima(resumen).map(({ tipo, texto }) => {
      const consejo = crear('li', texto);
      consejo.dataset.tipo = tipo;
      return consejo;
    }));
    lista.hidden = lista.children.length === 0;
  }

  return { pintar };
}
