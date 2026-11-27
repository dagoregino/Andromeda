// Graba una pestaña de Chromium como MP4 usando las capturas continuas de DevTools,
// con un cursor visible y movimientos suaves.
import { chromium } from 'playwright';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

export const VISTA = Object.freeze({ width: 1600, height: 900 });
const ESCALA = 1.2;
const CALIDAD_JPEG = 92;
const FPS = 30;

export function abrirNavegador() {
  return chromium.launch({
    args: [`--force-device-scale-factor=${ESCALA}`, '--use-angle=d3d11', '--ignore-gpu-blocklist', '--hide-scrollbars'],
  });
}

// El navegador sin ventana no dibuja el puntero: se pinta uno propio que sigue al ratón.
function ponerCursor() {
  const montar = () => {
    const NS = 'http://www.w3.org/2000/svg';
    const cursor = document.createElement('div');
    Object.assign(cursor.style, {
      position: 'fixed', left: '0', top: '0', width: '34px', height: '34px', zIndex: '2147483647',
      pointerEvents: 'none', transform: 'translate(-80px, -80px)',
      filter: 'drop-shadow(0 3px 6px rgba(0,0,0,.45))',
    });
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '34');
    svg.setAttribute('height', '34');
    const flecha = document.createElementNS(NS, 'path');
    flecha.setAttribute('d', 'M4 2l16 11h-7.2l4 8.2-3.4 1.6-4-8.4L4 19.6z');
    flecha.setAttribute('fill', '#fcc605');
    flecha.setAttribute('stroke', '#1d1d1f');
    flecha.setAttribute('stroke-width', '1.4');
    svg.append(flecha);
    cursor.append(svg);
    document.documentElement.append(cursor);
    addEventListener('mousemove', (e) => {
      cursor.style.transform = `translate(${e.clientX - 5}px, ${e.clientY - 3}px)`;
    }, true);
    addEventListener('mousedown', (e) => {
      const onda = document.createElement('div');
      Object.assign(onda.style, {
        position: 'fixed', left: `${e.clientX - 30}px`, top: `${e.clientY - 30}px`, width: '60px',
        height: '60px', borderRadius: '50%', border: '4px solid #fcc605', zIndex: '2147483646',
        pointerEvents: 'none',
      });
      document.documentElement.append(onda);
      onda.animate([{ transform: 'scale(.2)', opacity: 1 }, { transform: 'scale(1.5)', opacity: 0 }], { duration: 550, easing: 'ease-out' })
        .finished.then(() => onda.remove());
    }, true);
  };
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', montar);
  else montar();
}

export async function abrirPagina(navegador, url) {
  const contexto = await navegador.newContext({
    viewport: VISTA, deviceScaleFactor: ESCALA, locale: 'es-CO', bypassCSP: true,
  });
  await contexto.addInitScript(ponerCursor);
  const pagina = await contexto.newPage();
  await pagina.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
  return pagina;
}

let ultimoPunto = { x: VISTA.width * 0.62, y: VISTA.height * 0.72 };

const suavizar = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export async function mover(pagina, x, y, ms = 700) {
  const desde = ultimoPunto;
  const inicio = Date.now();
  let t = 0;
  while (t < 1) {
    t = Math.min(1, (Date.now() - inicio) / ms);
    const k = suavizar(t);
    await pagina.mouse.move(desde.x + (x - desde.x) * k, desde.y + (y - desde.y) * k);
    await pagina.waitForTimeout(16);
  }
  ultimoPunto = { x, y };
}

export async function centroDe(localizador) {
  const caja = await localizador.boundingBox();
  if (!caja) throw new Error(`No está visible: ${localizador}`);
  return { x: caja.x + caja.width / 2, y: caja.y + caja.height / 2, caja };
}

export async function tocar(pagina, localizador, ms = 700) {
  const { x, y } = await centroDe(localizador);
  await mover(pagina, x, y, ms);
  await pagina.waitForTimeout(180);
  await pagina.mouse.down();
  await pagina.waitForTimeout(90);
  await pagina.mouse.up();
}

// Desplaza la ventana, o un contenedor, hasta dejar el elemento a la altura pedida (0 arriba, 1 abajo).
export async function desplazarA(localizador, altura = 0.12, ms = 900) {
  await localizador.evaluate(async (elemento, { altura, ms }) => {
    let marco = elemento.parentElement;
    while (marco && !(marco.scrollHeight > marco.clientHeight + 4 && /(auto|scroll)/.test(getComputedStyle(marco).overflowY))) {
      marco = marco.parentElement;
    }
    const raiz = marco ?? document.scrollingElement;
    document.documentElement.style.scrollBehavior = 'auto';
    const alto = marco ? marco.getBoundingClientRect() : { top: 0, height: innerHeight };
    const desde = raiz.scrollTop;
    const hasta = desde + elemento.getBoundingClientRect().top - alto.top - alto.height * altura;
    const inicio = performance.now();
    await new Promise((listo) => {
      const paso = (ahora) => {
        const t = Math.min(1, (ahora - inicio) / ms);
        const k = t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
        raiz.scrollTop = desde + (hasta - desde) * k;
        if (t < 1) requestAnimationFrame(paso);
        else listo();
      };
      requestAnimationFrame(paso);
    });
  }, { altura, ms });
}

// Graba lo que ocurra mientras corre `acciones` y devuelve la duración y las marcas de tiempo.
export async function grabar(pagina, nombre, destino, acciones) {
  const temporal = join(tmpdir(), `baqnova-clip-${nombre}`);
  await rm(temporal, { recursive: true, force: true });
  await mkdir(temporal, { recursive: true });
  await mkdir(destino, { recursive: true });

  const sesion = await pagina.context().newCDPSession(pagina);
  const cuadros = [];
  const escrituras = [];
  sesion.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
    const archivo = join(temporal, `${String(cuadros.length).padStart(5, '0')}.jpg`);
    cuadros.push({ archivo, t: metadata.timestamp });
    escrituras.push(writeFile(archivo, Buffer.from(data, 'base64')));
    sesion.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
  });
  await sesion.send('Page.startScreencast', {
    format: 'jpeg', quality: CALIDAD_JPEG, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1,
  });
  // Un movimiento mínimo obliga a emitir el primer cuadro.
  await pagina.mouse.move(ultimoPunto.x, ultimoPunto.y);

  const marcas = {};
  const inicio = Date.now() / 1000;
  const marcar = (clave, extra = {}) => { marcas[clave] = { t: Number((Date.now() / 1000 - inicio).toFixed(2)), ...extra }; };
  await acciones(marcar);
  const fin = Date.now() / 1000;
  await sesion.send('Page.stopScreencast');
  await Promise.all(escrituras);
  if (cuadros.length < 2) throw new Error(`${nombre}: no se capturaron cuadros`);

  const lineas = cuadros.flatMap((cuadro, i) => {
    const desde = i === 0 ? inicio : cuadro.t;
    const hasta = cuadros[i + 1]?.t ?? fin;
    return [`file '${cuadro.archivo.replaceAll('\\', '/')}'`, `duration ${Math.max(0.001, hasta - desde).toFixed(4)}`];
  });
  const lista = join(temporal, 'lista.txt');
  await writeFile(lista, [...lineas, `file '${cuadros.at(-1).archivo.replaceAll('\\', '/')}'`].join('\n'));
  const salida = resolve(destino, `${nombre}.mp4`);
  execFileSync('ffmpeg', [
    '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lista,
    '-vf', `scale=1920:1080:flags=lanczos,fps=${FPS}`, '-t', (fin - inicio).toFixed(3),
    '-c:v', 'libx264', '-crf', '17', '-preset', 'medium',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart', salida,
  ]);
  await rm(temporal, { recursive: true, force: true });
  return { duracion: Number((fin - inicio).toFixed(2)), cuadrosCapturados: cuadros.length, marcas };
}
