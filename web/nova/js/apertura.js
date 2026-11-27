// Cuánto se abre la tapa del prototipo según dónde está en la ventana. Función pura.
import { limitar } from './pose.js';

// Distancias entre el centro del modelo y el de la ventana, como fracción de su altura.
const ABIERTA_HASTA = 0.08;
const CERRADA_DESDE = 0.45;

// 0 = cerrada, 1 = abierta.
export function apertura({ arriba, alto, ventana }) {
  if (!(ventana > 0)) return 0;
  const distancia = Math.abs(arriba + alto / 2 - ventana / 2) / ventana;
  const avance = limitar((CERRADA_DESDE - distancia) / (CERRADA_DESDE - ABIERTA_HASTA), 0, 1);
  return avance * avance * (3 - 2 * avance);
}
