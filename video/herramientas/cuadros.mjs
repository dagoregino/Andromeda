// Saca cuadros sueltos del video para revisarlos antes del render final.
// Uso: node herramientas/cuadros.mjs [escena=segundos,segundos ...]
//   node herramientas/cuadros.mjs                      → los cuadros de aprobación
//   node herramientas/cuadros.mjs programa=6,12,16     → solo esos
import { bundle } from '@remotion/bundler';
import { openBrowser, renderStill, selectComposition } from '@remotion/renderer';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const POR_DEFECTO = [
  'gancho=1.6,3.8,5.4,7.0,10.2,13.8',
  'problema=8.6,14.8,22.4,32.6',
  'propuesta=4.6,9.4,15.6',
  'programa=3.6,12.4,17.4,22.4,26.4,36.8,39.4,43.2,48.6,53.8,61.8,64.4',
  'demo=2.2,5.6,9.6,13.4,17.2,21.6,25.6,28.0,33.8,36.6,42.4,47.8,53.2',
  'impacto=6.6,12.2',
  'cierre=5.4,10.6',
];

const SALIDA = process.env.SALIDA ?? 'out/cuadros';
const ESCALA = Number(process.env.ESCALA ?? 0.5);
const pedidos = (process.argv.length > 2 ? process.argv.slice(2) : POR_DEFECTO).map((p) => {
  const [id, lista] = p.split('=');
  const segundos = (lista ?? '').split(',').map(Number);
  if (!id || segundos.some(Number.isNaN)) throw new Error(`Formato esperado escena=segundos,…  Recibido: ${p}`);
  return { id, segundos };
});

await mkdir(SALIDA, { recursive: true });
const serveUrl = await bundle({ entryPoint: resolve('src/index.ts'), rspack: true });
const navegador = await openBrowser('chrome');
const fallos = [];
try {
  for (const { id, segundos } of pedidos) {
    const composition = await selectComposition({ serveUrl, id, puppeteerInstance: navegador });
    for (const s of segundos) {
      const frame = Math.min(composition.durationInFrames - 1, Math.round(s * composition.fps));
      const output = `${SALIDA}/${id}-${String(s.toFixed(1)).padStart(4, '0')}.jpg`;
      try {
        await renderStill({
          serveUrl, composition, frame, output, puppeteerInstance: navegador, scale: ESCALA,
          imageFormat: 'jpeg', jpegQuality: 90, overwrite: true,
          onBrowserLog: (m) => m.type === 'error' && fallos.push(`${id}@${s}: ${m.text}`),
        });
      } catch (error) {
        fallos.push(`${id}@${s}: ${error.message.split('\n')[0]}`);
      }
    }
    console.log(id, 'listo');
  }
} finally {
  await navegador.close({ silent: true });
}
if (fallos.length) {
  console.error([...new Set(fallos)].slice(0, 20).join('\n'));
  process.exitCode = 1;
}
