// Cierre de la parte 4: lo que sostiene el encuentro y los siete componentes unidos.
import { AbsoluteFill } from 'remotion';
import { mezclar, rampa, rebote, vaiven } from '../../anim';
import { Cartelera, Escuela, Hospital, Puesto } from '../../dibujos/Ciudad';
import { Emma, Rosa } from '../../dibujos/Personas';
import { ALTO, ANCHO, C } from '../../tema';
import { Fondo } from '../../ui/Fondo';
import { Estrella, Rafaga, Recorte } from '../../ui/Formas';
import { Icono } from '../../ui/Iconos';
import { Titular, sans } from '../../ui/Texto';
import { COMPONENTES, textoSobre } from './componentes';

const Cimientos = ({ t }: Readonly<{ t: number }>) => {
  const fuera = vaiven(t, 62.2, 62.9);
  const paneles = [
    { texto: 'Energía de respaldo', desde: 55.4, color: C.azul, dibujo: <g transform="translate(215 390) scale(0.78)"><Hospital x={-30} y={0} energia={vaiven(t, 56, 57.6)} /></g> },
    { texto: 'Cuentas claras', desde: 59.7, color: C.rojo, dibujo: <g transform="translate(250 390)"><Cartelera x={0} y={0} avance={vaiven(t, 60.1, 61.3)} /></g> },
    { texto: 'Escuela de ciudad', desde: 60.9, color: C.verde, dibujo: <g transform="translate(250 395) scale(0.82)"><Escuela x={0} y={0} onda={t * 6} /></g> },
  ];
  return (
    <AbsoluteFill style={{ opacity: 1 - fuera, scale: String(1 - fuera * 0.25) }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 182 }}>
        <Titular t={t} desde={55.1} texto="Detrás de ese encuentro" tam={96} centrado />
      </div>
      {paneles.map((p, i) => (
        <Recorte key={p.texto} forma={(['a', 'b', 'c'] as const)[i]} color={p.color} giro={[-2.5, 1.5, -1][i]} style={{ left: 120 + i * 590, top: 320, width: 500, height: 540, scale: String(rebote(t, p.desde, 100, 13)) }}>
          <svg width="100%" height={430} viewBox="0 0 500 430">{p.dibujo}</svg>
          <div style={{ ...sans(38, 700), textAlign: 'center' }}>{p.texto}</div>
        </Recorte>
      ))}
    </AbsoluteFill>
  );
};

const CENTRO = { x: 960, y: 605 } as const;
const RADIO = { x: 700, y: 245 } as const;

const posicion = (i: number, giro: number) => {
  const a = (i / COMPONENTES.length) * Math.PI * 2 - Math.PI / 2 + giro;
  return { x: CENTRO.x + Math.cos(a) * RADIO.x, y: CENTRO.y + Math.sin(a) * RADIO.y };
};

const Union = ({ t }: Readonly<{ t: number }>) => {
  if (t < 62.4) return null;
  const abre = rampa(t, 62.4, 1.1);
  const giro = (t - 62.4) * 0.05;
  const aro = vaiven(t, 62.9, 64.2);
  return (
    <AbsoluteFill>
      <Rafaga x={CENTRO.x} y={CENTRO.y} tam={760} color={C.amarillo} giro={t * 8} escala={rebote(t, 62.5, 80, 14)} opacidad={0.35} />
      <svg width={ANCHO} height={ALTO} style={{ position: 'absolute', inset: 0 }}>
        <ellipse cx={CENTRO.x} cy={CENTRO.y} rx={RADIO.x} ry={RADIO.y} fill="none" stroke={C.amarillo} strokeWidth={10} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - aro} />
        <g transform={`translate(${CENTRO.x} ${CENTRO.y + 118}) scale(${rebote(t, 62.6) * 0.72})`}>
          <Puesto x={-40} y={0} />
          <Rosa x={-220} y={20} />
          <Emma x={220} y={20} mira={-1} escala={1.05} />
        </g>
      </svg>
      {COMPONENTES.map((c, i) => {
        const p = posicion(i, giro);
        return (
          <div key={c.id} style={{ position: 'absolute', left: mezclar(CENTRO.x, p.x, abre), top: mezclar(CENTRO.y, p.y, abre), translate: '-50% -50%', scale: String(rebote(t, 62.5 + i * 0.08)), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 128, height: 128, borderRadius: '50%', background: c.color, border: '6px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icono nombre={c.icono} tam={76} color={textoSobre(c.color)} />
            </div>
            <div style={{ ...sans(26, 700), background: C.hondo, borderRadius: 99, padding: '6px 18px', whiteSpace: 'nowrap' }}>{c.nombre}</div>
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 160 }}>
        <Titular t={t} desde={62.8} texto="Siete componentes, una sola ciudad" tam={74} color={C.amarillo} centrado paso={0.07} />
      </div>
      <Estrella x={1780} y={200} tam={120} giro={t * 30} escala={rebote(t, 63.2)} />
    </AbsoluteFill>
  );
};

export const Final = ({ t }: Readonly<{ t: number }>) => {
  if (t < 54.4) return null;
  // Un círculo se abre desde el encuentro y cubre la calle.
  const abre = vaiven(t, 54.4, 55.3);
  return (
    <AbsoluteFill style={{ clipPath: `circle(${abre * 1300}px at 960px 620px)` }}>
      <Fondo>
        {t < 63 ? <Cimientos t={t} /> : null}
        <Union t={t} />
      </Fondo>
    </AbsoluteFill>
  );
};
