import type { Metadata } from 'next';
import { RegistrarseClient } from './RegistrarseClient';

export const metadata: Metadata = {
  title: 'Crear Cuenta',
  description: 'Regístrate en Academia El Profe Oficial. Crea tu cuenta con Google o correo electrónico.',
  robots: { index: false, follow: false },
};

export default function RegistrarsePage() {
  return <RegistrarseClient />;
}