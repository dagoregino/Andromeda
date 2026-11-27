// Los siete componentes de programa/README.md, con el segundo en que se encienden en la historia.
import { C } from '../../tema';
import type { NombreIcono } from '../../ui/Iconos';

export type Componente = Readonly<{ id: string; nombre: string; icono: NombreIcono; color: string; enciende: number }>;

export const COMPONENTES: readonly Componente[] = [
  { id: 'sombra', nombre: 'Sombra', icono: 'sombra', color: C.verde, enciende: 20.2 },
  { id: 'drenaje', nombre: 'Drenaje y energía', icono: 'gota', color: C.azul, enciende: 39.2 },
  { id: 'transporte', nombre: 'Transporte accesible', icono: 'bus', color: C.amarillo, enciende: 42.4 },
  { id: 'oportunidades', nombre: 'Oportunidades', icono: 'puesto', color: C.rojo, enciende: 24.1 },
  { id: 'avisos', nombre: 'Avisos y respuesta', icono: 'aviso', color: C.naranja, enciende: 15 },
  { id: 'cuentas', nombre: 'Cuentas claras', icono: 'cuentas', color: C.encima, enciende: 59.8 },
  { id: 'escuela', nombre: 'Escuela de ciudad', icono: 'escuela', color: C.verdeClaro, enciende: 61.4 },
];

export const textoSobre = (color: string): string => (color === C.amarillo || color === C.naranja ? C.oscuro : C.blanco);
