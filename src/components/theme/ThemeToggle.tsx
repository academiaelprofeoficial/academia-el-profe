'use client';

// ============================================================
// Toggle de Tema — Academia El Profe Oficial
// Botón para alternar entre modo claro y oscuro.
// ============================================================

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [montado, setMontado] = useState(false);

  // Evitar error de hidratación: solo renderizar el ícono correcto
  // después de que el componente esté montado en el cliente.
  useEffect(() => {
    setMontado(true);
  }, []);

  const alternarTema = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={alternarTema}
      className="h-9 w-9 rounded-lg"
      aria-label={resolvedTheme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {montado ? (
        resolvedTheme === 'dark' ? (
          <Sun className="h-4 w-4 text-yellow-400" />
        ) : (
          <Moon className="h-4 w-4 text-slate-600" />
        )
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </Button>
  );
}