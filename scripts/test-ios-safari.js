const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
    viewport: { width: 390, height: 844 },
    isMobile: true,
  });

  const pages = [
    { name: 'Inicio', url: '/' },
    { name: 'Cursos', url: '/cursos' },
    { name: 'Nosotros', url: '/nosotros' },
    { name: 'Soporte', url: '/soporte' },
    { name: 'Curso Detalle', url: '/cursos/calculo-diferencial' },
    { name: 'Temario', url: '/cursos/calculo-diferencial/temario' },
    { name: 'Login', url: '/iniciar-sesion' },
    { name: 'Registro', url: '/registrarse' },
  ];

  const base = 'http://localhost:3099';
  let errors = 0;

  for (const page of pages) {
    try {
      const p = await context.newPage();
      const consoleErrors = [];
      p.on('pageerror', (err) => {
        consoleErrors.push(err.message);
      });

      const resp = await p.goto(`${base}${page.url}`, { waitUntil: 'networkidle', timeout: 15000 });
      const status = resp ? resp.status() : 'NO RESPONSE';

      if (consoleErrors.length > 0) {
        console.log(`❌ ${page.name} (${page.url}) — ${status} — ${consoleErrors.length} JS errors:`);
        consoleErrors.forEach((e, i) => console.log(`   ${i+1}. ${e.substring(0, 200)}`));
        errors++;
      } else {
        console.log(`✅ ${page.name} (${page.url}) — ${status} — No JS errors`);
      }

      // Check for "Application error" text in page content
      const bodyText = await p.textContent('body').catch(() => '');
      if (bodyText && bodyText.includes('Application error')) {
        console.log(`   ⚠️  Page contains "Application error" text!`);
        errors++;
      }

      await p.close();
    } catch (e) {
      console.log(`❌ ${page.name} (${page.url}) — NAVIGATION FAILED: ${e.message.substring(0, 150)}`);
      errors++;
    }
  }

  await browser.close();
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Total: ${pages.length} pages, ${errors} with errors, ${pages.length - errors} clean`);
  console.log(`${errors === 0 ? '🎉 ALL PAGES PASSED — iOS Safari compatible' : '⚠️  SOME PAGES HAVE ISSUES'}`);
  process.exit(errors > 0 ? 1 : 0);
})();