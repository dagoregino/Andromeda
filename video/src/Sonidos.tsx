// Efectos de sonido (todos CC0, ver public/sfx/CREDITOS.md) y voz opcional.
// Para añadir la voz: un archivo por escena en public/voz/ (gancho.mp3, problema.mp3, …).
import { Audio } from '@remotion/media';
import { Sequence, getStaticFiles, staticFile } from 'remotion';
import { ESCENAS, INICIOS, type IdEscena } from './guion';
import { FPS } from './tema';

type Efecto = 'whoosh' | 'pop' | 'impact' | 'riser' | 'click' | 'tick' | 'ding' | 'glitch';

const VOLUMEN: Record<Efecto, number> = {
  whoosh: 0.42, pop: 0.34, impact: 0.55, riser: 0.4, click: 0.5, tick: 0.28, ding: 0.34, glitch: 0.35,
};

// Segundos dentro de cada escena en los que suena cada efecto.
const MARCAS: Record<IdEscena, Partial<Record<Efecto, readonly number[]>>> = {
  gancho: { impact: [0.35, 2.45, 4.45, 7.5, 9.2, 12.15], whoosh: [2.3, 4.3, 6.1, 8.3], glitch: [6.9], pop: [8.55, 8.67, 8.8, 8.92, 13.1], riser: [10.14] },
  problema: { pop: [1.2, 7.4, 11.2, 25.6, 29.1, 31.2], impact: [5.3, 12.2, 18.2], whoosh: [10, 17.2, 24.2], tick: [18.9, 19.5, 20.1, 20.7, 21.3] },
  propuesta: { whoosh: [1.45, 5.15, 6.55, 10.9], impact: [3.5, 15], pop: [6, 11.5, 11.8], tick: [12, 13.05, 14.1] },
  programa: {
    whoosh: [4.55, 14.25, 28.15, 33.4, 39.7, 45.9, 54.4, 62.4], pop: [2.8, 11.5, 38.5, 19.1, 19.7, 20.3, 20.9, 24.8, 29.5, 47.9, 52.6, 53.4],
    ding: [15, 20.2, 24.1, 39.2, 42.4, 49.6, 61.4], click: [46.9], impact: [0.9, 55.4, 59.7, 60.9],
  },
  demo: {
    impact: [0.4], whoosh: [3.15, 11.1, 14.95, 18.95, 22.95, 26.85, 48.95], click: [4.2, 6.5, 7.8, 20.7],
    // Mientras habla el dispositivo real (27 a 49 s) no suena nada encima.
    pop: [7.8, 12.2, 15.6, 20.4, 23.5, 49.4, 50.8, 52.2],
  },
  impacto: { pop: [1, 2.6, 4.8, 10.9], whoosh: [8.15], impact: [9.5], tick: [9.7, 9.92, 10.14, 10.36, 10.58] },
  cierre: { pop: [1.9, 2.7, 3.5, 8.5, 8.78, 9.06], whoosh: [6], impact: [6.6], ding: [7.6] },
};

export const archivoDeVoz = (id: IdEscena): string | undefined =>
  getStaticFiles().find((f) => new RegExp(`^voz/${id}\\.(mp3|wav|m4a|ogg)$`).test(f.name))?.name;

export const Sonidos = () => (
  <>
    {ESCENAS.map((escena, i) => {
      const voz = archivoDeVoz(escena.id);
      const marcas = Object.entries(MARCAS[escena.id]) as Array<[Efecto, readonly number[]]>;
      return (
        <Sequence key={escena.id} from={INICIOS[i]} durationInFrames={Math.round(escena.segundos * FPS)} name={`Sonido · ${escena.nombre}`} layout="none">
          {voz ? <Audio src={staticFile(voz)} /> : null}
          {marcas.flatMap(([efecto, tiempos]) =>
            tiempos.map((segundo) => (
              <Sequence key={`${efecto}-${segundo}`} from={Math.round(segundo * FPS)} layout="none" showInTimeline={false}>
                {/* Con voz grabada, los efectos bajan para no taparla. */}
                <Audio src={staticFile(`sfx/${efecto}.ogg`)} volume={VOLUMEN[efecto] * (voz ? 0.55 : 1)} />
              </Sequence>
            )),
          )}
        </Sequence>
      );
    })}
  </>
);
