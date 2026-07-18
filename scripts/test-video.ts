import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(`PageError: ${err.message}`));

  console.log('📱 Testing mobile (iPhone)...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:3099/cursos/calculo-diferencial/temario', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  // Check for video element
  const videoEl = await page.$('video');
  console.log(`Video element found: ${!!videoEl}`);
  
  // Check for VideoPlayer component
  const playerContainer = await page.$('.video-player-container');
  console.log(`VideoPlayer container found: ${!!playerContainer}`);
  
  // Check for placeholder
  const placeholder = await page.$('text=Selecciona');
  console.log(`Placeholder visible: ${!!placeholder}`);
  
  // Try clicking first topic to expand
  const firstTopic = await page.$('summary, [data-topic], button');
  if (firstTopic) {
    console.log('Clicking first element...');
    await firstTopic.click();
    await page.waitForTimeout(2000);
  }

  // Check for video after click
  const videoAfter = await page.$('video');
  console.log(`Video after click: ${!!videoAfter}`);

  // Check for any error toasts or messages
  const pageContent = await page.content();
  const hasVideoPlayer = pageContent.includes('video-player-container');
  console.log(`Has video-player-container in DOM: ${hasVideoPlayer}`);

  if (errors.length > 0) {
    console.log('\n❌ Console Errors:');
    errors.forEach((e, i) => console.log(`  ${i + 1}. ${e.slice(0, 200)}`));
  } else {
    console.log('\n✅ No console errors');
  }

  // Desktop test
  console.log('\n🖥️  Testing desktop...');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:3099/cursos/calculo-diferencial/temario', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  
  const desktopVideo = await page.$('video');
  console.log(`Desktop video element: ${!!desktopVideo}`);
  const desktopPlaceholder = await page.$('text=Selecciona');
  console.log(`Desktop placeholder: ${!!desktopPlaceholder}`);

  const desktopErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') desktopErrors.push(msg.text());
  });

  if (desktopErrors.length > 0) {
    console.log('Desktop errors:', desktopErrors);
  }

  await browser.close();
  console.log('\nDone.');
})();