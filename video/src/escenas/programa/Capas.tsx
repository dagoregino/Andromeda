// Lo que va sobre la calle: marcador de componentes, nombres, globos de diálogo y ventanas de detalle.
import type { ReactNode } from 'react';
import { Img, staticFile } from 'remotion';
import { mezclar, rampa, rebote, tramo, vaiven } from '../../anim';
import { Alcantarilla } from '../../dibujos/Clima';
import { Nova } from '../../dibujos/Nova';
import { C, SANS } from '../../tema';
import { Recorte } from '../../ui/Formas';
import { Icono } from '../../ui/Iconos';
import { sans, serif } from '../../ui/Texto';
import { COMPONENTES, textoSobre } from './componentes';
import { emma, enPantalla, rosa } from './recorrido';

export const Marcador = ({ t }: Readonly<{ t: number }>) => (
  <div style={{ position: 'absolute', left: 30, right: 30, top: 24, display: 'flex', gap: 12 }}>
    {COMPONENTES.map((c, i) => {
      const k = rampa(t, c.enciende, 0.4);
      const salto = tramo(t, c.enciende, c.enciende + 1.1, 0.25, 0.5);
      const prendido = t >= c.enciende;
      const tinta = prendido ? textoSobre(c.color) : C.suave;
      return (
        <div
          key={c.id}
          style={{
            flex: 1, height: 76, display: 'flex', alignItems: 'center', gap: 14, padding: '0 16px', borderRadius: 18,
            background: prendido ? c.color : 'rgb(6 14 40 / .72)', border: `3px solid ${prendido ? C.puro : C.encima}`,
            scale: String(1 + salto * 0.12), translate: `0 ${salto * 12}px`, opacity: rampa(t, 4.6 + i * 0.09, 0.4),
          }}
        >
          <Icono nombre={c.icono} tam={42} color={tinta} grosor={3.4} avance={0.55 + k * 0.45} />
          <div style={{ ...sans(21, 700, tinta), lineHeight: 1.1 }}>{c.nombre}</div>
        </div>
      );
    })}
  </div>
);

const Globo = ({
  t, desde, hasta, x, y, texto, color = C.puro, tinta = C.oscuro,
}: Readonly<{ t: number; desde: number; hasta: number; x: number; y: number; texto: string; color?: string; tinta?: string }>) => {
  if (t < desde || t > hasta) return null;
  const k = rebote(t, desde) * (1 - vaiven(t, hasta - 0.25, hasta));
  return (
    <div style={{ position: 'absolute', left: x, top: y, translate: '-50% -100%', scale: String(k), transformOrigin: 'bottom center' }}>
      <div style={{ ...sans(34, 700, tinta), background: color, borderRadius: 28, padding: '18px 28px', whiteSpace: 'nowrap', boxShadow: '10px 12px 0 rgb(0 0 0 / .28)' }}>{texto}</div>
      <div style={{ width: 0, height: 0, margin: '-2px auto 0', borderLeft: '18px solid transparent', borderRight: '18px solid transparent', borderTop: `24px solid ${color}` }} />
    </div>
  );
};

export const Dialogos = ({ t }: Readonly<{ t: number }>) => {
  const r = rosa(t);
  const e = emma(t);
  const pr = enPantalla(t, r.x, r.y);
  const pe = enPantalla(t, e.x, e.y);
  const nombre = (visible: number, p: { x: number; y: number }, texto: string, color: string, alto: number) =>
    visible > 0 ? (
      <div style={{ position: 'absolute', left: p.x, top: p.y - alto, translate: '-50% -100%', opacity: visible, ...sans(30, 700, textoSobre(color)), background: color, border: '3px solid #fff', borderRadius: 99, padding: '10px 24px', whiteSpace: 'nowrap' }}>
        {texto}
      </div>
    ) : null;
  return (
    <>
      {nombre(tramo(t, 5.9, 9.1), pr, 'Rosa · vende jugos', C.rojo, 330)}
      {nombre(tramo(t, 29.5, 33.4), pe, 'Emma · viene de Canadá', C.azul, 320)}
      <Globo t={t} desde={11.5} hasta={14.4} x={pr.x - 30} y={pr.y - 320} texto="¿Hay avisos cerca?" />
      <Globo t={t} desde={24.8} hasta={28.1} x={pr.x - 380} y={pr.y - 320} texto="¡Mi puesto sigue aquí!" color={C.amarillo} />
      <Globo t={t} desde={53.4} hasta={55.2} x={pe.x + 120} y={pe.y - 330} texto="Thank you!" color={C.amarillo} />
    </>
  );
};

const Ventana = ({
  t, desde, hasta, x, y, ancho, alto, color, giro = 0, children,
}: Readonly<{ t: number; desde: number; hasta: number; x: number; y: number; ancho: number; alto: number; color: string; giro?: number; children: ReactNode }>) => {
  if (t < desde || t > hasta) return null;
  const k = rebote(t, desde, 110, 14) * (1 - vaiven(t, hasta - 0.3, hasta));
  return (
    <Recorte forma="c" color={color} giro={giro} borde={10} style={{ left: x, top: y, width: ancho, height: alto, scale: String(k) }}>
      {children}
    </Recorte>
  );
};

// La respuesta de Nova, en grande: la misma que se dice y se escribe.
const RespuestaNova = ({ t }: Readonly<{ t: number }>) => {
  const letras = 'Hay un arroyo en tu ruta. Toma otro camino.';
  const escrito = letras.slice(0, Math.round(vaiven(t, 14.8, 17.8) * letras.length));
  return (
    <Ventana t={t} desde={14.3} hasta={19.4} x={1060} y={170} ancho={800} alto={520} color={C.superficie} giro={-1.5}>
      <svg width={300} height={470} viewBox="-160 -240 320 480" style={{ position: 'absolute', left: 20, top: 15 }}>
        <Nova x={0} y={0} t={t} pantalla="aviso" aviso={['Arroyo en tu ruta.', 'Toma otro camino.']} />
      </svg>
      <div style={{ position: 'absolute', left: 350, top: 66, width: 390 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Icono nombre="voz" tam={56} color={C.amarillo} />
          <div style={sans(28, 700, C.amarillo)}>Con voz y en pantalla</div>
        </div>
        <div style={{ ...serif(58), marginTop: 28, lineHeight: 1.05 }}>{escrito}</div>
        <div style={{ display: 'flex', gap: 7, alignItems: 'center', height: 70, marginTop: 16 }}>
          {Array.from({ length: 22 }, (_, i) => <div key={i} style={{ width: 9, borderRadius: 9, background: C.amarillo, height: t < 18.2 ? 10 + Math.abs(Math.sin(t * 11 + i * 0.8)) * 52 : 10 }} />)}
        </div>
      </div>
    </Ventana>
  );
};

const Telefono = ({ t }: Readonly<{ t: number }>) => {
  if (t < 33.4 || t > 38.6) return null;
  const entra = rampa(t, 33.4, 0.7);
  const sale = vaiven(t, 38.1, 38.6);
  const cambio = vaiven(t, 35.8, 36.4);
  return (
    <div style={{ position: 'absolute', left: 180, top: mezclar(1100, 172, entra) + sale * 1000, width: 348, height: 724, borderRadius: 56, background: C.negro, border: '6px solid #fff', padding: 12, rotate: '-4deg', boxShadow: '18px 22px 0 rgb(0 0 0 / .3)' }}>
      <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 40, overflow: 'hidden', background: C.fondo }}>
        <Img src={staticFile('clips/telefono-mapa.png')} style={{ position: 'absolute', width: '100%', top: mezclar(0, -40, vaiven(t, 34, 35.8)), opacity: 1 - cambio }} />
        <Img src={staticFile('clips/telefono-rutas.png')} style={{ position: 'absolute', width: '100%', top: 0, opacity: cambio }} />
      </div>
    </div>
  );
};

const Desvio = ({ t }: Readonly<{ t: number }>) => {
  const k = vaiven(t, 40.5, 41.8);
  return (
    <Ventana t={t} desde={40.2} hasta={42.6} x={110} y={190} ancho={600} alto={360} color={C.hondo} giro={-2}>
      <svg width="100%" height="100%" viewBox="0 0 580 340">
        <path d="M60 250 H520" stroke={C.suave} strokeWidth={18} strokeDasharray="4 30" strokeLinecap="round" />
        <path d="M60 250 C150 250 150 90 290 90 S430 250 520 250" fill="none" stroke={C.verdeClaro} strokeWidth={18} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} />
        <circle cx={60} cy={250} r={22} fill="#fff" />
        <circle cx={520} cy={250} r={22} fill={C.amarillo} />
        <g transform="translate(290 250)"><path d="M-30 -30 L30 30 M30 -30 L-30 30" stroke={C.rojo} strokeWidth={18} strokeLinecap="round" /></g>
        <text x={290} y={74} textAnchor="middle" fill="#fff" style={{ font: `700 34px ${SANS}` }}>El bus toma otra ruta</text>
      </svg>
    </Ventana>
  );
};

// El agua entra por la rejilla en lugar de quedarse en la calle.
const Drenaje = ({ t }: Readonly<{ t: number }>) => (
  <Ventana t={t} desde={38.5} hasta={40.2} x={110} y={190} ancho={600} alto={360} color={C.hondo} giro={1.5}>
    <div style={{ ...serif(40), textAlign: 'center', marginTop: 50 }}>El drenaje responde</div>
    <svg width="100%" height={220} viewBox="0 0 580 220">
      <g transform="translate(290 112) scale(1.45)"><Alcantarilla x={0} y={0} t={t} flujo={1} /></g>
    </svg>
  </Ventana>
);

const PASOS = [
  { desde: 46.9, texto: 'Reporte enviado', color: C.azul },
  { desde: 47.9, texto: 'Alguien va en camino', color: C.naranja },
  { desde: 49.6, texto: 'Atendido', color: C.verde },
] as const;

const Reporte = ({ t }: Readonly<{ t: number }>) => (
  <Ventana t={t} desde={45.9} hasta={50.8} x={1190} y={150} ancho={640} alto={440} color={C.hondo} giro={1.5}>
    <div style={{ padding: '38px 46px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <Icono nombre="aviso" tam={62} color={C.amarillo} />
        <div style={serif(50)}>Alcantarilla tapada</div>
      </div>
      {PASOS.map((p) => (
        <div key={p.texto} style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '16px 22px', borderRadius: 18, background: t >= p.desde ? p.color : 'rgb(255 255 255 / .08)', scale: String(1 + tramo(t, p.desde, p.desde + 0.8, 0.2, 0.4) * 0.07) }}>
          <Icono nombre={t >= p.desde ? 'visto' : 'reloj'} tam={44} color={p.color === C.naranja && t >= p.desde ? C.oscuro : C.blanco} />
          <div style={sans(32, 700, p.color === C.naranja && t >= p.desde ? C.oscuro : C.blanco)}>{p.texto}</div>
        </div>
      ))}
    </div>
  </Ventana>
);

export const Ventanas = ({ t }: Readonly<{ t: number }>) => (
  <>
    <RespuestaNova t={t} />
    <Telefono t={t} />
    <Drenaje t={t} />
    <Desvio t={t} />
    <Reporte t={t} />
  </>
);
