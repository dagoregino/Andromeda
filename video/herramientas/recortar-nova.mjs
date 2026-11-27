// Une las mejores partes de las dos grabaciones del dispositivo real en public/clips/nova-real.mp4.
// Uso: node herramientas/recortar-nova.mjs "<video del saludo>" "<video de la ruta>"
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

// [video (0 o 1), desde, hasta] en segundos de la grabación original.
// El montaje (src/escenas/NovaReal.tsx) cuenta con estas duraciones: si cambian, hay que ajustarlo.
const TRAMOS = [
  [0, 9.2, 10.75], //  «Hola, ¿cómo te llamas?»
  [0, 13.5, 20.2], //  Nova se presenta y pregunta desde dónde sales
  [1, 8.45, 10.35], // «Quiero ir al estadio Metropolitano»
  [1, 13.15, 25.0], // Nova da la ruta y la advertencia de la caminata
];
const FUNDIDO = 0.04;

const entradas = process.argv.slice(2);
if (entradas.length !== 2 || !entradas.every((ruta) => existsSync(ruta))) {
  console.error('Indica las dos grabaciones: primero la del saludo y después la de la ruta.');
  process.exit(1);
}

const filtros = TRAMOS.flatMap(([video, desde, hasta], i) => {
  const dura = (hasta - desde).toFixed(3);
  return [
    `[${video}:v]trim=${desde}:${hasta},setpts=PTS-STARTPTS,fps=30,scale=576:1024,setsar=1,format=yuv420p[v${i}]`,
    `[${video}:a]atrim=${desde}:${hasta},asetpts=PTS-STARTPTS,afade=t=in:d=${FUNDIDO},afade=t=out:st=${(dura - FUNDIDO).toFixed(3)}:d=${FUNDIDO}[a${i}]`,
  ];
});
const union = `${TRAMOS.map((_, i) => `[v${i}][a${i}]`).join('')}concat=n=${TRAMOS.length}:v=1:a=1[v][junto]`;
// Quita zumbido y algo de ruido de fondo, y deja la voz a un nivel parejo.
const limpieza = '[junto]highpass=f=120,afftdn=nr=10:nf=-35,loudnorm=I=-16:TP=-2:LRA=9,aresample=48000[a]';

execFileSync('ffmpeg', [
  '-y', '-loglevel', 'error', ...entradas.flatMap((ruta) => ['-i', ruta]),
  '-filter_complex', [...filtros, union, limpieza].join(';'), '-map', '[v]', '-map', '[a]',
  '-c:v', 'libx264', '-crf', '17', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', 'public/clips/nova-real.mp4',
], { stdio: 'inherit' });

const total = TRAMOS.reduce((suma, [, desde, hasta]) => suma + hasta - desde, 0);
console.log(`public/clips/nova-real.mp4 · ${total.toFixed(2)} s`);
