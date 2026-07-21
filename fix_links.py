import re

def process_file(filepath, component_name):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'handleMercadoPago' in content:
        return

    handlers = """
  const [loadingMP, setLoadingMP] = useState(false);
  const [loadingPP, setLoadingPP] = useState(false);

  const handleMercadoPago = async () => {
    setLoadingMP(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cursoId: slug,
          titulo: title,
          precio: pricePEN,
          userId: user?.uid || undefined,
          userEmail: user?.email || undefined
        })
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error || 'Error al iniciar pago');
    } catch (e) {
      alert('Error de conexión');
    } finally {
      setLoadingMP(false);
    }
  };

  const handlePayPal = async () => {
    setLoadingPP(true);
    try {
      const res = await fetch('/api/checkout/paypal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cursoId: slug,
          titulo: title,
          precioUSD: priceUSD,
          userId: user?.uid || undefined,
          userEmail: user?.email || undefined
        })
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error || 'Error al iniciar pago');
    } catch (e) {
      alert('Error de conexión');
    } finally {
      setLoadingPP(false);
    }
  };
"""

    # Inject handlers
    content = re.sub(r'(export function ' + component_name + r'\([^\)]*\)\s*\{)', r'\1' + handlers, content)

    # Replace <Link href={/api/checkout...}> with <button onClick={...}>
    content = re.sub(
        r'<Link\s+href=\{/api/checkout\?courseId=\$\{slug\}\&provider=mercadopago\}\s+className="(.*?)"\s*>\s*Pagar con MercadoPago\s*</Link>',
        r'<button onClick={handleMercadoPago} disabled={loadingMP} className="\1">{loadingMP ? "Cargando..." : "Pagar con MercadoPago"}</button>',
        content
    )
    
    content = re.sub(
        r'<Link\s+href=\{/api/checkout/paypal\?courseId=\$\{slug\}\}\s+className="(.*?)"\s*>\s*Pagar con PayPal\s*</Link>',
        r'<button onClick={handlePayPal} disabled={loadingPP} className="\1">{loadingPP ? "Cargando..." : "Pagar con PayPal"}</button>',
        content
    )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {filepath}")

process_file('src/app/cursos/[slug]/DetalleCursoClient.tsx', 'DetalleCursoClient')
process_file('src/app/cursos/[slug]/lecciones/[videoOrder]/LeccionClient.tsx', 'LeccionClient')
