// Demostración: una pregunta se responde en la pantalla, en texto y, si se pide, en voz alta.
import { PREGUNTAS, validarPreguntas } from './contenido.js';
import { idioma, t } from '../../js/idioma.js';

const ESPERA = 900;

function crearVoz(boton, aviso) {
  const sintesis = window.speechSynthesis;
  let encendida = false;
  if (!sintesis) {
    boton.disabled = true;
    aviso.textContent = t('Tu navegador no permite leer en voz alta.');
  }

  function decir(texto) {
    if (!sintesis || !encendida || !texto) return;
    sintesis.cancel();
    const frase = new SpeechSynthesisUtterance(texto);
    frase.lang = idioma === 'es' ? 'es-CO' : 'en-US';
    frase.onerror = (evento) => {
      if (['canceled', 'interrupted'].includes(evento.error)) return;
      aviso.textContent = t('No se pudo reproducir la voz. La respuesta sigue escrita.');
    };
    sintesis.speak(frase);
  }

  return {
    decir,
    alternar(textoActual) {
      encendida = !encendida;
      boton.setAttribute('aria-pressed', String(encendida));
      aviso.textContent = '';
      if (encendida) decir(textoActual);
      else sintesis?.cancel();
    },
  };
}

export function iniciarDemo(raiz, escenario, { movimiento }) {
  const lista = raiz.querySelector('[data-preguntas]');
  const respuesta = raiz.querySelector('[data-respuesta]');
  const botonVoz = raiz.querySelector('[data-voz]');
  const errores = validarPreguntas(PREGUNTAS);
  if (errores.length) {
    respuesta.textContent = t('La demostración no está disponible. {errores}', { errores: errores.join(' ') });
    botonVoz.disabled = true;
    return;
  }

  const voz = crearVoz(botonVoz, raiz.querySelector('[data-aviso-voz]'));
  let contestado = '';
  let reloj = 0;

  function preguntar({ pregunta, respuesta: original, tipo }, elegido) {
    const texto = t(original);
    clearTimeout(reloj);
    lista.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === elegido)));
    escenario.cambiar({ pantalla: { tipo: 'escuchando' } });
    respuesta.textContent = t('Escuchando…');
    reloj = setTimeout(
      () => {
        contestado = texto;
        escenario.cambiar({ pantalla: { tipo, titulo: t(pregunta), texto } });
        respuesta.textContent = texto;
        voz.decir(texto);
      },
      movimiento() ? ESPERA : 0,
    );
  }

  PREGUNTAS.forEach((item) => {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'pregunta';
    boton.textContent = t(item.pregunta);
    boton.setAttribute('aria-pressed', 'false');
    boton.addEventListener('click', () => preguntar(item, boton));
    lista.append(boton);
  });

  botonVoz.addEventListener('click', () => voz.alternar(contestado));
}
