"""Test de las páginas de temario con Playwright."""
import asyncio
from playwright.async_api import async_playwright

BASE = "https://www.academiaelprofeoficial.com"

TEMARIO_ROUTES = [
    "/cursos/calculo-diferencial/temario",
    "/cursos/calculo-integral/temario",
    "/cursos/ecuaciones-diferenciales/temario",
    "/cursos/calculo-vectorial/temario",
    "/cursos/fisica-1/temario",
    "/cursos/fisica-2/temario",
    "/cursos/estatica/temario",
]

async def test_temario(page, url, label):
    errors = []
    page.on("pageerror", lambda err: errors.append(str(err)))
    page.on("console", lambda msg: errors.append(f"[{msg.type}] {msg.text}") if msg.type == "error" else None)

    await page.goto(f"{BASE}{url}", wait_until="networkidle", timeout=30000)
    content = await page.content()
    final_url = page.url

    status = "✅"
    notes = []

    # Check for crash
    if "Application error" in content:
        status = "💀"
        notes.append("CRASH: Application error page")

    # Check for TDZ
    critical = [e for e in errors if "ReferenceError" in e or "Cannot access" in e or "TypeError" in e]
    if critical:
        status = "💀"
        notes.append(f"Critical JS: {critical[:2]}")

    # Check key elements exist
    if "TEMARIO DEL CURSO" not in content:
        status = "⚠️" if status == "✅" else status
        notes.append("Missing 'TEMARIO DEL CURSO' title")

    if "COMPRAR AHORA" not in content:
        status = "⚠️" if status == "✅" else status
        notes.append("Missing 'COMPRAR AHORA' button")

    # Check breadcrumbs contain "Temario"
    breadcrumb = await page.query_selector('nav')
    if breadcrumb and "Temario" not in await breadcrumb.text_content():
        status = "⚠️" if status == "✅" else status
        notes.append("Breadcrumb missing 'Temario'")

    # Check module list exists (look for numbered items)
    modules = await page.query_selector_all('[class*="rounded-xl"][class*="border"]')
    if len(modules) < 5:
        status = "⚠️" if status == "✅" else status
        notes.append(f"Only {len(modules)} module items found (expected 14)")

    # Check lock indicators
    lock_icons = await page.query_selector_all('svg.lucide-lock, svg[data-lucide="lock"]')
    
    print(f"  {status} {label:50s} modules≈{len(modules):2d} locks={len(lock_icons):2d} err={len(errors)}")
    if notes:
        for n in notes:
            print(f"       └─ {n}")
    if errors and not critical:
        for e in errors[:2]:
            print(f"       └─ {e[:100]}")

    return status == "✅"

async def test_mobile_temario(page, url, label):
    await page.goto(f"{BASE}{url}", wait_until="networkidle", timeout=30000)
    content = await page.content()

    errors = []
    page.on("pageerror", lambda err: errors.append(str(err)))

    status = "✅"
    notes = []

    if "Application error" in content:
        status = "💀"
        notes.append("CRASH on mobile")

    # Mobile should NOT have sidebar
    sidebar = await page.query_selector('aside.lg\\:flex')
    if sidebar and await sidebar.is_visible():
        status = "⚠️"
        notes.append("Sidebar visible on mobile viewport")

    # Should have compact mobile card
    mobile_card = await page.query_selector('.lg\\:hidden')
    
    # Should have bottom CTA
    if "COMPRAR AHORA" not in content:
        status = "⚠️" if status == "✅" else status
        notes.append("Missing CTA on mobile")

    print(f"  📱 {status} {label:45s}")
    if notes:
        for n in notes:
            print(f"       └─ {n}")

    return status == "✅"

async def main():
    print("=" * 70)
    print("🔍 TEST TEMARIO PAGES")
    print("=" * 70)

    async with async_playwright() as p:
        # Desktop
        print("\n🖥️  DESKTOP")
        print("-" * 50)
        desktop = await p.chromium.launch(headless=True)
        page = await desktop.new_page(viewport={"width": 1440, "height": 900})
        
        ok_count = 0
        for url in TEMARIO_ROUTES:
            slug = url.split("/")[2]
            if await test_temario(page, url, slug):
                ok_count += 1
        await desktop.close()

        # Mobile
        print("\n📱  MÓVIL")
        print("-" * 50)
        mobile = await p.chromium.launch(headless=True)
        mpage = await mobile.new_page(viewport={"width": 390, "height": 844})
        
        for url in TEMARIO_ROUTES[:3]:  # test 3 on mobile
            slug = url.split("/")[2]
            await test_mobile_temario(mpage, url, slug)
        await mobile.close()

        print(f"\n{'=' * 70}")
        print(f"Desktop: {ok_count}/{len(TEMARIO_ROUTES)} OK")
        print(f"{'=' * 70}")

if __name__ == "__main__":
    asyncio.run(main())