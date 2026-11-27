// "Estudio fotográfico": una sola escena 3D que se copia en el lienzo de cada sección.
import { crearDispositivo } from './modelo.js';
import { DIMENSIONES } from './escenas.js';
import { alturaVisible, distanciaCamara } from './pose.js';

const ANGULO = 24;
const DENSIDAD_MAXIMA = 2;

// Paneles de luz que se reflejan en el metal y el vidrio.
function crearEntorno(THREE, renderer) {
  const sala = new THREE.Scene();
  sala.background = new THREE.Color(0x05070c);
  const panel = (ancho, alto, color, fuerza, posicion) => {
    const material = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
    material.color.multiplyScalar(fuerza);
    const malla = new THREE.Mesh(new THREE.PlaneGeometry(ancho, alto), material);
    malla.position.set(...posicion);
    malla.lookAt(0, 0, 0);
    sala.add(malla);
  };
  panel(9, 3, 0xffffff, 3.2, [0, 8, 3]);
  panel(1.4, 9, 0xdbe8ff, 4, [-8, 1, 2]);
  panel(0.8, 9, 0x6fa8ff, 5, [8, 0, -2]);
  panel(6, 1, 0xffe3a8, 1.2, [2, -7, 4]);

  const generador = new THREE.PMREMGenerator(renderer);
  const entorno = generador.fromScene(sala, 0.04).texture;
  generador.dispose();
  return entorno;
}

function luz(THREE, color, intensidad, posicion) {
  const direccional = new THREE.DirectionalLight(color, intensidad);
  direccional.position.set(...posicion);
  return direccional;
}

export function crearEstudio(THREE) {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.setClearColor(0x000000, 0);

  const escena = new THREE.Scene();
  escena.environment = crearEntorno(THREE, renderer);
  escena.add(
    luz(THREE, 0xffffff, 1.5, [-3, 4, 5]),
    luz(THREE, 0x7db1ff, 2.6, [5, 1, -3]),
    luz(THREE, 0xffe0a0, 0.5, [2, -4, 3]),
  );

  const dispositivo = crearDispositivo(THREE);
  const pivote = new THREE.Group();
  pivote.add(dispositivo.grupo);
  escena.add(pivote);

  const camara = new THREE.PerspectiveCamera(ANGULO, 1, 0.1, 100);
  const medida = new THREE.Vector2();
  const objetos = new Set([pivote]);

  // Todos comparten la escena; en cada foto solo se ve uno.
  function mostrarSolo(objeto) {
    if (!objetos.has(objeto)) {
      objetos.add(objeto);
      escena.add(objeto);
    }
    objetos.forEach((otro) => {
      otro.visible = otro === objeto;
    });
  }

  // Ajusta el renderizador al lienzo de destino, encuadra la cámara y copia la imagen.
  function copiar(lienzo, { exposicion, encuadrar }) {
    const densidad = Math.min(window.devicePixelRatio || 1, DENSIDAD_MAXIMA);
    const ancho = Math.round(lienzo.clientWidth * densidad);
    const alto = Math.round(lienzo.clientHeight * densidad);
    if (!ancho || !alto) return false;

    if (lienzo.width !== ancho || lienzo.height !== alto) {
      lienzo.width = ancho;
      lienzo.height = alto;
    }
    renderer.getSize(medida);
    if (medida.x !== ancho || medida.y !== alto) renderer.setSize(ancho, alto, false);

    encuadrar(ancho / alto);
    renderer.toneMappingExposure = exposicion;
    renderer.render(escena, camara);

    const destino = lienzo.getContext('2d');
    destino.clearRect(0, 0, ancho, alto);
    destino.drawImage(renderer.domElement, 0, 0);
    return true;
  }

  function mirar(medidas, aspecto) {
    const visible = alturaVisible({ ...medidas, aspecto });
    camara.aspect = aspecto;
    camara.position.set(0, 0, distanciaCamara(visible, ANGULO));
    camara.updateProjectionMatrix();
    return visible;
  }

  // El dispositivo conceptual, en la pose y con la pantalla de cada sección.
  function pintar(lienzo, { pose, pantalla, exposicion = 1 }) {
    return copiar(lienzo, {
      exposicion,
      encuadrar(aspecto) {
        const visible = mirar({ ...DIMENSIONES, ocupa: pose.ocupa }, aspecto);
        mostrarSolo(pivote);
        dispositivo.mostrar(pantalla);
        dispositivo.grupo.position.set(-pose.fx, -pose.fy, -pose.fz);
        pivote.rotation.set(pose.rx, pose.ry, pose.rz);
        pivote.position.set(pose.dx * visible * aspecto, pose.dy * visible, 0);
      },
    });
  }

  // Otro objeto (el prototipo) con las mismas luces; medidas = { ancho, alto, ocupa }.
  function pintarObjeto(lienzo, objeto, medidas) {
    return copiar(lienzo, {
      exposicion: 1,
      encuadrar(aspecto) {
        mirar(medidas, aspecto);
        mostrarSolo(objeto);
      },
    });
  }

  return { pintar, pintarObjeto, lienzo: renderer.domElement };
}
