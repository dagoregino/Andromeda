// 5. Demostración: clips de la web, el dispositivo real respondiendo y el modelo 3D de la carcasa.
import type { ReactNode } from 'react';
import { AbsoluteFill } from 'remotion';
import { mezclar, rampa, rebote, useT, vaiven } from '../anim';
import { C } from '../tema';
import { Fondo } from '../ui/Fondo';
import { Cinta, Estrella, Rafaga } from '../ui/Formas';
import { Clip, Navegador } from '../ui/Navegador';
import { Aparece, NumeroContorno, Pildora, Titular, sans, serif } from '../ui/Texto';
import { FIN_NOVA, INICIO_NOVA, NovaReal } from './NovaReal';

const Parte = ({ t, desde, hasta, children }: Readonly<{ t: number; desde: number; hasta: number; children: ReactNode }>) =>
  t >= desde && t < hasta ? <AbsoluteFill>{children}</AbsoluteFill> : null;

const Insignia = ({
  t, desde, grande, texto, color = C.amarillo, tinta = C.oscuro, x, y,
}: Readonly<{ t: number; desde: number; grande: string; texto: string; color?: string; tinta?: string; x: number; y: number }>) => (
  <div style={{ position: 'absolute', left: x, top: y, rotate: '-4deg', scale: String(rebote(t, desde)), opacity: rampa(t, desde, 0.15), background: color, border: '5px solid #fff', borderRadius: 26, padding: '20px 30px', textAlign: 'center', boxShadow: '14px 16px 0 rgb(0 0 0 / .3)' }}>
    <div style={serif(82, tinta)}>{grande}</div>
    <div style={sans(28, 700, tinta)}>{texto}</div>
  </div>
);

const Nota = ({ texto }: Readonly<{ texto: string }>) => (
  <div style={{ position: 'absolute', right: 252, top: 858, ...sans(20, 600), background: 'rgb(4 10 28 / .86)', borderRadius: 99, padding: '7px 18px' }}>{texto}</div>
);

const Intro = ({ t }: Readonly<{ t: number }>) => (
  <>
    <Rafaga x={960} y={480} tam={1200} color={C.verde} giro={t * 10} escala={rebote(t, 0.3, 80, 13)} opacidad={0.7} />
    <div style={{ position: 'absolute', left: 0, right: 0, top: 150, display: 'flex', justifyContent: 'center' }}>
      <Aparece t={t} desde={0.2}><NumeroContorno numero="LA DEMO" tam={70} /></Aparece>
    </div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 310 }}>
      <Titular t={t} desde={0.4} texto="No es solo" tam={180} centrado />
      <Titular t={t} desde={0.9} texto="una idea" tam={260} color={C.amarillo} centrado />
    </div>
    <Estrella x={1560} y={700} tam={170} giro={t * 40} escala={rebote(t, 1.4)} />
  </>
);

const Mapa = ({ t }: Readonly<{ t: number }>) => {
  const acerca = vaiven(t, 11.1, 12.2);
  return (
    <>
      <Navegador ruta="BaqNova · Mapa" avance={rampa(t, 3.2, 0.7)} zoom={{ escala: mezclar(1, 2.5, acerca), x: mezclar(0.5, 0.23, acerca), y: mezclar(0.5, 0.36, acerca) }}>
        {t < 7.2 ? <Clip archivo="mapa.mp4" desde={3.2} inicio={0.3} velocidad={1.55} /> : null}
        {t >= 7.2 && t < 11 ? <Clip archivo="mapa.mp4" desde={7.2} inicio={13} velocidad={1.9} /> : null}
        {t >= 11 ? <Clip archivo="mapa.mp4" desde={11} inicio={9.3} velocidad={0.75} /> : null}
      </Navegador>
      {t >= 7.6 && t < 11 ? <Insignia t={t} desde={7.8} grande="91" texto="recorridos de referencia" x={1440} y={330} /> : null}
      {t >= 12 ? <Insignia t={t} desde={12.2} grande="Antes" texto="de salir, mira el clima" x={1380} y={330} color={C.azul} tinta={C.blanco} /> : null}
      <Nota texto={t < 11 ? 'Mapa © colaboradores de OpenStreetMap · Recorridos: AMB y OpenStreetMap' : 'Clima: Open-Meteo.com (CC BY 4.0)'} />
    </>
  );
};

const Cursos = ({ t }: Readonly<{ t: number }>) => (
  <>
    <Navegador ruta="BaqNova · Cursos" avance={rampa(t, 15, 0.7)}>
      <Clip archivo="cursos.mp4" desde={15} inicio={1.2} velocidad={2.4} />
    </Navegador>
    <Insignia t={t} desde={15.6} grande="14" texto="cursos propuestos" x={80} y={560} />
  </>
);

const Idioma = ({ t }: Readonly<{ t: number }>) => (
  <>
    <Navegador ruta="BaqNova · Español / English" avance={rampa(t, 19, 0.5)}>
      <Clip archivo="idioma.mp4" desde={19} inicio={0.1} velocidad={1.1} />
    </Navegador>
    <Insignia t={t} desde={20.4} grande="ES ⇄ EN" texto="para recibir el Mundial" x={1400} y={600} color={C.rojo} tinta={C.blanco} />
  </>
);

const SinCelular = ({ t }: Readonly<{ t: number }>) => (
  <>
    <Navegador ruta="BaqNova · Nova" avance={rampa(t, 23, 0.7)}>
      <Clip archivo="nova-portada.mp4" desde={23} />
    </Navegador>
    <div style={{ position: 'absolute', left: 80, top: 150 }}>
      <Pildora t={t} desde={23.5} texto="¿Y quien no tiene celular?" tam={56} style={{ rotate: '-4deg', border: '5px solid #fff' }} />
    </div>
    <Nota texto="Imagen conceptual" />
  </>
);

const Carcasa = ({ t }: Readonly<{ t: number }>) => (
  <>
    <Navegador ruta="BaqNova · Nova · El prototipo" avance={rampa(t, FIN_NOVA, 0.6)} zoom={{ escala: mezclar(1.05, 1.28, vaiven(t, FIN_NOVA + 0.2, 54)), x: 0.5, y: 0.4 }}>
      <Clip archivo="nova-carcasa.mp4" desde={FIN_NOVA} inicio={0.3} />
    </Navegador>
    <div style={{ position: 'absolute', left: 70, top: 200, display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'flex-start' }}>
      <Pildora t={t} desde={49.4} texto="Lo que sigue" tam={40} fondo={C.blanco} />
      <Pildora t={t} desde={50.8} texto="1 · Imprimir la carcasa" tam={34} />
      <Pildora t={t} desde={52.2} texto="2 · Probarlo con personas con discapacidad" tam={34} />
    </div>
    <Nota texto="Diseño 3D del prototipo · la carcasa aún no está impresa" />
  </>
);

export const E5Demo = () => {
  const t = useT();
  return (
    <Fondo color={C.fondo}>
      <Cinta t={t} y={10} />
      <Parte t={t} desde={0} hasta={3.2}><Intro t={t} /></Parte>
      <Parte t={t} desde={3.2} hasta={15}><Mapa t={t} /></Parte>
      <Parte t={t} desde={15} hasta={19}><Cursos t={t} /></Parte>
      <Parte t={t} desde={19} hasta={23}><Idioma t={t} /></Parte>
      <Parte t={t} desde={23} hasta={INICIO_NOVA}><SinCelular t={t} /></Parte>
      <Parte t={t} desde={INICIO_NOVA} hasta={FIN_NOVA}><NovaReal t={t} /></Parte>
      <Parte t={t} desde={FIN_NOVA} hasta={55}><Carcasa t={t} /></Parte>
    </Fondo>
  );
};
