// Grabación real del dispositivo, con lo que se dice escrito al lado.
// El clip sale de herramientas/recortar-nova.mjs; los tiempos son segundos de la escena 5.
import { Video } from '@remotion/media';
import { Sequence, staticFile } from 'remotion';
import { lineal, mezclar, rampa, rebote, vaiven } from '../anim';
import { C, FPS } from '../tema';
import { Estrella, Rafaga } from '../ui/Formas';
import { Icono } from '../ui/Iconos';
import { Titular, sans, serif } from '../ui/Texto';

export const INICIO_NOVA = 27;
export const FIN_NOVA = 49;

type Turno = Readonly<{ quien: 'persona' | 'nova' | 'aviso'; desde: number; hasta: number; texto: string }>;

// Dos intercambios; cada uno ocupa la pantalla mientras se oye.
const CHARLAS: ReadonlyArray<{ desde: number; hasta: number; turnos: readonly Turno[] }> = [
  {
    desde: INICIO_NOVA,
    hasta: 35.25,
    turnos: [
      { quien: 'persona', desde: 27.05, hasta: 28.4, texto: 'Hola, ¿cómo te llamas?' },
      { quien: 'nova', desde: 28.7, hasta: 35.1, texto: 'Me llamo Nova, soy tu asistente de voz para moverte por Barranquilla. ¿Desde qué lugar sales hoy?' },
    ],
  },
  {
    desde: 35.25,
    hasta: FIN_NOVA,
    turnos: [
      { quien: 'persona', desde: 35.35, hasta: 37, texto: 'Quiero ir al estadio Metropolitano.' },
      { quien: 'nova', desde: 37.3, hasta: 43.2, texto: 'Desde el aeropuerto toma el bus 4163 de Coolitoral hacia el estadio Metropolitano.' },
      { quien: 'aviso', desde: 43.4, hasta: 48.8, texto: 'Ojo, esa ruta implica caminar más de 700 metros en total. Confírmalo con el conductor.' },
    ],
  },
];

const ESTILOS = {
  persona: { fondo: C.azul, tinta: C.blanco, nombre: 'Pregunta', icono: 'persona' },
  nova: { fondo: C.puro, tinta: C.oscuro, nombre: 'Nova', icono: 'voz' },
  aviso: { fondo: C.amarillo, tinta: C.oscuro, nombre: 'Nova', icono: 'aviso' },
} as const;

const Burbuja = ({ t, turno }: Readonly<{ t: number; turno: Turno }>) => {
  if (t < turno.desde - 0.1) return null;
  const estilo = ESTILOS[turno.quien];
  const palabras = turno.texto.split(' ');
  const dichas = Math.ceil(lineal(t, turno.desde, turno.hasta) * palabras.length);
  const propia = turno.quien === 'persona';
  return (
    <div style={{ alignSelf: propia ? 'flex-end' : 'flex-start', maxWidth: propia ? 800 : 1000, scale: String(rebote(t, turno.desde - 0.1)), transformOrigin: propia ? 'top right' : 'top left', background: estilo.fondo, borderRadius: 34, borderTopRightRadius: propia ? 6 : 34, borderTopLeftRadius: propia ? 34 : 6, padding: '22px 36px 28px', boxShadow: '12px 14px 0 rgb(0 0 0 / .28)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <Icono nombre={estilo.icono} tam={34} color={estilo.tinta} />
        <div style={{ ...sans(24, 700, estilo.tinta), letterSpacing: '.14em', textTransform: 'uppercase', opacity: 0.75 }}>{estilo.nombre}</div>
      </div>
      <div style={sans(44, 700, estilo.tinta)}>
        {palabras.map((palabra, i) => (
          <span key={`${palabra}-${i}`} style={{ opacity: i < dichas ? 1 : 0.18 }}>
            {i ? ' ' : ''}
            {palabra}
          </span>
        ))}
      </div>
    </div>
  );
};

// Ancho al que se muestra el clip vertical; es mayor que el marco para acercar la pantalla de Nova.
const ANCHO_CLIP = 760;

export const NovaReal = ({ t }: Readonly<{ t: number }>) => {
  // En cada grabación el dispositivo queda en un sitio distinto (fracción del ancho).
  const foco = mezclar(0.47, 0.6, vaiven(t, 35.1, 35.4));
  const entra = rampa(t, INICIO_NOVA, 0.6);
  const hablaNova = CHARLAS.some((c) => c.turnos.some((x) => x.quien !== 'persona' && t >= x.desde && t <= x.hasta));
  const charla = CHARLAS.find((c) => t >= c.desde && t < c.hasta) ?? CHARLAS[CHARLAS.length - 1];
  const verificada = vaiven(t, 40.8, 41.2);
  return (
    <>
      <Rafaga x={390} y={490} tam={1100} color={C.amarillo} giro={t * 7} escala={rebote(t, INICIO_NOVA, 80, 14)} opacidad={0.5} />
      {/* El video es vertical (576 × 1024): se recorta arriba y abajo. */}
      <div style={{ position: 'absolute', left: 90, top: 44, width: 600, height: 858, borderRadius: 34, overflow: 'hidden', border: '6px solid #fff', boxShadow: '22px 26px 0 rgb(0 0 0 / .3)', translate: `${mezclar(-760, 0, entra)}px 0`, rotate: `${mezclar(-6, -1, entra)}deg`, background: C.negro }}>
        <Sequence from={INICIO_NOVA * FPS} layout="none">
          <Video src={staticFile('clips/nova-real.mp4')} style={{ position: 'absolute', left: 294 - foco * ANCHO_CLIP, top: -146, width: ANCHO_CLIP, height: (ANCHO_CLIP * 16) / 9 }} />
        </Sequence>
        <div style={{ position: 'absolute', left: 22, bottom: 22, display: 'flex', alignItems: 'center', gap: 12, background: 'rgb(4 10 28 / .88)', borderRadius: 99, padding: '10px 22px' }}>
          <div style={{ width: 18, height: 18, borderRadius: 9, background: C.rojo, opacity: hablaNova ? 0.4 + Math.abs(Math.sin(t * 6)) * 0.6 : 0.4 }} />
          <div style={sans(24, 700)}>Prototipo real, grabado con sonido</div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 770, top: 60, width: 1070 }}>
        <Titular t={t} desde={INICIO_NOVA + 0.1} texto="Así responde Nova" tam={84} />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', height: 60, marginTop: 10 }}>
          {Array.from({ length: 46 }, (_, i) => (
            <div key={i} style={{ width: 11, borderRadius: 9, background: C.amarillo, height: hablaNova ? 8 + Math.abs(Math.sin(t * 12 + i * 0.7) * Math.sin(t * 5 + i * 0.31)) * 50 : 8 }} />
          ))}
        </div>
      </div>
      <div style={{ position: 'absolute', left: 770, top: 244, width: 1070, display: 'flex', flexDirection: 'column', gap: 28 }}>
        {charla.turnos.map((turno) => <Burbuja key={turno.texto} t={t} turno={turno} />)}
      </div>
      {/* Comprobado con web/data: es la única ruta que el mapa sugiere del aeropuerto al estadio. */}
      <div style={{ position: 'absolute', left: 770, top: 938, display: 'flex', alignItems: 'center', gap: 18, opacity: verificada, scale: String(rebote(t, 40.8)), transformOrigin: 'left center', background: C.verde, border: '4px solid #fff', borderRadius: 99, padding: '12px 30px' }}>
        <Icono nombre="visto" tam={46} />
        <div style={{ ...serif(34), textTransform: 'none' }}>Coincide con nuestro mapa: B17 · Ruta 4163</div>
      </div>
      <Estrella x={1790} y={120} tam={120} giro={t * 30} escala={rebote(t, INICIO_NOVA + 0.5)} />
    </>
  );
};
