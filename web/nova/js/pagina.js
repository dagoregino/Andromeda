// Movimientos de la página: entrada de la portada, barra flotante y apariciones.
import { ESCENAS } from './escenas.js';
import { limitar } from './pose.js';

const ENTRADA = 2600;
const GIRO_AL_BAJAR = 0.75;

export function iniciarPortada(escenario, { movimiento }) {
  if (!movimiento()) return;
  const final = ESCENAS.hero;
  let pendiente = false;
  let entrando = true;

  escenario.cambiar({ pose: ESCENAS['hero-inicio'].pose, exposicion: 0.05 });
  // La animación empieza cuando el escenario ya sabe que está a la vista.
  setTimeout(() => escenario.cambiar({ pose: final.pose, exposicion: 1 }, { duracion: ENTRADA }), 120);
  setTimeout(() => {
    entrando = false;
    // Si el navegador frenó la animación, el dispositivo igual queda en su pose final.
    escenario.cambiar({ pose: final.pose, exposicion: 1 });
  }, ENTRADA + 240);

  window.addEventListener(
    'scroll',
    () => {
      if (pendiente || entrando || window.scrollY > window.innerHeight * 1.2) return;
      pendiente = true;
      requestAnimationFrame(() => {
        pendiente = false;
        const avance = limitar(window.scrollY / window.innerHeight, 0, 1);
        escenario.cambiar({ pose: { ...final.pose, ry: final.pose.ry + avance * GIRO_AL_BAJAR }, exposicion: 1 });
      });
    },
    { passive: true },
  );
}

export function iniciarBarraLocal(barra, portada) {
  new IntersectionObserver(
    ([entrada]) => barra.classList.toggle('barra-local--visible', !entrada.isIntersecting),
    { rootMargin: '-45% 0px 0px 0px' },
  ).observe(portada);
}

export function iniciarApariciones(elementos, { movimiento }) {
  if (!movimiento()) return;
  const observador = new IntersectionObserver(
    (entradas) => {
      entradas
        .filter((entrada) => entrada.isIntersecting)
        .forEach((entrada) => {
          entrada.target.classList.remove('por-aparecer');
          observador.unobserve(entrada.target);
        });
    },
    { threshold: 0.15 },
  );
  elementos.forEach((elemento) => {
    // Solo se oculta lo que todavía está fuera de la pantalla.
    if (elemento.getBoundingClientRect().top < window.innerHeight) return;
    elemento.classList.add('por-aparecer');
    observador.observe(elemento);
  });
}
