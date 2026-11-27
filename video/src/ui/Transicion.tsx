// Barrido tricolor entre escenas: tres paños inclinados cruzan la pantalla y tapan el corte.
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { vaiven } from '../anim';
import { C, FPS } from '../tema';

export const MEDIA_TRANSICION = 14;

const PANOS = [
  { color: C.verde, retraso: 0 },
  { color: C.amarillo, retraso: 0.05 },
  { color: C.fondo, retraso: 0.11 },
] as const;

// El componente vive en una secuencia de 2 × MEDIA_TRANSICION cuadros centrada en el corte.
export const Barrido = () => {
  const t = useCurrentFrame() / FPS;
  const total = (MEDIA_TRANSICION * 2) / FPS;
  const medio = total / 2;
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {PANOS.map(({ color, retraso }) => {
        const entra = vaiven(t, retraso, medio);
        const sale = vaiven(t, medio, total - 0.12 + retraso);
        return (
          <div
            key={color}
            style={{
              position: 'absolute', top: -20, bottom: -20, left: -260, width: 2440, background: color,
              clipPath: 'polygon(240px 0, 100% 0, calc(100% - 240px) 100%, 0 100%)',
              translate: `${-2460 + entra * 2460 + sale * 2460}px 0`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
