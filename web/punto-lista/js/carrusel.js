// Carrusel de destacados: avanza solo, se puede pausar y responde al dedo y al teclado.
import { indiceMasCercano, indiceSiguiente } from './indices.js';

const ESPERA = 5000;

export function iniciarCarrusel(raiz, { movimiento }) {
  const pista = raiz.querySelector('[data-pista]');
  const tarjetas = [...pista.children];
  const puntos = raiz.querySelector('[data-puntos]');
  const pausa = raiz.querySelector('[data-pausa]');
  let indice = 0;
  let activo = movimiento();
  let visible = false;
  let reloj = 0;

  const inicios = () => tarjetas.map((tarjeta) => tarjeta.offsetLeft - tarjetas[0].offsetLeft);

  const botones = tarjetas.map((_, i) => {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'punto';
    boton.setAttribute('aria-label', `Ver destacado ${i + 1} de ${tarjetas.length}`);
    boton.addEventListener('click', () => irA(i));
    puntos.append(boton);
    return boton;
  });

  function marcar() {
    botones.forEach((boton, i) => boton.setAttribute('aria-current', String(i === indice)));
  }

  function programar() {
    clearTimeout(reloj);
    const corriendo = activo && visible;
    raiz.classList.toggle('destacados--andando', corriendo);
    pausa.setAttribute('aria-label', activo ? 'Pausar el recorrido' : 'Reproducir el recorrido');
    pausa.dataset.estado = activo ? 'andando' : 'pausado';
    if (corriendo) reloj = setTimeout(() => irA(indiceSiguiente(indice, tarjetas.length)), ESPERA);
  }

  function irA(nuevo) {
    indice = nuevo;
    pista.scrollTo({ left: inicios()[indice], behavior: movimiento() ? 'smooth' : 'auto' });
    marcar();
    // Reinicia la barra de avance del punto activo.
    raiz.classList.remove('destacados--andando');
    void raiz.offsetWidth;
    programar();
  }

  function detener() {
    if (!activo) return;
    activo = false;
    programar();
  }

  pausa.addEventListener('click', () => {
    activo = !activo;
    programar();
  });
  ['pointerdown', 'wheel', 'keydown'].forEach((tipo) => pista.addEventListener(tipo, detener, { passive: true }));
  pista.addEventListener(
    'scroll',
    () => {
      // Durante el avance automático el índice ya está fijado.
      if (activo) return;
      indice = indiceMasCercano(pista.scrollLeft, inicios());
      marcar();
    },
    { passive: true },
  );
  new IntersectionObserver(
    ([entrada]) => {
      visible = entrada.isIntersecting;
      programar();
    },
    { threshold: 0.4 },
  ).observe(pista);

  marcar();
  programar();
}
