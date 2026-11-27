# Web de Barranquilla Lista

Un mapa para moverse por Barranquilla, con dos vistas:

- **Cómo llegar:** se elige un destino y el punto de salida, y se consultan las rutas de bus de ejemplo que sirven, sin transbordos.
- **Todas las rutas:** se filtra por empresa, código o nombre y se ve el recorrido completo, los lugares conocidos cerca y las paradas cuando se conocen.

## Verla en tu equipo

Desde la carpeta `web`:

```powershell
python -m http.server 4173
```

Luego abre <http://localhost:4173>. Necesita un servidor: abrir el archivo con doble clic no carga los datos. La ubicación del navegador solo funciona en `localhost` o con HTTPS.

## Estructura

| Ruta | Contenido |
|---|---|
| `index.html`, `css/inicio.css`, `img/portada.svg` | Página de inicio |
| `img/logo.svg`, `favicon.svg` | Logo provisional (patacón en amarillo; el original está en `img/patacon-negro.svg`) |
| `mapa/index.html` | La aplicación del mapa |
| `js/app.js` | Interacción y estado del viaje |
| `js/mapa.js`, `js/listas.js` | Mapa y listas |
| `js/geo.js`, `js/destinos.js`, `js/rutas.js`, `js/accesibilidad.js` | Lógica sin interfaz, con pruebas |
| `js/accesibilidadVista.js` | Bloque de accesibilidad del destino |
| `js/clima.js`, `js/climaVista.js` | Línea «Antes de salir» con el clima (lógica con pruebas y vista) |
| `data/destinos.json` | Lugares de destino (ubicaciones aproximadas) |
| `data/accesibilidad.json` | Accesibilidad de 6 destinos, según TUR4all |
| `data/rutas.json` | 4 recorridos de Transmetro, de OpenStreetMap |
| `data/rutas-amb.json` | 87 recorridos de buses tradicionales, del AMB |
| `css/paleta.css`, `css/app.css` | Colores y diseño |
| `vendor/leaflet/` | Leaflet 1.9.4 (BSD-2) |

## Pruebas

```powershell
npm test
```

## Accesibilidad física

En **Cómo llegar**, con destino y salida elegidos, aparece una línea con el veredicto y una fecha. **Ver detalle** muestra Llegada, Ingreso, Dentro y Baño; **Ver todos los criterios** abre el resto. Si el destino no tiene datos (o es un punto marcado en el mapa), no aparece nada.

### De dónde salen los datos

Los de hoy vienen de los informes de accesibilidad de [TUR4all](https://www.tur4all.com/destinations/barranquilla), que según el sitio fueron aportados por profesionales. Consultados el 2026-11-26. **No son una auditoría del equipo ni una certificación oficial.**

| Destino | Ficha |
|---|---|
| Estadio Metropolitano | [ver](https://www.tur4all.com/resources/estadio-metropolitano-roberto-melendez) |
| Gran Malecón | [ver](https://www.tur4all.com/resources/gran-malecon-de-barranquilla) |
| Zoológico | [ver](https://www.tur4all.com/resources/zoologico-de-barranquilla) |
| Estación Joe Arroyo | [ver](https://www.tur4all.com/resources/estacion-joe-arroyo-de-transmetro) |
| Ventana al Mundo | [ver](https://www.tur4all.com/resources/ventana-al-mundo) |
| Ciénaga de Mallorquín | [ver](https://www.tur4all.com/resources/ecoparque-cienaga-de-mallorquin) |

Sin datos: aeropuerto, Buenavista, Catedral, Plaza de la Paz, Museo del Caribe, Gran Bazar y Portal de Soledad. No se hallaron fichas para ellos en TUR4all.

**Límites que conviene saber:**

- Las fichas no indican cuándo se visitó el lugar. La fecha en pantalla es la de consulta. El estadio tuvo obras en 2026 y la ficha puede no reflejarlas.
- Cubren pocos criterios, así que hoy los seis destinos salen como **«Sin información»**. El detalle sí muestra lo que cada ficha informa.
- El [aviso legal de TUR4all](https://www.tur4all.com/legal-notice) prohíbe reproducir o transformar sus contenidos sin autorización. Aquí se anotan hechos con palabras propias y enlace a la ficha. **Conviene pedir autorización antes de publicar la web.** Si no se obtiene, se quitan esas entradas.

**Cómo se pasó cada ficha a criterios.** Solo se usa el informe detallado; lo que no dice queda `sinDato`.

| La ficha dice | Criterio |
|---|---|
| Entorno exterior: aceras sin obstáculos | `andenContinuo` |
| Acceso sin desniveles | `sinEscalon` |
| Paso de la puerta de entrada de 78 cm o más | `puertaAccesible` |
| Rampa utilizable de forma autónoma | `rampa` |
| Circulación con silla de ruedas total | `rutaAccesible` |
| Pavimento antideslizante en áreas al aire libre | `pisoFirme` |
| Ascensor entre plantas | `ascensor` |
| Aseo para personas con movilidad reducida | `bano` (`parcial` si no tiene espacio de giro de 150 cm) |
| Mostrador de atención junto a la entrada | `informacion` |
| Bancos y sillas | `asientos` (`sinDato` si la ficha también pide mejorar el mobiliario) |
| Zona de descanso con sombra | `servicios.sombra` |

No se cargan las etiquetas de resumen sin detalle, como «Interpretación en lengua de signos». El ancho exacto queda `null` porque las fichas solo dan un mínimo.

### Estados

| En el archivo | En pantalla |
|---|---|
| `si` | Se puede |
| `parcial` | Con ayuda |
| `no` | No se puede |
| `sinDato` | Sin información |
| `noAplica` | No aplica |

En todos los criterios, `si` es la respuesta favorable. Un criterio que falta cuenta como `sinDato`, salvo los tres críticos: deben estar escritos o el archivo no es válido.

### Criterios

| Bloque | Criterios (nombre en el archivo) |
|---|---|
| `llegada` | Andén continuo (`andenContinuo`), rebaje en la esquina o vado (`vado`), cruce con semáforo (`cruceSemaforo`), iluminación (`iluminacion`), sombra (`sombra`) |
| `ingreso` | Puerta accesible (`puertaAccesible`), **entrada sin escalón** (`sinEscalon`), rampa (`rampa`), timbre (`timbre`) y ancho de la puerta en metros (`anchoMetros`) |
| `dentro` | **Ruta accesible** (`rutaAccesible`), piso firme (`pisoFirme`), paso sin obstáculos (`sinObstaculos`), ascensor (`ascensor`) y ancho del paso en metros (`anchoMetros`) |
| `servicios` | **Baño accesible** (`bano`), punto de información (`informacion`), asientos (`asientos`), agua (`agua`), sombra (`sombra`) |
| `comunicacion` | Pictogramas (`pictogramas`), braille (`braille`), lenguaje claro (`lenguajeClaro`), audio (`audio`), lengua de señas (`lenguaSenas`) |
| `emergencia` | Salida de emergencia accesible (`evacuacion`), alarma con luz (`alarmaVisual`), punto de encuentro (`puntoEncuentro`) |

En **negrita**, los tres criterios críticos. Los anchos son un número en metros o `null`; se muestran, pero no cambian el veredicto.

### Veredicto

Se aplica la primera regla que se cumpla. «Aplicables» son todos los criterios menos los `noAplica`.

1. **No accesible:** algún crítico es `no`.
2. **Sin información:** algún crítico es `sinDato` o `noAplica`, o más de la mitad de los aplicables son `sinDato`.
3. **Accesible con ayuda:** algún crítico es `parcial` o algún no crítico es `no`.
4. **Accesible:** al menos el 80 % de los aplicables son `si` (con los críticos en `si`).
5. En cualquier otro caso, **accesible con ayuda**.

En el detalle, cada fila (Llegada, Ingreso y Dentro) aplica estas reglas solo a su bloque, con tres diferencias. Dice «No se puede» si todo lo aplicable es `no`, y «No aplica» si nada aplica. Solo dice «Con ayuda» si algún criterio es `parcial` o `no`: cuando lo único que falta son datos, manda el criterio crítico y, si el bloque no tiene, queda «Sin información». La fila Baño muestra directamente el criterio `bano`.

### Agregar un lugar

Añade el lugar en `data/accesibilidad.json` y ejecuta `npm test`. Siempre lleva:

- `destinoId` (debe existir en `destinos.json`, sin repetirse).
- `bloques`, con los seis grupos.
- `notas` (texto corto para `llegada`, `ingreso`, `dentro` y `bano`).
- `ejemplo`: `false` con datos reales. Solo así se muestra. Nunca marques así un dato inventado.

Además, según su origen:

- **Informe ajeno:** `fuente`, con `nombre`, `url` (https) y `consultado` (AAAA-MM-DD).
- **Visita del equipo:** `fecha` (AAAA-MM-DD), `hora` (HH:MM), `auditores`, `clima`, `punto` (`lat`, `lng`), `parada` (`nombre`, `distanciaMetros`) y `fotos` (rutas relativas). No lleva `fuente`.

Las pruebas con datos reales esperan los seis lugares actuales: actualízalas al cambiarlos. Si el archivo tiene un error, la aplicación no muestra ninguna entrada y lo explica en la consola; las rutas siguen funcionando.

### Marco de referencia

La lista de criterios y las reglas del veredicto son del equipo. Estos documentos son el marco de referencia; **aún no se han contrastado criterio por criterio**:

- [Decreto 1538 de 2005](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=16540), accesibilidad al espacio público y a edificios abiertos al público (reglamenta la Ley 361 de 1997). Confirma su texto vigente antes de citarlo.
- [Ley Estatutaria 1618 de 2013](https://funcionpublica.gov.co/eva/gestornormativo/norma.php?i=52081), derechos de las personas con discapacidad.
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/), referencia para la interfaz; no evalúa lugares físicos.
- Pendiente de consultar: la norma técnica NTC 6047 de 2013 (ICONTEC), para definir anchos y pendientes mínimos.

## Rutas de bus

Son **datos de ejemplo**: no están verificados con las empresas. Las dos fuentes van en archivos separados porque tienen fuentes y licencias distintas.

### Transmetro (`rutas.json`)

B1, S2, GM y VM, de [OpenStreetMap](https://www.openstreetmap.org/copyright), © colaboradores de OpenStreetMap, licencia [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/). Consultadas el 2026-11-26. B1 y S2 tienen paradas; GM y VM no. No incluye las demás rutas de Transmetro.

### Buses tradicionales (`rutas-amb.json`)

Recorridos publicados en el [visor del Área Metropolitana de Barranquilla](https://www.ambq.gov.co/transporte/transporte-publico-colectivo/), consultados el 2026-11-26. La propiedad es de quien indica el AMB en sus [condiciones de uso](https://www.ambq.gov.co/condiciones-de-uso/).

- **Cobertura:** el visor lista 89 recorridos distintos. Quedaron fuera A4-4109 y D8-4165 porque su trazado viene fragmentado.
- **Sentido:** los archivos no lo declaran. Se toma el orden del trazado, contrastado solo con la A-16 de La Carolina en OpenStreetMap, donde coincide en la mayoría de los tramos. La aplicación avisa que no está confirmado.
- **Sin paradas ni nombres de recorrido:** salvo B18, se muestra el número de ruta.
- La capa de origen se llama `rutas_2026_proy`; falta confirmar si son recorridos vigentes o proyectados. La fecha de los archivos es 2026-05-20.
- Los trazados se simplificaron con una tolerancia de 6 m y se cerró cada circuito.

## Cómo se calcula

- Se sugiere una ruta si hay dónde subir y bajar a menos de 800 m en línea recta del origen y del destino, siguiendo el sentido del recorrido.
- En las rutas sin paradas registradas, el punto de abordaje es aproximado.
- No se sugiere el bus si caminar directo es más corto, ni si el viaje en bus supera 4 veces la línea recta más 3 km.
- Se ordenan por conveniencia: la caminata más una décima parte del trayecto en bus. Primero se muestran 8.
- No hay transbordos.
- Los tramos a pie son líneas rectas: no consideran calles, arroyos ni accesibilidad.

Para agregar una ruta, añade su recorrido en el sentido de viaje al archivo de su fuente y ejecuta `npm test`. La prueba de cantidades en `tests/rutas.test.mjs` debe actualizarse.

## Clima («Antes de salir»)

En **Cómo llegar**, con destino y salida elegidos, aparece una línea con la temperatura, la sensación térmica, la probabilidad de lluvia y, si hace falta, consejos cortos (menos caminata y sombra con calor; paraguas y no cruzar arroyos con lluvia). Es el clima de **toda la ciudad**, no el de un barrio. Si la consulta falla, tarda más de 8 segundos o la respuesta no es válida, no aparece nada. Pasada una hora el dato se oculta y se vuelve a pedir.

### De dónde salen los datos

[Open-Meteo.com](https://open-meteo.com/), licencia [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). No pide clave. Su servicio gratuito es **solo para uso no comercial** (sin anuncios ni suscripciones); si el proyecto cambia de naturaleza, hay que revisar sus términos. La consulta la hace el navegador de cada persona, así que Open-Meteo recibe su dirección IP; el mapa lo avisa en los créditos. Por eso `mapa/index.html` permite `connect-src https://api.open-meteo.com` en su política de seguridad (las demás páginas no).

### Criterios de los consejos

Están en `UMBRALES` de `js/clima.js` y son del equipo, fáciles de cambiar:

| Aviso | Cuándo |
|---|---|
| Calor | Sensación de 32 °C o más (90 °F) |
| Calor muy fuerte | Sensación de 39 °C o más (103 °F) |
| Puede llover | 30 % o más de probabilidad en las próximas horas |
| Es probable que llueva | 60 % o más, o ya está lloviendo |

Los cortes de calor son los de «precaución extrema» y «peligro» del [índice de calor del Servicio Meteorológico de EE. UU.](https://www.weather.gov/ama/heatindex). La sensación térmica de Open-Meteo no es idéntica a ese índice: es una referencia, **no un aviso oficial**. Los de lluvia son un criterio del equipo.
