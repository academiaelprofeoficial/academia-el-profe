'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2 } from 'lucide-react';

export function SoporteForm() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const nombre = (form.elements.namedItem('nombre') as HTMLInputElement).value;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const asunto = (form.elements.namedItem('asunto') as HTMLInputElement).value;
    const mensaje = (form.elements.namedItem('mensaje') as HTMLTextAreaElement).value;

    try {
      const res = await fetch('/api/soporte', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, asunto, mensaje }),
      });

      const data = await res.json();

      if (res.ok) {
        setSent(true);
        form.reset();
      } else {
        setError(data.error || 'Error al enviar.');
      }
    } catch {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-2xl border border-brand-primary/30 dark:border-brand-primary/40 bg-brand-primary-bg-light dark:bg-brand-primary-darkest/20 p-8 text-center">
        <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-brand-primary" />
        <p className="text-lg font-bold text-brand-primary-text dark:text-brand-primary-light-text mb-1">
          Mensaje enviado
        </p>
        <p className="text-sm text-brand-primary-text">
          Te responderemos pronto. Revisa tu correo.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => setSent(false)}
        >
          Enviar otro mensaje
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border/40 bg-card p-5 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="soporte-nombre" className="text-sm font-medium text-foreground">
            Nombre completo
          </label>
          <Input name="nombre" id="soporte-nombre" placeholder="Tu nombre" className="h-10" required />
        </div>
        <div className="space-y-2">
          <label htmlFor="soporte-email" className="text-sm font-medium text-foreground">
            Correo electrónico
          </label>
          <Input name="email" id="soporte-email" type="email" placeholder="tu@correo.com" className="h-10" required />
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="soporte-asunto" className="text-sm font-medium text-foreground">
          Asunto
        </label>
        <Input name="asunto" id="soporte-asunto" placeholder="¿En qué podemos ayudarte?" className="h-10" />
      </div>
      <div className="space-y-2">
        <label htmlFor="soporte-mensaje" className="text-sm font-medium text-foreground">
          Mensaje
        </label>
        <Textarea
          name="mensaje"
          id="soporte-mensaje"
          placeholder="Describe tu consulta con el mayor detalle posible..."
          className="min-h-[120px] resize-none"
          required
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white font-bold h-10"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Enviando...
          </>
        ) : (
          'Enviar Mensaje'
        )}
      </Button>
    </form>
  );
}