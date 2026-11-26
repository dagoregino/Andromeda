// Dibuja en un lienzo lo que muestra la pantalla del dispositivo.
import { ajustarLineas } from './texto.js';

export const LIENZO = Object.freeze({ ancho: 650, alto: 600 });

const COLOR = Object.freeze({
  fondoAlto: '#17407a',
  fondoBajo: '#071329',
  texto: '#ffffff',
  suave: '#a9bde0',
  amarillo: '#fcc605',
  rojo: '#f01622',
  boton: 'rgba(255, 255, 255, 0.14)',
});

const FUENTE = 'Inter, "Segoe UI", system-ui, sans-serif';
const MARGEN = 52;
const ONDA = [0.25, 0.5, 0.8, 0.45, 1, 0.65, 0.9, 0.35, 0.7, 0.4, 0.2];

function escribir(ctx, texto, x, y, { tamano, peso = 600, color = COLOR.texto, centrado = false }) {
  ctx.font = `${peso} ${tamano}px ${FUENTE}`;
  ctx.fillStyle = color;
  ctx.textAlign = centrado ? 'center' : 'left';
  ctx.fillText(texto, x, y);
}

function escribirParrafo(ctx, texto, y, opciones) {
  const { tamano, peso = 600, interlinea = 1.25 } = opciones;
  ctx.font = `${peso} ${tamano}px ${FUENTE}`;
  const lineas = ajustarLineas(texto, LIENZO.ancho - MARGEN * 2, (t) => ctx.measureText(t).width);
  lineas.forEach((linea, i) => escribir(ctx, linea, MARGEN, y + i * tamano * interlinea, opciones));
  return y + lineas.length * tamano * interlinea;
}

function caja(ctx, x, y, ancho, alto, radio, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, ancho, alto, radio);
  ctx.fill();
}

function onda(ctx, centroY, altura) {
  const paso = 34;
  const inicio = LIENZO.ancho / 2 - ((ONDA.length - 1) * paso) / 2;
  ONDA.forEach((nivel, i) => {
    const alto = Math.max(14, altura * nivel);
    caja(ctx, inicio + i * paso - 8, centroY - alto / 2, 16, alto, 8, COLOR.amarillo);
  });
}

function anillo(ctx, x, y, radio) {
  ctx.strokeStyle = COLOR.amarillo;
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.arc(x, y, radio, 0, Math.PI * 2);
  ctx.stroke();
}

function nube(ctx, x, y) {
  ctx.fillStyle = COLOR.texto;
  ctx.beginPath();
  ctx.arc(x - 70, y + 20, 55, 0, Math.PI * 2);
  ctx.arc(x, y - 20, 80, 0, Math.PI * 2);
  ctx.arc(x + 80, y + 22, 53, 0, Math.PI * 2);
  ctx.rect(x - 70, y + 20, 150, 55);
  ctx.fill();
}

const centro = LIENZO.ancho / 2;

const MODOS = {
  reposo(ctx) {
    anillo(ctx, centro, 150, 58);
    escribir(ctx, 'Punto Lista', centro, 316, { tamano: 76, peso: 700, centrado: true });
    escribir(ctx, 'Pulsa y pregunta', centro, 376, { tamano: 38, peso: 500, color: COLOR.suave, centrado: true });
    onda(ctx, 488, 80);
  },
  escuchando(ctx) {
    onda(ctx, 260, 250);
    escribir(ctx, 'Te escucho…', centro, 490, { tamano: 58, centrado: true });
  },
  respuesta(ctx, { titulo = '', texto = '' }) {
    caja(ctx, MARGEN, 40, 170, 54, 27, COLOR.amarillo);
    escribir(ctx, 'Ejemplo', MARGEN + 85, 77, { tamano: 28, peso: 700, color: COLOR.fondoBajo, centrado: true });
    const final = escribirParrafo(ctx, titulo, 156, { tamano: 32, peso: 500, color: COLOR.suave });
    escribirParrafo(ctx, texto, final + 48, { tamano: 48 });
  },
  aviso(ctx, { texto = '' }) {
    caja(ctx, 0, 0, LIENZO.ancho, 130, 0, COLOR.rojo);
    escribir(ctx, '⚠ Aviso de ejemplo', MARGEN, 84, { tamano: 44, peso: 700 });
    escribirParrafo(ctx, texto, 214, { tamano: 46 });
  },
  botones(ctx) {
    escribir(ctx, '¿Qué necesitas?', MARGEN, 104, { tamano: 54, peso: 700 });
    ['Cómo llegar', 'Qué hay cerca', 'Avisos'].forEach((opcion, i) => {
      const y = 162 + i * 134;
      caja(ctx, MARGEN, y, LIENZO.ancho - MARGEN * 2, 108, 30, i === 0 ? COLOR.amarillo : COLOR.boton);
      escribir(ctx, opcion, MARGEN + 36, y + 68, { tamano: 42, color: i === 0 ? COLOR.fondoBajo : COLOR.texto });
    });
  },
  nube(ctx) {
    nube(ctx, centro, 230);
    escribir(ctx, 'Conectado a la nube', centro, 440, { tamano: 52, centrado: true });
  },
  instrucciones(ctx) {
    escribir(ctx, 'Así responde', MARGEN, 106, { tamano: 58, peso: 700 });
    ['Lenguaje sencillo', 'Respuestas cortas', 'Si no sabe, lo dice'].forEach((linea, i) => {
      const y = 232 + i * 112;
      caja(ctx, MARGEN, y - 34, 26, 26, 13, COLOR.amarillo);
      escribir(ctx, linea, MARGEN + 58, y - 6, { tamano: 44 });
    });
  },
};

export function dibujarPantalla(ctx, estado) {
  const { ancho, alto } = LIENZO;
  ctx.clearRect(0, 0, ancho, alto);
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(0, 0, ancho, alto, 52);
  ctx.clip();
  const degradado = ctx.createLinearGradient(0, 0, ancho * 0.4, alto);
  degradado.addColorStop(0, COLOR.fondoAlto);
  degradado.addColorStop(1, COLOR.fondoBajo);
  ctx.fillStyle = degradado;
  ctx.fillRect(0, 0, ancho, alto);
  (MODOS[estado.tipo] ?? MODOS.reposo)(ctx, estado);
  ctx.restore();
}
