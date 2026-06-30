'use client';

// ============================================================
// Panel de Administración MOBILE-FIRST — Academia El Profe Oficial
// Native-feeling admin panel with bottom navigation,
// bottom-sheet modals, skeleton loading, and card-based layouts.
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  BarChart3, Users, DollarSign, TrendingUp, ShoppingCart,
  MessageSquare, Loader2, LogOut, AlertTriangle, Search,
  ChevronLeft, ChevronRight, Eye, Trash2, Shield, ShieldCheck,
  Clock, CheckCircle2, XCircle, AlertCircle, UserCircle, Mail,
  CreditCard, BookOpen, X,
} from 'lucide-react';

// --- Tipos ---

interface Metrics {
  totalUsers: number;
  totalStudents: number;
  totalPurchases: number;
  pendingPurchases: number;
  rejectedPurchases: number;
  totalRevenuePEN: number;
  totalRevenueUSD: number;
  ticketPromedio: number;
  mercadopago: { ventas: number; ingresos: number };
  paypal: { ventas: number; ingresos: number };
  wishlistCount: number;
  clasesCompletadas: number;
  totalTickets: number;
  newTickets: number;
  recentPurchases: any[];
  recentUsers: any[];
  recentTickets: any[];
}

interface Student {
  id: string;
  email: string;
  name: string;
  photoURL: string | null;
  role: string;
  createdAt: string;
  lastActive: string;
  stats: {
    cursosComprados: number;
    totalCompras: number;
    clasesVistas: number;
    totalProgreso: number;
    enWishlist: number;
  };
  compras: any[];
  totalGastado: number;
}

// --- Helpers ---

function fmt(n: number, decimals = 0): string {
  return n.toLocaleString('es-PE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
function fmtSoles(n: number): string { return `S/ ${fmt(n)}`; }
function fmtUSD(n: number): string { return `$${fmt(n, 2)}`; }
function fmtFecha(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtHora(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
}
function tiempoRelativo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Ahora';
  if (min < 60) return `Hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Hace ${h}h`;
  return `Hace ${Math.floor(h / 24)}d`;
}

function getAdminHeaders(idToken: string | null, user: { email: string | null; uid: string } | null) {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (idToken) h['Authorization'] = `Bearer ${idToken}`;
  if (user?.email) h['X-Admin-Email'] = user.email;
  if (user?.uid) h['X-Admin-UID'] = user.uid;
  return h;
}

// --- BADGES ---

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; label: string; icon: any }> = {
    approved: { color: 'bg-brand-primary-bg text-brand-primary-text', label: 'Aprobado', icon: CheckCircle2 },
    pending: { color: 'bg-amber-100 text-amber-700', label: 'Pendiente', icon: Clock },
    rejected: { color: 'bg-red-100 text-red-700', label: 'Rechazado', icon: XCircle },
    refunded: { color: 'bg-slate-100 text-slate-600', label: 'Reembolsado', icon: AlertCircle },
  };
  const s = map[status] || { color: 'bg-slate-100 text-slate-600', label: status, icon: AlertCircle };
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.color}`}>
      <Icon className="h-2.5 w-2.5" />{s.label}
    </span>
  );
}

function TicketBadge({ estado }: { estado: string }) {
  const map: Record<string, { color: string; label: string }> = {
    nuevo: { color: 'bg-blue-100 text-blue-700', label: 'Nuevo' },
    en_proceso: { color: 'bg-amber-100 text-amber-700', label: 'En Proceso' },
    resuelto: { color: 'bg-brand-primary-bg text-brand-primary-text', label: 'Resuelto' },
    cerrado: { color: 'bg-slate-100 text-slate-500', label: 'Cerrado' },
  };
  const s = map[estado] || { color: 'bg-slate-100 text-slate-600', label: estado };
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.color}`}>{s.label}</span>
  );
}

function RoleBadge({ role }: { role: string }) {
  if (role === 'admin') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
        <ShieldCheck className="h-2.5 w-2.5" />Admin
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
      <UserCircle className="h-2.5 w-2.5" />Estudiante
    </span>
  );
}

// --- SKELETON COMPONENTS ---

function SkeletonPulse({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200/70 rounded-xl ${className || ''}`} />;
}

function SkeletonKPICards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <SkeletonPulse className="h-3 w-20" />
          <SkeletonPulse className="h-7 w-28" />
          <SkeletonPulse className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

function SkeletonCardList({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <SkeletonPulse className="h-10 w-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <SkeletonPulse className="h-4 w-36" />
              <SkeletonPulse className="h-3 w-48" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SkeletonSection() {
  return (
    <div className="space-y-5">
      <SkeletonKPICards />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
          <SkeletonPulse className="h-4 w-40" />
          <SkeletonPulse className="h-10 w-full" />
          <SkeletonPulse className="h-10 w-full" />
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
          <SkeletonPulse className="h-4 w-40" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <SkeletonPulse className="h-5 w-5" />
                <SkeletonPulse className="h-6 w-12" />
                <SkeletonPulse className="h-3 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden space-y-3 p-5">
        <SkeletonPulse className="h-4 w-48" />
        <SkeletonCardList rows={2} />
      </div>
    </div>
  );
}

// --- BOTTOM NAV ---

type Tab = 'resumen' | 'estudiantes' | 'compras' | 'tickets';

function BottomNav({
  activeTab,
  onTabChange,
  newTickets,
}: {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  newTickets?: number;
}) {
  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'resumen', label: 'Resumen', icon: BarChart3 },
    { id: 'estudiantes', label: 'Usuarios', icon: Users },
    { id: 'compras', label: 'Compras', icon: ShoppingCart },
    { id: 'tickets', label: 'Soporte', icon: MessageSquare },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-100 safe-area-bottom">
      <div className="max-w-[1400px] mx-auto flex items-center justify-around px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-2 px-3 min-w-[64px] min-h-[52px] rounded-2xl transition-all duration-200 active:scale-95 ${
                isActive ? 'text-brand-primary-text' : 'text-slate-400 active:text-slate-500'
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 transition-all duration-200 ${isActive ? 'scale-110' : ''}`} />
                {tab.id === 'tickets' && newTickets && newTickets > 0 ? (
                  <span className="absolute -top-1.5 -right-2.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 leading-none">
                    {newTickets}
                  </span>
                ) : null}
              </div>
              <span className={`text-[10px] mt-0.5 font-medium tracking-tight transition-all duration-200 ${isActive ? 'font-semibold' : ''}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-1 w-1 h-1 bg-brand-primary-hover rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// --- COMPONENTE PRINCIPAL ---

export default function PaginaAdmin() {
  const router = useRouter();
  const { user, loading: authLoading, isAdmin, idToken, signOut } = useAuth();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsPagination, setStudentsPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [apiWarning, setApiWarning] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('resumen');
  const [searchStudent, setSearchStudent] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Protección: salir del loading en cuanto auth termine
  useEffect(() => {
    if (!authLoading) setLoading(false);
  }, [authLoading]);

  const headers = useCallback(() => getAdminHeaders(idToken, user ? { email: user.email, uid: user.uid } : null), [idToken, user]);

  // --- Cargar métricas ---
  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/metrics', { headers: headers() });
      if (!res.ok) {
        setApiWarning(`Métricas: error ${res.status}`);
        setMetrics(null);
        return;
      }
      const data = await res.json();
      setMetrics(data);
      setApiWarning(null);
    } catch {
      setApiWarning('Error de conexión al cargar métricas.');
    }
  }, [headers]);

  // --- Cargar estudiantes ---
  const fetchStudents = useCallback(async (page = 1, search = '') => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: '50' });
      if (search) params.set('search', search);
      const res = await fetch(`/api/admin/students?${params}`, { headers: headers() });
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students);
        setStudentsPagination(data.pagination);
      }
    } catch (err) {
      console.error('[Admin] Error cargando estudiantes:', err);
    }
  }, [headers]);

  // --- Cargar métricas en background (no bloquea UI) ---
  useEffect(() => {
    if (!isAdmin || !user) return;
    fetchMetrics();
  }, [isAdmin, user, fetchMetrics]);

  useEffect(() => {
    if (activeTab === 'estudiantes' && isAdmin) {
      fetchStudents(1, searchStudent);
    }
  }, [activeTab, isAdmin, fetchStudents, searchStudent]);

  // --- Ver detalle de usuario ---
  const viewUserDetail = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { headers: headers() });
      if (res.ok) {
        const data = await res.json();
        setSelectedUser(data);
        setShowUserModal(true);
      }
    } catch (err) {
      console.error('[Admin] Error detalle usuario:', err);
    }
  };

  // --- Cambiar rol de usuario ---
  const changeUserRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        if (selectedUser?.id === userId) {
          setSelectedUser({ ...selectedUser, role: newRole });
        }
        fetchStudents(studentsPagination.page, searchStudent);
        fetchMetrics();
      }
    } catch (err) {
      console.error('[Admin] Error cambiando rol:', err);
    }
  };

  // --- Eliminar usuario ---
  const deleteUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: headers(),
      });
      if (res.ok) {
        setConfirmDelete(null);
        setShowUserModal(false);
        fetchStudents(studentsPagination.page, searchStudent);
        fetchMetrics();
      } else {
        alert('No se pudo eliminar el usuario.');
      }
    } catch {
      alert('Error al eliminar usuario.');
    }
  };

  // --- Cambiar estado de ticket ---
  const updateTicketStatus = async (ticketId: string, estado: string) => {
    try {
      const res = await fetch('/api/admin/tickets', {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ id: ticketId, estado }),
      });
      if (res.ok) {
        fetchMetrics();
      }
    } catch (err) {
      console.error('[Admin] Error actualizando ticket:', err);
    }
  };

  // ========== LOADING (Skeleton) ==========
  if (authLoading || (loading && isAdmin && user)) {
    return (
      <div className="min-h-screen bg-[#f8fafb]">
        {/* Header skeleton */}
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl shadow-sm">
          <div className="max-w-[1400px] mx-auto px-4 lg:px-8 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SkeletonPulse className="h-5 w-5 rounded-lg" />
              <SkeletonPulse className="h-5 w-32" />
            </div>
            <div className="flex items-center gap-3">
              <SkeletonPulse className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </div>
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-5">
          <SkeletonSection />
        </div>
        <BottomNav activeTab="resumen" onTabChange={() => {}} />
      </div>
    );
  }

  // ========== NO AUTORIZADO ==========
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#f8fafb] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-8 shadow-sm max-w-sm w-full text-center">
          <div className="h-16 w-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
            <Shield className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-lg font-bold text-brand-heading mb-2">Acceso restringido</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">Necesitas iniciar sesión con una cuenta de administrador para acceder a este panel.</p>
          <button
            onClick={() => router.push('/iniciar-sesion')}
            className="w-full py-3 bg-brand-primary-hover text-white text-sm font-semibold rounded-2xl hover:bg-brand-primary-hover active:scale-[0.98] transition-all duration-150"
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full mt-3 py-3 text-sm text-slate-500 hover:text-brand-heading-secondary font-medium active:scale-[0.98] transition-all duration-150"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const m = metrics;

  return (
    <div className="min-h-screen bg-[#f8fafb] flex flex-col">
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-brand-primary-bg-light flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-brand-primary-text" />
            </div>
            <h1 className="text-base font-bold text-brand-heading tracking-tight">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-2">
            {user?.photoURL && (
              <img src={user.photoURL} alt="" className="h-8 w-8 rounded-full ring-2 ring-slate-100" />
            )}
            <button
              onClick={() => router.push('/dashboard/cursos')}
              className="hidden lg:inline-flex text-sm text-slate-500 hover:text-brand-heading-secondary font-medium px-3 py-2 rounded-xl hover:bg-slate-50 active:scale-95 transition-all duration-150"
            >
              Dashboard
            </button>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 font-medium px-3 py-2 rounded-xl hover:bg-red-50 active:scale-95 transition-all duration-150"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden lg:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 lg:px-8 py-5 pb-24 lg:pb-8">
        {/* Warning */}
        {apiWarning && (
          <div className="mb-4 flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-100 rounded-2xl text-sm text-amber-700">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{apiWarning}</span>
          </div>
        )}

        {/* ===== TAB: RESUMEN ===== */}
        {activeTab === 'resumen' && (
          m ? (
            <div className="space-y-5">
              {/* Pull-down style section header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-0.5">Panel de Control</p>
                  <h2 className="text-xl font-bold text-brand-heading tracking-tight">Resumen General</h2>
                </div>
                <button
                  onClick={() => { setLoading(true); fetchMetrics().finally(() => setLoading(false)); }}
                  className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-brand-primary-text active:scale-95 transition-all duration-150"
                >
                  <BarChart3 className="h-4 w-4" />
                </button>
              </div>

              {/* KPI Cards — 2x2 mobile, 4-col desktop */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: 'Ingresos Totales', value: fmtSoles(m.totalRevenuePEN), sub: fmtUSD(m.totalRevenueUSD), icon: DollarSign, color: 'text-brand-primary-text', bg: 'bg-brand-primary-bg-light' },
                  { label: 'Estudiantes', value: String(m.totalUsers), sub: `+${m.recentUsers?.length || 0} recientes`, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Compras Aprobadas', value: String(m.totalPurchases), sub: `${m.pendingPurchases} pendientes`, icon: ShoppingCart, color: 'text-purple-600', bg: 'bg-purple-50' },
                  { label: 'Ticket Promedio', value: fmtSoles(m.ticketPromedio), sub: `${m.totalTickets} tickets`, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
                ].map((card) => {
                  const Icon = card.icon;
                  return (
                    <div key={card.label} className="bg-white rounded-2xl p-4 shadow-sm active:scale-[0.98] transition-transform duration-150">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{card.label}</span>
                        <div className={`h-8 w-8 rounded-xl ${card.bg} flex items-center justify-center`}>
                          <Icon className={`h-4 w-4 ${card.color}`} />
                        </div>
                      </div>
                      <div className={`text-2xl font-bold tracking-tight text-brand-heading ${card.label.includes('Ingresos') || card.label.includes('Ticket') ? 'font-mono' : ''}`}>
                        {card.value}
                      </div>
                      {card.sub && <div className="text-xs text-slate-400 mt-1">{card.sub}</div>}
                    </div>
                  );
                })}
              </div>

              {/* Fila: Gateway + Actividad */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Ingresos por Gateway */}
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-4">Ingresos por Gateway</p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-sky-50/60">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600 text-xs font-bold">MP</div>
                        <span className="text-sm font-medium text-brand-heading-secondary">MercadoPago</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold font-mono text-brand-heading">{fmtSoles(m.mercadopago.ingresos)}</div>
                        <div className="text-[10px] text-slate-400">{m.mercadopago.ventas} ventas</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/60">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 text-xs font-bold">PP</div>
                        <span className="text-sm font-medium text-brand-heading-secondary">PayPal</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold font-mono text-brand-heading">{fmtUSD(m.paypal.ingresos)}</div>
                        <div className="text-[10px] text-slate-400">{m.paypal.ventas} ventas</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actividad de la plataforma */}
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-4">Actividad de la Plataforma</p>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Clases completadas', value: m.clasesCompletadas, icon: BookOpen, color: 'text-brand-primary-text', bg: 'bg-brand-primary-bg-light' },
                      { label: 'Wishlist', value: m.wishlistCount, icon: CreditCard, color: 'text-pink-600', bg: 'bg-pink-50' },
                      { label: 'Tickets nuevos', value: m.newTickets, icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50' },
                      { label: 'Compras rechazadas', value: m.rejectedPurchases, icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80">
                          <div className={`h-9 w-9 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                            <Icon className={`h-4 w-4 ${item.color}`} />
                          </div>
                          <div>
                            <div className="text-lg font-bold text-brand-heading tracking-tight">{item.value}</div>
                            <div className="text-[10px] text-slate-400 font-medium leading-tight">{item.label}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Últimos usuarios registrados */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between border-b border-slate-50">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Últimos usuarios</p>
                  <button
                    onClick={() => setActiveTab('estudiantes')}
                    className="text-xs text-brand-primary-text font-semibold active:scale-95 transition-transform duration-150"
                  >
                    Ver todos
                  </button>
                </div>
                {m.recentUsers?.length === 0 ? (
                  <div className="p-10 text-center">
                    <Users className="h-10 w-10 mx-auto mb-3 text-slate-200" />
                    <p className="text-sm text-slate-400">Sin usuarios registrados aún.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {m.recentUsers.map((u) => (
                      <div key={u.id} className="px-4 py-3 flex items-center gap-3 active:bg-slate-50 transition-colors">
                        {u.photoURL ? (
                          <img src={u.photoURL} className="h-10 w-10 rounded-full ring-2 ring-slate-100" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-brand-primary-bg-light flex items-center justify-center text-brand-primary-text font-bold text-sm">
                            {(u.name || u.email)[0].toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-brand-heading truncate">{u.name || 'Sin nombre'}</div>
                          <div className="text-xs text-slate-400 truncate">{u.email}</div>
                        </div>
                        <RoleBadge role={u.role} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Compras recientes */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between border-b border-slate-50">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Compras recientes</p>
                  <button
                    onClick={() => setActiveTab('compras')}
                    className="text-xs text-brand-primary-text font-semibold active:scale-95 transition-transform duration-150"
                  >
                    Ver todas
                  </button>
                </div>
                {m.recentPurchases?.length === 0 ? (
                  <div className="p-10 text-center">
                    <ShoppingCart className="h-10 w-10 mx-auto mb-3 text-slate-200" />
                    <p className="text-sm text-slate-400">Sin compras registradas aún.</p>
                  </div>
                ) : (
                  <>
                    {/* Mobile: card list */}
                    <div className="lg:hidden divide-y divide-slate-50">
                      {m.recentPurchases.map((p) => (
                        <div key={p.id} className="px-4 py-3.5 active:bg-slate-50 transition-colors">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-semibold text-brand-heading truncate max-w-[60%]">{p.courseTitle || p.courseId}</span>
                            <span className="text-sm font-bold font-mono text-brand-heading">
                              {p.currency === 'PEN' ? fmtSoles(p.amount) : fmtUSD(p.amount)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span>{p.userName || p.userEmail || '-'}</span>
                            <span>·</span>
                            <span>{p.approvedAt ? tiempoRelativo(p.approvedAt) : p.id.substring(0,8)}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <StatusBadge status={p.status} />
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${p.gateway === 'mercadopago' ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700'}`}>
                              {p.gateway === 'mercadopago' ? 'MercadoPago' : 'PayPal'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Desktop: table */}
                    <div className="hidden lg:block overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-100 text-left">
                            <th className="px-5 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Fecha</th>
                            <th className="px-5 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Usuario</th>
                            <th className="px-5 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Curso</th>
                            <th className="px-5 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Gateway</th>
                            <th className="px-5 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-right">Monto</th>
                            <th className="px-5 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {m.recentPurchases.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-5 py-3 text-slate-500 text-xs whitespace-nowrap">{p.approvedAt ? tiempoRelativo(p.approvedAt) : p.id.substring(0,8)}</td>
                              <td className="px-5 py-3 text-brand-heading-secondary text-xs max-w-[150px] truncate">{p.userName || p.userEmail || '-'}</td>
                              <td className="px-5 py-3 font-medium text-brand-heading text-xs max-w-[180px] truncate">{p.courseTitle || p.courseId}</td>
                              <td className="px-5 py-3">
                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${p.gateway === 'mercadopago' ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700'}`}>
                                  {p.gateway === 'mercadopago' ? 'MP' : 'PayPal'}
                                </span>
                              </td>
                              <td className="px-5 py-3 text-right font-mono font-medium text-xs text-brand-heading">
                                {p.currency === 'PEN' ? fmtSoles(p.amount) : fmtUSD(p.amount)}
                              </td>
                              <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <SkeletonSection />
          )
        )}

        {/* ===== TAB: ESTUDIANTES ===== */}
        {activeTab === 'estudiantes' && (
          <div className="space-y-5">
            {/* Section header */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-0.5">Gestión de Usuarios</p>
              <h2 className="text-xl font-bold text-brand-heading tracking-tight">Estudiantes</h2>
            </div>

            {/* Search bar — full width, rounded-2xl */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 text-sm bg-white rounded-2xl shadow-sm border-0 text-brand-heading placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)] transition-all"
              />
            </div>

            {/* Student count */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">
                {studentsPagination.total} usuario{studentsPagination.total !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Student list */}
            {students.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-slate-300" />
                </div>
                <p className="text-sm font-semibold text-slate-600 mb-1">No se encontraron estudiantes</p>
                <p className="text-xs text-slate-400">Intenta ajustar tu búsqueda</p>
              </div>
            ) : (
              <>
                {/* Mobile: Card list */}
                <div className="lg:hidden space-y-3">
                  {students.map((s) => (
                    <div
                      key={s.id}
                      className="bg-white rounded-2xl p-4 shadow-sm active:scale-[0.99] transition-all duration-150"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        {s.photoURL ? (
                          <img src={s.photoURL} alt="" className="h-11 w-11 rounded-full ring-2 ring-slate-100" />
                        ) : (
                          <div className="h-11 w-11 rounded-full bg-brand-primary-bg-light flex items-center justify-center text-brand-primary-text font-bold text-sm">
                            {(s.name || s.email)[0].toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-brand-heading truncate">{s.name}</div>
                          <div className="text-xs text-slate-400 truncate">{s.email}</div>
                        </div>
                        <RoleBadge role={s.role} />
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="bg-slate-50/80 rounded-xl px-3 py-2 text-center">
                          <div className="text-sm font-bold text-brand-heading">{s.stats.cursosComprados}</div>
                          <div className="text-[10px] text-slate-400 font-medium">Cursos</div>
                        </div>
                        <div className="bg-slate-50/80 rounded-xl px-3 py-2 text-center">
                          <div className="text-sm font-bold font-mono text-brand-heading">{fmtSoles(s.totalGastado)}</div>
                          <div className="text-[10px] text-slate-400 font-medium">Gastado</div>
                        </div>
                        <div className="bg-slate-50/80 rounded-xl px-3 py-2 text-center">
                          <div className="text-sm font-bold text-brand-heading">{s.stats.clasesVistas}<span className="text-slate-400 font-normal">/{s.stats.totalProgreso}</span></div>
                          <div className="text-[10px] text-slate-400 font-medium">Clases</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                        <Clock className="h-3 w-3" />
                        <span>Registro: {fmtFecha(s.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => viewUserDetail(s.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium rounded-xl bg-brand-primary-bg-light text-brand-primary-text hover:bg-brand-primary-bg active:scale-[0.97] transition-all duration-150"
                        >
                          <Eye className="h-4 w-4" />Ver detalle
                        </button>
                        <button
                          onClick={() => changeUserRole(s.id, s.role === 'admin' ? 'estudiante' : 'admin')}
                          className="h-11 w-11 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 hover:bg-purple-100 active:scale-95 transition-all duration-150"
                        >
                          {s.role === 'admin' ? <Shield className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop: Table */}
                <div className="hidden lg:block bg-white rounded-2xl shadow-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-left bg-slate-50/50">
                        <th className="px-5 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Usuario</th>
                        <th className="px-5 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Rol</th>
                        <th className="px-5 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-center">Cursos</th>
                        <th className="px-5 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-center">Gastado</th>
                        <th className="px-5 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-center">Clases</th>
                        <th className="px-5 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Registro</th>
                        <th className="px-5 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {students.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              {s.photoURL ? (
                                <img src={s.photoURL} alt="" className="h-9 w-9 rounded-full ring-2 ring-slate-100" />
                              ) : (
                                <div className="h-9 w-9 rounded-full bg-brand-primary-bg-light flex items-center justify-center text-brand-primary-text font-bold text-sm">
                                  {(s.name || s.email)[0].toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="font-medium text-brand-heading truncate max-w-[180px]">{s.name}</div>
                                <div className="text-xs text-slate-400 truncate max-w-[180px]">{s.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3"><RoleBadge role={s.role} /></td>
                          <td className="px-5 py-3 text-center">
                            <span className="text-sm font-semibold text-brand-heading">{s.stats.cursosComprados}</span>
                          </td>
                          <td className="px-5 py-3 text-center">
                            <span className="text-sm font-mono font-medium text-brand-heading-secondary">{fmtSoles(s.totalGastado)}</span>
                          </td>
                          <td className="px-5 py-3 text-center">
                            <span className="text-sm text-slate-600">{s.stats.clasesVistas}/{s.stats.totalProgreso}</span>
                          </td>
                          <td className="px-5 py-3">
                            <div className="text-xs text-slate-500">{fmtFecha(s.createdAt)}</div>
                            <div className="text-xs text-slate-400">{fmtHora(s.createdAt)}</div>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={() => viewUserDetail(s.id)} title="Ver detalle" className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-brand-primary-text active:scale-95 transition-all duration-150">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button onClick={() => changeUserRole(s.id, s.role === 'admin' ? 'estudiante' : 'admin')} title="Cambiar rol" className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-purple-600 active:scale-95 transition-all duration-150">
                                {s.role === 'admin' ? <Shield className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  {studentsPagination.pages > 1 && (
                    <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        Página {studentsPagination.page} de {studentsPagination.pages}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => fetchStudents(Math.max(1, studentsPagination.page - 1), searchStudent)}
                          disabled={studentsPagination.page <= 1}
                          className="h-9 w-9 rounded-xl bg-slate-50 flex items-center justify-center hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all duration-150"
                        >
                          <ChevronLeft className="h-4 w-4 text-slate-600" />
                        </button>
                        <button
                          onClick={() => fetchStudents(Math.min(studentsPagination.pages, studentsPagination.page + 1), searchStudent)}
                          disabled={studentsPagination.page >= studentsPagination.pages}
                          className="h-9 w-9 rounded-xl bg-slate-50 flex items-center justify-center hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all duration-150"
                        >
                          <ChevronRight className="h-4 w-4 text-slate-600" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile Pagination */}
                {studentsPagination.pages > 1 && (
                  <div className="lg:hidden flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm">
                    <span className="text-xs text-slate-400">
                      Página {studentsPagination.page} de {studentsPagination.pages}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => fetchStudents(Math.max(1, studentsPagination.page - 1), searchStudent)}
                        disabled={studentsPagination.page <= 1}
                        className="h-11 w-11 rounded-xl bg-slate-50 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all duration-150"
                      >
                        <ChevronLeft className="h-4 w-4 text-slate-600" />
                      </button>
                      <button
                        onClick={() => fetchStudents(Math.min(studentsPagination.pages, studentsPagination.page + 1), searchStudent)}
                        disabled={studentsPagination.page >= studentsPagination.pages}
                        className="h-11 w-11 rounded-xl bg-brand-primary-bg-light flex items-center justify-center text-brand-primary-text disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all duration-150"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ===== TAB: COMPRAS ===== */}
        {activeTab === 'compras' && (
          <div className="space-y-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-0.5">Historial</p>
              <h2 className="text-xl font-bold text-brand-heading tracking-tight">Compras</h2>
            </div>

            {(!m || m.recentPurchases?.length === 0) ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="h-8 w-8 text-slate-300" />
                </div>
                <p className="text-sm font-semibold text-slate-600 mb-1">No hay compras registradas</p>
                <p className="text-xs text-slate-400">Las compras aparecerán aquí cuando se realicen</p>
              </div>
            ) : (
              <>
                {/* Mobile: Card list */}
                <div className="lg:hidden space-y-3">
                  {m.recentPurchases.map((p) => (
                    <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm active:scale-[0.99] transition-all duration-150">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-brand-heading truncate max-w-[60%]">{p.courseTitle || p.courseId}</span>
                        <StatusBadge status={p.status} />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                        <span>{p.userName || p.userEmail || '-'}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${p.gateway === 'mercadopago' ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700'}`}>
                            {p.gateway === 'mercadopago' ? 'MercadoPago' : 'PayPal'}
                          </span>
                          <span className="text-xs text-slate-400">
                            {p.approvedAt ? fmtFecha(p.approvedAt) : '-'}
                          </span>
                        </div>
                        <span className="text-sm font-bold font-mono text-brand-heading">
                          {p.currency === 'PEN' ? fmtSoles(p.amount) : fmtUSD(p.amount)}
                        </span>
                      </div>
                      {p.gatewayPaymentId && (
                        <div className="mt-2 text-[10px] text-slate-300 font-mono truncate">ID: {p.gatewayPaymentId}</div>
                      )}
                    </div>
                  ))}
                </div>
                {/* Desktop: Table */}
                <div className="hidden lg:block bg-white rounded-2xl shadow-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-left bg-slate-50/50">
                        <th className="px-5 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Fecha</th>
                        <th className="px-5 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Usuario</th>
                        <th className="px-5 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Curso</th>
                        <th className="px-5 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Gateway</th>
                        <th className="px-5 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-right">Monto</th>
                        <th className="px-5 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Estado</th>
                        <th className="px-5 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">ID Pago</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {m.recentPurchases.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3 text-xs text-slate-500 whitespace-nowrap">
                            <div>{p.approvedAt ? fmtFecha(p.approvedAt) : '-'}</div>
                            <div className="text-slate-400">{p.approvedAt ? fmtHora(p.approvedAt) : ''}</div>
                          </td>
                          <td className="px-5 py-3">
                            <div className="text-xs font-medium text-brand-heading-secondary truncate max-w-[150px]">{p.userName || '-'}</div>
                            <div className="text-xs text-slate-400 truncate max-w-[150px]">{p.userEmail || p.payerEmail || '-'}</div>
                          </td>
                          <td className="px-5 py-3 text-xs font-medium text-brand-heading max-w-[180px] truncate">{p.courseTitle || p.courseId}</td>
                          <td className="px-5 py-3">
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${p.gateway === 'mercadopago' ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700'}`}>
                              {p.gateway === 'mercadopago' ? 'MercadoPago' : 'PayPal'}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right font-mono font-medium text-xs text-brand-heading">
                            {p.currency === 'PEN' ? fmtSoles(p.amount) : fmtUSD(p.amount)}
                          </td>
                          <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                          <td className="px-5 py-3 text-xs text-slate-400 font-mono max-w-[100px] truncate">{p.gatewayPaymentId || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* ===== TAB: TICKETS ===== */}
        {activeTab === 'tickets' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-0.5">Soporte</p>
                <h2 className="text-xl font-bold text-brand-heading tracking-tight">Tickets</h2>
              </div>
              {m?.newTickets ? (
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-600">
                  {m.newTickets} nuevo{m.newTickets !== 1 ? 's' : ''}
                </span>
              ) : null}
            </div>

            {/* Filter pills */}
            {m && (
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                {['todos', 'nuevo', 'en_proceso', 'resuelto', 'cerrado'].map((filter) => {
                  const count = filter === 'todos' ? m.totalTickets : m.recentTickets.filter((t) => t.estado === filter).length;
                  return (
                    <button
                      key={filter}
                      className="shrink-0 text-xs font-medium px-3.5 py-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-95 transition-all duration-150"
                    >
                      {filter === 'todos' ? 'Todos' : filter.replace('_', ' ')} ({count})
                    </button>
                  );
                })}
              </div>
            )}

            {(!m || m.recentTickets?.length === 0) ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-slate-300" />
                </div>
                <p className="text-sm font-semibold text-slate-600 mb-1">No hay tickets de soporte</p>
                <p className="text-xs text-slate-400">Los tickets nuevos aparecerán aquí</p>
              </div>
            ) : (
              <div className="space-y-3">
                {m.recentTickets.map((t) => (
                  <div key={t.id} className="bg-white rounded-2xl p-4 shadow-sm active:scale-[0.99] transition-all duration-150">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <TicketBadge estado={t.estado} />
                          <span className="text-xs text-slate-400">{tiempoRelativo(t.createdAt)}</span>
                        </div>
                        {t.asunto && (
                          <div className="text-sm font-semibold text-brand-heading mb-1">{t.asunto}</div>
                        )}
                        <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{t.mensaje}</p>
                        <div className="flex items-center gap-3 mt-2.5 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />{t.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <UserCircle className="h-3 w-3" />{t.nombre}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-50">
                      {t.estado === 'nuevo' && (
                        <button
                          onClick={() => updateTicketStatus(t.id, 'en_proceso')}
                          className="flex-1 py-2.5 text-xs font-semibold rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 active:scale-[0.97] transition-all duration-150"
                        >
                          Tomar
                        </button>
                      )}
                      {t.estado === 'en_proceso' && (
                        <button
                          onClick={() => updateTicketStatus(t.id, 'resuelto')}
                          className="flex-1 py-2.5 text-xs font-semibold rounded-xl bg-brand-primary-bg-light text-brand-primary-text hover:bg-brand-primary-bg active:scale-[0.97] transition-all duration-150"
                        >
                          Resolver
                        </button>
                      )}
                      {t.estado === 'resuelto' && (
                        <button
                          onClick={() => updateTicketStatus(t.id, 'cerrado')}
                          className="flex-1 py-2.5 text-xs font-semibold rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 active:scale-[0.97] transition-all duration-150"
                        >
                          Cerrar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ===== BOTTOM NAV ===== */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        newTickets={m?.newTickets}
      />

      {/* ===== MODAL / BOTTOM SHEET: DETALLE DE USUARIO ===== */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 z-[60]" onClick={() => setShowUserModal(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 lg:bg-black/50 transition-opacity" />

          {/* Bottom Sheet (mobile) / Centered Modal (desktop) */}
          <div
            className="absolute bottom-0 left-0 right-0 lg:bottom-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 bg-white rounded-t-3xl lg:rounded-2xl w-full lg:max-w-2xl max-h-[90vh] lg:max-h-[85vh] overflow-hidden shadow-2xl z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle (mobile) */}
            <div className="lg:hidden flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-slate-200" />
            </div>

            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 lg:px-6 py-3 lg:py-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-brand-heading">Detalle del Usuario</h2>
              <button
                onClick={() => setShowUserModal(false)}
                className="h-9 w-9 rounded-xl bg-slate-50 flex items-center justify-center hover:bg-slate-100 active:scale-95 transition-all duration-150"
              >
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>

            <div className="overflow-y-auto p-5 lg:p-6 space-y-5 pb-24 lg:pb-6">
              {/* Info principal */}
              <div className="flex items-center gap-4">
                {selectedUser.photoURL ? (
                  <img src={selectedUser.photoURL} className="h-14 w-14 rounded-full ring-2 ring-slate-100" />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-brand-primary-bg-light flex items-center justify-center text-brand-primary-text font-bold text-xl">
                    {(selectedUser.name || selectedUser.email)[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-brand-heading text-lg truncate">{selectedUser.name || 'Sin nombre'}</div>
                  <div className="text-sm text-slate-500 truncate">{selectedUser.email}</div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <RoleBadge role={selectedUser.role} />
                    <span className="text-xs text-slate-400">Registro: {fmtFecha(selectedUser.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: 'Cursos comprados', value: selectedUser.stats.comprasAprobadas, icon: BookOpen, color: 'text-brand-primary-text', bg: 'bg-brand-primary-bg-light' },
                  { label: 'Total gastado', value: fmtSoles(selectedUser.stats.totalGastado), icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Clases vistas', value: selectedUser.stats.clasesCompletadas, icon: CheckCircle2, color: 'text-purple-600', bg: 'bg-purple-50' },
                  { label: 'Wishlist', value: selectedUser.stats.enWishlist, icon: CreditCard, color: 'text-pink-600', bg: 'bg-pink-50' },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="bg-slate-50/80 rounded-xl p-3 text-center">
                      <div className={`h-8 w-8 rounded-lg ${stat.bg} flex items-center justify-center mx-auto mb-1.5`}>
                        <Icon className={`h-4 w-4 ${stat.color}`} />
                      </div>
                      <div className="text-lg font-bold text-brand-heading tracking-tight">{stat.value}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{stat.label}</div>
                    </div>
                  );
                })}
              </div>

              {/* Compras del usuario */}
              {selectedUser.purchases.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
                    Historial de compras ({selectedUser.purchases.length})
                  </p>
                  {/* Mobile: card list */}
                  <div className="lg:hidden space-y-2">
                    {selectedUser.purchases.map((p: any) => (
                      <div key={p.id} className="bg-slate-50/80 rounded-xl p-3 flex items-center justify-between">
                        <div className="flex-1 min-w-0 mr-3">
                          <div className="text-sm font-medium text-brand-heading truncate">{p.courseTitle || p.courseId}</div>
                          <div className="text-xs text-slate-400">{p.approvedAt ? fmtFecha(p.approvedAt) : '-'}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-sm font-bold font-mono text-brand-heading">{p.currency === 'PEN' ? fmtSoles(p.amount) : fmtUSD(p.amount)}</div>
                          <StatusBadge status={p.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Desktop: table */}
                  <div className="hidden lg:block rounded-xl border border-slate-100 overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="px-3 py-2 text-left font-semibold text-slate-400 uppercase tracking-wider">Curso</th>
                          <th className="px-3 py-2 text-right font-semibold text-slate-400 uppercase tracking-wider">Monto</th>
                          <th className="px-3 py-2 text-center font-semibold text-slate-400 uppercase tracking-wider">Estado</th>
                          <th className="px-3 py-2 text-left font-semibold text-slate-400 uppercase tracking-wider">Fecha</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {selectedUser.purchases.map((p: any) => (
                          <tr key={p.id}>
                            <td className="px-3 py-2 text-brand-heading-secondary max-w-[150px] truncate">{p.courseTitle || p.courseId}</td>
                            <td className="px-3 py-2 text-right font-mono">{p.currency === 'PEN' ? fmtSoles(p.amount) : fmtUSD(p.amount)}</td>
                            <td className="px-3 py-2 text-center"><StatusBadge status={p.status} /></td>
                            <td className="px-3 py-2 text-slate-400">{p.approvedAt ? fmtFecha(p.approvedAt) : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Progreso de clases */}
              {selectedUser.progress.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
                    Progreso de clases ({selectedUser.progress.length})
                  </p>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {selectedUser.progress.map((p: any) => (
                      <div key={p.id} className="flex items-center gap-2.5 text-xs px-3 py-2 rounded-xl bg-slate-50/80">
                        {p.completed ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-brand-primary shrink-0" />
                        ) : (
                          <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        )}
                        <span className="text-slate-600 truncate flex-1">{p.courseId}{p.temaId ? ` / ${p.temaId}` : ''}</span>
                        <span className="text-slate-400 font-mono shrink-0">{p.watchTime}s</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Wishlist */}
              {selectedUser.wishlist.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
                    Wishlist ({selectedUser.wishlist.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.wishlist.map((w: any, i: number) => (
                      <span key={i} className="text-xs bg-pink-50 text-pink-700 px-3 py-1.5 rounded-full font-medium">{w.courseId}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Acciones */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => changeUserRole(selectedUser.id, selectedUser.role === 'admin' ? 'estudiante' : 'admin')}
                  className="flex-1 py-3 text-sm font-semibold rounded-2xl border border-purple-200 text-purple-700 hover:bg-purple-50 active:scale-[0.97] transition-all duration-150"
                >
                  {selectedUser.role === 'admin' ? 'Quitar Admin' : 'Promover a Admin'}
                </button>
                {confirmDelete === selectedUser.id ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => deleteUser(selectedUser.id)}
                      className="px-5 py-3 text-sm font-semibold rounded-2xl bg-red-600 text-white hover:bg-red-700 active:scale-95 transition-all duration-150"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="px-5 py-3 text-sm font-medium rounded-2xl border border-slate-200 text-slate-600 active:scale-95 transition-all duration-150"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(selectedUser.id)}
                    className="px-5 py-3 text-sm font-medium rounded-2xl border border-red-200 text-red-600 hover:bg-red-50 active:scale-95 transition-all duration-150 flex items-center gap-1.5"
                  >
                    <Trash2 className="h-4 w-4" />Eliminar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== SAFE AREA PADDING STYLES ===== */}
      <style jsx global>{`
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }
      `}</style>
    </div>
  );
}
