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

  function pintar(lienzo, { pose, pantalla, exposicion = 1 }) {
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

    const aspecto = ancho / alto;
    const visible = alturaVisible({ ...DIMENSIONES, aspecto, ocupa: pose.ocupa });
    camara.aspect = aspecto;
    camara.position.set(0, 0, distanciaCamara(visible, ANGULO));
    camara.updateProjectionMatrix();

    dispositivo.mostrar(pantalla);
    dispositivo.grupo.position.set(-pose.fx, -pose.fy, -pose.fz);
    pivote.rotation.set(pose.rx, pose.ry, pose.rz);
    pivote.position.set(pose.dx * visible * aspecto, pose.dy * visible, 0);
    renderer.toneMappingExposure = exposicion;
    renderer.render(escena, camara);

    const destino = lienzo.getContext('2d');
    destino.clearRect(0, 0, ancho, alto);
    destino.drawImage(renderer.domElement, 0, 0);
    return true;
  }

  return { pintar, lienzo: renderer.domElement };
}
