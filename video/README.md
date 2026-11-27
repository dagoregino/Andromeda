# Video de presentación de BaqNova

3:32 minutos. Hecho con Remotion.

**[baqnova.mp4](baqnova.mp4)** es la versión actual: 960 × 540, con efectos y la voz de Nova, **todavía sin narración**. La versión final (1920 × 1080) se genera cuando esté la voz.

## Usarlo

Desde esta carpeta:

```powershell
npm run dev
```

Abre Remotion Studio: la composición `BaqNova` es el video completo y en `Escenas` está cada parte sola.

```powershell
npm run render
```

Genera `out/baqnova.mp4`. **Antes del render final se revisan y aprueban los cuadros** (`npm run cuadros`).

## En una copia nueva del repositorio

Los clips de `public/clips/` y las librerías no se suben a git. Antes de renderizar: `npm install`, `npm run grabar`, `node herramientas/captura-telefono.mjs` y `node herramientas/recortar-nova.mjs` con las grabaciones originales del dispositivo.

## Escenas

| Tiempo | Parte | Archivo |
|---|---|---|
| 0:00–0:15 | Gancho | `src/escenas/E1Gancho.tsx` |
| 0:15–0:50 | Problema | `src/escenas/E2Problema.tsx` |
| 0:50–1:07 | Propuesta | `src/escenas/E3Propuesta.tsx` |
| 1:07–2:12 | Programa: Rosa y Emma | `src/escenas/programa/` |
| 2:12–3:06 | Demostración (Nova real de 2:39 a 3:01) | `src/escenas/E5Demo.tsx`, `NovaReal.tsx` |
| 3:06–3:20 | Impacto | `src/escenas/E6Impacto.tsx` |
| 3:20–3:32 | Cierre | `src/escenas/E7Cierre.tsx` |

El texto de la voz y sus tiempos están en `src/guion.ts`.

## Grabación del dispositivo real

`public/clips/nova-real.mp4` une las mejores partes de dos grabaciones (22 s, con su sonido). Se genera así:

```powershell
node herramientas/recortar-nova.mjs "<video del saludo>" "<video de la ruta>"
```

Los textos que aparecen junto al video están en `src/escenas/NovaReal.tsx`. Guarda las grabaciones originales: el `.mp4` no se sube a git.

La ruta que menciona Nova (4163 de Coolitoral) coincide con la única que sugiere el mapa del aeropuerto al estadio (`web/data/rutas-amb.json`).

## Pendiente de material propio

### Voz

Un archivo por parte en `public/voz/`: `gancho`, `problema`, `propuesta`, `programa`, `demo`, `impacto`, `cierre` (`.mp3`, `.wav`, `.m4a` u `.ogg`). Se detectan solos y los efectos bajan. Si la lectura no cabe en su tiempo, se ajusta `src/guion.ts`; los movimientos de cada escena están fijados en segundos y también habría que moverlos.

### Letra de los titulares

La web usa **Gloock**. Mientras `public/fonts/Gloock.woff2` no exista, los titulares usan Bodoni MT (el respaldo que declara la web).

## Clips de la web

Se grabaron de la web local con Playwright. Para repetirlos, sirve la carpeta `web` en el puerto 4173 y ejecuta:

```powershell
npm run grabar
```

```powershell
node herramientas/captura-telefono.mjs
```

La grabación consulta los servicios que usa la web (OpenStreetMap y Open-Meteo), así que el clima cambia según el día. Los clips `.mp4` no se suben a git.

## Qué es real y qué es ilustrativo

| En pantalla | Origen |
|---|---|
| Cifras de transporte, calor y arroyos | `web/index.html`, con su fuente y su advertencia en pantalla |
| Programa, indicadores y etapas | `programa/README.md`; se marcan como propuesta |
| Historia de Rosa y Emma | Inventada; la pantalla lo dice durante toda la parte |
| Mapa, clima, cursos e idioma | Grabaciones de la web local |
| Nova respondiendo | Grabación real del prototipo |
| Carcasa 3D | Diseño sin imprimir; la pantalla lo dice |

## Sonido

Efectos CC0, detallados en [`public/sfx/CREDITOS.md`](public/sfx/CREDITOS.md). No hay música ni voz todavía.
