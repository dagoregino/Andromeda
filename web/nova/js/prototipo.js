// Sección del prototipo: gira despacio y abre la tapa al pasar por el centro de la ventana.
// La malla se descarga solo cuando la sección está cerca.
import { t } from '../../js/idioma.js';
import { leerMalla } from './malla.js';
import { apertura } from './apertura.js';
import { ENCUADRE, crearPrototipo } from './prototipo-modelo.js';

const URL_MALLA = new URL('../modelos/carcasa.bin', import.meta.url);
const ANGULO_INICIAL = -0.5;
const RADIANES_POR_MS = (Math.PI * 2) / 22000;
const SALTO_MAXIMO = 100;
const SUAVIDAD = 140;
const CAMBIO_MINIMO = 0.001;

async function descargarMalla() {
  const respuesta = await fetch(URL_MALLA);
  if (!respuesta.ok) throw new Error(`La malla respondió ${respuesta.status}`);
  return leerMalla(await respuesta.arrayBuffer());
}

export function iniciarPrototipo(seccion, { movimiento }) {
  const hueco = seccion.querySelector('[data-prototipo]');
  const lienzo = hueco.querySelector('canvas');
  const boton = seccion.querySelector('[data-pausa-giro]');
  let girando = movimiento();
  // Con movimiento reducido nada se mueve hasta que la persona lo pida con el botón.
  let animado = girando;
  let estudio = null;
  let modelo = null;
  let visible = false;
  let cuadro = 0;
  let antes = 0;
  let angulo = ANGULO_INICIAL;
  let abierta = 0;
  let pendiente = true;
  // Sin 3D ya no se vuelve a conectar, aunque la descarga termine después.
  let anulado = false;

  function marcarBoton() {
    boton.dataset.estado = girando ? 'andando' : 'pausado';
    boton.setAttribute('aria-label', t(girando ? 'Pausar el giro del prototipo' : 'Girar el prototipo'));
  }

  function avanzar(ahora) {
    const lapso = antes ? Math.min(ahora - antes, SALTO_MAXIMO) : 0;
    antes = ahora;
    const { top, height } = hueco.getBoundingClientRect();
    const meta = animado ? apertura({ arriba: top, alto: height, ventana: window.innerHeight }) : 0;
    const cambio = (meta - abierta) * Math.min(lapso / SUAVIDAD, 1);
    if (girando) angulo += lapso * RADIANES_POR_MS;
    if (Math.abs(cambio) > CAMBIO_MINIMO) abierta += cambio;
    if (girando || pendiente || Math.abs(cambio) > CAMBIO_MINIMO) {
      modelo.colocar({ angulo, abierta });
      if (estudio.pintarObjeto(lienzo, modelo.grupo, ENCUADRE)) {
        hueco.classList.add('escena--lista');
        pendiente = false;
      }
    }
    cuadro = requestAnimationFrame(avanzar);
  }

  // El ciclo solo corre con el modelo listo y a la vista.
  function actualizar() {
    cancelAnimationFrame(cuadro);
    antes = 0;
    pendiente = true;
    if (estudio && modelo && visible) cuadro = requestAnimationFrame(avanzar);
  }

  function desconectar() {
    anulado = true;
    estudio = null;
    boton.hidden = true;
    hueco.classList.remove('escena--lista');
    actualizar();
  }

  async function cargar(THREE, motor) {
    if (anulado) return;
    try {
      const partes = await descargarMalla();
      if (anulado) return;
      modelo = crearPrototipo(THREE, partes);
      estudio = motor;
      boton.hidden = false;
      actualizar();
    } catch (error) {
      console.warn('No se pudo mostrar el prototipo:', error);
      hueco.querySelector('.respaldo span').textContent = t('No se pudo cargar el modelo');
      desconectar();
    }
  }

  function conectar(motor, THREE) {
    const cercania = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        cercania.disconnect();
        cargar(THREE, motor);
      },
      { rootMargin: '800px' },
    );
    cercania.observe(hueco);
  }

  boton.addEventListener('click', () => {
    girando = !girando;
    animado = animado || girando;
    marcarBoton();
  });
  new IntersectionObserver(([entrada]) => {
    visible = entrada.isIntersecting;
    actualizar();
  }).observe(hueco);
  new ResizeObserver(() => {
    pendiente = true;
  }).observe(hueco);
  marcarBoton();

  return { conectar, desconectar };
}
