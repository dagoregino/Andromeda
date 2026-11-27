// Captura el mapa en inglés a tamaño de teléfono para la historia de Emma.
// Uso (con la web servida en 4173): node herramientas/captura-telefono.mjs
import { chromium } from 'playwright';

const BASE = process.env.BASE_WEB ?? 'http://127.0.0.1:4173';
const navegador = await chromium.launch();
try {
  const contexto = await navegador.newContext({
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, locale: 'en-US',
  });
  const pagina = await contexto.newPage();
  await pagina.goto(`${BASE}/mapa/?lang=en`, { waitUntil: 'networkidle' });
  // Los nombres cambian con el idioma: se eligen por posición (0 es el estadio, 6 la Plaza de la Paz).
  await pagina.locator('[data-buscador] [data-lugares] button').nth(0).click();
  await pagina.locator('[data-buscador-origen] [data-lugares] button').nth(6).click();
  await pagina.waitForTimeout(1500);
  await pagina.locator('[data-ver-rutas]').click();
  await pagina.locator('[data-rutas] button').first().waitFor();
  await pagina.waitForTimeout(2500);
  await pagina.evaluate(() => window.scrollTo(0, 0));
  await pagina.waitForTimeout(800);
  await pagina.screenshot({ path: 'public/clips/telefono-mapa.png' });
  await pagina.locator('[data-rutas] button').first().scrollIntoViewIfNeeded();
  await pagina.locator('[data-cuantas]').evaluate((e) => e.scrollIntoView({ block: 'start' }));
  await pagina.waitForTimeout(1200);
  await pagina.screenshot({ path: 'public/clips/telefono-rutas.png' });
  console.log('ok');
} finally {
  await navegador.close();
}
