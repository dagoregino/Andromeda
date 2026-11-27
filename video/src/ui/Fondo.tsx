import type { ReactNode } from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { azar } from '../anim';
import { C } from '../tema';

// Grano en movimiento: da textura de papel sin pesar en el render.
const Grano = ({ fuerza }: Readonly<{ fuerza: number }>) => {
  const paso = Math.floor(useCurrentFrame() / 3);
  return (
    <Img
      src={staticFile('grano.png')}
      style={{
        position: 'absolute', width: '112%', height: '112%', left: '-6%', top: '-6%', mixBlendMode: 'overlay',
        opacity: fuerza, pointerEvents: 'none',
        translate: `${(azar(paso) - 0.5) * 80}px ${(azar(paso + 91) - 0.5) * 50}px`,
      }}
    />
  );
};

export const Fondo = ({
  children, color = C.fondo, grano = 0.2,
}: Readonly<{ children: ReactNode; color?: string; grano?: number }>) => (
  <AbsoluteFill style={{ background: color, overflow: 'hidden' }}>
    {children}
    <Grano fuerza={grano} />
    <AbsoluteFill style={{ boxShadow: 'inset 0 0 260px rgb(3 8 24 / .42)', pointerEvents: 'none' }} />
  </AbsoluteFill>
);
