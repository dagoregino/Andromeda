// Modelo 3D del prototipo a partir de la malla exportada de Fusion. Recibe Three.js ya cargado.

const MILIMETROS_POR_UNIDAD = 25;
const INCLINACION = 0.62;
// Cuánto sube la tapa al abrirse, en milímetros.
const LEVANTE = 44;

// Colores de la página (css/base.css) para la carcasa; la electrónica conserva los suyos.
const ACABADOS = Object.freeze({
  carcasa: { color: 0x1b3f78, metalness: 0.2, roughness: 0.4, clearcoat: 0.45, clearcoatRoughness: 0.35 },
  letras: { color: 0xfcc605, metalness: 0.1, roughness: 0.35, clearcoat: 0.6 },
  metal: { color: 0xb9c0cc, metalness: 1, roughness: 0.32 },
  pantalla: { color: 0x020305, metalness: 0.1, roughness: 0.08, clearcoat: 1 },
});

// Espacio que ocupa el modelo abierto mientras gira, en unidades de la escena.
export const ENCUADRE = Object.freeze({ ancho: 5.6, alto: 6, ocupa: 0.96 });
// Con la inclinación, la esquina de adelante baja más de lo que sube la de atrás.
const SUBIDA = 0.22;

function crearMalla(THREE, parte, material) {
  const geometria = new THREE.BufferGeometry();
  geometria.setAttribute('position', new THREE.BufferAttribute(parte.posiciones, 3));
  geometria.setAttribute('normal', new THREE.BufferAttribute(parte.normales, 3, true));
  geometria.setIndex(new THREE.BufferAttribute(parte.caras, 1));
  return new THREE.Mesh(geometria, material);
}

export function crearPrototipo(THREE, partes) {
  const materiales = new Map();
  const materialDe = (nombre) => {
    if (!materiales.has(nombre)) {
      const acabado = ACABADOS[nombre] ?? { color: new THREE.Color(nombre), metalness: 0.15, roughness: 0.55 };
      materiales.set(nombre, new THREE.MeshPhysicalMaterial(acabado));
    }
    return materiales.get(nombre);
  };

  const tapa = new THREE.Group();
  const cuerpo = new THREE.Group();
  cuerpo.add(tapa);
  partes.forEach((parte) => {
    (parte.grupo === 'tapa' ? tapa : cuerpo).add(crearMalla(THREE, parte, materialDe(parte.material)));
  });
  // En Fusion el eje vertical es Z; en la escena es Y.
  cuerpo.rotation.x = -Math.PI / 2;
  cuerpo.scale.setScalar(1 / MILIMETROS_POR_UNIDAD);

  const giro = new THREE.Group();
  giro.add(cuerpo);
  const grupo = new THREE.Group();
  grupo.rotation.x = INCLINACION;
  grupo.position.y = SUBIDA;
  grupo.add(giro);

  function colocar({ angulo, abierta }) {
    giro.rotation.y = angulo;
    tapa.position.z = abierta * LEVANTE;
    // El conjunto baja la mitad de lo que sube la tapa para seguir centrado.
    giro.position.y = (-abierta * LEVANTE) / 2 / MILIMETROS_POR_UNIDAD;
  }

  return { grupo, colocar };
}
