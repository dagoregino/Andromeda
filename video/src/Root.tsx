import { AbsoluteFill, Composition, Folder } from 'remotion';
import { CUADROS_TOTALES, ESCENAS, cuadrosDe, type Escena } from './guion';
import { ALTO, ANCHO, FPS } from './tema';
import { Subtitulos } from './ui/Subtitulos';
import { COMPONENTES, Video } from './Video';

// Cada escena también se puede abrir sola en Remotion Studio.
const Suelta = (escena: Escena) => {
  const Componente = COMPONENTES[escena.id];
  const Vista = () => (
    <AbsoluteFill>
      <Componente />
      <Subtitulos frases={escena.frases} />
    </AbsoluteFill>
  );
  return Vista;
};

const SUELTAS = ESCENAS.map((escena) => ({ escena, Vista: Suelta(escena) }));

export const Root = () => (
  <>
    <Composition
      id="BaqNova" component={Video} durationInFrames={CUADROS_TOTALES} fps={FPS} width={ANCHO} height={ALTO}
      defaultProps={{ subtitulos: true }}
    />
    <Folder name="Escenas">
      {SUELTAS.map(({ escena, Vista }) => (
        <Composition key={escena.id} id={escena.id} component={Vista} durationInFrames={cuadrosDe(escena)} fps={FPS} width={ANCHO} height={ALTO} />
      ))}
    </Folder>
  </>
);
