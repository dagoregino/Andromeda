// Graba los clips de la demostración desde la web local.
// 1. Sirve la web (preview «web», puerto 4173).  2. node herramientas/grabar-web.mjs [clip ...]
import { readFile, writeFile } from 'node:fs/promises';
import { abrirNavegador, abrirPagina, grabar, mover, tocar, centroDe, desplazarA, VISTA } from './grabador.mjs';

const BASE = process.env.BASE_WEB ?? 'http://127.0.0.1:4173';
const DESTINO = 'public/clips';
const DATOS = `${DESTINO}/clips.json`;
const espera = (pagina, ms) => pagina.waitForTimeout(ms);

// Caja de un elemento en fracciones de la pantalla, para acercar la cámara en el montaje.
async function zona(localizador) {
  const { caja } = await centroDe(localizador);
  const f = (v, total) => Number((v / total).toFixed(4));
  return { x: f(caja.x, VISTA.width), y: f(caja.y, VISTA.height), ancho: f(caja.width, VISTA.width), alto: f(caja.height, VISTA.height) };
}

// La barra fija de Nova tapa la parte alta de la escena; se oculta solo en la grabación.
const sinBarraLocal = (pagina) => pagina.addStyleTag({ content: '.barra-local{display:none!important}' });

const CLIPS = {
  async mapa(navegador) {
    const pagina = await abrirPagina(navegador, `${BASE}/mapa/`);
    const lugares = pagina.locator('[data-buscador] [data-lugares] button');
    await lugares.first().waitFor();
    await espera(pagina, 2500);
    return grabar(pagina, 'mapa', DESTINO, async (marcar) => {
      await espera(pagina, 700);
      marcar('destino');
      await tocar(pagina, lugares.filter({ hasText: 'Estadio Metropolitano' }), 900);
      await espera(pagina, 1500);
      const salida = pagina.locator('[data-buscador-origen] [data-lugares] button').filter({ hasText: 'Plaza de la Paz' });
      await desplazarA(salida, 0.55);
      marcar('origen');
      await tocar(pagina, salida);
      await espera(pagina, 1800);
      const clima = pagina.locator('[data-clima]');
      if (await clima.isVisible()) {
        await desplazarA(clima, 0.18);
        await espera(pagina, 500);
        marcar('clima', { zona: await zona(clima) });
        await mover(pagina, 420, 330, 600);
        await espera(pagina, 2600);
      }
      const verRutas = pagina.locator('[data-ver-rutas]');
      await desplazarA(verRutas, 0.2);
      marcar('rutas');
      await tocar(pagina, verRutas);
      await espera(pagina, 1400);
      const opciones = pagina.locator('[data-rutas] button');
      await opciones.first().waitFor();
      await desplazarA(opciones.first(), 0.2);
      await espera(pagina, 600);
      if ((await opciones.count()) > 1) await tocar(pagina, opciones.nth(1));
      await espera(pagina, 1600);
      await tocar(pagina, opciones.first());
      await mover(pagina, 1050, 460, 800);
      await espera(pagina, 2000);
    });
  },

  async cursos(navegador) {
    const pagina = await abrirPagina(navegador, `${BASE}/cursos/`);
    await espera(pagina, 1500);
    return grabar(pagina, 'cursos', DESTINO, async (marcar) => {
      await espera(pagina, 700);
      const lista = pagina.locator('#lista-cursos');
      await desplazarA(pagina.locator('#filtros-cursos'), 0.1, 1400);
      marcar('lista', { zona: await zona(pagina.locator('#filtros-cursos')) });
      await espera(pagina, 900);
      const tarjetas = lista.locator('li.curso');
      await mover(pagina, 500, 560, 600);
      await espera(pagina, 500);
      await mover(pagina, 1100, 600, 800);
      await desplazarA(tarjetas.nth(6), 0.3, 1600);
      await espera(pagina, 700);
      await desplazarA(tarjetas.nth(1), 0.18, 900);
      const abrir = tarjetas.nth(1).locator('button, a').first();
      if (await abrir.count()) {
        marcar('curso');
        await tocar(pagina, abrir);
        await espera(pagina, 2200);
      }
    });
  },

  async idioma(navegador) {
    const pagina = await abrirPagina(navegador, `${BASE}/?lang=es`);
    await pagina.goto(`${BASE}/cursos/?lang=es`, { waitUntil: 'networkidle' });
    await espera(pagina, 1500);
    return grabar(pagina, 'idioma', DESTINO, async (marcar) => {
      await espera(pagina, 900);
      marcar('cambio');
      await tocar(pagina, pagina.locator('.nav-global__idioma'), 900);
      await espera(pagina, 2800);
    });
  },

  async novaPortada(navegador) {
    const pagina = await abrirPagina(navegador, `${BASE}/nova/?lang=es`);
    await espera(pagina, 3500);
    return grabar(pagina, 'nova-portada', DESTINO, async () => {
      await mover(pagina, 380, 330, 1500);
      await mover(pagina, 1230, 300, 2200);
      await espera(pagina, 1200);
    });
  },

  async novaCarcasa(navegador) {
    const pagina = await abrirPagina(navegador, `${BASE}/nova/?lang=es`);
    const escena = pagina.locator('[data-prototipo]');
    await sinBarraLocal(pagina);
    await espera(pagina, 1500);
    await desplazarA(escena, 0.1, 600);
    await espera(pagina, 3500);
    return grabar(pagina, 'nova-carcasa', DESTINO, async (marcar) => {
      const giro = pagina.locator('[data-pausa-giro]');
      if ((await giro.isVisible()) && (await giro.getAttribute('data-estado')) === 'pausado') await giro.click();
      await mover(pagina, VISTA.width - 40, VISTA.height - 40, 200);
      marcar('modelo', { zona: await zona(escena) });
      await espera(pagina, 9000);
    });
  },

  async novaDemo(navegador) {
    const pagina = await abrirPagina(navegador, `${BASE}/nova/?lang=es`);
    await sinBarraLocal(pagina);
    await espera(pagina, 1500);
    await desplazarA(pagina.locator('#demo-titulo'), 0.02, 600);
    await espera(pagina, 3000);
    const preguntas = pagina.locator('[data-preguntas] button');
    await preguntas.first().waitFor();
    await desplazarA(pagina.locator('[data-escena="demo"]'), 0.08, 600);
    await espera(pagina, 1200);
    return grabar(pagina, 'nova-demo', DESTINO, async (marcar) => {
      await espera(pagina, 600);
      const avisos = preguntas.filter({ hasText: 'avisos' });
      marcar('pregunta', { zona: await zona(pagina.locator('[data-escena="demo"]')) });
      await tocar(pagina, avisos, 900);
      await espera(pagina, 3600);
    });
  },
};

const pedidos = process.argv.slice(2);
const nombres = pedidos.length ? pedidos : Object.keys(CLIPS);
const previos = await readFile(DATOS, 'utf8').then(JSON.parse).catch(() => ({}));
let datos = previos;
const navegador = await abrirNavegador();
let fallos = 0;
try {
  for (const nombre of nombres) {
    try {
      const resultado = await CLIPS[nombre](navegador);
      datos = { ...datos, [nombre]: resultado };
      console.log(nombre, `${resultado.duracion}s`, `${resultado.cuadrosCapturados} cuadros`, JSON.stringify(resultado.marcas));
    } catch (error) {
      fallos += 1;
      console.error(`${nombre}: ${error.message.split('\n').slice(0, 4).join(' | ')}`);
    }
  }
} finally {
  await navegador.close();
}
await writeFile(DATOS, `${JSON.stringify(datos, null, 2)}\n`);
process.exitCode = fallos ? 1 : 0;
