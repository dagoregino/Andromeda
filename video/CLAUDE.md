# Video de presentación de BaqNova

Proyecto Remotion. Cómo se usa y qué falta: [README.md](README.md). Entorno de origen: `Desktop\edicion de video`.

## Reglas (heredadas de ese entorno)

- Responder en español.
- Solo opciones gratis: sin cuentas nuevas, pagos ni claves de API.
- Antes de descargar algo nuevo (programas, modelos, música, sonidos, letras), decir qué es y de dónde sale y esperar el sí.
- No poner en pantalla datos que no sean verdad; si no se sabe, preguntar. Indicar qué es ilustrativo.
- Antes de un render final, mostrar cuadros sueltos y esperar aprobación.
- Música solo sin derechos de autor; anotar su origen.

## Equipo

Poca RAM libre: renderizar con 2 cuadros en paralelo (ya está en `remotion.config.ts`).

## Estética

Colores de `web/css/paleta.css` (en `src/tema.ts`). Titulares serif en mayúscula, ráfagas, estrella, recortes con borde blanco y franja tricolor, como la web.

## Comprobar un cambio

`npm run revisar` (tipos), `npm run cuadros` (cuadros de revisión) y `node herramientas/barrido.mjs` (un cuadro por segundo, sin errores).

## Skills

Las de HyperFrames se copiaron en `.claude/skills/`; las de Remotion, sonido y reels son las del usuario. La skill `sound-effects` usa el Python de `Desktop\edicion de video\.sound-effects`.
