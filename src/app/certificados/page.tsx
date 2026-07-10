import { redirect } from 'next/navigation';

// ============================================================
// /certificados → Redirige a /dashboard/certificados
// Los certificados son solo para usuarios autenticados.
// ============================================================

export default function CertificadosRedirectPage() {
  redirect('/dashboard/certificados');
}