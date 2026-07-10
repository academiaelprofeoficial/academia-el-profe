'use client';

// ============================================================
// CourseAccessGuard — Protege el Aula Virtual
// Verifica que el usuario haya comprado el curso antes de mostrar contenido.
// Si no ha comprado, muestra un CTA para comprar.
// ============================================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Lock, ShoppingCart, Loader2, CheckCircle2, Video, FileText } from 'lucide-react';

interface CourseAccessGuardProps {
  courseId: string;
  courseTitle: string;
  children: React.ReactNode;
}

export function CourseAccessGuard({ courseId, courseTitle, children }: CourseAccessGuardProps) {
  const { user, purchasedCourseIds, loading: authLoading } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    // 1. Verificar desde la lista ya cargada en auth context
    if (user && purchasedCourseIds.includes(courseId)) {
      setHasAccess(true);
      setChecking(false);
      return;
    }

    // 2. Verificación server-side (más confiable)
    if (user) {
      fetch(`/api/course/access?userId=${user.uid}&courseId=${courseId}`)
        .then((res) => res.json())
        .then((data) => {
          setHasAccess(data.hasAccess);
          setChecking(false);
        })
        .catch(() => {
          // Si falla la verificación, permitir acceso si ya está en el client
          setHasAccess(purchasedCourseIds.includes(courseId));
          setChecking(false);
        });
    } else {
      setChecking(false);
    }
  }, [user, courseId, purchasedCourseIds, authLoading]);

  // ---- Cargando ----
  if (checking || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-brand-primary" />
          <p className="text-sm text-slate-500">Verificando acceso al curso...</p>
        </div>
      </div>
    );
  }

  // ---- Sin acceso ----
  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="max-w-md w-full text-center px-4">
          <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6">
            <Lock className="h-10 w-10 text-slate-400" />
          </div>

          <h2 className="text-xl font-bold text-brand-heading dark:text-slate-100 mb-2">
            Contenido bloqueado
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Necesitas comprar &ldquo;{courseTitle}&rdquo; para acceder a las clases,
            materiales PDF y evaluaciones.
          </p>

          {/* Beneficios del curso */}
          <div className="grid grid-cols-2 gap-3 mb-8 text-left">
            {[
              { icon: Video, label: 'Clases grabadas en video' },
              { icon: FileText, label: 'Material PDF descargable' },
              { icon: CheckCircle2, label: 'Acceso de por vida' },
              { icon: ShoppingCart, label: 'Certificado de completion' },
            ].map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div key={benefit.label} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <Icon className="h-3.5 w-3.5 text-brand-primary shrink-0" />
                  <span>{benefit.label}</span>
                </div>
              );
            })}
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-3">
            {user ? (
              <Link
                href={`/cursos/${courseId}/temario`}
                className="inline-flex items-center justify-center gap-2 h-12 px-6 bg-brand-primary-hover hover:bg-brand-primary text-white font-bold text-sm rounded-xl transition-colors"
              >
                <ShoppingCart className="h-4 w-4" />
                Comprar ahora
              </Link>
            ) : (
              <>
                <Link
                  href={`/cursos/${courseId}/temario`}
                  className="inline-flex items-center justify-center gap-2 h-12 px-6 bg-brand-primary-hover hover:bg-brand-primary text-white font-bold text-sm rounded-xl transition-colors"
                >
                  Ver temario y precios
                </Link>
                <Link
                  href="/iniciar-sesion"
                  className="inline-flex items-center justify-center gap-2 h-11 px-6 border border-slate-300 text-brand-heading-secondary font-medium text-sm rounded-xl transition-colors hover:bg-slate-50"
                >
                  Iniciar sesión
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => router.back()}
            className="mt-6 text-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            Volver atrás
          </button>
        </div>
      </div>
    );
  }

  // ---- Con acceso: renderizar contenido ----
  return <>{children}</>;
}