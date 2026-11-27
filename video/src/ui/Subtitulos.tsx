// Subtítulos con la palabra que se está diciendo resaltada. Sirven también de guía para grabar la voz.
import { AbsoluteFill } from 'remotion';
import { rampa, useT, vaiven } from '../anim';
import type { Frase } from '../guion';
import { C } from '../tema';
import { sans } from './Texto';

// Reparte el tiempo de la frase según el largo de cada palabra.
const palabraActual = (frase: Frase, t: number): number => {
  const palabras = frase.texto.split(' ');
  const total = palabras.reduce((n, p) => n + p.length + 1, 0);
  const objetivo = ((t - frase.desde) / ((frase.hasta - frase.desde) * 0.92)) * total;
  let acumulado = 0;
  const i = palabras.findIndex((p) => {
    acumulado += p.length + 1;
    return acumulado > objetivo;
  });
  return i === -1 ? palabras.length : i;
};

export const Subtitulos = ({ frases }: Readonly<{ frases: readonly Frase[] }>) => {
  const t = useT();
  const frase = frases.find((f) => t >= f.desde && t < f.hasta);
  if (!frase) return null;
  const actual = palabraActual(frase, t);
  const k = rampa(t, frase.desde, 0.3) * (1 - vaiven(t, frase.hasta - 0.12, frase.hasta));
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 46, pointerEvents: 'none' }}>
      <div
        style={{
          ...sans(40, 700), maxWidth: 1480, textAlign: 'center', padding: '16px 34px', borderRadius: 22,
          background: 'rgb(4 10 28 / .84)', border: `1px solid ${C.encima}`, opacity: k, translate: `0 ${(1 - k) * 16}px`,
          textWrap: 'balance',
        }}
      >
        {frase.texto.split(' ').map((palabra, i) => (
          <span key={`${palabra}-${i}`} style={{ color: i === actual ? C.amarillo : C.blanco, opacity: i <= actual ? 1 : 0.55 }}>
            {i ? ' ' : ''}
            {palabra}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};
