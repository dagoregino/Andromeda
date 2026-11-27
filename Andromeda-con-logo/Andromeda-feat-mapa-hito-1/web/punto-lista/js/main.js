// Arranque de la página: primero lo que funciona sin 3D y después el modelo.
import { ESCENAS } from './escenas.js';
import { crearEscenario } from './escenario.js';
import { iniciarCarrusel } from './carrusel.js';
import { iniciarDemo } from './demo.js';
import { iniciarPortada, iniciarBarraLocal, iniciarApariciones } from './pagina.js';

const URL_THREE = 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

const reducido = window.matchMedia('(prefers-reduced-motion: reduce)');
const entorno = { movimiento: () => !reducido.matches };

const escenarios = [...document.querySelectorAll('[data-escena]')].map((elemento) =>
  crearEscenario(elemento, ESCENAS[elemento.dataset.escena], entorno),
);
const buscar = (nombre) => escenarios.find((escenario) => escenario.nombre === nombre);

iniciarCarrusel(document.querySelector('[data-destacados]'), entorno);
iniciarDemo(document.querySelector('[data-demo]'), buscar('demo'), entorno);
iniciarBarraLocal(document.querySelector('[data-barra-local]'), document.querySelector('.portada'));
iniciarApariciones(document.querySelectorAll('[data-aparece]'), entorno);

function mostrarRespaldo() {
  escenarios.forEach((escenario) => escenario.desconectar());
  document.querySelector('[data-aviso-3d]').hidden = false;
}

async function iniciar3d() {
  try {
    const [THREE, { crearEstudio }] = await Promise.all([import(URL_THREE), import('./estudio.js')]);
    await document.fonts.ready;
    const estudio = crearEstudio(THREE);
    estudio.lienzo.addEventListener('webglcontextlost', mostrarRespaldo);
    iniciarPortada(buscar('hero'), entorno);
    escenarios.forEach((escenario) => escenario.conectar(estudio));
  } catch (error) {
    // Sin conexión al CDN o sin WebGL: se avisa y queda la figura de respaldo.
    console.warn('No se pudo mostrar el modelo 3D:', error);
    mostrarRespaldo();
  }
}

iniciar3d();
