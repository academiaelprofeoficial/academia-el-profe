"""
Test completo de academiaelprofeoficial.com con Playwright.
Verifica que TODAS las páginas carguen sin errores JS,
que el dashboard redirija sin sesión, y que el mobile sea correcto.
"""

import asyncio
import json
from playwright.async_api import async_playwright

BASE = "https://www.academiaelprofeoficial.com"

# Páginas a testear en modo visitante (sin login)
VISITOR_PAGES = [
    "/",
    "/cursos",
    "/nosotros",
    "/soporte",
    "/iniciar-sesion",
    "/registrarse",
    "/certificados",  # debe redirigir a /dashboard/certificados → /#hero
]

# Rutas del dashboard que deben redirigir a /#hero (no logueado)
DASHBOARD_ROUTES = [
    "/dashboard",
    "/dashboard/cursos",
    "/dashboard/certificados",
    "/dashboard/deseos",
    "/dashboard/historial",
]

async def test_page(page, url, label, expected_redirect=None, is_mobile=False):
    """Testea una página: captura errores JS, verifica redirect, toma screenshot."""
    errors = []
    page.on("pageerror", lambda err: errors.append(str(err)))
    page.on("console", lambda msg: errors.append(f"[{msg.type}] {msg.text}") if msg.type == "error" else None)

    response = await page.goto(f"{BASE}{url}", wait_until="networkidle", timeout=30000)
    final_url = page.url

    status = "✅ OK"
    notes = []

    # Verificar redirect esperado
    if expected_redirect:
        if expected_redirect in final_url:
            notes.append(f"Redirect correcto → {final_url}")
        else:
            status = "❌ FAIL"
            notes.append(f"Redirect INCORRECTO: esperaba '{expected_redirect}', llegó a {final_url}")

    # Verificar errores
    if errors:
        critical = [e for e in errors if "ReferenceError" in e or "TypeError" in e or "Cannot access" in e]
        if critical:
            status = "💀 CRASH"
            notes.append(f"Errores críticos: {critical[:3]}")
        else:
            status = "⚠️ WARN"
            notes.append(f"Errores menores: {errors[:2]}")

    # Verificar que no sea página de error de Next.js
    content = await page.content()
    if "Application error" in content and "client-side exception" in content:
        status = "💀 CRASH"
        notes.append("Página de error de Next.js detectada")

    device = "📱" if is_mobile else "🖥️"
    print(f"  {device} {status} {label:35s} → {final_url[:80]}")
    if notes:
        for n in notes:
            print(f"       └─ {n}")

    return status, errors

async def check_no_tab_bar(page, label):
    """Verifica que NO haya tab bar inferior."""
    tab_bar = await page.query_selector('nav.fixed.bottom-0')
    if tab_bar:
        print(f"       ⚠️ Tab bar visible en {label} (debería estar oculto)")
        return False
    print(f"       ✅ Tab bar oculto en {label}")
    return True

async def main():
    print("=" * 70)
    print("🔍 TEST COMPLETO — academiaelprofeoficial.com")
    print("=" * 70)

    async with async_playwright() as p:
        # ============================================================
        # TEST 1: Desktop — Visitante
        # ============================================================
        print("\n🖥️  DESKTOP — MODO VISITANTE (sin sesión)")
        print("-" * 50)

        desktop = await p.chromium.launch(headless=True)
        page = await desktop.new_page(viewport={"width": 1440, "height": 900})

        results = []
        for url in VISITOR_PAGES:
            status, errs = await test_page(page, url, url)
            results.append(("desktop", url, status))

        # Dashboard routes — deben redirigir
        print("\n🔒 DASHBOARD — Redirección sin sesión (desktop):")
        for url in DASHBOARD_ROUTES:
            status, errs = await test_page(page, url, url, expected_redirect="/#hero")
            results.append(("desktop", url, status))

        await desktop.close()

        # ============================================================
        # TEST 2: Mobile — Visitante
        # ============================================================
        print("\n📱  MÓVIL — MODO VISITANTE (sin sesión)")
        print("-" * 50)

        mobile = await p.chromium.launch(headless=True)
        mpage = await mobile.new_page(viewport={"width": 390, "height": 844})

        # Verificar tab bar OCULTO en móvil visitante
        await mpage.goto(f"{BASE}/", wait_until="networkidle", timeout=30000)
        await check_no_tab_bar(mpage, "/")

        await mpage.goto(f"{BASE}/cursos", wait_until="networkidle", timeout=30000)
        await check_no_tab_bar(mpage, "/cursos")

        # Test resto de páginas móvil
        for url in ["/cursos", "/nosotros", "/soporte", "/iniciar-sesion"]:
            status, errs = await test_page(mpage, url, url, is_mobile=True)
            results.append(("mobile", url, status))

        # Dashboard redirect móvil
        print("\n🔒 DASHBOARD — Redirección sin sesión (móvil):")
        for url in DASHBOARD_ROUTES[:2]:  # solo 2 para no demorar
            status, errs = await test_page(mpage, url, url, expected_redirect="/#hero", is_mobile=True)
            results.append(("mobile", url, status))

        await mobile.close()

        # ============================================================
        # RESUMEN
        # ============================================================
        print("\n" + "=" * 70)
        print("📊 RESUMEN DE RESULTADOS")
        print("=" * 70)

        ok = sum(1 for *_, s in results if s == "✅ OK")
        warn = sum(1 for *_, s in results if s == "⚠️ WARN")
        fail = sum(1 for *_, s in results if "FAIL" in s)
        crash = sum(1 for *_, s in results if "CRASH" in s)
        total = len(results)

        print(f"  Total: {total} | ✅ OK: {ok} | ⚠️ Warn: {warn} | ❌ Fail: {fail} | 💀 Crash: {crash}")

        if crash > 0:
            print("\n  🚨 HAY PÁGINAS CRASHEADAS — REQUIERE ATENCIÓN INMEDIATA")
        elif fail > 0:
            print("\n  ⚠️  Hay fallos menores que revisar")
        elif warn > 0:
            print("\n  ✅ Todo funciona con advertencias menores")
        else:
            print("\n  🎉 TODAS LAS PÁGINAS FUNCIONAN CORRECTAMENTE")

        return crash == 0 and fail == 0

if __name__ == "__main__":
    ok = asyncio.run(main())
    exit(0 if ok else 1)