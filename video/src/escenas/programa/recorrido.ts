// Dónde está cada cosa en la calle y dónde van la cámara y los personajes en cada segundo.
import { claves, lineal, vaiven } from '../../anim';

export const SUELO = 870;
export const ANCHO_MUNDO = 8000;

export const SITIOS = Object.freeze({
  casa: 330,
  nova: 1230,
  arroyo: 1800,
  puesto: 3500,
  estadio: 4160,
  tapada: 4660,
  parada: 5800,
  drenaje: 6760,
});

const puntos = (t: number, lista: ReadonlyArray<readonly [number, number]>): number => claves(t, lista);

export const camara = (t: number) => ({
  x: puntos(t, [
    [4.4, 3760], [6, 700], [9.2, 1180], [13.8, 1180], [15, 1560], [18.2, 1560], [19.8, 2000],
    [21.6, 2620], [23.8, 3420], [25.2, 3640], [28.1, 3640], [29.2, 6800], [37.9, 6760], [39.4, 6460],
    [44.7, 6360], [46.4, 4980], [50.2, 4820], [52, 3710], [66, 3710],
  ]),
  zoom: puntos(t, [
    [4.4, 0.78], [6, 1.14], [9.2, 1.16], [14, 1.16], [15, 1], [19, 1], [24, 1], [25.4, 1.18], [28.1, 1.2],
    [29.2, 1.14], [37.9, 1.14], [39.4, 0.98], [45, 0.98], [46.4, 1.1], [50.2, 1.1], [52, 1.24], [55, 1.3],
  ]),
});

const PUENTE = { desde: 1610, hasta: 1990, alto: 118 } as const;

export const rosa = (t: number) => {
  const x = puntos(t, [[5.4, 380], [9.4, 1030], [18, 1030], [19.7, 1800], [21.6, 2560], [23.6, 3200], [24.6, 3200], [25.8, 3605]]);
  const enPuente = x > PUENTE.desde && x < PUENTE.hasta;
  const y = SUELO - (enPuente ? Math.sin(((x - PUENTE.desde) / (PUENTE.hasta - PUENTE.desde)) * Math.PI) * PUENTE.alto : 0);
  const camina = (t > 5.4 && t < 9.4) || (t > 18 && t < 23.6) || (t > 24.6 && t < 25.8);
  return { x, y, paso: camina ? x / 26 : 0, detras: t > 25.2 };
};

export const bus = (t: number) => ({
  x: puntos(t, [[39.6, 4100], [41.8, 6120], [44.5, 6120], [46.3, 4900], [47.6, 4900], [49.8, 2200]]),
  rampa: vaiven(t, 41.8, 42.5) * (1 - vaiven(t, 44.1, 44.5)) + vaiven(t, 46.3, 46.7) * (1 - vaiven(t, 47.2, 47.6)),
});

export const emma = (t: number) => {
  const x = puntos(t, [
    [29, 7060], [30.6, 6880], [41.8, 6880], [42.6, 6520], [43.9, 6310], [46.3, 5090], [47.3, 5300],
    [47.9, 4960], [50.3, 4960], [52.4, 3880],
  ]);
  const subida = t > 42.4 && t < 44.5 ? 1 - lineal(x, 6340, 6500) : 0;
  // Dentro del bus no se dibuja.
  const visible = !(t > 43.9 && t < 46.5);
  return { x, y: SUELO - subida * 52, visible, rueda: -x * 1.1 };
};

// Posición en pantalla de un punto de la calle.
export const enPantalla = (t: number, x: number, y: number) => {
  const c = camara(t);
  return { x: (x - c.x) * c.zoom + 960, y: (y - 700) * c.zoom + 700 };
};
