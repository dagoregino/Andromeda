# Web de Barranquilla Lista

Tres páginas:

| Dirección | Qué muestra |
|---|---|
| `/` (`index.html`) | Inicio **Barranquilla 2034**: el plan de ciudad antes y después del Mundial |
| `mapa.html` | El mapa para moverse por la ciudad |
| `punto-lista/` | La propuesta del dispositivo ([documentación](punto-lista/README.md)) |

## Inicio

Se lee de arriba abajo: barra superior, portada, **De dónde partimos**, **La ruta**, **Lo que queda**, **Participa** y pie. Presenta el plan de ciudad; los enlaces a Mapa, Punto Lista y Contacto van en la barra de arriba, no en el pie. No carga scripts, Leaflet ni datos del mapa.

El diseño toma como referencia [`DESIGN.md`](../DESIGN.md) (análisis inspirado en el estilo de Apple, copiado de [awesome-design-md](https://github.com/VoltAgent/awesome-design-md), [licencia MIT](../DESIGN.LICENSE)), con los colores de `css/paleta.css` e Inter en lugar de SF Pro. Las animaciones son de CSS, se apagan si se pide reducir el movimiento y las ligadas al desplazamiento solo funcionan en navegadores con `animation-timeline`.

Reglas para editarla (varias las revisa `tests/paginas.test.mjs`):

- Es un escenario ficticio: la portada debe decirlo.
- Máximo tres datos, cada uno con fuente y fecha. Si no está verificado por un tercero, una línea lo dice.
- Máximo cinco hitos y tres viñetas por hito. Lo que no está aprobado se marca como **Propuesta**.
- **Lo que queda** es una frase y máximo cuatro líneas.
- No se listan funciones de la aplicación ni lanzamientos futuros.

| Dato en pantalla | Fuente | Fecha |
|---|---|---|
| Calor: más de 5 °C de diferencia de superficie | [Banco Mundial](https://documents1.worldbank.org/curated/en/099101025093541356/pdf/P504085-aceef324-8f97-478b-b4cd-6624ef954e6a.pdf), que cita un análisis de Barranquilla | 2025 |
| Transmetro: de 29,5 a 13,6 millones de validaciones | [Gabriel Olier](https://gabrielolier.substack.com/p/repensar-la-movilidad-de-barranquilla), análisis independiente | 11 de octubre de 2026 |
| Arroyos: 14.200 toneladas de residuos | Alcaldía, en [El Tiempo](https://www.eltiempo.com/colombia/barranquilla/la-impresionante-cantidad-de-basura-que-termina-en-los-arroyos-de-barranquilla-14-200-toneladas-retiradas-en-2026-y-50-canales-intervenidos-3594947) | 20 de octubre de 2026 |

Las tres cifras se contrastaron en la página original el 2026-11-26. La ruta resume la [hoja de ruta propuesta](../investigacion/08-barranquilla-preguntas-clave.md).

**Participa** y **Contacto** llevan a las [incidencias del repositorio](https://github.com/dagoregino/Andromeda/issues). Escribir pide una cuenta de GitHub. Si se prefiere un correo o un formulario, se cambian esos dos enlaces en `index.html`.

### Pendiente

- G queda pendiente de definir; no se construye en esta entrega.
- E queda para una entrega posterior, dentro del mapa.

## Mapa

Tiene dos vistas:

- **Cómo llegar:** se elige un destino y el punto de salida, y se consultan las rutas de bus de ejemplo que sirven, sin transbordos.
- **Todas las rutas:** se filtra por empresa, código o nombre y se ve el recorrido completo, los lugares conocidos cerca y las paradas cuando se conocen.

## Verla en tu equipo

Desde la carpeta `web`:

```powershell
python -m http.server 4173
```

Luego abre <http://localhost:4173> para el inicio o <http://localhost:4173/mapa.html> para el mapa. El mapa necesita un servidor: abrir el archivo con doble clic no carga los datos. La ubicación del navegador solo funciona en `localhost` o con HTTPS.

## Estructura

| Ruta | Contenido |
|---|---|
| `index.html`, `css/inicio.css` | Inicio |
| `mapa.html` | La aplicación del mapa |
| `punto-lista/` | Página de Punto Lista, con sus propios estilos, scripts y pruebas |
| `js/app.js` | Interacción y estado del viaje |
| `js/mapa.js`, `js/listas.js` | Mapa y listas |
| `js/geo.js`, `js/destinos.js`, `js/rutas.js`, `js/accesibilidad.js` | Lógica sin interfaz, con pruebas |
| `js/accesibilidadVista.js` | Bloque de accesibilidad del destino |
| `data/destinos.json` | Lugares de destino (ubicaciones aproximadas) |
| `data/accesibilidad.json` | Accesibilidad de 6 destinos, según TUR4all |
| `data/rutas.json` | 4 recorridos de Transmetro, de OpenStreetMap |
| `data/rutas-amb.json` | 87 recorridos de buses tradicionales, del AMB |
| `css/paleta.css` | Colores y letra, compartidos por el inicio y el mapa |
| `css/app.css` | Diseño del mapa |
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
