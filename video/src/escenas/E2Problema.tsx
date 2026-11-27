// 2. Problema: tres datos con su fuente y a quiénes se atiende primero.
// Cifras y advertencias iguales a las de web/index.html.
import type { ReactNode } from 'react';
import { AbsoluteFill } from 'remotion';
import { azar, lineal, mezclar, rampa, rebote, useT, vaiven } from '../anim';
import { Agua } from '../dibujos/Clima';
import { Arbol, Edificio, Sol } from '../dibujos/Ciudad';
import { ALTO, ANCHO, C } from '../tema';
import { Fondo } from '../ui/Fondo';
import { Cinta, Estrella, Rafaga, Recorte } from '../ui/Formas';
import { Icono, type NombreIcono } from '../ui/Iconos';
import { Aparece, Contador, FuenteDato, NumeroContorno, Pildora, Titular, sans, serif } from '../ui/Texto';

// Cada panel entra desde la derecha y sale por la izquierda.
const Panel = ({
  t, desde, hasta, color, children,
}: Readonly<{ t: number; desde: number; hasta: number; color: string; children: ReactNode }>) => {
  if (t < desde || t >= hasta + 0.5) return null;
  const entra = vaiven(t, desde, desde + 0.55);
  const sale = vaiven(t, hasta, hasta + 0.5);
  return (
    <AbsoluteFill style={{ translate: `${(1 - entra) * ANCHO - sale * 520}px 0` }}>
      <Fondo color={color}>
        <Cinta t={t} />
        {children}
      </Fondo>
    </AbsoluteFill>
  );
};

const Encabezado = ({ t, desde, numero, titulo }: Readonly<{ t: number; desde: number; numero: string; titulo: string }>) => (
  <div style={{ position: 'absolute', left: 110, top: 100, display: 'flex', alignItems: 'center', gap: 34 }}>
    <Aparece t={t} desde={desde}><NumeroContorno numero={numero} tam={110} /></Aparece>
    <div>
      <Aparece t={t} desde={desde + 0.1} dy={16}><div style={{ ...sans(24, 700, C.suave), letterSpacing: '.16em' }}>EL PROBLEMA</div></Aparece>
      <Titular t={t} desde={desde + 0.15} texto={titulo} tam={92} />
    </div>
  </div>
);

const Barra = ({
  t, desde, anio, valor, ancho, color, y,
}: Readonly<{ t: number; desde: number; anio: string; valor: number; ancho: number; color: string; y: number }>) => {
  const k = rampa(t, desde, 1.4);
  return (
    <div style={{ position: 'absolute', left: 110, top: y, width: 1700, opacity: rampa(t, desde, 0.25) }}>
      <div style={{ position: 'absolute', left: 0, top: 30, ...sans(52, 700, C.suave) }}>{anio}</div>
      <div style={{ position: 'absolute', left: 190, top: 0, width: 1060, height: 128, borderRadius: 99, background: 'rgb(255 255 255 / .1)' }} />
      <div style={{ position: 'absolute', left: 190, top: 0, width: Math.max(128, ancho * 1060 * k), height: 128, borderRadius: 99, background: color }}>
        <div style={{ position: 'absolute', right: 18, top: 18 }}><Icono nombre="bus" tam={92} color={color === C.blanco ? C.fondo : C.blanco} grosor={3.2} /></div>
      </div>
      <div style={{ position: 'absolute', left: 1300, top: 4, ...serif(122, color === C.rojo ? C.amarillo : C.blanco) }}>
        <Contador t={t} desde={desde} hasta={desde + 1.4} valor={valor} decimales={1} />
      </div>
    </div>
  );
};

const Transporte = ({ t }: Readonly<{ t: number }>) => (
  <>
    <Encabezado t={t} desde={0.5} numero="01" titulo="Transporte" />
    <Barra t={t} desde={1.2} anio="2019" valor={29.5} ancho={1} color={C.blanco} y={320} />
    <Barra t={t} desde={5.3} anio="2025" valor={13.6} ancho={13.6 / 29.5} color={C.rojo} y={500} />
    <Aparece t={t} desde={2.2} dy={10} style={{ position: 'absolute', right: 110, top: 262, ...sans(28, 700, C.suave) }}>millones de validaciones en Transmetro</Aparece>
    <Pildora t={t} desde={7.4} texto="Menos de la mitad" tam={40} style={{ position: 'absolute', left: 920, top: 530, rotate: '-4deg' }} />
    <FuenteDato t={t} desde={2.6} linea="Fuente: Gabriel Olier, 11 de octubre de 2026" aviso="Análisis independiente, sin contrastar con un informe oficial." style={{ position: 'absolute', left: 110, top: 745 }} />
  </>
);

const Calor = ({ t }: Readonly<{ t: number }>) => {
  const sube = vaiven(t, 11.4, 13.4);
  return (
    <>
      <svg width={ANCHO} height={ALTO} style={{ position: 'absolute', inset: 0 }}>
        <g transform={`translate(${mezclar(-80, 0, rampa(t, 10.5, 0.8))} 0)`}>
          <rect x={90} y={330} width={640} height={420} rx={30} fill="#7a2230" stroke="#fff" strokeWidth={7} />
          <Sol x={620} y={430} r={58 + Math.sin(t * 5) * 5} giro={t * 25} color={C.naranja} />
          {[130, 260, 390, 530].map((x, i) => <Edificio key={x} x={x} y={750} ancho={110} alto={150 + (i % 3) * 60} color="#b5442f" semilla={i + 61} />)}
          {[200, 330, 470].map((x, i) => <path key={x} d={`M${x} ${480 - ((t * 60 + i * 40) % 110)} q22 -24 0 -48 q-22 -24 0 -48`} fill="none" stroke={C.naranja} strokeWidth={9} strokeLinecap="round" opacity={0.85} />)}
        </g>
        <g transform={`translate(${mezclar(80, 0, rampa(t, 10.7, 0.8))} 0)`}>
          <rect x={1190} y={330} width={640} height={420} rx={30} fill="#0f5560" stroke="#fff" strokeWidth={7} />
          <Sol x={1730} y={420} r={40} giro={t * 12} />
          {[1250, 1400, 1580].map((x, i) => <Edificio key={x} x={x} y={750} ancho={110} alto={180 - (i % 2) * 40} color={C.encima} semilla={i + 71} />)}
          {[1290, 1500, 1720].map((x, i) => <Arbol key={x} x={x} y={750} escala={rebote(t, 11.2 + i * 0.25) * 0.85} vaiven={Math.sin(t * 2 + i) * 3} />)}
        </g>
        {/* Termómetro central */}
        <g transform="translate(960 0)">
          <rect x={-34} y={300} width={68} height={400} rx={34} fill="#fff" />
          <circle cy={712} r={64} fill="#fff" />
          <rect x={-18} y={680 - sube * 340} width={36} height={sube * 340 + 20} rx={18} fill={C.rojo} />
          <circle cy={712} r={46} fill={C.rojo} />
        </g>
      </svg>
      <Encabezado t={t} desde={10.3} numero="02" titulo="Calor" />
      <div style={{ position: 'absolute', right: 110, top: 92, ...serif(180, C.amarillo), opacity: rampa(t, 12.2, 0.2), scale: String(mezclar(1.6, 1, rampa(t, 12.2, 0.5))) }}>
        +<Contador t={t} desde={12.2} hasta={13.4} valor={5} /> °C
      </div>
      <Aparece t={t} desde={11.2} style={{ position: 'absolute', left: 90, top: 764, width: 640, textAlign: 'center', ...sans(32, 700) }}>Barrios más pobres</Aparece>
      <Aparece t={t} desde={11.4} style={{ position: 'absolute', left: 1190, top: 764, width: 640, textAlign: 'center', ...sans(32, 700) }}>Zonas más ricas</Aparece>
      <FuenteDato t={t} desde={13} linea="Temperatura de superficie. Fuente: Banco Mundial, 2025" style={{ position: 'absolute', left: 110, top: 828 }} />
    </>
  );
};

const BASURA = Array.from({ length: 34 }, (_, i) => ({
  x: 80 + azar(i + 100) * 1760, y: 660 + azar(i + 140) * 190, giro: azar(i + 180) * 360,
  tono: [C.naranja, '#9fe0c0', C.amarillo, '#d9d9d9', C.rojo][i % 5], cae: 17.8 + azar(i + 220) * 3.6, tipo: i % 3,
}));

const Arroyos = ({ t }: Readonly<{ t: number }>) => (
  <>
    <svg width={ANCHO} height={ALTO} style={{ position: 'absolute', inset: 0 }}>
      <Agua t={t} y={690} />
      {BASURA.map((b, i) => {
        const k = rampa(t, b.cae, 0.8);
        const x = b.x + Math.sin(t * 1.5 + i) * 18 + lineal(t, b.cae, 24) * 60;
        return (
          <g key={i} transform={`translate(${x} ${mezclar(-80, b.y, k) + Math.sin(t * 4 + i) * 9 * k}) rotate(${b.giro + t * 20})`} opacity={t > b.cae ? 1 : 0}>
            {b.tipo === 0 ? <rect x={-15} y={-34} width={30} height={68} rx={11} fill={b.tono} stroke="#fff" strokeWidth={5} /> : null}
            {b.tipo === 1 ? <circle r={24} fill={b.tono} stroke="#fff" strokeWidth={5} /> : null}
            {b.tipo === 2 ? <path d="M-34 14 L-8 -30 L36 -6 L14 28 Z" fill={b.tono} stroke="#fff" strokeWidth={5} /> : null}
          </g>
        );
      })}
    </svg>
    <Encabezado t={t} desde={17.5} numero="03" titulo="Arroyos" />
    <div style={{ position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center' }}>
      <div style={{ ...serif(250, C.amarillo), scale: String(rebote(t, 18.2, 80, 14)) }}>
        <Contador t={t} desde={18.4} hasta={21.4} valor={14200} /> t
      </div>
      <Aparece t={t} desde={19.2}><div style={sans(38, 700)}>de residuos retirados de arroyos, caños y drenajes en lo corrido de 2026</div></Aparece>
    </div>
    <FuenteDato t={t} desde={20.2} linea="Fuente: Alcaldía, citada por El Tiempo, 20 de octubre de 2026" aviso="Balance parcial, sin verificación independiente." style={{ position: 'absolute', right: 90, top: 104, maxWidth: 940 }} />
  </>
);

const GRUPOS: ReadonlyArray<{ icono: NombreIcono; titulo: string; color: string; desde: number }> = [
  { icono: 'aviso', titulo: 'Sur y occidente', color: C.rojo, desde: 25.6 },
  { icono: 'bus', titulo: 'Quienes andan en bus', color: C.azul, desde: 29.1 },
  { icono: 'silla', titulo: 'Personas con discapacidad', color: C.verde, desde: 31.2 },
];

const Prioridad = ({ t }: Readonly<{ t: number }>) => (
  <>
    <Rafaga x={960} y={560} tam={900} color={C.amarillo} giro={t * 6} escala={rebote(t, 24.5, 70, 14)} opacidad={0.28} />
    <div style={{ position: 'absolute', left: 0, right: 0, top: 130 }}>
      <Titular t={t} desde={24.5} texto="Nuestra prioridad" tam={150} centrado />
    </div>
    {GRUPOS.map((g, i) => (
      <Recorte key={g.titulo} forma={(['a', 'b', 'c'] as const)[i]} color={g.color} giro={[-4, 2, -2][i] + Math.sin(t * 1.6 + i * 2) * 1.2} style={{ left: 145 + i * 570, top: 380 + (i === 1 ? 40 : 0), width: 490, height: 430, scale: String(rebote(t, g.desde)) }}>
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', gap: 34, padding: 40 }}>
          <Icono nombre={g.icono} tam={170} grosor={2.4} />
          <div style={{ ...serif(54), textAlign: 'center' }}>{g.titulo}</div>
        </AbsoluteFill>
      </Recorte>
    ))}
    <Estrella x={1760} y={190} tam={130} giro={t * 30} escala={rebote(t, 25)} />
  </>
);

export const E2Problema = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{ background: C.fondo }}>
      <Panel t={t} desde={-0.6} hasta={10} color={C.fondo}><Transporte t={t} /></Panel>
      <Panel t={t} desde={10} hasta={17.2} color={C.tramo}><Calor t={t} /></Panel>
      <Panel t={t} desde={17.2} hasta={24.2} color={C.hondo}><Arroyos t={t} /></Panel>
      <Panel t={t} desde={24.2} hasta={36} color={C.fondo}><Prioridad t={t} /></Panel>
    </AbsoluteFill>
  );
};
