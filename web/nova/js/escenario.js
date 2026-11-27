// Un escenario es un hueco de la página donde se ve el dispositivo.
// Funciona sin 3D: en ese caso actualiza la figura de respaldo hecha con CSS.
import { interpolarPose, suavizar } from './pose.js';
import { t } from '../../js/idioma.js';

const TEXTOS = {
  reposo: 'Nova',
  escuchando: 'Te escucho…',
  botones: '¿Qué necesitas?',
  instrucciones: 'Así responde',
};

export function crearEscenario(elemento, inicial, { movimiento }) {
  const lienzo = elemento.querySelector('canvas');
  const respaldo = elemento.querySelector('.respaldo span');
  let actual = { ...inicial, exposicion: 1 };
  let estudio = null;
  let cuadro = 0;
  let cerca = false;

  function pintar() {
    if (respaldo) respaldo.textContent = t(actual.pantalla.texto ?? TEXTOS[actual.pantalla.tipo] ?? TEXTOS.reposo);
    if (estudio && cerca && estudio.pintar(lienzo, actual)) elemento.classList.add('escena--lista');
  }

  // Cambia pose, pantalla o luz; con duración, el cambio se anima.
  function cambiar(cambios, { duracion = 0 } = {}) {
    cancelAnimationFrame(cuadro);
    const origen = actual;
    const destino = { ...actual, ...cambios };
    if (!duracion || !movimiento() || !cerca || !estudio) {
      actual = destino;
      pintar();
      return;
    }
    const comienzo = performance.now();
    const paso = (ahora) => {
      const avance = suavizar((ahora - comienzo) / duracion);
      actual = {
        ...destino,
        pose: interpolarPose(origen.pose, destino.pose, avance),
        exposicion: origen.exposicion + (destino.exposicion - origen.exposicion) * avance,
      };
      pintar();
      if (avance < 1) cuadro = requestAnimationFrame(paso);
    };
    cuadro = requestAnimationFrame(paso);
  }

  // En el carrusel se observa la pista: así las tarjetas ocultas a los lados ya llegan pintadas.
  new IntersectionObserver(
    ([entrada]) => {
      cerca = entrada.isIntersecting;
      pintar();
    },
    { rootMargin: '200px' },
  ).observe(elemento.closest('[data-pista]') ?? elemento);
  new ResizeObserver(pintar).observe(elemento);

  return {
    nombre: elemento.dataset.escena,
    cambiar,
    conectar(motor) {
      estudio = motor;
      pintar();
    },
    desconectar() {
      estudio = null;
      elemento.classList.remove('escena--lista');
    },
  };
}
