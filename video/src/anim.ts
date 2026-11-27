import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { FPS } from './tema';

const FIJO = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

// Tiempo en segundos desde el inicio de la escena.
export const useT = (): number => useCurrentFrame() / useVideoConfig().fps;

// 0 → 1 con salida suave: para entradas.
export const rampa = (t: number, desde: number, dur = 0.6): number =>
  interpolate(t, [desde, desde + dur], [0, 1], { ...FIJO, easing: Easing.bezier(0.16, 1, 0.3, 1) });

// 0 → 1 acelerando y frenando: para recorridos y cámara.
export const vaiven = (t: number, desde: number, hasta: number): number =>
  interpolate(t, [desde, hasta], [0, 1], { ...FIJO, easing: Easing.inOut(Easing.cubic) });

export const lineal = (t: number, desde: number, hasta: number): number =>
  interpolate(t, [desde, hasta], [0, 1], FIJO);

// Visible entre `desde` y `hasta`, con entrada y salida suaves.
export const tramo = (t: number, desde: number, hasta: number, entra = 0.45, sale = 0.35): number =>
  rampa(t, desde, entra) * (1 - vaiven(t, hasta - sale, hasta));

// Entrada elástica; puede pasar un poco de 1.
export const rebote = (t: number, desde: number, rigidez = 130, freno = 13): number =>
  spring({ frame: Math.max(0, (t - desde) * FPS), fps: FPS, config: { stiffness: rigidez, damping: freno, mass: 0.8 } });

export const mezclar = (a: number, b: number, k: number): number => a + (b - a) * k;

export type Clave = readonly [tiempo: number, valor: number];

// Recorre una lista de valores en el tiempo, frenando en cada uno.
export const claves = (t: number, puntos: readonly Clave[]): number => {
  const ultimo = puntos[puntos.length - 1];
  if (t <= puntos[0][0]) return puntos[0][1];
  if (t >= ultimo[0]) return ultimo[1];
  const i = puntos.findIndex(([tiempo]) => tiempo > t);
  const [t0, v0] = puntos[i - 1];
  const [t1, v1] = puntos[i];
  return mezclar(v0, v1, vaiven(t, t0, t1));
};

// Número pseudoaleatorio estable para una semilla.
export const azar = (semilla: number): number => {
  const x = Math.sin(semilla * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
