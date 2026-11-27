// Ventana de navegador que muestra un clip grabado de la web, con acercamiento opcional.
import { Video } from '@remotion/media';
import type { ReactNode } from 'react';
import { Sequence, staticFile } from 'remotion';
import { mezclar } from '../anim';
import { C, FPS } from '../tema';
import { sans } from './Texto';

export type Zoom = Readonly<{ escala: number; x: number; y: number }>;

const SIN_ZOOM: Zoom = { escala: 1, x: 0.5, y: 0.5 };

export const Clip = ({
  archivo, desde, inicio = 0, velocidad = 1,
}: Readonly<{ archivo: string; desde: number; inicio?: number; velocidad?: number }>) => (
  // `desde` es el segundo de la escena en que empieza; `inicio`, el segundo del clip.
  <Sequence from={Math.round(desde * FPS)} layout="none">
    <Video
      src={staticFile(`clips/${archivo}`)} trimBefore={Math.round(inicio * FPS)} playbackRate={velocidad} muted
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    />
  </Sequence>
);

export const Navegador = ({
  ruta, children, zoom = SIN_ZOOM, ancho = 1440, avance = 1,
}: Readonly<{ ruta: string; children: ReactNode; zoom?: Zoom; ancho?: number; avance?: number }>) => {
  const alto = (ancho * 9) / 16;
  return (
    <div
      style={{
        position: 'absolute', left: (1920 - ancho) / 2, top: 42, width: ancho, borderRadius: 24, overflow: 'hidden',
        border: '5px solid #fff', background: C.negro, boxShadow: '26px 30px 0 rgb(0 0 0 / .3)',
        translate: `0 ${mezclar(160, 0, avance)}px`, opacity: Math.min(1, avance * 2), scale: String(mezclar(0.9, 1, avance)),
      }}
    >
      <div style={{ height: 48, background: '#14161d', display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px' }}>
        {[C.rojo, C.amarillo, C.verdeClaro].map((c) => <div key={c} style={{ width: 17, height: 17, borderRadius: 9, background: c }} />)}
        <div style={{ ...sans(20, 600, C.suave), marginLeft: 26, background: '#262a36', borderRadius: 99, padding: '4px 22px' }}>{ruta}</div>
      </div>
      <div style={{ position: 'relative', width: '100%', height: alto, overflow: 'hidden' }}>
        <div
          style={{
            position: 'absolute', inset: 0, transformOrigin: '0 0',
            // Lleva el punto (x, y) del clip al centro sin dejar bordes vacíos.
            translate: `${-Math.min(Math.max(zoom.x * zoom.escala - 0.5, 0), zoom.escala - 1) * 100}% ${-Math.min(Math.max(zoom.y * zoom.escala - 0.5, 0), zoom.escala - 1) * 100}%`,
            scale: String(zoom.escala),
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
