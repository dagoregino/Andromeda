// 1. Gancho: cuatro golpes de lo que está pasando, silencio y la pregunta.
import type { ReactNode } from 'react';
import { AbsoluteFill } from 'remotion';
import { azar, mezclar, rampa, rebote, tramo, useT, vaiven } from '../anim';
import { Agua, Lluvia } from '../dibujos/Clima';
import { Bus, Edificio, Horizonte, Paradero } from '../dibujos/Ciudad';
import { Recortado, Vecino } from '../dibujos/Personas';
import { ALTO, ANCHO, C } from '../tema';
import { Fondo } from '../ui/Fondo';
import { Estrella, Franja, Rafaga, Recorte } from '../ui/Formas';
import { Icono } from '../ui/Iconos';
import { Titular, sans, serif } from '../ui/Texto';

const Lienzo = ({ children }: Readonly<{ children: ReactNode }>) => (
  <svg width={ANCHO} height={ALTO} viewBox={`0 0 ${ANCHO} ${ALTO}`} style={{ position: 'absolute', inset: 0 }}>{children}</svg>
);

// Cada golpe entra con un acercamiento corto, como un corte de cámara.
const Golpe = ({ t, desde, hasta, children }: Readonly<{ t: number; desde: number; hasta: number; children: ReactNode }>) => {
  if (t < desde || t >= hasta) return null;
  const k = rampa(t, desde, 0.5);
  return <AbsoluteFill style={{ scale: String(mezclar(1.14, 1, k) + (t - desde) * 0.018) }}>{children}</AbsoluteFill>;
};

const Palabra = ({ t, desde, texto, color = C.blanco }: Readonly<{ t: number; desde: number; texto: string; color?: string }>) => (
  <div style={{ position: 'absolute', left: 110, top: 100 }}>
    <Titular t={t} desde={desde + 0.12} texto={texto} tam={190} color={color} style={{ maxWidth: 1100, textShadow: '0 12px 40px rgb(0 0 0 / .55)' }} />
  </div>
);

const Llueve = ({ t }: Readonly<{ t: number }>) => {
  const rayo = Math.max(tramo(t, 0.9, 1.15, 0.03, 0.2), tramo(t, 1.3, 1.45, 0.02, 0.12) * 0.6);
  return (
    <Fondo color="#081433">
      <Lienzo>
        <Horizonte y={ALTO} desde={-40} hasta={ANCHO} alto={620} semilla={9} color="#142a63" />
        <Horizonte y={ALTO + 60} desde={-110} hasta={ANCHO} alto={420} semilla={21} color={C.superficie} />
        <path d="M1480 -20 L1370 330 L1460 320 L1340 700 L1610 250 L1505 262 L1600 -20 Z" fill={C.amarillo} stroke="#fff" strokeWidth={8} opacity={rayo} />
      </Lienzo>
      <Lluvia t={t} fuerza={rampa(t, 0.1, 0.8)} gotas={190} />
      <AbsoluteFill style={{ background: '#dfeaff', opacity: rayo * 0.35 }} />
      <Palabra t={t} desde={0.35} texto="Llueve" />
    </Fondo>
  );
};

const Rio = ({ t }: Readonly<{ t: number }>) => {
  const sube = mezclar(940, 660, vaiven(t, 2.4, 4.2));
  return (
    <Fondo color="#0a1a44">
      <Lienzo>
        <Horizonte y={800} desde={-40} hasta={ANCHO} alto={470} semilla={33} color={C.superficie} />
        <Agua t={t} y={sube} />
        {[0, 1, 2, 3, 4].map((i) => {
          const x = ((azar(i) * 2100 + t * (260 + i * 60)) % 2200) - 140;
          const y = sube + 36 + azar(i + 5) * 170 + Math.sin(t * 6 + i) * 14;
          return (
            <g key={i} transform={`translate(${x} ${y}) rotate(${Math.sin(t * 3 + i) * 32})`}>
              <Recortado borde={9}>
                {i % 2 ? <rect x={-22} y={-48} width={44} height={96} rx={16} fill="#9fe0c0" /> : <path d="M-60 0 q30 -52 70 -8 q36 6 46 24 q-70 40 -116 -16Z" fill={i ? C.naranja : C.amarillo} />}
              </Recortado>
            </g>
          );
        })}
      </Lienzo>
      <Lluvia t={t} fuerza={0.8} />
      <Palabra t={t} desde={2.4} texto="La calle es río" color={C.amarillo} />
    </Fondo>
  );
};

const SinBus = ({ t }: Readonly<{ t: number }>) => (
  <Fondo color="#17306d">
    <Lienzo>
      <Horizonte y={900} desde={-40} hasta={ANCHO} alto={380} semilla={47} color={C.superficie} />
      <rect y={900} width={ANCHO} height={180} fill={C.hondo} />
      <g opacity={0.2}><Bus x={mezclar(2250, 1900, vaiven(t, 4.4, 6))} y={900} color={C.suave} /></g>
      <Paradero x={1120} y={900} />
      {[880, 1010, 1150, 1270].map((x, i) => <Vecino key={x} x={x} y={900 + (i % 2) * 14} escala={1.08} color={[C.rojo, C.amarillo, C.verde, C.azul][i]} mira={i % 2 ? -1 : 1} />)}
      <g transform="translate(1640 330)">
        <circle r={150} fill={C.blanco} stroke={C.rojo} strokeWidth={22} />
        <path d="M0 0V-104" stroke={C.oscuro} strokeWidth={14} strokeLinecap="round" transform={`rotate(${(t - 4.4) * 620})`} />
        <path d="M0 0V-66" stroke={C.oscuro} strokeWidth={18} strokeLinecap="round" transform={`rotate(${(t - 4.4) * 90 + 40})`} />
        <circle r={15} fill={C.rojo} />
      </g>
    </Lienzo>
    <Lluvia t={t} fuerza={0.55} />
    <Palabra t={t} desde={4.4} texto="Sin bus" />
  </Fondo>
);

const SinLuz = ({ t }: Readonly<{ t: number }>) => {
  const parpadeo = t < 6.9 ? 1 : t < 7.5 ? (Math.floor(t * 22) % 3 === 0 ? 0.85 : 0.12) : 0;
  return (
    <Fondo color={parpadeo > 0.5 ? '#12245a' : '#050a1c'}>
      <Lienzo>
        {[40, 320, 1520, 1740].map((x, i) => <Edificio key={x} x={x} y={900} ancho={230} alto={330 + i * 60} color={C.hondo} semilla={i + 2} luz={parpadeo} />)}
        <g transform="translate(1140 900)">
          <Recortado borde={16}>
            <path d="M-380 -400 L0 -660 L380 -400 Z" fill={C.rojo} />
            <rect x={-320} y={-402} width={640} height={402} fill={parpadeo > 0.5 ? C.encima : '#101c45'} />
          </Recortado>
          {[-250, 90].map((x) => (
            <g key={x}>
              <rect x={x} y={-330} width={160} height={150} rx={12} fill={C.amarillo} opacity={0.06 + parpadeo * 0.94} />
              <path d={`M${x + 80} -330v150M${x} -255h160`} stroke={C.hondo} strokeWidth={12} />
            </g>
          ))}
          <rect x={-62} y={-200} width={124} height={200} rx={14} fill={C.hondo} />
        </g>
        <rect y={900} width={ANCHO} height={180} fill="#040918" />
      </Lienzo>
      <Palabra t={t} desde={6.2} texto="Sin luz" color={parpadeo > 0.5 ? C.blanco : C.suave} />
    </Fondo>
  );
};

const MINI = [
  { icono: 'lluvia', texto: 'Lluvia', x: 100, y: 100, giro: -7, color: C.azul },
  { icono: 'arroyo', texto: 'Arroyos', x: 1440, y: 90, giro: 6, color: C.verde },
  { icono: 'bus', texto: 'Transporte', x: 130, y: 640, giro: 5, color: C.rojo },
  { icono: 'rayo', texto: 'Energía', x: 1430, y: 640, giro: -5, color: C.encima },
] as const;

const Pasando = ({ t }: Readonly<{ t: number }>) => (
  <Fondo>
    <Rafaga x={960} y={490} tam={1250} color={C.rojo} giro={t * 9} escala={rebote(t, 8.5, 90, 12)} />
    {MINI.map((m, i) => (
      <Recorte key={m.texto} forma={i % 2 ? 'b' : 'c'} color={m.color} giro={m.giro + Math.sin(t * 2 + i) * 1.5} style={{ left: m.x, top: m.y, width: 380, height: 280, scale: String(rebote(t, 8.55 + i * 0.12)) }}>
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <Icono nombre={m.icono} tam={120} grosor={2.6} />
          <div style={sans(34, 700)}>{m.texto}</div>
        </AbsoluteFill>
      </Recorte>
    ))}
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: 90 }}>
      <div style={{ ...serif(190), textAlign: 'center', scale: String(mezclar(2.2, 1, rampa(t, 9.2, 0.45))), opacity: rampa(t, 9.2, 0.15), rotate: '-3deg', textShadow: '0 16px 0 rgb(0 0 0 / .35)' }}>
        Está<br />pasando
      </div>
    </AbsoluteFill>
  </Fondo>
);

const Pregunta = ({ t }: Readonly<{ t: number }>) => (
  <Fondo color="#060f2b">
    <Rafaga x={1600} y={270} tam={430} color={C.amarillo} giro={-t * 14} escala={rebote(t, 13.2)} />
    <svg width={ANCHO} height={ALTO} style={{ position: 'absolute', inset: 0, opacity: rampa(t, 13.2, 0.6) }}>
      {/* Balón que gira: el Mundial llega a la ciudad. */}
      <g transform={`translate(1600 270) rotate(${t * 70})`} stroke={C.oscuro} strokeWidth={6} strokeLinejoin="round">
        <circle r={108} fill={C.blanco} />
        <path d="M0 -38 L36 -12 L22 31 L-22 31 L-36 -12 Z" fill={C.oscuro} />
        {[0, 72, 144, 216, 288].map((giro) => (
          <g key={giro} transform={`rotate(${giro})`}>
            <path d="M0 -38 V-72" fill="none" />
            <path d="M0 -72 L28 -91 L17 -105 Q0 -109 -17 -105 L-28 -91 Z" fill={C.oscuro} />
          </g>
        ))}
      </g>
    </svg>
    <div style={{ position: 'absolute', left: 130, top: 250 }}>
      <Titular t={t} desde={12.15} texto="¿Estamos" tam={250} />
      <Titular t={t} desde={12.7} texto="listos?" tam={330} color={C.amarillo} />
    </div>
    <Estrella x={1560} y={720} tam={190} giro={t * 40} escala={rebote(t, 13.1)} />
    <Franja y={0} alto={12} avance={rampa(t, 12.4, 1.6)} />
  </Fondo>
);

export const E1Gancho = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{ background: C.negro }}>
      <Golpe t={t} desde={0} hasta={2.4}><Llueve t={t} /></Golpe>
      <Golpe t={t} desde={2.4} hasta={4.4}><Rio t={t} /></Golpe>
      <Golpe t={t} desde={4.4} hasta={6.2}><SinBus t={t} /></Golpe>
      <Golpe t={t} desde={6.2} hasta={8.4}><SinLuz t={t} /></Golpe>
      <Golpe t={t} desde={8.4} hasta={11.1}><Pasando t={t} /></Golpe>
      {/* De 11,1 a 12 s: negro y silencio antes de la pregunta. */}
      <Golpe t={t} desde={12} hasta={15}><Pregunta t={t} /></Golpe>
      <AbsoluteFill style={{ background: C.negro, opacity: 1 - rampa(t, 0, 0.5) }} />
    </AbsoluteFill>
  );
};
