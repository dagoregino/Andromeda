// Dibuja un cuadro por segundo de cada escena, y los cortes, para comprobar que ninguno falla.
// Uso: node herramientas/barrido.mjs
import { bundle } from '@remotion/bundler';
import { openBrowser, renderStill, selectComposition } from '@remotion/renderer';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const serveUrl = await bundle({ entryPoint: resolve('src/index.ts'), rspack: true });
const navegador = await openBrowser('chrome');
const salida = join(tmpdir(), 'baqnova-barrido.jpg');
const fallos = [];
let revisados = 0;
const probar = async (composition, frame) => {
  revisados += 1;
  await renderStill({
    serveUrl, composition, frame, output: salida, puppeteerInstance: navegador, scale: 0.25,
    imageFormat: 'jpeg', overwrite: true,
    onBrowserLog: (m) => m.type === 'error' && fallos.push(`${composition.id}@${frame}: ${m.text.split('\n')[0]}`),
  }).catch((error) => fallos.push(`${composition.id}@${frame}: ${error.message.split('\n')[0]}`));
};
try {
  const completo = await selectComposition({ serveUrl, id: 'BaqNova', puppeteerInstance: navegador });
  console.log('duración', (completo.durationInFrames / completo.fps).toFixed(1), 's');
  for (let frame = 0; frame < completo.durationInFrames; frame += completo.fps) await probar(completo, frame);
  await probar(completo, completo.durationInFrames - 1);
} finally {
  await navegador.close({ silent: true });
}
console.log(`${revisados} cuadros revisados, ${fallos.length} fallos`);
if (fallos.length) {
  console.error([...new Set(fallos)].slice(0, 15).join('\n'));
  process.exitCode = 1;
}
