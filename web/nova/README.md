# Nova: página de presentación

La segunda vista de la web, junto al mapa: fondo negro, titulares grandes, carrusel de destacados y una demostración. El mapa usa la misma barra, colores y letra (`../css/`).

## Verla

Desde la raíz del repositorio:

```powershell
python -m http.server 4180 --directory web
```

Luego abre <http://localhost:4180/nova/>.

## Pruebas

```powershell
node --test web/nova/tests/*.test.mjs
```

## Qué cambiar

| Para cambiar | Archivo |
|---|---|
| Textos | `index.html` |
| Preguntas de la demostración | `js/contenido.js` |
| Ángulos y acercamientos del dispositivo | `js/escenas.js` |
| Lo que muestra la pantalla | `js/pantalla.js` |
| Forma y colores del dispositivo | `js/modelo.js` |
| Colores, inclinación y apertura del prototipo | `js/prototipo-modelo.js` |
| Velocidad del giro | `js/prototipo.js` |
| Forma del prototipo | Fusion 360 y `herramientas/exportar-carcasa.py` |

## Ten en cuenta

- El dispositivo es un **modelo 3D conceptual**, no una fotografía del equipo. La página lo declara en las notas al pie.
- Necesita internet: Three.js 0.170.0 se carga desde jsDelivr y la letra desde Google Fonts. Sin el modelo 3D aparece una figura sencilla y un aviso.
- Las respuestas de la demostración son ejemplos escritos a mano; la página no está conectada al dispositivo.
- La sección **El prototipo** sí usa el diseño real: `modelos/carcasa.bin` sale del modelo de Fusion. Si cambia el diseño, hay que volver a ejecutar el script de `herramientas/` (revisa antes las alturas de las letras de la tapa). El color azul es el de la página; la carcasa todavía no está impresa.
