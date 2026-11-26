# Punto Lista: página de presentación

Página del dispositivo, con un diseño de página de producto: fondo negro, titulares grandes, carrusel de destacados, visor de partes y una demostración.

## Verla

Desde la raíz del repositorio:

```powershell
python -m http.server 4180 --directory web
```

Luego abre <http://localhost:4180/punto-lista/>.

## Pruebas

```powershell
node --test web/punto-lista/tests/*.test.mjs
```

## Qué cambiar

| Para cambiar | Archivo |
|---|---|
| Textos | `index.html` |
| Preguntas de la demostración | `js/contenido.js` |
| Ángulos y acercamientos del dispositivo | `js/escenas.js` |
| Lo que muestra la pantalla | `js/pantalla.js` |
| Forma y colores del dispositivo | `js/modelo.js` |

## Ten en cuenta

- El dispositivo es un **modelo 3D conceptual**, no una fotografía del equipo. La página lo declara en las notas al pie.
- Necesita internet: Three.js 0.170.0 se carga desde jsDelivr y la letra desde Google Fonts. Sin el modelo 3D aparece una figura sencilla y un aviso.
- Las respuestas de la demostración son ejemplos escritos a mano; la página no está conectada al dispositivo.
