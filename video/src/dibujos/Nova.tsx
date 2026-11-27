// Dibujo de Nova, con la misma forma y colores del dispositivo de la web.
import { C, SANS } from '../tema';

export type PantallaNova = 'espera' | 'escucha' | 'aviso';

const Onda = ({ t, y, alto }: Readonly<{ t: number; y: number; alto: number }>) => (
  <g>
    {Array.from({ length: 13 }, (_, i) => {
      const h = 8 + Math.abs(Math.sin(t * 9 + i * 0.9)) * alto * (1 - Math.abs(i - 6) / 9);
      return <rect key={i} x={-90 + i * 15} y={y - h / 2} width={8} height={h} rx={4} fill={C.amarillo} />;
    })}
  </g>
);

// Origen en el centro del dispositivo; mide 300 × 460.
export const Nova = ({
  x, y, t, escala = 1, pantalla = 'espera', aviso = [],
}: Readonly<{ x: number; y: number; t: number; escala?: number; pantalla?: PantallaNova; aviso?: readonly string[] }>) => (
  <g transform={`translate(${x} ${y}) scale(${Math.max(0.001, escala)})`}>
    <rect x={-150} y={-230} width={300} height={460} rx={52} fill="#14327a" stroke="#fff" strokeWidth={8} />
    <rect x={-128} y={-206} width={256} height={262} rx={30} fill="#0b1a42" stroke={C.encima} strokeWidth={5} />
    {pantalla === 'espera' ? (
      <g>
        <circle cy={-140} r={30} fill="none" stroke={C.amarillo} strokeWidth={12} />
        <text y={-62} textAnchor="middle" fill="#fff" style={{ font: `700 46px ${SANS}` }}>Nova</text>
        <text y={-30} textAnchor="middle" fill={C.suave} style={{ font: `600 21px ${SANS}` }}>Pulsa y pregunta</text>
        <Onda t={t * 0.5} y={14} alto={30} />
      </g>
    ) : null}
    {pantalla === 'escucha' ? (
      <g>
        <Onda t={t} y={-96} alto={110} />
        <text y={14} textAnchor="middle" fill="#fff" style={{ font: `700 30px ${SANS}` }}>Te escucho…</text>
      </g>
    ) : null}
    {pantalla === 'aviso' ? (
      <g>
        <path d="M-128 -176 q0 -30 30 -30 h196 q30 0 30 30 v26 h-256 Z" fill={C.rojo} />
        <text y={-168} textAnchor="middle" fill="#fff" style={{ font: `700 28px ${SANS}` }}>⚠ Aviso</text>
        {aviso.map((linea, i) => <text key={linea} x={-106} y={-108 + i * 38} fill="#fff" style={{ font: `700 27px ${SANS}` }}>{linea}</text>)}
      </g>
    ) : null}
    <g transform="translate(-62 140)">
      <circle r={62} fill={C.superficie} stroke={C.suave} strokeWidth={4} />
      {Array.from({ length: 37 }, (_, i) => {
        const anillo = i === 0 ? 0 : i < 7 ? 1 : i < 19 ? 2 : 3;
        const n = [1, 6, 12, 18][anillo];
        const base = [0, 1, 7, 19][anillo];
        const a = ((i - base) / n) * Math.PI * 2;
        return <circle key={i} cx={Math.cos(a) * anillo * 16} cy={Math.sin(a) * anillo * 16} r={5} fill="#050c22" />;
      })}
    </g>
    <circle cx={78} cy={140} r={46} fill={C.oscuro} stroke={C.suave} strokeWidth={5} />
    <circle cx={78} cy={140} r={pantalla === 'espera' ? 34 : 29} fill={C.amarillo} />
  </g>
);

// Nova montada en un poste, como punto de consulta en la calle.
export const PuntoNova = ({
  x, y, t, pantalla, aviso,
}: Readonly<{ x: number; y: number; t: number; pantalla?: PantallaNova; aviso?: readonly string[] }>) => (
  <g>
    <rect x={x - 14} y={y - 150} width={28} height={150} fill={C.suave} stroke="#fff" strokeWidth={5} />
    <rect x={x - 60} y={y - 14} width={120} height={20} rx={8} fill={C.encima} stroke="#fff" strokeWidth={5} />
    <Nova x={x} y={y - 262} t={t} escala={0.52} pantalla={pantalla} aviso={aviso} />
  </g>
);
