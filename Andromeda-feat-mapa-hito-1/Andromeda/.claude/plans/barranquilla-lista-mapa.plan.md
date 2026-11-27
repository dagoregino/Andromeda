# Plan: el mapa es la aplicación (hito 1)

**Source PRD**: `.claude/prds/barranquilla-lista-mapa.prd.md`
**Selected Milestone**: 1. El mapa es la aplicación
**Complexity**: Medium

## Summary
La página de inicio pasa a ser un mapa: el usuario elige un destino, ve cómo llegar y pide las rutas de bus solo si las quiere. Se retiran la presentación del sprint y el simulador de escenarios. Filtros de lugares (hito 2) y avisos (hito 3) quedan fuera de este plan.

## Supuestos (confirmar antes de empezar)
| # | Supuesto | Por qué |
|---|---|---|
| 1 | Bastan datos de ejemplo, identificados en pantalla | Sin respuesta; el PRD no confirma ninguna fuente validada |
| 2 | Entre 4 y 6 rutas de bus, directas, sin transbordos | Cabe en una entrega y prueba la hipótesis |
| 3 | "Cómo llegar": rutas que pasan cerca del origen y del destino, con los tramos a pie como líneas rectas aproximadas | No requiere un servicio externo de rutas ni enviarle la ubicación del usuario |
| 4 | El destino se elige de una lista local de lugares o tocando el mapa | Evita un buscador externo |
| 5 | Se eliminan diagnóstico, causas, lecciones, escenarios y las fotos; la investigación sigue en el repositorio | Lista "fuera de alcance" del PRD, aún sin confirmar |
| 6 | La accesibilidad se muestra como "sin información" salvo dato verificado | No hay fuente confirmada; no se inventa |

## Fuentes de rutas (revisadas, ninguna validada)
| Fuente | Qué ofrece | Condición |
|---|---|---|
| [ColombiaTransit/gtfs-barranquilla](https://github.com/ColombiaTransit/gtfs-barranquilla) | Feed comunitario de Transmetro | Código MIT; los datos de Transmetro conservan su propia licencia; tiempos entre paradas provisionales |
| [Visor del AMB](https://www.ambq.gov.co/transporte/transporte-publico-colectivo/) | Recorridos de buses tradicionales | Según un proyecto de terceros: uso personal y no comercial con crédito. Verificar en la fuente |
| OpenStreetMap | Relaciones de rutas de bus | ODbL, con crédito; cobertura en Barranquilla sin comprobar |
| [ItsDenaos/pa-donde](https://github.com/ItsDenaos/pa-donde) | App que ya hace "cómo llegar" con estas rutas | Sin licencia: no se copia código ni datos; sirve de referencia |

## Patterns to Mirror
| Category | Source | Pattern |
|---|---|---|
| Naming | `web/js/escenarios.js:35` | Español, verbos en camelCase (`validarDatos`), datos en `web/data/*.json` con campo `nota` |
| Separación | `web/js/escenarios.js:1` | Lógica pura sin DOM; la interfaz en otro módulo |
| Errors | `web/js/simulador.js:28`, `:217` | `cargarJson` lanza con ruta y estado; el arranque captura y muestra un mensaje en `[data-estado]` |
| Errors de mapa | `web/js/simulador.js:41` | Aviso visible si Leaflet o las teselas no cargan; la lista sigue funcionando |
| Validation | `web/js/escenarios.js:35` | La validación devuelve una lista de errores legibles |
| DOM seguro | `web/js/simulador.js:21` | `crear()` con `textContent`, sin insertar HTML de datos |
| Data access | `web/js/simulador.js:219` | `Promise.all` de archivos JSON locales |
| Logging | — | No hay registro en el código; no se agrega |
| Tests | `web/tests/escenarios.test.mjs:30` | `node:test` y `assert/strict`; una prueba valida los datos reales |
| Estilos | `web/css/paleta.css` | Colores solo desde los tokens |

## Files to Change
| File | Action | Why |
|---|---|---|
| `web/js/geo.js` | CREATE | Distancia entre puntos y de un punto a un recorrido |
| `web/js/rutas.js` | CREATE | Validar rutas y encontrar las que sirven para origen y destino |
| `web/js/destinos.js` | CREATE | Validar y buscar destinos por nombre, sin depender de tildes |
| `web/js/mapa.js` | CREATE | Dibujo en Leaflet: marcadores, recorrido y rutas |
| `web/js/app.js` | CREATE | Interfaz: destino, origen, resultado, botón de rutas, errores |
| `web/data/destinos.json` | CREATE | Lugares de destino; reutiliza los 6 de `puntos.json` |
| `web/data/rutas.json` | CREATE | Rutas de ejemplo con fuente, fecha y crédito |
| `web/tests/geo.test.mjs`, `rutas.test.mjs`, `destinos.test.mjs` | CREATE | Pruebas escritas antes de la lógica |
| `web/css/app.css` | CREATE | Mapa a pantalla completa y panel; en móvil, panel inferior |
| `web/index.html` | UPDATE | Reemplazar la presentación por la aplicación |
| `web/package.json` | UPDATE | Ejecutar todas las pruebas |
| `web/README.md`, `README.md` | UPDATE | Describir la aplicación y sus fuentes |
| `web/share.jpg` | UPDATE | Imagen de la nueva pantalla |
| `web/simulador.html`, `web/js/simulador.js`, `web/js/escenarios.js`, `web/css/simulador.css`, `web/css/pagina.css` | DELETE | Presentación y simulador |
| `web/data/escenarios.json`, `web/data/puntos.json`, `web/tests/escenarios.test.mjs` | DELETE | Escenarios; los puntos pasan a `destinos.json` |
| `web/credits.html`, `web/assets/img/` | DELETE | Solo si ya no queda ninguna foto en uso |

## Tasks

Todas las rutas de los comandos parten de `web/`. Se trabaja en una rama nueva creada desde `feat/web-barranquilla-lista`.

### Task 1: confirmar los datos de rutas
- **Action**: revisar en la fuente original las condiciones de uso, elegir 4 a 6 rutas que pasen por los destinos principales y guardar recorrido, nombre, fuente, fecha y crédito. Si no hay permiso claro, dibujar recorridos de ejemplo propios, marcados como no reales.
- **Mirror**: campo `nota` de `data/puntos.json`.
- **Validate**: cada ruta tiene fuente y fecha; la prueba de la Task 3 pasa sobre el archivo real.

### Task 2: geometría y destinos (pruebas primero)
- **Action**: escribir las pruebas (fallan), luego `geo.js` y `destinos.js`. Casos: punto sobre el recorrido, lejos, recorrido de un solo punto, coordenadas inválidas, búsqueda sin tildes y sin resultados. Crear `destinos.json`.
- **Mirror**: `tests/escenarios.test.mjs`, `escenarios.js:35`.
- **Validate**: `node --test tests/geo.test.mjs tests/destinos.test.mjs`

### Task 3: encontrar rutas (pruebas primero)
- **Action**: `rutas.js` devuelve las rutas cuyo recorrido pasa a menos de una distancia a pie configurable de origen y destino, respeta el sentido y ordena por caminata total. Devuelve lista vacía si ninguna sirve.
- **Mirror**: funciones puras de `escenarios.js`, sin mutar la entrada.
- **Validate**: `node --test tests/rutas.test.mjs`

### Task 4: pantalla del mapa
- **Action**: nuevo `index.html`, `app.css`, `mapa.js`, `app.js`. Flujo: buscar o tocar un destino; elegir origen en el mapa o con "Usar mi ubicación" (se pide solo al pulsar y no se guarda); ver distancia aproximada; pulsar "Ver rutas de bus" para mostrar las que sirven, una resaltada a la vez; ocultarlas de nuevo. Estados visibles: sin origen, sin rutas, permiso denegado, fuera de Barranquilla, mapa o datos sin cargar. Aviso fijo "Rutas de ejemplo".
- **Mirror**: `simulador.js` (carga, errores, `crear`).
- **Validate**: abrir con la vista previa `web` a 390, 768 y 1440 px; recorrer el flujo con teclado; consola sin errores.

### Task 5: retirar lo anterior
- **Action**: borrar los archivos marcados DELETE, comprobar que no queden enlaces ni recursos sin uso de `assets/`, actualizar `package.json` a `tests/*.test.mjs`, los README y `share.jpg`.
- **Mirror**: —
- **Validate**: `npm test`; buscar `simulador|escenarios|credits|assets/img` sin resultados en HTML, JS y README.

### Task 6: revisión
- **Action**: `/code-review` sobre los cambios, revisión de ubicación y datos mostrados, y prueba con 5 personas: encontrar un destino y una ruta en menos de 1 minuto.
- **Validate**: sin hallazgos críticos ni altos; tiempos anotados.

## Validation
```powershell
cd web
npm test
python -m http.server 4173
```

## Risks
| Risk | Likelihood | Mitigation |
|---|---|---|
| Sin permiso o datos desactualizados de rutas | Alta | Task 1 primero; plan B con recorridos de ejemplo marcados |
| Una ruta sugerida no opera o va en otro sentido | Media | Aviso visible, fecha del dato y respeto del sentido |
| Caminata en línea recta cruza arroyos o vías sin paso | Alta | Rotularla como aproximada; no llamarla recorrido accesible |
| El mapa depende de teselas de OpenStreetMap | Baja | Aviso de error y lista utilizable; crédito visible |
| Mapa saturado en móvil | Media | Rutas ocultas por defecto y una resaltada a la vez |
| Se borra algo que el bootcamp exige | TBD | Confirmar el supuesto 5; el historial de git permite recuperarlo |

## Acceptance
- [ ] La página de inicio es el mapa
- [ ] Se elige un destino y se ve cómo llegar
- [ ] Las rutas de bus aparecen solo al pedirlas
- [ ] Los datos de ejemplo están identificados y con crédito
- [ ] `npm test` pasa con al menos 80 % de cobertura en la lógica
- [ ] Revisada a 390, 768 y 1440 px
- [ ] Patterns mirrored, not reinvented

## Notas de ejecución (2026-11-26)
- Supuestos 1 a 6 aprobados.
- Rutas tomadas de OpenStreetMap (ODbL): B1, S2, GM, VM y A-16 en los dos sentidos. No se usó el visor del AMB.
- Se agregó `web/js/listas.js` para separar las listas de la interacción.
- Se eliminó todo `web/assets/` porque la aplicación ya no lo usa; `paleta.css` quedó solo con colores y fuente.
- La salida elegida en la lista se confirma con un botón, para que funcione con teclado.
- Pendiente de la Task 6: prueba con 5 personas.
- Se agregó la vista "Todas las rutas" (buscar por código o empresa y ver recorrido y paradas), pedida después del plan.
- Con permiso del usuario se cargaron 87 de los 89 recorridos del AMB (`web/data/rutas-amb.json`); reemplazan la A-16 de OpenStreetMap. Pendiente: autorización del AMB antes de publicar y confirmar el sentido de las rutas.
