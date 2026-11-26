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
| `index.html` | La aplicación |
| `js/app.js` | Interacción y estado del viaje |
| `js/mapa.js`, `js/listas.js` | Mapa y listas |
| `js/geo.js`, `js/destinos.js`, `js/rutas.js` | Lógica sin interfaz, con pruebas |
| `data/destinos.json` | Lugares de destino (ubicaciones aproximadas) |
| `data/rutas.json` | 4 recorridos de Transmetro, de OpenStreetMap |
| `data/rutas-amb.json` | 87 recorridos de buses tradicionales, del AMB |
| `css/paleta.css`, `css/app.css` | Colores y diseño |
| `vendor/leaflet/` | Leaflet 1.9.4 (BSD-2) |

## Pruebas

```powershell
npm test
```

## Rutas de bus

Son **datos de ejemplo**: no están verificados con las empresas. Las dos fuentes van en archivos separados porque tienen condiciones distintas.

### Transmetro (`rutas.json`)

B1, S2, GM y VM, de [OpenStreetMap](https://www.openstreetmap.org/copyright), © colaboradores de OpenStreetMap, licencia [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/). Consultadas el 2026-11-26. B1 y S2 tienen paradas; GM y VM no. No incluye las demás rutas de Transmetro.

### Buses tradicionales (`rutas-amb.json`)

Recorridos publicados en el [visor del Área Metropolitana de Barranquilla](https://www.ambq.gov.co/transporte/transporte-publico-colectivo/), consultados el 2026-11-26. La propiedad es de quien indica el AMB en sus [condiciones de uso](https://www.ambq.gov.co/condiciones-de-uso/).

- **Uso:** las condiciones prohíben el uso comercial o promocional sin autorización. Su texto sobre el uso no comercial es ambiguo: **conviene pedir autorización al AMB antes de publicar la web**. Si no se obtiene, se borra este archivo y se quita su carga en `js/app.js`.
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
