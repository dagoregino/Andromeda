// Visor de diseño: al abrir una parte, el dispositivo gira hacia ella.
import { ESCENAS } from './escenas.js';

const DURACION = 900;

export function iniciarVisor(raiz, escenario) {
  const botones = [...raiz.querySelectorAll('[data-parte]')];

  function abrir(elegido) {
    botones.forEach((boton) => {
      const abierto = boton === elegido;
      boton.setAttribute('aria-expanded', String(abierto));
      boton.closest('li').classList.toggle('parte--abierta', abierto);
    });
    const nombre = elegido ? `parte-${elegido.dataset.parte}` : 'diseno';
    escenario.cambiar(ESCENAS[nombre], { duracion: DURACION });
  }

  botones.forEach((boton) => {
    boton.addEventListener('click', () => {
      abrir(boton.getAttribute('aria-expanded') === 'true' ? null : boton);
    });
  });
}
