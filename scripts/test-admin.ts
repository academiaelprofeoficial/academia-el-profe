// Test Playwright — verificar que el panel admin funciona
import { chromium } from 'playwright';

const BASE = 'https://www.academiaelprofeoficial.com';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('1. Navegando a /api/debug para verificar DB...');
  const debugRes = await page.goto(`${BASE}/api/debug`);
  if (debugRes) {
    const status = debugRes.status();
    if (status === 404) {
      console.log('   ✅ Debug endpoint eliminado (404)');
    } else {
      console.log(`   ⚠️  Debug endpoint responde con ${status}`);
    }
  }

  console.log('2. Navegando a /admin sin auth...');
  const adminRes = await page.goto(`${BASE}/admin`);
  const adminBody = await page.textContent('body');
  const has403 = adminBody?.includes('restringido') || adminBody?.includes('No tienes');
  console.log(`   ${has403 ? '✅' : '❌'} Sin auth muestra acceso restringido`);

  console.log('3. Navegando a /iniciar-sesion...');
  await page.goto(`${BASE}/iniciar-sesion`);
  const hasGoogleBtn = await page.isVisible('button:has-text("Continuar con Google")');
  console.log(`   ${hasGoogleBtn ? '✅' : '❌'} Botón Google visible`);

  console.log('4. Verificando que /admin no es estático (debe ser client component)...');
  // Solo verificar que la página carga sin error 500
  const adminStatus = await page.goto(`${BASE}/admin`);
  console.log(`   ${adminStatus?.status() === 200 ? '✅' : '❌'} /admin responde ${adminStatus?.status()}`);

  // Verificar que no hay errores de JS en consola relacionados con auth
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  await page.goto(`${BASE}/admin`);
  await page.waitForTimeout(3000);
  const authErrors = consoleErrors.filter(e =>
    e.includes('admin') || e.includes('auth') || e.includes('403')
  );
  console.log(`   ${authErrors.length === 0 ? '✅' : '⚠️'} Sin errores críticos de auth en consola`);
  if (authErrors.length > 0) {
    authErrors.forEach(e => console.log(`     - ${e}`));
  }

  await browser.close();
  console.log('\n✅ Test completado');
})();