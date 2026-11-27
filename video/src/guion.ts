// Fuente única de tiempos y voz. Los segundos de cada frase son relativos a su escena.
// Si se graba la voz, aquí se ajustan las duraciones y las frases.
import { FPS } from './tema';

export type IdEscena = 'gancho' | 'problema' | 'propuesta' | 'programa' | 'demo' | 'impacto' | 'cierre';

export type Frase = Readonly<{ desde: number; hasta: number; texto: string }>;

export type Escena = Readonly<{ id: IdEscena; nombre: string; segundos: number; frases: readonly Frase[] }>;

const f = (desde: number, hasta: number, texto: string): Frase => ({ desde, hasta, texto });

export const ESCENAS: readonly Escena[] = [
  {
    id: 'gancho',
    nombre: '1. Gancho',
    segundos: 15,
    frases: [
      f(0.4, 2.3, 'Llueve en Barranquilla.'),
      f(2.5, 4.3, 'La calle se vuelve río.'),
      f(4.5, 6.1, 'El bus no pasa.'),
      f(6.3, 8.2, 'En una casa se va la luz.'),
      f(8.5, 10.9, 'No es una película. Está pasando.'),
      f(12.1, 14.7, 'Ahora imagina que llega el Mundial.'),
    ],
  },
  {
    id: 'problema',
    nombre: '2. Problema',
    segundos: 35,
    frases: [
      f(0.9, 5.0, 'En 2019, Transmetro registró 29,5 millones de validaciones.'),
      f(5.2, 9.7, 'En 2025, 13,6 millones: menos de la mitad.'),
      f(10.4, 16.8, 'Entre barrios pobres y ricos hay más de cinco grados de diferencia en la temperatura de superficie.'),
      f(17.6, 23.8, 'Y en 2026 se han retirado 14.200 toneladas de residuos de los arroyos.'),
      f(24.6, 28.6, 'Nuestra prioridad: el sur y el occidente,'),
      f(28.8, 33.8, 'quienes andan en bus y las personas con discapacidad.'),
    ],
  },
  {
    id: 'propuesta',
    nombre: '3. Propuesta',
    segundos: 17,
    frases: [
      f(0.5, 2.9, 'El Mundial no puede ser el proyecto.'),
      f(3.1, 5.2, 'El proyecto es la ciudad.'),
      f(5.6, 10.6, 'Somos Andromeda y proponemos BaqNova: la ciudad al alcance de su gente.'),
      f(11.0, 16.2, 'Empieza con algo que ya se puede probar y crece hasta 2034.'),
    ],
  },
  {
    id: 'programa',
    nombre: '4. Programa',
    segundos: 65,
    frases: [
      f(0.5, 5.0, '¿Cómo se vería esa ciudad? Un día de partido, en 2034.'),
      f(5.6, 8.8, 'Rosa vende jugos cerca del estadio.'),
      f(9.2, 14.0, 'No tiene celular, así que se acerca a Nova y pregunta: «¿Hay avisos cerca?».'),
      f(14.3, 19.7, 'Nova le responde, con voz y en pantalla: «Hay un arroyo en tu ruta. Toma otro camino».'),
      f(20.1, 23.4, 'Rosa llega bajo la sombra a su puesto.'),
      f(23.7, 28.2, 'Cuando la ciudad cambió, contó con ella, y su puesto siguió en pie.'),
      f(29.0, 33.3, 'Emma acaba de llegar de Canadá y se mueve en silla de ruedas.'),
      f(33.6, 37.9, 'Abre BaqNova en inglés y mira qué bus la lleva al estadio.'),
      f(38.3, 45.0, 'Cae un aguacero: el drenaje responde, el bus toma otra ruta y un andén accesible le permite subir.'),
      f(45.4, 50.2, 'Ve una alcantarilla tapada, la reporta y alguien responde.'),
      f(51.0, 54.4, 'En la entrada, Emma le compra un jugo a Rosa.'),
      f(55.0, 59.4, 'Detrás de ese encuentro hay una ciudad con energía de respaldo,'),
      f(59.6, 64.2, 'cuentas claras y una escuela de ciudad que prepara a su gente.'),
    ],
  },
  {
    id: 'demo',
    nombre: '5. Demostración',
    segundos: 54.5,
    frases: [
      f(0.5, 3.0, 'Y no es solo una idea.'),
      f(3.4, 7.0, 'En nuestro mapa eliges a dónde vas'),
      f(7.2, 10.8, 'y ves qué buses te pueden servir, entre 91 recorridos de referencia.'),
      f(11.2, 14.6, 'Antes de salir, te muestra el clima.'),
      f(15.2, 18.6, 'Hay 14 cursos propuestos sobre la ciudad,'),
      f(18.9, 22.6, 'y la web funciona en español y en inglés.'),
      f(23.3, 26.9, '¿Y quien no tiene celular? Para eso está Nova. Escúchenla.'),
      // De 27 a 49 s habla el dispositivo real (NovaReal.tsx): sin narrador.
      f(49.2, 54.3, 'Ya responde sobre rutas. Sigue imprimir su carcasa y probarlo con personas con discapacidad.'),
    ],
  },
  {
    id: 'impacto',
    nombre: '6. Impacto',
    segundos: 13.5,
    frases: [
      f(0.6, 4.4, 'Buscamos viajes mejor preparados, preguntar sin depender de un celular'),
      f(4.6, 8.0, 'y barrios que aprendan y vigilen.'),
      f(8.9, 12.8, 'El primer paso: medir dónde estamos.'),
    ],
  },
  {
    id: 'cierre',
    nombre: '7. Cierre',
    segundos: 12,
    frases: [
      f(0.5, 2.9, 'Si el Mundial nunca llega, la sombra, el drenaje'),
      f(3.1, 6.0, 'y los buses seguirán haciendo falta.'),
      f(6.6, 9.6, 'BaqNova: primero, la gente.'),
    ],
  },
];

export const cuadrosDe = (escena: Escena): number => Math.round(escena.segundos * FPS);

// Cuadro del video completo en el que empieza cada escena.
export const INICIOS: readonly number[] = ESCENAS.map((_, i) =>
  ESCENAS.slice(0, i).reduce((suma, e) => suma + cuadrosDe(e), 0),
);

export const CUADROS_TOTALES = ESCENAS.reduce((suma, e) => suma + cuadrosDe(e), 0);
