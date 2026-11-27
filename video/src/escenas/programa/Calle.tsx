// La calle continua que recorren Rosa y Emma.
import { rampa, rebote, tramo, vaiven } from '../../anim';
import { Agua, Alcantarilla } from '../../dibujos/Clima';
import { Arbol, Bus, Edificio, Estadio, Horizonte, Paradero, Puesto, Sol } from '../../dibujos/Ciudad';
import { PuntoNova } from '../../dibujos/Nova';
import { Emma, Recortado, Rosa, Vecino } from '../../dibujos/Personas';
import { ALTO, ANCHO, C, SANS } from '../../tema';
import { ANCHO_MUNDO, SITIOS, SUELO, bus, camara, emma, rosa } from './recorrido';

const ARBOLES = [2150, 2420, 2700, 2980] as const;

const Suelo = () => (
  <g>
    <rect x={-400} y={SUELO} width={ANCHO_MUNDO + 800} height={30} fill={C.encima} />
    <rect x={-400} y={SUELO + 30} width={ANCHO_MUNDO + 800} height={500} fill={C.hondo} />
    {Array.from({ length: 56 }, (_, i) => <rect key={i} x={-300 + i * 160} y={SUELO + 108} width={84} height={12} rx={6} fill={C.amarillo} opacity={0.75} />)}
  </g>
);

const Casa = ({ x }: Readonly<{ x: number }>) => (
  <g transform={`translate(${x} ${SUELO})`}>
    <Recortado>
      <path d="M-210 -250 L0 -390 L210 -250 Z" fill={C.rojo} />
      <rect x={-170} y={-252} width={340} height={252} fill={C.amarillo} />
      <rect x={20} y={-140} width={90} height={140} rx={12} fill={C.azul} />
    </Recortado>
    <rect x={-130} y={-180} width={100} height={90} rx={10} fill={C.hondo} stroke="#fff" strokeWidth={6} />
  </g>
);

// El arroyo que Nova avisa, con un paso seguro por encima.
const Arroyo = ({ t }: Readonly<{ t: number }>) => {
  const alerta = tramo(t, 14.6, 20, 0.4, 0.6);
  return (
    <g>
      <Agua t={t} y={SUELO - 18} desde={SITIOS.arroyo - 150} hasta={SITIOS.arroyo + 150} fondo={ALTO} />
      <path d={`M1610 ${SUELO} Q1800 ${SUELO - 236} 1990 ${SUELO}`} fill="none" stroke="#fff" strokeWidth={40} />
      <path d={`M1610 ${SUELO} Q1800 ${SUELO - 236} 1990 ${SUELO}`} fill="none" stroke={C.verde} strokeWidth={28} />
      <path d={`M1640 ${SUELO - 150} Q1800 ${SUELO - 480} 1960 ${SUELO - 150}`} fill="none" stroke={C.amarillo} strokeWidth={14} strokeDasharray="30 24" strokeDashoffset={-t * 70} opacity={alerta} />
      <path d="M1932 664 L1966 724 L1904 716 Z" fill={C.amarillo} opacity={alerta} />
      <g transform={`translate(1800 ${SUELO - 34}) scale(${rebote(t, 14.8) * (1 + Math.sin(t * 9) * 0.05)})`} opacity={alerta}>
        <path d="M0 -62 L66 48 H-66 Z" fill={C.rojo} stroke="#fff" strokeWidth={8} strokeLinejoin="round" />
        <text y={34} textAnchor="middle" fill="#fff" style={{ font: `700 62px ${SANS}` }}>!</text>
      </g>
    </g>
  );
};

// Obras junto al puesto: llegan, terminan y el puesto sigue en su lugar.
const Obras = ({ t }: Readonly<{ t: number }>) => {
  const fuera = vaiven(t, 25.6, 27.2);
  if (t > 27.4) return null;
  return (
    <g opacity={1 - fuera} transform={`translate(0 ${fuera * -60})`}>
      <g transform="translate(3250 870)">
        <Recortado>
          <rect x={-16} y={-560} width={32} height={560} fill={C.amarillo} />
          <rect x={-90} y={-576} width={400} height={30} fill={C.amarillo} />
        </Recortado>
        <path d={`M270 -546 v${150 + Math.sin(t * 3) * 40}`} stroke="#fff" strokeWidth={6} />
        <rect x={244} y={-396 + Math.sin(t * 3) * 40} width={52} height={40} rx={8} fill={C.naranja} stroke="#fff" strokeWidth={5} />
      </g>
      {[3900, 4040].map((x) => (
        <g key={x} transform={`translate(${x} ${SUELO})`}>
          <rect x={-50} y={-84} width={100} height={34} rx={8} fill={C.naranja} stroke="#fff" strokeWidth={5} />
          <path d="M-34 -50 v50 M34 -50 v50" stroke="#fff" strokeWidth={9} />
        </g>
      ))}
    </g>
  );
};

export const Calle = ({ t }: Readonly<{ t: number }>) => {
  const c = camara(t);
  const r = rosa(t);
  const e = emma(t);
  const b = bus(t);
  const lluvia = tramo(t, 37.9, 46.5, 1, 1.5);
  const limpia = vaiven(t, 48.7, 49.6);
  const novaPantalla = t < 11.6 ? 'espera' : t < 14.3 ? 'escucha' : 'aviso';
  const vaso = vaiven(t, 52.6, 53.5);
  const dibujoRosa = <Rosa x={r.x} y={r.y} paso={r.paso} brazo={t > 52.4 ? 60 * rampa(t, 52.4, 0.5) : 0} escala={1.08} />;
  return (
    <>
      {/* Horizonte lejano: avanza más lento que la calle. */}
      <svg width={ANCHO} height={ALTO} style={{ position: 'absolute', inset: 0 }}>
        <Sol x={1720 - c.x * 0.03} y={330} r={74} giro={t * 8} color={lluvia > 0.5 ? C.suave : C.amarillo} />
        <g transform={`translate(${-c.x * 0.28} 0)`}>
          <Horizonte y={SUELO} desde={-200} hasta={ANCHO_MUNDO * 0.28 + ANCHO} alto={400} semilla={12} color={C.tramo} />
        </g>
      </svg>
      <svg width={ANCHO} height={ALTO} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <g transform={`translate(${960 - c.x * c.zoom} ${700 - 700 * c.zoom}) scale(${c.zoom})`}>
          {[820, 2950, 5000, 5330, 7420, 7700].map((x, i) => <Edificio key={x} x={x} y={SUELO} ancho={170} alto={230 + (i % 3) * 70} color={C.superficie} semilla={i + 90} />)}
          <Estadio x={SITIOS.estadio} y={SUELO - 8} escala={1.18} onda={t * 5} />
          <Casa x={SITIOS.casa} />
          <Suelo />
          <Obras t={t} />
          {ARBOLES.map((x, i) => (
            <g key={x}>
              <ellipse cx={x + 30} cy={SUELO + 18} rx={170 * rampa(t, 19.2 + i * 0.6, 0.8)} ry={18} fill="#020715" opacity={0.55} />
              <Arbol x={x} y={SUELO} escala={rebote(t, 19.1 + i * 0.6) * 1.18} vaiven={Math.sin(t * 2 + i) * 2.5} />
            </g>
          ))}
          <Arroyo t={t} />
          <PuntoNova x={SITIOS.nova} y={SUELO} t={t} pantalla={novaPantalla} aviso={['Arroyo en tu ruta.', 'Toma otro camino.']} />
          {/* Zona de Emma */}
          <Paradero x={SITIOS.parada + 980} y={SUELO} />
          <Alcantarilla x={SITIOS.drenaje - 260} y={SUELO + 20} t={t} flujo={lluvia} />
          <Alcantarilla x={SITIOS.tapada} y={SUELO + 20} t={t} basura={t < 49.7 ? rampa(t, 45, 0.5) * (1 - limpia) : 0} flujo={limpia * tramo(t, 49.2, 52, 0.4, 0.6)} />
          {t > 47.9 ? <Vecino x={xAyudante(t)} y={SUELO + 16} color={C.naranja} paso={t < 48.8 ? t * 11 : 0} mira={1} escala={1.02} /> : null}
          {/* Rosa pasa detrás del mostrador cuando llega a su puesto. */}
          {r.detras ? dibujoRosa : null}
          <Puesto x={SITIOS.puesto} y={SUELO} escala={1 + tramo(t, 26.4, 28, 0.4, 0.6) * 0.07} />
          {r.detras ? null : dibujoRosa}
          {t > 39.4 ? <Bus x={b.x} y={SUELO} giro={b.x * 1.2} rampa={b.rampa} letrero={t < 46 ? 'ESTADIO' : 'BUS'} escala={1.06} /> : null}
          {t > 28 && e.visible ? <Emma x={e.x} y={e.y} rueda={e.rueda} mira={-1} escala={1.1} brazo={t > 52.4 ? 20 * rampa(t, 52.4, 0.5) : 0} /> : null}
          {t > 52.6 ? (
            <g transform={`translate(${3660 + vaso * 130} ${SUELO - 190 - Math.sin(vaso * Math.PI) * 120})`}>
              <path d="M-22 -34 H22 L15 30 H-15 Z" fill={C.naranja} stroke="#fff" strokeWidth={6} strokeLinejoin="round" />
              <path d="M4 -34 L16 -68" stroke={C.rojo} strokeWidth={7} strokeLinecap="round" />
            </g>
          ) : null}
        </g>
      </svg>
    </>
  );
};

// La persona que atiende el reporte camina hasta la alcantarilla.
function xAyudante(t: number): number {
  return 4260 + vaiven(t, 47.9, 48.9) * 270;
}
