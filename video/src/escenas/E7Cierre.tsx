// 7. Cierre: la misma calle del gancho, ya con sombra y drenaje, y la firma del equipo.
import { AbsoluteFill } from 'remotion';
import { mezclar, rampa, rebote, useT, vaiven } from '../anim';
import { Alcantarilla } from '../dibujos/Clima';
import { Arbol, Bus, Horizonte, Paradero, Sol } from '../dibujos/Ciudad';
import { Vecino } from '../dibujos/Personas';
import { ALTO, ANCHO, C } from '../tema';
import { Fondo } from '../ui/Fondo';
import { Estrella, Franja, Rafaga } from '../ui/Formas';
import { Logo } from '../ui/Iconos';
import { Aparece, Pildora, Titular, sans, serif } from '../ui/Texto';

const EQUIPO = ['Dagoberto Regino', 'Aixa Martínez', 'Mariana Cala', 'Iván Tuesca', 'Kevin Rivera'];

const SUELO = 830;

const CalleEnCalma = ({ t }: Readonly<{ t: number }>) => {
  const llega = vaiven(t, 2.2, 4.8);
  return (
    <Fondo color={C.superficie} grano={0.16}>
      <svg width={ANCHO} height={ALTO} style={{ position: 'absolute', inset: 0 }}>
        <Sol x={1790} y={410} r={64} giro={t * 10} />
        <Horizonte y={SUELO} desde={-40} hasta={ANCHO} alto={330} semilla={47} color={C.tramo} />
        <rect y={SUELO} width={ANCHO} height={28} fill={C.encima} />
        <rect y={SUELO + 28} width={ANCHO} height={ALTO - SUELO - 28} fill={C.hondo} />
        {[110, 330, 1790].map((x, i) => <Arbol key={x} x={x} y={SUELO} escala={rebote(t, 0.9 + i * 0.3) * 0.9} vaiven={Math.sin(t * 2 + i) * 3} />)}
        <Paradero x={1230} y={SUELO} />
        <Vecino x={1150} y={SUELO} color={C.rojo} escala={1.02} />
        <Vecino x={1290} y={SUELO + 14} color={C.verde} escala={1.02} mira={-1} />
        <Alcantarilla x={600} y={SUELO + 44} t={t} flujo={rampa(t, 2.6, 0.5)} />
        <Bus x={mezclar(-320, 760, llega)} y={SUELO + 6} giro={llega * 1500} escala={0.92} letrero="BAQNOVA" />
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 84 }}>
        <Titular t={t} desde={0.5} texto="Si el Mundial nunca llega…" tam={96} centrado />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 238, display: 'flex', justifyContent: 'center', gap: 28 }}>
        {[{ x: 'La sombra', d: 1.9, c: C.verde }, { x: 'el drenaje', d: 2.7, c: C.azul }, { x: 'y los buses', d: 3.5, c: C.rojo }].map((p) => (
          <Pildora key={p.x} t={t} desde={p.d} texto={p.x} tam={52} fondo={p.c} color={C.blanco} style={{ border: '5px solid #fff' }} />
        ))}
      </div>
      <Aparece t={t} desde={4.4} style={{ position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center' }}>
        <div style={{ ...serif(88, C.amarillo), textShadow: '0 8px 0 rgb(0 0 0 / .3)' }}>seguirán haciendo falta</div>
      </Aparece>
    </Fondo>
  );
};

const Firma = ({ t }: Readonly<{ t: number }>) => (
  <Fondo color={C.fondo}>
    <Rafaga x={960} y={380} tam={1000} color={C.azul} giro={t * 6} escala={rebote(t, 6.5, 70, 14)} opacidad={0.4} />
    <div style={{ position: 'absolute', left: 0, right: 0, top: 90, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 34 }}>
        <div style={{ scale: String(rebote(t, 6.4)) }}><Logo tam={210} avance={vaiven(t, 6.4, 7.8)} /></div>
        <Titular t={t} desde={6.6} texto="BaqNova" tam={260} />
      </div>
      <div style={{ marginTop: 26 }}><Titular t={t} desde={7.5} texto="Primero, la gente" tam={120} color={C.amarillo} centrado paso={0.16} /></div>
    </div>
    <Aparece t={t} desde={8.3} style={{ position: 'absolute', left: 0, right: 0, top: 612, textAlign: 'center' }}>
      <div style={{ ...sans(26, 700, C.amarillo), letterSpacing: '.22em' }}>EQUIPO ANDROMEDA</div>
    </Aparece>
    <div style={{ position: 'absolute', left: 60, right: 60, top: 668, display: 'flex', justifyContent: 'center', gap: 18 }}>
      {EQUIPO.map((nombre, i) => (
        <Pildora key={nombre} t={t} desde={8.5 + i * 0.14} texto={nombre} tam={30} fondo={C.superficie} color={C.blanco} style={{ border: '2px solid #fff' }} />
      ))}
    </div>
    <Aparece t={t} desde={9.4} style={{ position: 'absolute', left: 0, right: 0, top: 800, textAlign: 'center' }}>
      <div style={sans(28, 600, C.suave)}>Bootcamp de Innovación QUIJAM · Barranquilla, 2026</div>
      <div style={{ ...sans(21, 500, C.suave), marginTop: 12 }}>Propuesta en un escenario hipotético · Las fuentes de cada dato aparecen en pantalla</div>
    </Aparece>
    <Estrella x={1660} y={250} tam={150} giro={t * 34} escala={rebote(t, 7.2)} />
    <Franja y={ALTO - 14} alto={14} avance={rampa(t, 7, 2)} />
  </Fondo>
);

export const E7Cierre = () => {
  const t = useT();
  const abre = vaiven(t, 6, 6.8);
  return (
    <AbsoluteFill style={{ background: C.negro }}>
      <CalleEnCalma t={t} />
      {t > 6 ? <AbsoluteFill style={{ clipPath: `circle(${abre * 1300}px at 960px 460px)` }}><Firma t={t} /></AbsoluteFill> : null}
      <AbsoluteFill style={{ background: C.negro, opacity: vaiven(t, 11.5, 12) }} />
    </AbsoluteFill>
  );
};
