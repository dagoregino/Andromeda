# Web de Barranquilla Lista

Sitio estático del programa (`index.html`) y prototipo digital (`simulador.html`).

## Verla en tu equipo

Desde la carpeta `web`:

```powershell
python -m http.server 4173
```

Luego abre <http://localhost:4173>. El simulador necesita un servidor: abrir el archivo con doble clic no carga los datos.

## Estructura

| Ruta | Contenido |
|---|---|
| `index.html` | Programa: diagnóstico, causas, componentes, día de partido, inclusión y lecciones |
| `simulador.html` | Mapa con seis puntos críticos y cuatro escenarios simulados |
| `data/puntos.json` | Puntos críticos (ubicaciones aproximadas) |
| `data/escenarios.json` | Escenarios y pasos; los minutos son metas propuestas, no mediciones |
| `js/escenarios.js` | Lógica del simulador, sin interfaz |
| `js/simulador.js` | Mapa e interacción |
| `assets/` | Sistema de diseño de la habilidad `design-taste-frontend` (MIT) y fotos |
| `vendor/leaflet/` | Leaflet 1.9.4 (BSD-2) |

## Pruebas

```powershell
npm test
```

## Editar los escenarios

Cambia `data/escenarios.json` y ejecuta `npm test`: la prueba revisa que cada paso apunte a un punto y un componente existentes y que los minutos vayan en orden.

## Fotos

Fotografías de Wikimedia Commons con licencias CC y dominio público; créditos en `credits.html`. Son fotos de referencia: reemplázalas por fotos propias del equipo cuando las tengan.
