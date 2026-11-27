// 3. Propuesta: el Mundial es un medio; el proyecto es la ciudad. Presenta BaqNova.
import { AbsoluteFill } from 'remotion';
import { mezclar, rampa, rebote, useT, vaiven } from '../anim';
import { Arbol, Bus, Horizonte } from '../dibujos/Ciudad';
import { ALTO, ANCHO, C } from '../tema';
import { Fondo } from '../ui/Fondo';
import { Cinta, Estrella, Franja, Rafaga, Recorte } from '../ui/Formas';
import { Icono, Logo } from '../ui/Iconos';
import { Aparece, Pildora, Titular, sans, serif } from '../ui/Texto';

const Frase = ({ t }: Readonly<{ t: number }>) => {
  const tacha = vaiven(t, 1.5, 2.1);
  const sube = vaiven(t, 2.7, 3.3);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, right: 0, top: mezclar(330, 80, sube), scale: String(mezclar(1, 0.55, sube)), opacity: mezclar(1, 0.55, sube) }}>
        <div style={{ position: 'relative', width: 1620, margin: '0 auto' }}>
          <Titular t={t} desde={0.3} texto="El Mundial" tam={230} centrado />
          <div style={{ position: 'absolute', left: 210, top: 100, height: 28, width: 1200 * tacha, background: C.rojo, rotate: '-3deg', borderRadius: 99 }} />
        </div>
        <Aparece t={t} desde={1.1} style={{ textAlign: 'center', marginTop: 20 }}><div style={serif(96, C.suave)}>no puede ser el proyecto</div></Aparece>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 440 }}>
        <Titular t={t} desde={3.1} texto="El proyecto es" tam={130} centrado />
        <Titular t={t} desde={3.5} texto="la ciudad" tam={260} color={C.amarillo} centrado />
      </div>
      <svg width={ANCHO} height={ALTO} style={{ position: 'absolute', inset: 0 }}>
        <g transform={`translate(0 ${mezclar(300, 0, rampa(t, 3.2, 1))})`}>
          <Horizonte y={1090} desde={-40} hasta={ANCHO} alto={190} semilla={83} color={C.superficie} />
        </g>
      </svg>
      <Estrella x={1600} y={560} tam={170} giro={t * 34} escala={rebote(t, 3.9)} />
    </>
  );
};

const Marca = ({ t }: Readonly<{ t: number }>) => {
  const sube = vaiven(t, 10.5, 11.2);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: mezclar(190, 70, sube), display: 'flex', flexDirection: 'column', alignItems: 'center', scale: String(mezclar(1, 0.62, sube)), transformOrigin: 'top center' }}>
      <Aparece t={t} desde={5.5}><div style={{ ...sans(34, 700, C.suave), letterSpacing: '.2em' }}>SOMOS ANDROMEDA · PROPONEMOS</div></Aparece>
      <div style={{ display: 'flex', alignItems: 'center', gap: 36, marginTop: 40 }}>
        <div style={{ scale: String(rebote(t, 6)), rotate: `${mezclar(-90, 0, rampa(t, 6, 1.2))}deg` }}><Logo tam={250} avance={vaiven(t, 6.1, 7.9)} /></div>
        <Titular t={t} desde={6.6} texto="BaqNova" tam={290} />
      </div>
      <div style={{ marginTop: 26 }}><Titular t={t} desde={7.9} texto="La ciudad al alcance de su gente" tam={76} color={C.amarillo} centrado paso={0.12} /></div>
    </div>
  );
};

const Camino = ({ t }: Readonly<{ t: number }>) => {
  const avance = vaiven(t, 12, 15.6);
  return (
    <>
      <svg width={ANCHO} height={ALTO} style={{ position: 'absolute', inset: 0, opacity: rampa(t, 11.1, 0.5) }}>
        <path d="M260 770 H1660" stroke={C.encima} strokeWidth={18} strokeLinecap="round" />
        <path d={`M260 770 H${260 + 1400 * avance}`} stroke={C.amarillo} strokeWidth={18} strokeLinecap="round" />
        {[260, 727, 1193, 1660].map((x, i) => <circle key={x} cx={x} cy={770} r={26 * rebote(t, 12 + i * 1.05)} fill={C.fondo} stroke={C.amarillo} strokeWidth={9} />)}
        <Bus x={260 + 1400 * avance} y={744} escala={0.34} giro={avance * 1400} />
        <Arbol x={727} y={742} escala={rebote(t, 13.6) * 0.42} />
        <Arbol x={1193} y={742} escala={rebote(t, 14.4) * 0.55} />
      </svg>
      {[{ x: 180, nombre: 'mapa' as const, texto: 'Web' }, { x: 420, nombre: 'voz' as const, texto: 'Nova' }].map((p, i) => (
        <Recorte key={p.texto} forma={i ? 'b' : 'a'} color={i ? C.azul : C.rojo} giro={i ? 4 : -4} style={{ left: p.x, top: 490, width: 200, height: 170, scale: String(rebote(t, 11.5 + i * 0.3)) }}>
          <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Icono nombre={p.nombre} tam={74} />
            <div style={sans(28, 700)}>{p.texto}</div>
          </AbsoluteFill>
        </Recorte>
      ))}
      <Pildora t={t} desde={11.9} texto="Hoy: ya se puede probar" fondo={C.blanco} tam={32} style={{ position: 'absolute', left: 150, top: 815 }} />
      <div style={{ position: 'absolute', right: 130, top: 452, ...serif(150, C.amarillo), scale: String(rebote(t, 15)) }}>2034</div>
    </>
  );
};

export const E3Propuesta = () => {
  const t = useT();
  const cambio = vaiven(t, 5.2, 5.7);
  return (
    <Fondo>
      <Cinta t={t} />
      {cambio < 1 ? <AbsoluteFill style={{ translate: `0 ${-cambio * ALTO}px` }}><Frase t={t} /></AbsoluteFill> : null}
      {t > 5.2 ? (
        <AbsoluteFill style={{ translate: `0 ${(1 - cambio) * ALTO}px` }}>
          <Rafaga x={960} y={450} tam={1100} color={C.azul} giro={t * 5} escala={rebote(t, 5.8, 60, 14)} opacidad={0.4} />
          <Marca t={t} />
          {t > 10.9 ? <Camino t={t} /> : null}
          <Franja y={ALTO - 12} alto={12} avance={rampa(t, 6, 2)} />
        </AbsoluteFill>
      ) : null}
      <Aparece t={t} desde={1.2} dy={12} style={{ position: 'absolute', left: 80, top: 66 }}>
        <div style={{ ...sans(22, 600, C.suave), border: `1px solid ${C.encima}`, borderRadius: 99, padding: '8px 20px', background: C.hondo }}>Escenario hipotético: Mundial 2034</div>
      </Aparece>
    </Fondo>
  );
};
