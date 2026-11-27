// Textos animados: titulares palabra por palabra, etiquetas, fuentes y contadores.
import type { CSSProperties } from 'react';
import { mezclar, rampa, rebote, vaiven } from '../anim';
import { PESO_SERIF } from '../fuentes';
import { C, SANS, SERIF } from '../tema';

export const serif = (tam: number, color: string = C.blanco): CSSProperties => ({
  fontFamily: SERIF, fontWeight: PESO_SERIF, fontSize: tam, lineHeight: 0.95, letterSpacing: '-.012em',
  textTransform: 'uppercase', color,
});

export const sans = (tam: number, peso = 600, color: string = C.blanco): CSSProperties => ({
  fontFamily: SANS, fontWeight: peso, fontSize: tam, lineHeight: 1.25, color, letterSpacing: '-.01em',
});

// Cada palabra sube desde detrás de una línea invisible.
export const Titular = ({
  t, desde, texto, tam, color = C.blanco, paso = 0.09, centrado = false, style,
}: Readonly<{
  t: number; desde: number; texto: string; tam: number; color?: string; paso?: number; centrado?: boolean;
  style?: CSSProperties;
}>) => (
  <div
    style={{
      ...serif(tam, color), display: 'flex', flexWrap: 'wrap', columnGap: tam * 0.24,
      justifyContent: centrado ? 'center' : 'flex-start', ...style,
    }}
  >
    {texto.split(' ').map((palabra, i) => {
      const k = rampa(t, desde + i * paso, 0.75);
      return (
        <span key={`${palabra}-${i}`} style={{ display: 'inline-block', overflow: 'hidden', padding: '0.14em 0.04em 0.08em', margin: '-0.14em -0.04em -0.04em' }}>
          <span style={{ display: 'inline-block', translate: `0 ${mezclar(112, 0, k)}%`, rotate: `${mezclar(7, 0, k)}deg`, opacity: k > 0.01 ? 1 : 0 }}>{palabra}</span>
        </span>
      );
    })}
  </div>
);

export const Aparece = ({
  t, desde, children, dy = 36, style,
}: Readonly<{ t: number; desde: number; children: React.ReactNode; dy?: number; style?: CSSProperties }>) => {
  const k = rampa(t, desde, 0.7);
  return <div style={{ opacity: k, translate: `0 ${mezclar(dy, 0, k)}px`, ...style }}>{children}</div>;
};

export const Pildora = ({
  t, desde, texto, fondo = C.amarillo, color = C.oscuro, tam = 26, style,
}: Readonly<{ t: number; desde: number; texto: string; fondo?: string; color?: string; tam?: number; style?: CSSProperties }>) => (
  <div
    style={{
      ...sans(tam, 700, color), display: 'inline-block', padding: `${tam * 0.4}px ${tam * 0.95}px`, borderRadius: 999,
      background: fondo, scale: String(rebote(t, desde)), opacity: rampa(t, desde, 0.2), whiteSpace: 'nowrap', ...style,
    }}
  >
    {texto}
  </div>
);

// Fuente de un dato, con barra amarilla como en la web.
export const FuenteDato = ({
  t, desde, linea, aviso, style,
}: Readonly<{ t: number; desde: number; linea: string; aviso?: string; style?: CSSProperties }>) => (
  <Aparece t={t} desde={desde} dy={18} style={{ borderLeft: `5px solid ${C.amarillo}`, paddingLeft: 18, ...style }}>
    <div style={sans(28, 600, C.suave)}>{linea}</div>
    {aviso ? <div style={sans(24, 500, C.suave)}>{aviso}</div> : null}
  </Aparece>
);

const formato = (v: number, decimales: number): string => {
  const [entero, fraccion] = v.toFixed(decimales).split('.');
  const miles = entero.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return fraccion ? `${miles},${fraccion}` : miles;
};

export const Contador = ({
  t, desde, hasta, inicio = 0, valor, decimales = 0, antes = '', despues = '', style,
}: Readonly<{
  t: number; desde: number; hasta: number; inicio?: number; valor: number; decimales?: number;
  antes?: string; despues?: string; style?: CSSProperties;
}>) => (
  <span style={{ fontVariantNumeric: 'tabular-nums', ...style }}>
    {antes}
    {formato(mezclar(inicio, valor, vaiven(t, desde, hasta)), decimales)}
    {despues}
  </span>
);

// Número de sección en contorno amarillo, como las listas de la web.
export const NumeroContorno = ({ numero, tam, style }: Readonly<{ numero: string; tam: number; style?: CSSProperties }>) => (
  <div style={{ ...serif(tam, 'transparent'), WebkitTextStroke: `2.5px ${C.amarillo}`, transform: 'skewX(-8deg)', ...style }}>{numero}</div>
);
