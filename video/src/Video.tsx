import './fuentes';
import type { ComponentType } from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { E1Gancho } from './escenas/E1Gancho';
import { E2Problema } from './escenas/E2Problema';
import { E3Propuesta } from './escenas/E3Propuesta';
import { E5Demo } from './escenas/E5Demo';
import { E6Impacto } from './escenas/E6Impacto';
import { E7Cierre } from './escenas/E7Cierre';
import { E4Programa } from './escenas/programa/E4Programa';
import { ESCENAS, INICIOS, cuadrosDe, type IdEscena } from './guion';
import { Sonidos } from './Sonidos';
import { C } from './tema';
import { Subtitulos } from './ui/Subtitulos';
import { Barrido, MEDIA_TRANSICION } from './ui/Transicion';

export const COMPONENTES: Record<IdEscena, ComponentType> = {
  gancho: E1Gancho,
  problema: E2Problema,
  propuesta: E3Propuesta,
  programa: E4Programa,
  demo: E5Demo,
  impacto: E6Impacto,
  cierre: E7Cierre,
};

export type Opciones = { subtitulos: boolean };

export const Video = ({ subtitulos }: Opciones) => (
  <AbsoluteFill style={{ background: C.negro }}>
    {ESCENAS.map((escena, i) => {
      const Escena = COMPONENTES[escena.id];
      return (
        <Sequence key={escena.id} from={INICIOS[i]} durationInFrames={cuadrosDe(escena)} name={escena.nombre} premountFor={30}>
          <Escena />
          {subtitulos ? <Subtitulos frases={escena.frases} /> : null}
        </Sequence>
      );
    })}
    {INICIOS.slice(1).map((corte) => (
      <Sequence key={corte} from={corte - MEDIA_TRANSICION} durationInFrames={MEDIA_TRANSICION * 2} name="Barrido">
        <Barrido />
      </Sequence>
    ))}
    <Sonidos />
  </AbsoluteFill>
);
