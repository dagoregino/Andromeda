// 4. Programa: un solo recorrido por la calle con Rosa (local) y Emma (visitante). Historia ilustrativa.
import { AbsoluteFill } from 'remotion';
import { mezclar, rampa, tramo, useT, vaiven } from '../../anim';
import { Lluvia } from '../../dibujos/Clima';
import { C } from '../../tema';
import { Fondo } from '../../ui/Fondo';
import { Pildora, Titular, sans } from '../../ui/Texto';
import { Calle } from './Calle';
import { Dialogos, Marcador, Ventanas } from './Capas';
import { Final } from './Final';

const Apertura = ({ t }: Readonly<{ t: number }>) => {
  if (t > 5.4) return null;
  const sale = vaiven(t, 4.6, 5.4);
  return (
    <AbsoluteFill style={{ background: `rgb(6 14 40 / ${0.55 * (1 - sale)})`, alignItems: 'center', paddingTop: 150, translate: `0 ${-sale * 700}px` }}>
      <Titular t={t} desde={0.3} texto="¿Cómo se vería" tam={150} centrado />
      <Titular t={t} desde={0.9} texto="esa ciudad?" tam={190} color={C.amarillo} centrado />
      <Pildora t={t} desde={2.8} texto="Un día de partido · 2034" tam={42} fondo={C.blanco} style={{ marginTop: 40 }} />
    </AbsoluteFill>
  );
};

export const E4Programa = () => {
  const t = useT();
  const lluvia = tramo(t, 37.9, 46.5, 1, 1.5);
  // Destello al saltar de la historia de Rosa a la de Emma.
  const salto = tramo(t, 28.2, 29.3, 0.35, 0.5);
  return (
    <Fondo grano={0.16}>
      {t < 55.4 ? (
        <>
          <Calle t={t} />
          <AbsoluteFill style={{ background: '#0a1a44', opacity: lluvia * 0.34 }} />
          {lluvia > 0 ? <Lluvia t={t} fuerza={lluvia} /> : null}
          <Dialogos t={t} />
          <Ventanas t={t} />
          <div style={{ position: 'absolute', left: -200, top: 0, bottom: 0, width: 2320, background: C.amarillo, opacity: salto, translate: `${mezclar(2200, -2200, vaiven(t, 28.2, 29.3))}px 0`, rotate: '6deg', scale: '1 1.3' }} />
        </>
      ) : null}
      <Apertura t={t} />
      <Final t={t} />
      {t > 4.5 && t < 63 ? <div style={{ opacity: 1 - vaiven(t, 62.4, 63) }}><Marcador t={t} /></div> : null}
      <div style={{ position: 'absolute', left: 30, top: 116, opacity: rampa(t, 0.4, 0.5), ...sans(21, 600), background: 'rgb(6 14 40 / .82)', border: `1px solid ${C.encima}`, borderRadius: 99, padding: '8px 18px' }}>
        Propuesta · Historia ilustrativa con personajes inventados
      </div>
    </Fondo>
  );
};
