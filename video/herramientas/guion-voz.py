"""Escribe GUION-VOZ.md a partir de src/guion.ts. Uso (desde video/): python herramientas/guion-voz.py"""
import re

with open('src/guion.ts', encoding='utf-8') as archivo:
    fuente = archivo.read()

ESCENA = re.compile(r"nombre: '(.*?)',\s*segundos: ([\d.]+),\s*frases: \[(.*?)\n    \],", re.S)
FRASE = re.compile(r"f\(([\d.]+), ([\d.]+), '(.*?)'\),")
# Silencios que el video necesita, en segundos del video completo.
AVISOS = {
    '1. Gancho': 'Haz una pausa de un segundo antes de «Ahora imagina»: ahí la pantalla queda en negro.',
    '5. Demostración': '**Entre 2:39 y 3:01 no hables:** se oye a Nova. Graba esta parte en dos audios (antes y después).',
}


def reloj(segundos):
    return f'{int(segundos // 60)}:{int(segundos % 60):02d}'


escenas = ESCENA.findall(fuente)
if len(escenas) != 7:
    raise SystemExit(f'Se esperaban 7 escenas en src/guion.ts y se leyeron {len(escenas)}.')

lineas = [
    '# Guion de voz', '',
    'Generado desde `src/guion.ts` con `python herramientas/guion-voz.py`. No lo edites a mano.', '',
    '- Graba en un lugar silencioso, con el celular a un palmo de la boca.',
    '- Un audio por parte, con el nombre indicado. Empieza a hablar sin dejar silencio largo al inicio.',
    '- Ritmo tranquilo. La hora de cada línea es la del video completo y sirve de guía.', '',
]
inicio = 0.0
for nombre, segundos, cuerpo in escenas:
    duracion = float(segundos)
    frases = [(float(a), float(b), texto) for a, b, texto in FRASE.findall(cuerpo)]
    palabras = sum(len(texto.split()) for _, _, texto in frases)
    lineas += [f'## {nombre} ({reloj(inicio)}–{reloj(inicio + duracion)}, {palabras} palabras)', '']
    if nombre in AVISOS:
        lineas += [f'> {AVISOS[nombre]}', '']
    lineas += ['| Hora | Qué decir |', '|---|---|']
    lineas += [f'| {reloj(inicio + desde)} | {texto} |' for desde, _, texto in frases]
    lineas.append('')
    inicio += duracion
lineas.append(f'Duración total: {reloj(inicio)}.')

with open('GUION-VOZ.md', 'w', encoding='utf-8', newline='\n') as archivo:
    archivo.write('\n'.join(lineas) + '\n')
print(f'GUION-VOZ.md · {reloj(inicio)}')
