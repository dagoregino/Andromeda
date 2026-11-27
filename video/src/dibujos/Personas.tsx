// Personajes inventados, dibujados como recortes de papel: contorno blanco y colores planos.
// El origen de cada uno está en los pies.
import type { ReactNode } from 'react';
import { C } from '../tema';

export const Recortado = ({ children, borde = 12 }: Readonly<{ children: ReactNode; borde?: number }>) => (
  <>
    <g stroke="#fff" strokeWidth={borde} strokeLinejoin="round" strokeLinecap="round">{children}</g>
    <g>{children}</g>
  </>
);

const Miembro = ({
  x, y, largo, ancho, giro, color,
}: Readonly<{ x: number; y: number; largo: number; ancho: number; giro: number; color: string }>) => (
  <rect x={x - ancho / 2} y={y - ancho / 2} width={ancho} height={largo} rx={ancho / 2} fill={color} transform={`rotate(${giro} ${x} ${y})`} />
);

const Cara = ({ x, y }: Readonly<{ x: number; y: number }>) => (
  <g>
    <circle cx={x - 9} cy={y - 2} r={4} fill={C.oscuro} />
    <circle cx={x + 13} cy={y - 2} r={4} fill={C.oscuro} />
    <path d={`M${x - 7} ${y + 12} q9 9 20 0`} fill="none" stroke={C.oscuro} strokeWidth={3.5} strokeLinecap="round" />
  </g>
);

type Sitio = Readonly<{ x: number; y: number; escala?: number; mira?: 1 | -1 }>;

const situar = ({ x, y, escala = 1, mira = 1 }: Sitio) => `translate(${x} ${y}) scale(${escala * mira} ${escala})`;

// `paso` avanza mientras camina; con 0 queda quieta.
export const Rosa = ({ paso = 0, brazo = 0, ...sitio }: Sitio & { paso?: number; brazo?: number }) => {
  const zancada = Math.sin(paso) * 24;
  const salto = -Math.abs(Math.sin(paso)) * 6;
  const piel = '#a9673f';
  return (
    <g transform={situar(sitio)}>
      <g transform={`translate(0 ${salto})`}>
        <Recortado>
          <Miembro x={-14} y={-82} largo={88} ancho={20} giro={zancada} color={piel} />
          <Miembro x={14} y={-82} largo={88} ancho={20} giro={-zancada} color={piel} />
          <Miembro x={-30} y={-168} largo={82} ancho={19} giro={18 - zancada * 0.6} color={piel} />
          <path d="M-34 -176 Q0 -190 34 -176 L52 -66 Q0 -52 -52 -66 Z" fill={C.rojo} />
          <path d="M-24 -138 L24 -138 L34 -70 Q0 -62 -34 -70 Z" fill={C.amarillo} />
          <circle cx={0} cy={-214} r={34} fill={piel} />
          <path d="M-37 -214 Q-40 -262 2 -258 Q42 -256 37 -220 Q18 -240 -6 -234 Q-28 -232 -37 -214 Z" fill={C.verde} />
          <path d="M-34 -232 l-22 -14 6 26 Z" fill={C.verde} />
          <Miembro x={30} y={-168} largo={82} ancho={19} giro={-18 - brazo + zancada * 0.6} color={piel} />
        </Recortado>
        <Cara x={2} y={-212} />
        <path d="M-14 -112 h28" stroke={C.oscuro} strokeWidth={3} strokeLinecap="round" />
      </g>
    </g>
  );
};

// Emma usa silla de ruedas; `rueda` es el giro acumulado en grados.
export const Emma = ({ rueda = 0, brazo = 0, ...sitio }: Sitio & { rueda?: number; brazo?: number }) => {
  const piel = '#f0b896';
  const pelo = '#b4531f';
  return (
    <g transform={situar(sitio)}>
      <Recortado>
        <path d="M-52 -150 q-10 6 -8 26 l6 62 h20 l-6 -80 Z" fill={C.encima} />
        <path d="M-40 -170 q-30 4 -26 52 l28 4 Z" fill={C.verde} />
        <path d="M-36 -176 Q0 -192 26 -172 L30 -96 L-34 -96 Z" fill={C.azul} />
        <rect x={-34} y={-104} width={100} height={30} rx={15} fill={C.oscuro} />
        <Miembro x={58} y={-88} largo={68} ancho={23} giro={-12} color={C.oscuro} />
        <rect x={62} y={-30} width={40} height={20} rx={9} fill={C.amarillo} />
        <path d="M-30 -214 Q-48 -150 -66 -168 Q-52 -196 -44 -234 Z" fill={pelo} />
        <circle cx={-4} cy={-214} r={33} fill={piel} />
        <path d="M-40 -212 Q-40 -260 0 -256 Q34 -254 32 -226 Q6 -238 -10 -230 Q-22 -222 -26 -204 Z" fill={pelo} />
        <Miembro x={2} y={-160} largo={78} ancho={19} giro={-52 - brazo} color={piel} />
      </Recortado>
      <Cara x={-2} y={-208} />
      {/* Rueda grande y rueda pequeña */}
      <g transform={`translate(-14 -52)`}>
        <circle r={52} fill="none" stroke="#fff" strokeWidth={18} />
        <circle r={52} fill="none" stroke={C.oscuro} strokeWidth={9} />
        <g transform={`rotate(${rueda})`} stroke={C.suave} strokeWidth={4} strokeLinecap="round">
          {[0, 60, 120].map((a) => <path key={a} d="M-45 0H45" transform={`rotate(${a})`} />)}
        </g>
        <circle r={10} fill={C.amarillo} />
      </g>
      <g transform="translate(70 -17)">
        <circle r={17} fill={C.oscuro} stroke="#fff" strokeWidth={5} />
        <circle r={5} fill={C.amarillo} transform={`rotate(${rueda * 2.4})`} />
      </g>
    </g>
  );
};

export const Vecino = ({ color = C.azul, paso = 0, ...sitio }: Sitio & { color?: string; paso?: number }) => {
  const zancada = Math.sin(paso) * 22;
  const piel = '#c98a62';
  return (
    <g transform={situar(sitio)}>
      <Recortado borde={10}>
        <Miembro x={-13} y={-80} largo={86} ancho={19} giro={zancada} color={C.oscuro} />
        <Miembro x={13} y={-80} largo={86} ancho={19} giro={-zancada} color={C.oscuro} />
        <rect x={-30} y={-174} width={60} height={102} rx={24} fill={color} />
        <circle cx={0} cy={-208} r={30} fill={piel} />
        <path d="M-32 -210 Q-30 -248 2 -244 Q34 -244 31 -212 Q10 -230 -32 -210 Z" fill={C.oscuro} />
      </Recortado>
    </g>
  );
};
