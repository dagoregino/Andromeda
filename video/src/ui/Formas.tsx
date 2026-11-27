// Formas de la identidad de la web: estrella, ráfagas, recortes con borde blanco, franja y cinta.
import type { CSSProperties, ReactNode } from 'react';
import { C, SANS } from '../tema';

const ESTRELLA = 'M0 -50 L3.4 -8.3 L19.8 -19.8 L8.3 -3.4 L50 0 L8.3 3.4 L19.8 19.8 L3.4 8.3 L0 50 L-3.4 8.3 L-19.8 19.8 L-8.3 3.4 L-50 0 L-8.3 -3.4 L-19.8 -19.8 L-3.4 -8.3Z';

const BORDE = '11.4,-59.5 10,-23.7 31.9,-45.7 20.8,-19.5 43.2,-26.1 28.9,-10 48,-6 30.3,2.6 49,14.9 24.6,13.5 42.9,37.2 15.3,20.2 25.9,55.3 5.5,23.6 1.2,60.9 -4.8,25 -21.9,52 -16.1,23.2 -37.2,34.8 -26.1,15.7 -45.7,15.8 -30.3,3.8 -50.5,-4.3 -27.2,-8.2 -49.2,-27.1 -19.4,-16.8 -36.7,-48.4 -10.3,-21.9 -13.9,-59.6 -0.5,-25.2';
const RELLENO = '0,-55 4.9,-22.9 20.6,-46.3 15.3,-21 34.1,-30.7 24.1,-13.9 41.9,-13.6 27.5,-2.9 46.3,4.9 24.3,7.9 44.7,25.8 17.1,15.4 32.6,44.9 8.9,20.1 11.5,54.1 0,23.2 -10.7,50.2 -10.4,23.4 -27.2,37.5 -20.6,18.5 -38.1,22 -26.4,8.6 -45.8,4.8 -25.7,-2.7 -48.5,-15.8 -20.2,-11.6 -41,-37 -12.9,-17.8 -22.6,-50.8 -4.8,-22.4';

type Colocado = Readonly<{ x: number; y: number; tam: number; giro?: number; escala?: number; opacidad?: number }>;

const colocar = ({ x, y, tam, giro = 0, escala = 1, opacidad = 1 }: Colocado): CSSProperties => ({
  position: 'absolute',
  left: x - tam / 2,
  top: y - tam / 2,
  width: tam,
  height: tam,
  rotate: `${giro}deg`,
  scale: String(escala),
  opacity: opacidad,
  overflow: 'visible',
});

export const Estrella = ({ color = C.amarillo, ...sitio }: Colocado & { color?: string }) => (
  <svg viewBox="-50 -50 100 100" style={colocar(sitio)}>
    <path d={ESTRELLA} fill={color} />
  </svg>
);

// Ráfaga de dos capas: contorno blanco detrás y relleno de color.
export const Rafaga = ({ color = C.amarillo, ...sitio }: Colocado & { color?: string }) => (
  <svg viewBox="-62 -62 124 124" style={colocar(sitio)}>
    <polygon points={BORDE} fill="none" stroke="#fff" strokeWidth={0.9} strokeLinejoin="round" />
    <polygon points={RELLENO} fill={color} />
    <path d="M-60 -22 L-48 -18 M58 30 L46 27 M8 -61 L10 -50" stroke="#fff" strokeWidth={0.9} fill="none" />
  </svg>
);

export const FORMAS = {
  a: 'polygon(2% 6%, 30% 0, 62% 4%, 100% 0, 97% 48%, 100% 100%, 64% 95%, 32% 100%, 0 96%, 3% 50%)',
  b: 'polygon(0 8%, 34% 0, 58% 6%, 100% 0, 96% 44%, 100% 100%, 60% 93%, 30% 100%, 4% 94%, 8% 50%)',
  c: 'polygon(4% 4%, 40% 9%, 70% 0, 100% 6%, 95% 48%, 100% 96%, 62% 100%, 30% 93%, 0 100%, 5% 46%)',
} as const;

// Recorte de collage: borde blanco irregular alrededor de cualquier contenido.
export const Recorte = ({
  children, forma = 'a', borde = 8, color = C.superficie, giro = 0, sombra = C.negro, style,
}: Readonly<{
  children?: ReactNode; forma?: keyof typeof FORMAS; borde?: number; color?: string; giro?: number;
  sombra?: string; style?: CSSProperties;
}>) => (
  <div style={{ position: 'absolute', rotate: `${giro}deg`, filter: `drop-shadow(14px 18px 0 ${sombra}55)`, ...style }}>
    <div style={{ width: '100%', height: '100%', background: C.puro, clipPath: FORMAS[forma], padding: borde, boxSizing: 'border-box' }}>
      <div style={{ position: 'relative', width: '100%', height: '100%', background: color, clipPath: FORMAS[forma], overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  </div>
);

export const Franja = ({ y, alto = 8, avance = 1 }: Readonly<{ y: number; alto?: number; avance?: number }>) => (
  <div
    style={{
      position: 'absolute', left: 0, top: y, height: alto, width: '100%', transformOrigin: 'left',
      scale: `${avance} 1`,
      background: `linear-gradient(90deg, ${C.verde} 0 33.333%, ${C.amarillo} 33.333% 66.666%, ${C.rojo} 66.666%)`,
    }}
  />
);

// Cinta de texto pequeña que corre por el borde superior, como en las secciones de la web.
export const Cinta = ({ t, y = 30, color = C.suave }: Readonly<{ t: number; y?: number; color?: string }>) => (
  <div style={{ position: 'absolute', left: 0, right: 0, top: y, overflow: 'hidden', whiteSpace: 'pre', opacity: 0.6 }}>
    <div style={{ font: `700 17px/1 ${SANS}`, letterSpacing: '.22em', color, translate: `${-((t * 38) % 520)}px 0` }}>
      {'BAQNOVA   •   PRIMERO PARA SU GENTE   •   '.repeat(8)}
    </div>
  </div>
);
