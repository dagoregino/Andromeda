// Saca de una página HTML los textos que se muestran o se leen en voz alta, igual que los recorre
// js/idioma-pagina.js: los trozos entre etiquetas y los atributos que se traducen.
const ENTIDADES = Object.freeze({ '&amp;': '&', '&times;': '×', '&copy;': '©', '&nbsp;': ' ', '&lt;': '<', '&gt;': '>' });

const normalizar = (texto) => texto
  .replace(/&[a-z]+;/g, (entidad) => ENTIDADES[entidad] ?? entidad)
  .replace(/\s+/g, ' ')
  .trim();

const tieneLetras = (texto) => /\p{L}/u.test(texto);

export function textosDePagina(html) {
  const limpio = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style)[\s>][\s\S]*?<\/\1>/g, '<$1></$1>');
  const atributos = [...limpio.matchAll(/\s(?:aria-label|alt|title|placeholder)="([^"]*)"/g)].map((m) => m[1]);
  const metas = [...limpio.matchAll(/<meta (?:name="description"|property="og:(?:title|description)") content="([^"]*)"/g)]
    .map((m) => m[1]);
  const trozos = limpio.replace(/<!doctype[^>]*>/i, '').split(/<[^>]+>/);
  return [...new Set([...trozos, ...atributos, ...metas].map(normalizar).filter(tieneLetras))];
}
