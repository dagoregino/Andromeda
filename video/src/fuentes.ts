import { cancelRender, continueRender, delayRender, getStaticFiles, staticFile } from 'remotion';

// La web usa Gloock (titulares) e Inter. Si public/fonts/Gloock.woff2 existe, se usa;
// mientras tanto los titulares salen en Bodoni MT, el respaldo que declara la propia web.
export const hayGloock = getStaticFiles().some((f) => f.name === 'fonts/Gloock.woff2');
export const PESO_SERIF = hayGloock ? 400 : 700;

const FUENTES: ReadonlyArray<readonly [familia: string, archivo: string, peso: string]> = [
  ['BaqSans', 'fonts/Inter-400.woff2', '100 500'],
  ['BaqSans', 'fonts/Inter-700.woff2', '501 900'],
  ...(hayGloock ? ([['BaqSerif', 'fonts/Gloock.woff2', '100 900']] as const) : []),
];

const espera = delayRender('Cargando las letras');

Promise.all(
  FUENTES.map(async ([familia, archivo, peso]) => {
    const letra = new FontFace(familia, `url("${staticFile(archivo)}")`, { weight: peso });
    await letra.load();
    document.fonts.add(letra);
  }),
)
  .then(() => continueRender(espera))
  .catch((error: unknown) => cancelRender(error));
