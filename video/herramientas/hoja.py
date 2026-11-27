"""Une cuadros en hojas de contacto. Uso: python herramientas/hoja.py <salida.jpg> <cuadro.jpg ...>"""
import os
import sys
from PIL import Image, ImageDraw, ImageFont

ANCHO, ALTO, MARGEN, COLUMNAS = 960, 540, 14, 2

salida, rutas = sys.argv[1], sys.argv[2:]
if not rutas:
    raise SystemExit('No hay cuadros para unir.')
filas = (len(rutas) + COLUMNAS - 1) // COLUMNAS
hoja = Image.new('RGB', (COLUMNAS * (ANCHO + MARGEN) + MARGEN, filas * (ALTO + MARGEN) + MARGEN), '#e8e8e8')
letra = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 24)
for i, ruta in enumerate(rutas):
    x = MARGEN + (i % COLUMNAS) * (ANCHO + MARGEN)
    y = MARGEN + (i // COLUMNAS) * (ALTO + MARGEN)
    hoja.paste(Image.open(ruta).convert('RGB').resize((ANCHO, ALTO), Image.LANCZOS), (x, y))
    nombre = os.path.splitext(os.path.basename(ruta))[0]
    dibujo = ImageDraw.Draw(hoja)
    caja = dibujo.textbbox((x + 8, y + ALTO - 34), nombre, font=letra)
    dibujo.rectangle((caja[0] - 6, caja[1] - 3, caja[2] + 6, caja[3] + 3), fill='black')
    dibujo.text((x + 8, y + ALTO - 34), nombre, font=letra, fill='white')
hoja.save(salida, quality=88)
print(salida, hoja.size)
