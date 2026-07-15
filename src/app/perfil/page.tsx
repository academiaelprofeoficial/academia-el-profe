import type { Metadata } from 'next';
import { PerfilClient } from './PerfilClient';

export const metadata: Metadata = {
  title: 'Mi Perfil — Academia El Profe',
  description: 'Gestiona tu perfil de estudiante.',
};

export default function PerfilPage() {
  return <PerfilClient />;
}