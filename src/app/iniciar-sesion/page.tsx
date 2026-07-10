import type { Metadata } from 'next';
import { IniciarSesionClient } from './IniciarSesionClient';

export const metadata: Metadata = {
  title: 'Iniciar Sesión',
  description: 'Accede a tu cuenta de Academia El Profe Oficial. Inicia sesión con Google o correo electrónico.',
  robots: { index: false, follow: false },
};

export default function IniciarSesionPage() {
  return <IniciarSesionClient />;
}