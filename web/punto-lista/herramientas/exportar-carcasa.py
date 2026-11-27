"""Exporta el prototipo abierto en Fusion 360 a modelos/carcasa.bin.

Solo lee el diseño. Se ejecuta dentro de Fusion (Utilidades > Scripts y complementos),
con "prototipo sena - sin tornillos" abierto, y escribe en la carpeta modelos/ de al lado.

Formato: 4 bytes con el largo de la cabecera, cabecera JSON y los datos binarios.
Posiciones en enteros de 16 bits (milímetros por ESCALA, centradas), normales en
enteros de 8 bits e índices de 16 o 32 bits. Cada bloque empieza en múltiplo de 4.
"""
import array
import json
import os
import struct

import adsk.core
import adsk.fusion

SALIDA = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                       '..', 'modelos', 'carcasa.bin'))
ESCALA = 200
# Tolerancia de la malla en centímetros: la carcasa se ve de cerca; la electrónica, no.
TOLERANCIA_CARCASA = 0.003
TOLERANCIA_INTERIOR = 0.02
# Las piezas más pequeñas que esto (mm) no se alcanzan a ver.
TAMANO_MINIMO = 1.2
# Letras en relieve de la tapa: entre la cara exterior y 0,8 mm por encima (mm).
LETRAS_DESDE = 37.45
LETRAS_HASTA = 38.35

COLORES_ESP32 = {
    'PCB': '#1c2129',
    'PIN': 'metal',
    'WIFI_CARD': 'metal',
    'USB_SOCKET': 'metal',
    'BUTTON': 'metal',
}


def caja_mm(entidad):
    caja = entidad.boundingBox
    minimo, maximo = caja.minPoint, caja.maxPoint
    return ((minimo.x * 10, minimo.y * 10, minimo.z * 10),
            (maximo.x * 10, maximo.y * 10, maximo.z * 10))


def es_letra(cara):
    minimo, maximo = caja_mm(cara)
    return minimo[2] >= LETRAS_DESDE and LETRAS_DESDE + 0.1 < maximo[2] <= LETRAS_HASTA


def color_de(cuerpo):
    apariencia = cuerpo.appearance
    if apariencia and apariencia.name.startswith('Opaque('):
        rojo, verde, azul = (int(v) for v in apariencia.name[7:-1].split(','))
        return '#%02x%02x%02x' % (rojo, verde, azul)
    return None


def material_interior(ruta, cuerpo):
    if ruta.startswith('PCB_verde'):
        return '#1f7a4d'
    if ruta.startswith('Bocina'):
        return '#262a31'
    if ruta.startswith('Socket'):
        return '#14161a'
    if ruta.startswith('esp32'):
        pieza = ruta.split('+')[-1]
        for nombre, color in COLORES_ESP32.items():
            if pieza.startswith(nombre):
                return color
        return '#15171b'
    color = color_de(cuerpo)
    # La cara visible de la pantalla llega en blanco; apagada se ve negra, como en Fusion.
    if ruta.startswith('Pantalla') and color == '#ffffff':
        return 'pantalla'
    return color or '#4a4f58'


def agregar(partes, grupo, material, malla, centro):
    parte = partes.setdefault((grupo, material), {'pos': array.array('h'), 'nor': array.array('b'), 'ind': []})
    base = len(parte['pos']) // 3
    coordenadas = malla.nodeCoordinatesAsFloat
    normales = malla.normalVectorsAsFloat
    for i, valor in enumerate(coordenadas):
        parte['pos'].append(int(round((valor * 10 - centro[i % 3]) * ESCALA)))
    for valor in normales:
        parte['nor'].append(max(-127, min(127, int(round(valor * 127)))))
    parte['ind'].extend(base + i for i in malla.nodeIndices)


def triangular(entidad, tolerancia):
    calculadora = entidad.meshManager.createMeshCalculator()
    calculadora.surfaceTolerance = tolerancia
    return calculadora.calculate()


def reunir(diseno):
    ocurrencias = list(diseno.rootComponent.allOccurrences)
    carcasa = [c for o in ocurrencias if o.fullPathName.startswith('Carcasa_') for c in o.bRepBodies]
    cajas = [caja_mm(c) for c in carcasa]
    centro = [(min(c[0][i] for c in cajas) + max(c[1][i] for c in cajas)) / 2 for i in range(3)]

    partes = {}
    for ocurrencia in ocurrencias:
        ruta = ocurrencia.fullPathName
        for cuerpo in ocurrencia.bRepBodies:
            if not cuerpo.isVisible:
                continue
            if ruta.startswith('Carcasa_Tapa'):
                for cara in cuerpo.faces:
                    material = 'letras' if es_letra(cara) else 'carcasa'
                    agregar(partes, 'tapa', material, triangular(cara, TOLERANCIA_CARCASA), centro)
            elif ruta.startswith('Carcasa_Base'):
                agregar(partes, 'base', 'carcasa', triangular(cuerpo, TOLERANCIA_CARCASA), centro)
            else:
                minimo, maximo = caja_mm(cuerpo)
                if max(maximo[i] - minimo[i] for i in range(3)) < TAMANO_MINIMO:
                    continue
                material = material_interior(ruta, cuerpo)
                agregar(partes, 'interior', material, triangular(cuerpo, TOLERANCIA_INTERIOR), centro)
    return partes


def empaquetar(partes):
    datos = bytearray()

    def bloque(contenido):
        inicio = len(datos)
        datos.extend(contenido)
        datos.extend(bytes(-len(datos) % 4))
        return inicio

    indice = []
    for (grupo, material), parte in sorted(partes.items()):
        vertices = len(parte['pos']) // 3
        ancho = 2 if vertices <= 65535 else 4
        indices = array.array('H' if ancho == 2 else 'I', parte['ind'])
        indice.append({
            'grupo': grupo,
            'material': material,
            'vertices': vertices,
            'indices': len(indices),
            'ancho': ancho,
            'posiciones': bloque(parte['pos'].tobytes()),
            'normales': bloque(parte['nor'].tobytes()),
            'caras': bloque(indices.tobytes()),
        })
    cabecera = json.dumps({'escala': ESCALA, 'partes': indice}, separators=(',', ':')).encode('utf-8')
    cabecera += b' ' * (-(4 + len(cabecera)) % 4)
    return struct.pack('<I', len(cabecera)) + cabecera + bytes(datos)


def run(_context: str):
    diseno = adsk.fusion.Design.cast(adsk.core.Application.get().activeProduct)
    partes = reunir(diseno)
    contenido = empaquetar(partes)
    os.makedirs(os.path.dirname(SALIDA), exist_ok=True)
    with open(SALIDA, 'wb') as archivo:
        archivo.write(contenido)
    print('bytes', len(contenido))
    for (grupo, material), parte in sorted(partes.items()):
        print(grupo, material, 'triangulos', len(parte['ind']) // 3)
