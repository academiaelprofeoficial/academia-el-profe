const { chromium } = require('playwright');

const BASE = 'http://localhost:3099';
const PAGES = [
  { path: '/', name: 'Inicio' },
  { path: '/nosotros', name: 'Nosotros' },
  { path: '/soporte', name: 'Soporte' },
  { path: '/cursos', name: 'Cursos' },
  { path: '/cursos/calculo-diferencial', name: 'Curso Detalle' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const results = [];

  for (const page of PAGES) {
    const p = await context.newPage();
    const errors = [];
    
    p.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    p.on('pageerror', (err) => errors.push(err.message));

    try {
      const resp = await p.goto(`${BASE}${page.path}`, { waitUntil: 'networkidle', timeout: 15000 });
      const status = resp?.status();
      
      // Check if main content loaded (not blank/error page)
      const bodyText = await p.textContent('body');
      const hasContent = bodyText && bodyText.length > 100;
      const hasError = bodyText?.includes('Oops') || bodyText?.includes('Error') || bodyText?.includes('Something went wrong');
      
      // Check for key elements
      let hasKeyElement = true;
      if (page.path === '/nosotros') {
        hasKeyElement = (await p.locator('text=Enfoque UTP').count() > 0) || (await p.locator('text=Garantía de Calidad').count() > 0);
      } else if (page.path === '/soporte') {
        hasKeyElement = (await p.locator('text=Chat en Vivo').count() > 0) || (await p.locator('text=Preguntas Frecuentes').count() > 0);
      } else if (page.path === '/cursos') {
        hasKeyElement = (await p.locator('text=Cursos').count() > 0) || (await p.locator('text=TEMARIO').count() > 0);
      } else if (page.path === '/cursos/calculo-diferencial') {
        hasKeyElement = (await p.locator('text=Comprar Ahora').count() > 0) || (await p.locator('text=Temario').count() > 0);
      } else if (page.path === '/') {
        hasKeyElement = (await p.locator('text=VER CURSOS').count() > 0) || (await p.locator('text=Universidades').count() > 0);
      }

      results.push({
        page: page.name,
        path: page.path,
        status,
        hasContent,
        hasError,
        hasKeyElement,
        consoleErrors: errors.filter(e => !e.includes('favicon') && !e.includes('preload')).slice(0, 3),
        ok: status === 200 && hasContent && !hasError && hasKeyElement,
      });
    } catch (err) {
      results.push({
        page: page.name,
        path: page.path,
        status: 'FAIL',
        error: err.message.slice(0, 100),
        ok: false,
      });
    }
    await p.close();
  }

  console.log('\n=== PLAYWRIGHT TEST RESULTS ===\n');
  let allOk = true;
  for (const r of results) {
    const icon = r.ok ? '✅' : '❌';
    console.log(`${icon} ${r.page} (${r.path}) — Status: ${r.status} | Content: ${r.hasContent} | Error: ${r.hasError} | KeyEl: ${r.hasKeyElement}`);
    if (r.consoleErrors?.length) {
      r.consoleErrors.forEach(e => console.log(`   ⚠️  ${e.slice(0, 120)}`));
    }
    if (r.error) console.log(`   ❗ ${r.error}`);
    if (!r.ok) allOk = false;
  }
  console.log(`\n${allOk ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

  await browser.close();
  process.exit(allOk ? 0 : 1);
})();