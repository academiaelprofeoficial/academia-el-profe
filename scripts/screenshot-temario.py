"""Screenshot test of temario pages."""
import asyncio
from playwright.async_api import async_playwright

BASE = "https://www.academiaelprofeoficial.com"

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        
        # Desktop screenshot
        page = await browser.new_page(viewport={"width": 1440, "height": 1024})
        await page.goto(f"{BASE}/cursos/calculo-diferencial/temario", wait_until="networkidle", timeout=30000)
        await page.screenshot(path="/home/z/my-project/download/temario-desktop.png", full_page=True)
        print("✅ Desktop screenshot saved")

        # Mobile screenshot
        mpage = await browser.new_page(viewport={"width": 390, "height": 844})
        await mpage.goto(f"{BASE}/cursos/calculo-diferencial/temario", wait_until="networkidle", timeout=30000)
        await mpage.screenshot(path="/home/z/my-project/download/temario-mobile.png", full_page=True)
        print("✅ Mobile screenshot saved")

        # Check breadcrumbs text
        breadcrumbs = await page.query_selector_all('a, span')
        breadcrumb_text = ""
        for el in breadcrumbs:
            text = (await el.text_content() or "").strip()
            if text in ["Cursos", "Temario"]:
                breadcrumb_text += text + " > "
        print(f"Breadcrumb elements found: {breadcrumb_text}")

        # Check module count
        all_text = await page.content()
        import re
        modules = re.findall(r'Módulo\s*\d+|módulo\s*\d+', all_text, re.IGNORECASE)
        print(f"Module references found: {len(modules)}")

        await browser.close()

asyncio.run(main())