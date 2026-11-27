// Cómo se ve el dispositivo en cada parte de la página.
// pose: rx, ry, rz = giro · ocupa = fracción del lienzo · dx, dy = desplazamiento
// fx, fy, fz = punto del dispositivo que queda en el centro (para acercamientos).

export const DIMENSIONES = Object.freeze({ ancho: 3.2, alto: 4.5, fondo: 0.8 });

const REPOSO = { tipo: 'reposo' };
const VISTA = { rx: 0, ry: 0, rz: 0, ocupa: 0.8, dx: 0, dy: 0, fx: 0, fy: 0, fz: 0 };

function escena(pose, pantalla = REPOSO) {
  return Object.freeze({ pose: Object.freeze({ ...VISTA, ...pose }), pantalla: Object.freeze(pantalla) });
}

export const ESCENAS = Object.freeze({
  'hero-inicio': escena({ rx: 0.55, ry: -2.5, rz: -0.25, ocupa: 0.6 }),
  // Más bajo que el centro para que la palabra del fondo se pueda leer.
  hero: escena({ rx: 0.06, ry: -0.46, rz: -0.05, ocupa: 0.68, dy: -0.15 }),

  voz: escena(
    { rx: -0.32, ry: 0.42, ocupa: 3, dy: -0.1, fx: -0.35, fy: -1.45, fz: 0.4 },
    { tipo: 'escuchando' },
  ),
  pantalla: escena(
    { rx: 0.04, ry: -0.3, ocupa: 1.2, dy: -0.17, fy: 0.62, fz: 0.4 },
    { tipo: 'respuesta', titulo: '¿Cómo llego al estadio?', texto: 'Toma la ruta de ejemplo hacia el Metropolitano.' },
  ),
  boton: escena({ rx: -0.28, ry: -0.5, ocupa: 3.2, dy: -0.1, fx: 0.8, fy: -1.45, fz: 0.45 }, { tipo: 'botones' }),
  libre: escena({ rx: 0.12, ry: 0.62, rz: 0.08, ocupa: 0.66, dy: -0.12 }),
  instrucciones: escena(
    { rx: 0.02, ry: 0.26, ocupa: 0.94, dy: -0.2, fy: 0.3 },
    { tipo: 'instrucciones' },
  ),

  diseno: escena({ rx: 0.08, ry: -0.52, ocupa: 0.82 }),

  demo: escena({ ry: -0.12, ocupa: 0.94 }),
  cierre: escena({ rx: 0.1, ry: 0.5, rz: 0.06, ocupa: 0.88 }),
});
