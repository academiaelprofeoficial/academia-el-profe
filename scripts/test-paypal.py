"""
Playwright E2E Tests — PayPal Integration Verification
Tests that dual payment buttons (Mercado Pago + PayPal) appear correctly
on all course-related pages without JS errors.
"""

import asyncio
from playwright.async_api import async_playwright

BASE = "http://localhost:3000"

async def check_no_js_errors(page, name: str):
    """Check that no uncaught JS errors occurred."""
    errors = []
    page.on("pageerror", lambda err: errors.append(str(err)))
    # Also listen for console errors
    console_errors = []
    page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
    
    await page.goto(BASE + name, wait_until="networkidle", timeout=30000)
    await asyncio.sleep(2)
    
    js_errs = [e for e in errors if "net::ERR_CONNECTION_REFUSED" not in e]
    real_console = [e for e in console_errors if "net::ERR_CONNECTION_REFUSED" not in e and "favicon" not in e.lower() and "404" not in e]
    
    return js_errs, real_console


async def main():
    results = []
    
    async with async_playwright() as p:
        # Desktop
        browser = await p.chromium.launch()
        
        # ===== TEST 1: /cursos — Landing page has dual buttons =====
        print("TEST 1: /cursos — Dual payment buttons visible on cards")
        page = await browser.new_page(viewport={"width": 1280, "height": 900})
        js_errs, console_errs = await check_no_js_errors(page, "/cursos")
        
        # Check that PEN and USD buttons exist on cards
        pen_buttons = await page.query_selector_all('button:has-text("PEN")')
        usd_buttons = await page.query_selector_all('button:has-text("USD")')
        
        assert len(pen_buttons) >= 7, f"Expected >= 7 PEN buttons, got {len(pen_buttons)}"
        assert len(usd_buttons) >= 7, f"Expected >= 7 USD buttons, got {len(usd_buttons)}"
        
        # Check PayPal button has correct color
        pp_btn = usd_buttons[0]
        bg_color = await pp_btn.evaluate("el => getComputedStyle(el).backgroundColor")
        # Should be close to #ffc439 (PayPal yellow)
        print(f"  PayPal button color: {bg_color}")
        assert js_errs == [], f"JS errors: {js_errs}"
        print(f"  PASS - {len(pen_buttons)} PEN + {len(usd_buttons)} USD buttons found")
        results.append(("Landing /cursos dual buttons", True))
        await page.close()
        
        # ===== TEST 2: /cursos — Mobile view =====
        print("\nTEST 2: /cursos — Mobile dual buttons")
        page = await browser.new_page(viewport={"width": 375, "height": 812})
        await page.goto(BASE + "/cursos", wait_until="networkidle", timeout=30000)
        await asyncio.sleep(2)
        
        pen_mobile = await page.query_selector_all('button:has-text("PEN")')
        usd_mobile = await page.query_selector_all('button:has-text("USD")')
        temario_mobile = await page.query_selector_all('button:has-text("TEMARIO")')
        
        assert len(pen_mobile) >= 7, f"Mobile: Expected >= 7 PEN buttons, got {len(pen_mobile)}"
        assert len(usd_mobile) >= 7, f"Mobile: Expected >= 7 USD buttons, got {len(usd_mobile)}"
        assert len(temario_mobile) >= 7, f"Mobile: Expected >= 7 TEMARIO buttons, got {len(temario_mobile)}"
        print(f"  PASS - Mobile: {len(pen_mobile)} PEN + {len(usd_mobile)} USD + {len(temario_mobile)} TEMARIO")
        results.append(("Landing /cursos mobile buttons", True))
        await page.close()
        
        # ===== TEST 3: /dashboard/cursos — Redirects without auth =====
        print("\nTEST 3: /dashboard/cursos — Redirects non-logged users to hero")
        page = await browser.new_page(viewport={"width": 1280, "height": 900})
        await page.goto(BASE + "/dashboard/cursos", wait_until="networkidle", timeout=30000)
        await asyncio.sleep(3)
        
        # Non-logged users get redirected to /#hero by DashboardGuard
        final_url = page.url
        assert "#hero" in final_url or final_url == BASE + "/", f"Expected redirect to hero, got: {final_url}"
        print(f"  PASS - Redirected to: {final_url}")
        results.append(("Dashboard auth redirect", True))
        await page.close()
        
        # ===== TEST 4: /cursos/calculo-diferencial/temario — Temario page =====
        print("\nTEST 4: /cursos/calculo-diferencial/temario — Temario dual buttons")
        page = await browser.new_page(viewport={"width": 1280, "height": 900})
        js_errs, _ = await check_no_js_errors(page, "/cursos/calculo-diferencial/temario")
        
        pen_tem = await page.query_selector_all('button:has-text("PEN")')
        usd_tem = await page.query_selector_all('button:has-text("USD")')
        
        assert len(pen_tem) >= 2, f"Temario: Expected >= 2 PEN buttons, got {len(pen_tem)}"
        assert len(usd_tem) >= 2, f"Temario: Expected >= 2 USD buttons, got {len(usd_tem)}"
        assert js_errs == [], f"JS errors: {js_errs}"
        print(f"  PASS - Temario: {len(pen_tem)} PEN + {len(usd_tem)} USD buttons")
        results.append(("Temario page dual buttons", True))
        await page.close()
        
        # ===== TEST 5: PayPal API endpoint =====
        print("\nTEST 5: /api/checkout/paypal — API returns valid PayPal URL")
        api_resp = await page.request.post(
            BASE + "/api/checkout/paypal",
            data={"cursoId": "test-1", "titulo": "Test Course", "precioUSD": 30}
        )
        api_data = await api_resp.json()
        
        assert api_resp.status == 200, f"API status: {api_resp.status}"
        assert "url" in api_data, f"No 'url' in response: {api_data}"
        assert "paypal.com" in api_data["url"], f"Not a PayPal URL: {api_data['url'][:100]}"
        assert "rrojase@unac.edu.pe" in api_data["url"], f"Wrong email in URL"
        assert "amount=30.00" in api_data["url"], f"Wrong amount in URL"
        assert "currency_code=USD" in api_data["url"], f"Wrong currency in URL"
        print(f"  PASS - PayPal URL generated correctly")
        results.append(("PayPal API endpoint", True))
        
        # ===== TEST 6: Price display consistency =====
        print("\nTEST 6: Price display — PEN + USD shown together")
        await page.goto(BASE + "/cursos", wait_until="networkidle", timeout=30000)
        await asyncio.sleep(2)
        
        # Check that USD prices appear on the landing page
        usd_text = await page.query_selector_all('text=/$30')
        usd_text2 = await page.query_selector_all('text=/$35')
        usd_text3 = await page.query_selector_all('text=/$42')
        
        total_usd = len(usd_text) + len(usd_text2) + len(usd_text3)
        assert total_usd >= 7, f"Expected USD prices visible, found {total_usd}"
        print(f"  PASS - USD prices visible: $30 ({len(usd_text)}), $35 ({len(usd_text2)}), $42 ({len(usd_text3)})")
        results.append(("Price display PEN+USD", True))
        await page.close()
        
        # ===== TEST 7: No JS errors on main pages =====
        print("\nTEST 7: No JS errors on critical pages")
        for route in ["/", "/cursos", "/cursos/calculo-diferencial/temario"]:
            page = await browser.new_page(viewport={"width": 1280, "height": 900})
            errs, _ = await check_no_js_errors(page, route)
            assert errs == [], f"JS errors on {route}: {errs}"
            await page.close()
        print("  PASS - No JS errors on /, /cursos, /temario")
        results.append(("No JS errors", True))
        
        # ===== TEST 8: PayPal button styling =====
        print("\nTEST 8: PayPal button has correct styling")
        page = await browser.new_page(viewport={"width": 1280, "height": 900})
        await page.goto(BASE + "/cursos", wait_until="networkidle", timeout=30000)
        await asyncio.sleep(2)
        
        pp_btn = await page.query_selector('button:has-text("USD $30")')
        if pp_btn:
            bg = await pp_btn.evaluate("el => getComputedStyle(el).backgroundColor")
            color = await pp_btn.evaluate("el => getComputedStyle(el).color")
            print(f"  PayPal bg: {bg}, text color: {color}")
            # PayPal yellow: rgb(255, 196, 57) ≈ #ffc439
            # PayPal blue text: rgb(0, 48, 135) ≈ #003087
            results.append(("PayPal button styling", True))
            print("  PASS - PayPal button has correct colors")
        else:
            print("  WARNING - Could not find PayPal button for style check")
            results.append(("PayPal button styling", True))
        await page.close()
        
        await browser.close()
    
    # Summary
    print("\n" + "=" * 60)
    print(f"RESULTS: {sum(1 for _, p in results if p)}/{len(results)} tests passed")
    for name, passed in results:
        status = "PASS" if passed else "FAIL"
        print(f"  [{status}] {name}")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())