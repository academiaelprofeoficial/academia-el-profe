'use client';

// ============================================================
// Admin Access Management — Grant / Revoke manual course access
// Professional dark-themed design matching platform style.
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { sanityClient } from '@/lib/sanity.client';
import { ALL_COURSES_QUERY } from '@/lib/sanity.queries';
import type { SanityCourse } from '@/lib/sanity.client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Search, Loader2, Shield, ShieldCheck, UserCircle, Mail,
  ArrowLeft, CheckCircle2, XCircle, Clock, BookOpen, Key,
  Lock, Unlock, History, AlertTriangle,
} from 'lucide-react';

// --- Types ---

interface CourseInfo {
  slug: string;
  title: string;
  category?: string;
  level?: string;
  courseType?: string;
}

interface GrantedAccess {
  id: string;
  courseId: string;
  grantedBy: string;
  grantedAt: string;
  revokedAt: string | null;
  isActive: boolean;
  note: string | null;
}

interface AccessRecord {
  id: string;
  courseId: string;
  courseTitle: string | null;
  status: string;
  approvedAt: string | null;
}

interface UserInfo {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

// --- Helpers ---

function getAdminHeaders(idToken: string | null, user: { email: string | null; uid: string } | null) {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (idToken) h['Authorization'] = `Bearer ${idToken}`;
  if (user?.email) h['X-Admin-Email'] = user.email;
  if (user?.uid) h['X-Admin-UID'] = user.uid;
  return h;
}

function fmtFecha(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtHora(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
}

// --- Component ---

export default function AdminAccessPage() {
  const { user, loading: authLoading, isAdmin, idToken, signOut } = useAuth();
  const router = useRouter();

  // State
  const [searchEmail, setSearchEmail] = useState('');
  const [searching, setSearching] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [grantedAccess, setGrantedAccess] = useState<GrantedAccess[]>([]);
  const [allAccessRecords, setAllAccessRecords] = useState<GrantedAccess[]>([]);
  const [purchases, setPurchases] = useState<AccessRecord[]>([]);
  const [courses, setCourses] = useState<CourseInfo[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
  const [note, setNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const headers = useCallback(
    () => getAdminHeaders(idToken, user ? { email: user.email, uid: user.uid } : null),
    [idToken, user]
  );

  // Auth guard
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.replace('/admin');
    }
  }, [authLoading, user, isAdmin, router]);

  // Load all courses from Sanity
  useEffect(() => {
    async function loadCourses() {
      try {
        const data = await sanityClient.fetch<SanityCourse[]>(ALL_COURSES_QUERY);
        setCourses(data.map((c) => ({
          slug: c.slug,
          title: c.title,
          category: c.category,
          level: c.level,
          courseType: c.courseType,
        })));
      } catch (err) {
        console.error('[Access Page] Error loading courses:', err);
      } finally {
        setLoadingCourses(false);
      }
    }
    loadCourses();
  }, []);

  // Derived sets
  const purchasedSlugs = new Set(purchases.map((p) => p.courseId));
  const grantedSlugs = new Set(grantedAccess.map((a) => a.courseId));
  const accessibleSlugs = new Set([...purchasedSlugs, ...grantedSlugs]);

  // Search user
  const handleSearch = async () => {
    if (!searchEmail.trim()) return;
    setSearching(true);
    setError(null);
    setSuccessMsg(null);
    setSelectedCourses(new Set());
    setNote('');

    try {
      const res = await fetch(`/api/admin/grant-access?userEmail=${encodeURIComponent(searchEmail.trim())}`, {
        headers: headers(),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Error ${res.status}`);
        setUserInfo(null);
        setGrantedAccess([]);
        setAllAccessRecords([]);
        setPurchases([]);
        return;
      }

      const data = await res.json();
      setUserInfo(data.user);
      setGrantedAccess(data.grantedAccess);
      setAllAccessRecords(data.allAccessRecords || []);
      setPurchases(data.purchases || []);
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setSearching(false);
    }
  };

  // Toggle course selection
  const toggleCourse = (slug: string) => {
    setSelectedCourses((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  // Grant access
  const handleGrant = async () => {
    if (!userInfo || selectedCourses.size === 0) return;
    setActionLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/admin/grant-access', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          action: 'grant',
          userEmail: userInfo.email,
          courseIds: Array.from(selectedCourses),
          note: note.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error al otorgar acceso');
        return;
      }

      setSuccessMsg(`${data.results.length} curso(s) con acceso otorgado`);
      setSelectedCourses(new Set());
      setNote('');
      // Refresh user data
      await handleSearch();
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setActionLoading(false);
    }
  };

  // Revoke access
  const handleRevoke = async (courseId: string) => {
    if (!userInfo) return;
    setActionLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/admin/grant-access', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          action: 'revoke',
          userEmail: userInfo.email,
          courseIds: [courseId],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error al revocar acceso');
        return;
      }

      setSuccessMsg('Acceso revocado correctamente');
      // Refresh user data
      await handleSearch();
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setActionLoading(false);
    }
  };

  // Loading / auth gate
  if (authLoading || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-brand-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/60">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.push('/admin')}
            className="p-2 -ml-2 rounded-xl hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-brand-primary/10">
              <Key className="h-5 w-5 text-brand-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">Gestión de Acceso</h1>
              <p className="text-xs text-slate-500">Otorgar o revocar acceso manual a cursos</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Search Section */}
        <Card className="bg-slate-900 border-slate-800 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold text-slate-200 flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-500" />
              Buscar Usuario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-brand-primary focus:ring-brand-primary/20"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={searching || !searchEmail.trim()}
                className="bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold px-6"
              >
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                <span className="hidden sm:inline ml-2">Buscar</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error / Success */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
        {successMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {successMsg}
          </div>
        )}

        {/* User Info */}
        {userInfo && (
          <Card className="bg-slate-900 border-slate-800 shadow-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-slate-200 flex items-center gap-2">
                  <UserCircle className="h-4 w-4 text-slate-500" />
                  Usuario Encontrado
                </CardTitle>
                <Badge variant="outline" className={
                  userInfo.role === 'admin'
                    ? 'border-purple-500/30 text-purple-400 bg-purple-500/10'
                    : 'border-slate-600 text-slate-400 bg-slate-800'
                }>
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  {userInfo.role}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <UserCircle className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-500">Nombre:</span>
                  <span className="text-white font-medium">{userInfo.name || 'Sin nombre'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-500">Email:</span>
                  <span className="text-white font-medium">{userInfo.email}</span>
                </div>
              </div>
              <div className="flex gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {purchases.length} compra(s)
                </span>
                <span className="flex items-center gap-1">
                  <Key className="h-3 w-3" />
                  {grantedAccess.length} acceso(s) manual(es)
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Course Selection */}
        {userInfo && (
          <Card className="bg-slate-900 border-slate-800 shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-slate-200 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-slate-500" />
                  Seleccionar Cursos
                  {selectedCourses.size > 0 && (
                    <Badge className="bg-brand-primary text-white border-0 ml-2">
                      {selectedCourses.size} seleccionado(s)
                    </Badge>
                  )}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingCourses ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-slate-800 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : courses.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No se encontraron cursos</p>
              ) : (
                <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
                  {courses.map((course) => {
                    const isPurchased = purchasedSlugs.has(course.slug);
                    const isGranted = grantedSlugs.has(course.slug);
                    const isSelected = selectedCourses.has(course.slug);
                    const hasAccess = isPurchased || isGranted;

                    return (
                      <label
                        key={course.slug}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                          isSelected
                            ? 'bg-brand-primary/10 border-brand-primary/30'
                            : hasAccess
                            ? 'bg-slate-800/50 border-slate-700/50'
                            : 'hover:bg-slate-800/30 border-transparent'
                        }`}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleCourse(course.slug)}
                          className="border-slate-600 data-[state=checked]:bg-brand-primary data-[state=checked]:border-brand-primary"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white truncate">{course.title}</span>
                            {course.courseType === 'free' && (
                              <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-[9px] px-1.5 py-0">
                                GRATIS
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            {course.category && <span>{course.category}</span>}
                            {course.level && (
                              <>
                                <span>•</span>
                                <span>{course.level}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="shrink-0">
                          {isPurchased ? (
                            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-[10px]">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Comprado
                            </Badge>
                          ) : isGranted ? (
                            <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-[10px]">
                              <Key className="h-3 w-3 mr-1" />
                              Manual
                            </Badge>
                          ) : (
                            <Lock className="h-4 w-4 text-slate-600" />
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Note */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500">Nota interna (opcional)</label>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ej: Acceso otorgado por promoción especial..."
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-600 text-sm min-h-[60px] focus:border-brand-primary focus:ring-brand-primary/20"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <Button
                  onClick={handleGrant}
                  disabled={actionLoading || selectedCourses.size === 0}
                  className="flex-1 bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold"
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Unlock className="h-4 w-4" />
                  )}
                  <span className="ml-2">Otorgar Acceso</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Manual Access — can revoke */}
        {userInfo && grantedAccess.length > 0 && (
          <Card className="bg-slate-900 border-slate-800 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold text-slate-200 flex items-center gap-2">
                <Key className="h-4 w-4 text-amber-400" />
                Accesos Manuales Activos
                <Badge variant="outline" className="border-amber-500/30 text-amber-400 ml-1">
                  {grantedAccess.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {grantedAccess.map((access) => {
                  const course = courses.find((c) => c.slug === access.courseId);
                  return (
                    <div
                      key={access.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {course?.title || access.courseId}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {fmtFecha(access.grantedAt)} {fmtHora(access.grantedAt)}
                          </span>
                          <span>por {access.grantedBy}</span>
                          {access.note && <span className="text-slate-400">— {access.note}</span>}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevoke(access.courseId)}
                        disabled={actionLoading}
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 text-xs shrink-0"
                      >
                        {actionLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Lock className="h-3 w-3" />
                        )}
                        <span className="ml-1 hidden sm:inline">Revocar</span>
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Full Access History */}
        {userInfo && allAccessRecords.length > 0 && (
          <Card className="bg-slate-900 border-slate-800 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold text-slate-200 flex items-center gap-2">
                <History className="h-4 w-4 text-slate-500" />
                Historial Completo de Accesos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left text-xs font-medium text-slate-500 pb-2 pr-4">Curso</th>
                      <th className="text-left text-xs font-medium text-slate-500 pb-2 pr-4">Estado</th>
                      <th className="text-left text-xs font-medium text-slate-500 pb-2 pr-4">Otorgado por</th>
                      <th className="text-left text-xs font-medium text-slate-500 pb-2 pr-4">Fecha</th>
                      <th className="text-left text-xs font-medium text-slate-500 pb-2">Nota</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {allAccessRecords.map((record) => {
                      const course = courses.find((c) => c.slug === record.courseId);
                      return (
                        <tr key={record.id}>
                          <td className="py-2.5 pr-4 text-white font-medium truncate max-w-[200px]">
                            {course?.title || record.courseId}
                          </td>
                          <td className="py-2.5 pr-4">
                            {record.isActive ? (
                              <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-[10px]">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Activo
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-red-500/30 text-red-400 text-[10px]">
                                <XCircle className="h-3 w-3 mr-1" />
                                Revocado
                              </Badge>
                            )}
                          </td>
                          <td className="py-2.5 pr-4 text-slate-400 text-xs">{record.grantedBy}</td>
                          <td className="py-2.5 pr-4 text-slate-400 text-xs whitespace-nowrap">
                            {fmtFecha(record.grantedAt)} {fmtHora(record.grantedAt)}
                            {!record.isActive && record.revokedAt && (
                              <span className="text-red-400/70 block">
                                Revocado: {fmtFecha(record.revokedAt)}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 text-slate-500 text-xs max-w-[150px] truncate">
                            {record.note || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}