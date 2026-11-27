// Traduce lo que ya está escrito en la página y pone en la barra el botón para cambiar de idioma.
// Va como último script de cada página: así los demás leen primero los textos originales.
import { idioma, t, CLAVE_IDIOMA } from './idioma.js';

const ATRIBUTOS = ['aria-label', 'alt', 'title', 'placeholder'];
const METAS = 'meta[name="description"], meta[property="og:title"], meta[property="og:description"]';
// El botón se nombra en el idioma al que lleva, para que lo entienda quien lo necesita.
const OTRO = Object.freeze({
  es: Object.freeze({ codigo: 'en', largo: 'English', corto: 'EN' }),
  en: Object.freeze({ codigo: 'es', largo: 'Español', corto: 'ES' }),
});

function traducirTextos(raiz) {
  const recorrido = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
  for (let nodo = recorrido.nextNode(); nodo; nodo = recorrido.nextNode()) {
    const original = nodo.nodeValue;
    const limpio = original.trim();
    if (!limpio || nodo.parentElement?.closest('script, style')) continue;
    const nuevo = t(limpio);
    // Solo se cambia el texto: se respetan los espacios que lo separan de sus vecinos.
    if (nuevo !== limpio) nodo.nodeValue = original.replace(limpio, () => nuevo);
  }
}

function traducirAtributo(elemento, nombre) {
  const valor = elemento.getAttribute(nombre);
  if (valor) elemento.setAttribute(nombre, t(valor));
}

function traducirPagina() {
  document.documentElement.lang = idioma;
  document.title = t(document.title);
  document.querySelectorAll(METAS).forEach((meta) => traducirAtributo(meta, 'content'));
  traducirTextos(document.body);
  for (const nombre of ATRIBUTOS) {
    document.querySelectorAll(`[${nombre}]`).forEach((elemento) => traducirAtributo(elemento, nombre));
  }
}

/** Guarda la elección y vuelve a cargar la página, que así se escribe entera en el idioma nuevo. */
function cambiarA(codigo) {
  const direccion = new URL(window.location.href);
  try {
    window.localStorage.setItem(CLAVE_IDIOMA, codigo);
    direccion.searchParams.delete('lang');
  } catch {
    // Sin almacenamiento la elección viaja en la dirección.
    direccion.searchParams.set('lang', codigo);
  }
  window.history.replaceState(null, '', direccion);
  window.location.reload();
}

function crearParte(clase, texto) {
  const parte = document.createElement('span');
  parte.className = clase;
  parte.textContent = texto;
  return parte;
}

function ponerSelector(menu) {
  const { codigo, largo, corto } = OTRO[idioma];
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'nav-global__idioma';
  boton.lang = codigo;
  const abreviado = crearParte('nav-global__corto', corto);
  abreviado.setAttribute('aria-hidden', 'true');
  boton.append(crearParte('nav-global__largo', largo), abreviado);
  boton.addEventListener('click', () => cambiarA(codigo));
  menu.append(boton);
}

if (idioma !== 'es') traducirPagina();
const menu = document.querySelector('.nav-global__menu');
if (menu) ponerSelector(menu);

// Un enlace con ?lang=en deja elegido ese idioma para las demás páginas.
const pedido = new URLSearchParams(window.location.search).get('lang');
if (pedido === idioma) {
  try {
    window.localStorage.setItem(CLAVE_IDIOMA, idioma);
  } catch { /* sin almacenamiento: vale solo para esta visita */ }
}
