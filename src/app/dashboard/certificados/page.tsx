'use client';

// ============================================================
// Dashboard — Mis Certificados
// ============================================================

import { Award, Download, ExternalLink, ShieldCheck } from 'lucide-react';
import { CERTIFICADOS_USUARIO } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function DashboardCertificadosPage() {
  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Award className="h-5 w-5 text-brand-primary" />
          <h1 className="text-xl sm:text-2xl font-bold text-brand-heading dark:text-slate-100">
            Mis Certificados
          </h1>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Aquí encuentras todos los certificados de los cursos que has completado.
          Cada certificado cuenta con un código de verificación único.
        </p>
      </div>

      {/* Lista de certificados */}
      {CERTIFICADOS_USUARIO.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-12 text-center">
          <Award className="h-12 w-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <p className="text-lg font-semibold text-brand-body mb-1">
            Aún no tienes certificados
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">
            Completa un curso para obtener tu primer certificado.
          </p>
          <Link href="/dashboard/cursos">
            <Button className="bg-brand-primary hover:bg-brand-primary-hover text-white">
              Explorar Cursos
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {CERTIFICADOS_USUARIO.map((cert) => (
            <div
              key={cert.id}
              className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Icono */}
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-brand-primary-bg dark:bg-brand-primary-darkest/50 shrink-0">
                <Award className="h-6 w-6 text-brand-primary-text" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-brand-heading dark:text-slate-100 text-base">
                  {cert.cursoNombre}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Emitido el {cert.fechaEmision}
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge variant="outline" className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    {cert.codigoVerificacion}
                  </Badge>
                  <Badge className="text-xs bg-brand-primary-bg text-brand-primary-text dark:bg-brand-primary-darkest/50 dark:text-brand-primary-text border-0">
                    Completado
                  </Badge>
                </div>
              </div>

              {/* Botón descargar */}
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                Descargar
              </Button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}