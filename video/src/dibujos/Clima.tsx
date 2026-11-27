// Lluvia, agua y alcantarillas.
import { azar } from '../anim';
import { ALTO, ANCHO, C } from '../tema';

export const Lluvia = ({ t, fuerza = 1, gotas = 130 }: Readonly<{ t: number; fuerza?: number; gotas?: number }>) => (
  <svg width={ANCHO} height={ALTO} style={{ position: 'absolute', inset: 0, opacity: fuerza, pointerEvents: 'none' }}>
    {Array.from({ length: gotas }, (_, i) => {
      const velocidad = 1300 + azar(i + 4) * 900;
      const largo = 34 + azar(i + 9) * 56;
      const y = ((azar(i + 2) * 1400 + t * velocidad) % 1400) - 160;
      const x = azar(i) * (ANCHO + 300) - y * 0.18;
      return <line key={i} x1={x} y1={y} x2={x - largo * 0.18} y2={y + largo} stroke="#bcdcff" strokeWidth={2 + azar(i + 7) * 2.5} strokeLinecap="round" opacity={0.25 + azar(i + 3) * 0.55} />;
    })}
  </svg>
);

const onda = (y: number, t: number, alto: number, largo: number, desde: number, hasta: number, fondo: number): string => {
  const puntos = Array.from({ length: Math.ceil((hasta - desde) / 40) + 1 }, (_, i) => {
    const x = desde + i * 40;
    return `${x} ${y + Math.sin(x / largo + t * 5) * alto}`;
  });
  return `M${puntos.join(' L')} L${hasta} ${fondo} L${desde} ${fondo} Z`;
};

export const Agua = ({
  t, y, desde = 0, hasta = ANCHO, fondo = ALTO, color = C.azul, opacidad = 1,
}: Readonly<{ t: number; y: number; desde?: number; hasta?: number; fondo?: number; color?: string; opacidad?: number }>) => (
  <g opacity={opacidad}>
    <path d={onda(y, t, 18, 110, desde, hasta, fondo)} fill={C.enlace} opacity={0.75} />
    <path d={onda(y + 34, t * 1.35 + 2, 15, 84, desde, hasta, fondo)} fill={color} />
    <path d={onda(y + 84, t * 0.8 + 4, 12, 140, desde, hasta, fondo)} fill={C.tramo} opacity={0.85} />
  </g>
);

// Rejilla de drenaje; `flujo` mueve las flechas de agua que entran y `basura` la tapa.
export const Alcantarilla = ({
  x, y, t, flujo = 0, basura = 0,
}: Readonly<{ x: number; y: number; t: number; flujo?: number; basura?: number }>) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-96} y={-14} width={192} height={64} rx={14} fill={C.oscuro} stroke="#fff" strokeWidth={6} />
    {Array.from({ length: 7 }, (_, i) => <rect key={i} x={-74 + i * 23} y={-2} width={9} height={40} rx={4} fill={C.suave} />)}
    {flujo > 0
      ? [-190, -140, 140, 190].map((fx, i) => {
          const k = (t * 1.6 + i * 0.37) % 1;
          return (
            <path
              key={fx} d="M0 0 q14 18 0 30 q-14 -12 0 -30" fill={C.enlace} opacity={flujo * (1 - k)}
              transform={`translate(${fx * (1 - k * 0.8)} ${-50 + k * 62}) scale(${1.3 - k * 0.5})`}
            />
          );
        })
      : null}
    {basura > 0 ? (
      <g opacity={basura} transform={`scale(${0.6 + basura * 0.4})`}>
        <path d="M-70 -8 q20 -34 46 -8 q-24 22 -46 8Z" fill="#c8791f" />
        <path d="M-10 -22 q34 -22 52 12 q-34 18 -52 -12Z" fill="#8a5a34" />
        <rect x={34} y={-26} width={26} height={46} rx={7} fill="#9fe0c0" transform="rotate(38 47 -3)" />
        <circle cx={-34} cy={6} r={17} fill="#d9d9d9" />
      </g>
    ) : null}
  </g>
);
