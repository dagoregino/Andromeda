// 6. Impacto: lo que se busca y el primer paso. Sin cifras inventadas.
import type { ReactNode } from 'react';
import { AbsoluteFill } from 'remotion';
import { rampa, rebote, useT, vaiven } from '../anim';
import { ALTO, ANCHO, C } from '../tema';
import { Fondo } from '../ui/Fondo';
import { Cinta, Estrella, Rafaga, Recorte } from '../ui/Formas';
import { Icono, type NombreIcono } from '../ui/Iconos';
import { Pildora, Titular, sans, serif } from '../ui/Texto';

const Bloque = ({ t, desde, hasta, children }: Readonly<{ t: number; desde: number; hasta: number; children: ReactNode }>) => {
  if (t < desde || t >= hasta + 0.45) return null;
  const entra = vaiven(t, desde, desde + 0.45);
  const sale = vaiven(t, hasta, hasta + 0.45);
  return <AbsoluteFill style={{ translate: `0 ${(1 - entra) * ALTO - sale * ALTO}px` }}>{children}</AbsoluteFill>;
};

const METAS: ReadonlyArray<{ icono: NombreIcono; texto: string; color: string; desde: number }> = [
  { icono: 'mapa', texto: 'Viajes mejor preparados', color: C.azul, desde: 1 },
  { icono: 'voz', texto: 'Preguntar sin depender de un celular', color: C.rojo, desde: 2.6 },
  { icono: 'grupo', texto: 'Barrios que aprenden y vigilan', color: C.verde, desde: 4.8 },
];

const Buscamos = ({ t }: Readonly<{ t: number }>) => (
  <>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 130 }}>
      <Titular t={t} desde={0.3} texto="Lo que buscamos" tam={150} centrado />
    </div>
    {METAS.map((m, i) => (
      <Recorte key={m.texto} forma={(['b', 'c', 'a'] as const)[i]} color={m.color} giro={[-3, 2, -2][i] + Math.sin(t * 1.5 + i) * 1} style={{ left: 130 + i * 580, top: 390 + (i === 1 ? 30 : 0), width: 500, height: 440, scale: String(rebote(t, m.desde)) }}>
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', gap: 34, padding: 44 }}>
          <Icono nombre={m.icono} tam={160} grosor={2.5} />
          <div style={{ ...serif(50), textAlign: 'center', lineHeight: 1.05 }}>{m.texto}</div>
        </AbsoluteFill>
      </Recorte>
    ))}
  </>
);

const ETAPAS = [
  { anio: '2026–2027', nombre: 'Medir y empezar' },
  { anio: '2028–2030', nombre: 'Obras para cada día' },
  { anio: '2031–2033', nombre: 'Completar y ensayar' },
  { anio: '2034', nombre: 'Cumplir' },
  { anio: 'Después', nombre: 'Rendir cuentas' },
] as const;

const PrimerPaso = ({ t }: Readonly<{ t: number }>) => (
  <>
    <Rafaga x={960} y={330} tam={800} color={C.azul} giro={t * 8} escala={rebote(t, 8.8, 80, 14)} opacidad={0.45} />
    <div style={{ position: 'absolute', left: 0, right: 0, top: 120 }}>
      <Titular t={t} desde={8.9} texto="Primer paso:" tam={120} centrado />
      <Titular t={t} desde={9.5} texto="medir dónde estamos" tam={150} color={C.amarillo} centrado />
    </div>
    <div style={{ position: 'absolute', left: 150, top: 640, width: 1620, height: 14, borderRadius: 99, background: C.encima }} />
    <div style={{ position: 'absolute', left: 150, top: 640, width: 1620 * vaiven(t, 9.9, 12.5) * 0.12 + 40, height: 14, borderRadius: 99, background: C.amarillo }} />
    {ETAPAS.map((e, i) => (
      <div key={e.anio} style={{ position: 'absolute', left: 190 + i * 385, top: 647, translate: '-50% 0', display: 'flex', flexDirection: 'column', alignItems: 'center', scale: String(rebote(t, 9.7 + i * 0.22)), opacity: rampa(t, 9.7 + i * 0.22, 0.15) * (i ? 0.7 : 1) }}>
        <div style={{ width: i ? 40 : 66, height: i ? 40 : 66, borderRadius: '50%', marginTop: i ? -20 : -33, background: i ? C.fondo : C.amarillo, border: `9px solid ${i ? C.amarillo : '#fff'}`, boxSizing: 'border-box' }} />
        <div style={{ ...serif(i ? 46 : 60, C.amarillo), marginTop: 26, whiteSpace: 'nowrap' }}>{e.anio}</div>
        <div style={{ ...sans(28, 700), marginTop: 10, whiteSpace: 'nowrap' }}>{e.nombre}</div>
      </div>
    ))}
    <Pildora t={t} desde={10.9} texto="Propuesta" tam={26} fondo={C.blanco} style={{ position: 'absolute', left: 860, top: 830 }} />
    <Estrella x={1700} y={460} tam={130} giro={t * 36} escala={rebote(t, 10.1)} />
  </>
);

export const E6Impacto = () => {
  const t = useT();
  return (
    <Fondo>
      <Cinta t={t} />
      <svg width={ANCHO} height={ALTO} style={{ position: 'absolute', inset: 0, opacity: 0.07 }}>
        {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M${i * 160 - 120 + ((t * 24) % 160)} 0 l-260 ${ALTO}`} stroke="#fff" strokeWidth={3} />)}
      </svg>
      <Bloque t={t} desde={-0.5} hasta={8.2}><Buscamos t={t} /></Bloque>
      <Bloque t={t} desde={8.2} hasta={15}><PrimerPaso t={t} /></Bloque>
    </Fondo>
  );
};
