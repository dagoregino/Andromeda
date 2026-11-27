// Iconos de línea propios (lienzo de 48 × 48).
import type { ReactNode } from 'react';
import { C } from '../tema';

const TRAZOS = {
  arbol: <><circle cx="24" cy="18" r="13" /><path d="M24 24v20M24 32l-7-6M24 36l7-7M14 44h20" /></>,
  arroyo: <><path d="M4 14c7-7 13 7 20 0s13 7 20 0M4 25c7-7 13 7 20 0s13 7 20 0M4 36c7-7 13 7 20 0s13 7 20 0" /></>,
  gota: <><path d="M24 5C16 16 11 23 11 30a13 13 0 0 0 26 0c0-7-5-14-13-25z" /><path d="M26 17l-7 13h6l-3 10 10-15h-7z" /></>,
  bus: <><rect x="8" y="7" width="32" height="30" rx="6" /><path d="M8 23h32M24 7v16" /><circle cx="16" cy="31" r="1.6" /><circle cx="32" cy="31" r="1.6" /><path d="M13 37v5M35 37v5" /></>,
  puesto: <><path d="M6 18l4-10h28l4 10M6 18c0 6 9 6 9 0 0 6 9 6 9 0 0 6 9 6 9 0 0 6 9 6 9 0M10 24v18h28V24M19 42V31h10v11" /></>,
  aviso: <><path d="M24 44S9 30 9 19a15 15 0 0 1 30 0c0 11-15 25-15 25z" /><path d="M24 11v11M24 28v.5" /></>,
  cuentas: <><path d="M8 42V6h24l8 8v28zM32 6v8h8" /><path d="M15 34v-8M23 34V20M31 34v-11" /></>,
  escuela: <><path d="M4 18l20-10 20 10-20 10z" /><path d="M12 23v11c6 6 18 6 24 0V23M44 18v13" /></>,
  silla: <><circle cx="22" cy="8" r="4" /><path d="M20 15v15h13l6 11h4M20 23h12" /><path d="M14 22a12 12 0 1 0 15 17" /></>,
  persona: <><circle cx="24" cy="12" r="7" /><path d="M10 43v-6c0-8 6-13 14-13s14 5 14 13v6" /></>,
  grupo: <><circle cx="17" cy="15" r="6" /><circle cx="34" cy="18" r="5" /><path d="M5 41v-4c0-7 5-11 12-11s12 4 12 11v4M31 29c7-1 12 3 12 9v3" /></>,
  mapa: <><path d="M6 11l12-5 12 5 12-5v31l-12 5-12-5-12 5zM18 6v31M30 11v31" /></>,
  voz: <><path d="M8 19h8l11-9v28l-11-9H8z" /><path d="M33 17a10 10 0 0 1 0 14M37 11a18 18 0 0 1 0 26" /></>,
  micro: <><rect x="17" y="5" width="14" height="24" rx="7" /><path d="M10 22c0 8 6 14 14 14s14-6 14-14M24 36v8M16 44h16" /></>,
  pantalla: <><rect x="6" y="9" width="36" height="25" rx="5" /><path d="M13 18h22M13 25h14M17 41h14" /></>,
  nube: <><path d="M13 37a9 9 0 0 1 1-18 12 12 0 0 1 23 3 7.5 7.5 0 0 1-1 15z" /></>,
  placa: <><rect x="11" y="11" width="26" height="26" rx="4" /><rect x="19" y="19" width="10" height="10" /><path d="M17 4v7M31 4v7M17 37v7M31 37v7M4 17h7M4 31h7M37 17h7M37 31h7" /></>,
  reloj: <><circle cx="24" cy="24" r="18" /><path d="M24 13v12l8 5" /></>,
  lluvia: <><path d="M13 28a8 8 0 0 1 1-16 11 11 0 0 1 21 3 6.5 6.5 0 0 1-1 13z" /><path d="M16 34l-3 8M26 34l-3 8M36 34l-3 8" /></>,
  sombra: <><circle cx="35" cy="11" r="6" /><path d="M35 1v1M45 11h-1M42 4l-.7.7M42 18l-.7-.7" /><path d="M5 28c2-10 24-10 26 0zM18 28v14M8 43h22" /></>,
  rayo: <><path d="M28 4L11 27h12l-4 17 19-25H26z" /></>,
  visto: <><circle cx="24" cy="24" r="19" /><path d="M14 25l7 7 14-15" /></>,
  globo: <><circle cx="24" cy="24" r="19" /><path d="M5 24h38M24 5c-12 12-12 26 0 38M24 5c12 12 12 26 0 38" /></>,
} satisfies Record<string, ReactNode>;

export type NombreIcono = keyof typeof TRAZOS;

export const Icono = ({
  nombre, tam = 48, color = C.blanco, grosor = 3, avance = 1,
}: Readonly<{ nombre: NombreIcono; tam?: number; color?: string; grosor?: number; avance?: number }>) => (
  <svg
    viewBox="0 0 48 48" width={tam} height={tam} fill="none" stroke={color} strokeWidth={grosor}
    strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', opacity: avance, overflow: 'visible' }}
  >
    {TRAZOS[nombre]}
  </svg>
);

// El patacón del logo, que se dibuja trazo a trazo.
export const Logo = ({ tam, avance = 1, color = C.amarillo }: Readonly<{ tam: number; avance?: number; color?: string }>) => (
  <svg viewBox="0 0 24 24" width={tam} height={tam} fill="none" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', overflow: 'visible' }}>
    {[
      'M12.1,7.1c2.6,0,4.8,2.1,4.8,4.8s-2.1,4.8-4.8,4.8',
      'M19.8,17.1c1-1.5,1.6-3.3,1.6-5.2s-.2-2.3-.6-3.3-.6-1-1.1-1.4-.8-.8-.9-1.2c-.6-1.6-1.5-2.1-2.5-2.4s-1.4-.2-2.1,0-1.9,0-2.3-.3c-.8-.5-1.7-.7-2.6-.5-2.3.7-4.4,2.1-5.5,4.2s-.5,2.1-.2,2.7c.4.8,0,2-.3,2.4-.5.8-.7,1.7-.5,2.6.5,1.5,1.3,2.9,2.4,4h0c.9,0,1.8.5,2.3,1.2s.8.9,1.3,1.1c1,.3,2,.5,3.1.5,1.8,0,3.5-.5,5-1.4,0,0,.1-3,2.9-3Z',
    ].map((d) => (
      <path key={d} d={d} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.min(1, avance)} />
    ))}
    {[[13.5, 12], [11, 10.5], [11.2, 13.1]].map(([cx, cy], i) => (
      <circle key={cy} cx={cx} cy={cy} r={Math.max(0, Math.min(1, avance * 3 - 2 - i * 0.15)) * 0.95} fill={color} stroke="none" />
    ))}
  </svg>
);
