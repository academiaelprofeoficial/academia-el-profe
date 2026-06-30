'use client';

// ============================================================
// /dashboard → redirige a /dashboard/cursos
// Preserva query params (?status=success, ?status=pending, etc.)
// ============================================================

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, Suspense } from 'react';

function DashboardRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const status = searchParams.get('status');
    const query = status ? `?status=${status}` : '';
    router.replace(`/dashboard/cursos${query}`);
  }, [searchParams, router]);

  return null;
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardRedirect />
    </Suspense>
  );
}