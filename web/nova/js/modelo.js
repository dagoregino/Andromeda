// Modelo 3D conceptual del dispositivo. Recibe la librería Three.js ya cargada.
import { DIMENSIONES } from './escenas.js';
import { LIENZO, dibujarPantalla } from './pantalla.js';

const BISEL = 0.14;
const FRENTE = DIMENSIONES.fondo / 2;

function rectanguloRedondeado(THREE, ancho, alto, radio) {
  const x = -ancho / 2;
  const y = -alto / 2;
  const forma = new THREE.Shape();
  forma.moveTo(x + radio, y);
  forma.lineTo(x + ancho - radio, y);
  forma.absarc(x + ancho - radio, y + radio, radio, -Math.PI / 2, 0);
  forma.lineTo(x + ancho, y + alto - radio);
  forma.absarc(x + ancho - radio, y + alto - radio, radio, 0, Math.PI / 2);
  forma.lineTo(x + radio, y + alto);
  forma.absarc(x + radio, y + alto - radio, radio, Math.PI / 2, Math.PI);
  forma.lineTo(x, y + radio);
  forma.absarc(x + radio, y + radio, radio, Math.PI, Math.PI * 1.5);
  return forma;
}

function materiales(THREE) {
  const fisico = (opciones) => new THREE.MeshPhysicalMaterial(opciones);
  return {
    cuerpo: fisico({ color: 0x1b3f78, metalness: 0.78, roughness: 0.34, clearcoat: 0.35, clearcoatRoughness: 0.4 }),
    vidrio: fisico({ color: 0x020305, metalness: 0.1, roughness: 0.06, clearcoat: 1 }),
    metal: fisico({ color: 0x8ea6cc, metalness: 1, roughness: 0.24 }),
    hueco: fisico({ color: 0x010204, metalness: 0.2, roughness: 0.75 }),
    rejilla: fisico({ color: 0x5675a8, metalness: 0.85, roughness: 0.48 }),
    boton: fisico({ color: 0xfcc605, metalness: 0.15, roughness: 0.28, clearcoat: 0.8 }),
  };
}

function crearCuerpo(THREE, material) {
  const forma = rectanguloRedondeado(THREE, DIMENSIONES.ancho - BISEL * 2, DIMENSIONES.alto - BISEL * 2, 0.44);
  const geometria = new THREE.ExtrudeGeometry(forma, {
    depth: DIMENSIONES.fondo - BISEL * 2,
    bevelThickness: BISEL,
    bevelSize: BISEL,
    bevelSegments: 12,
    curveSegments: 40,
  });
  geometria.center();
  return new THREE.Mesh(geometria, material);
}

function crearPlaca(THREE, ancho, alto, radio, material, posicion) {
  const geometria = new THREE.ShapeGeometry(rectanguloRedondeado(THREE, ancho, alto, radio), 32);
  const malla = new THREE.Mesh(geometria, material);
  malla.position.set(...posicion);
  return malla;
}

function crearParlante(THREE, { hueco: material, metal: borde, rejilla }, x, y) {
  const paso = 0.1;
  const radio = 0.52;
  const puntos = [];
  for (let fila = -6; fila <= 6; fila += 1) {
    for (let columna = -6; columna <= 6; columna += 1) {
      const px = (columna + (fila % 2 ? 0.5 : 0)) * paso;
      const py = fila * paso * 0.87;
      if (Math.hypot(px, py) <= radio) puntos.push([x + px, y + py]);
    }
  }
  const huecos = new THREE.InstancedMesh(new THREE.CircleGeometry(0.031, 16), material, puntos.length);
  const matriz = new THREE.Matrix4();
  puntos.forEach(([px, py], i) => huecos.setMatrixAt(i, matriz.makeTranslation(px, py, FRENTE + 0.006)));
  // Un disco más claro detrás de los huecos hace visible la rejilla desde lejos.
  const disco = new THREE.Mesh(new THREE.CircleGeometry(radio + 0.09, 64), rejilla);
  disco.position.set(x, y, FRENTE + 0.003);
  const aro = new THREE.Mesh(new THREE.TorusGeometry(radio + 0.09, 0.012, 12, 96), borde);
  aro.position.set(x, y, FRENTE + 0.006);
  return [disco, huecos, aro];
}

function crearBoton(THREE, { boton, metal }, x, y) {
  const perfil = [
    [0, 0],
    [0.34, 0],
    [0.34, 0.07],
    [0.315, 0.11],
    [0.26, 0.128],
    [0, 0.14],
  ].map(([r, h]) => new THREE.Vector2(r, h));
  const tecla = new THREE.Mesh(new THREE.LatheGeometry(perfil, 64), boton);
  tecla.rotation.x = Math.PI / 2;
  tecla.position.set(x, y, FRENTE);
  const aro = new THREE.Mesh(new THREE.TorusGeometry(0.405, 0.028, 20, 80), metal);
  aro.position.set(x, y, FRENTE + 0.008);
  return [tecla, aro];
}

function crearDetalles(THREE, { hueco, metal }) {
  const microfonos = [-0.13, 0.13].flatMap((x) => {
    const orificio = new THREE.Mesh(new THREE.CircleGeometry(0.036, 24), hueco);
    orificio.position.set(x, 2.07, FRENTE + 0.003);
    const aro = new THREE.Mesh(new THREE.TorusGeometry(0.046, 0.007, 12, 40), metal);
    aro.position.set(x, 2.07, FRENTE + 0.004);
    return [orificio, aro];
  });
  const puerto = new THREE.Mesh(
    new THREE.ShapeGeometry(rectanguloRedondeado(THREE, 0.52, 0.17, 0.08), 16),
    hueco,
  );
  puerto.rotation.x = Math.PI / 2;
  puerto.position.set(0, -DIMENSIONES.alto / 2 - 0.003, 0);
  const borde = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.012, 12, 40), metal);
  borde.rotation.x = Math.PI / 2;
  borde.scale.set(2.7, 0.95, 1);
  borde.position.copy(puerto.position);
  return [...microfonos, puerto, borde];
}

export function crearDispositivo(THREE) {
  const mat = materiales(THREE);
  const lienzo = Object.assign(document.createElement('canvas'), { width: LIENZO.ancho, height: LIENZO.alto });
  const contexto = lienzo.getContext('2d');
  const textura = new THREE.CanvasTexture(lienzo);
  textura.colorSpace = THREE.SRGBColorSpace;
  textura.anisotropy = 8;

  const geometriaPantalla = new THREE.PlaneGeometry(2.7, 2.7 * (LIENZO.alto / LIENZO.ancho));
  const imagen = new THREE.Mesh(
    geometriaPantalla,
    new THREE.MeshBasicMaterial({ map: textura, transparent: true, toneMapped: false }),
  );
  imagen.position.set(0, 0.62, FRENTE + 0.008);

  const grupo = new THREE.Group();
  grupo.add(
    crearCuerpo(THREE, mat.cuerpo),
    crearPlaca(THREE, 2.9, 2.7, 0.3, mat.vidrio, [0, 0.62, FRENTE + 0.004]),
    imagen,
    ...crearParlante(THREE, mat, -0.5, -1.47),
    ...crearBoton(THREE, mat, 0.85, -1.47),
    ...crearDetalles(THREE, mat),
  );

  let dibujado = '';
  function mostrar(estado) {
    const clave = JSON.stringify(estado);
    if (clave === dibujado) return;
    dibujado = clave;
    dibujarPantalla(contexto, estado);
    textura.needsUpdate = true;
  }

  return { grupo, mostrar };
}
