#!/usr/bin/env python3
"""Fix admin panel: dark mode + sidebar on desktop + theme toggle."""
import re

FILE = '/home/z/my-project/academia-el-profe/src/app/admin/page.tsx'

with open(FILE, 'r') as f:
    content = f.read()

# ============================================================
# 1. ADD IMPORTS: Sun, Moon, useTheme
# ============================================================
content = content.replace(
    "} from 'lucide-react';",
    "} from 'lucide-react';\nimport { useTheme } from 'next-themes';",
    1  # only first occurrence
)

# ============================================================
# 2. SKELETON COMPONENTS — dark mode
# ============================================================
content = content.replace(
    "return <div className={`animate-pulse bg-slate-200/70 rounded-xl ${className || ''}`} />;",
    "return <div className={`animate-pulse bg-slate-200/70 dark:bg-slate-700/50 rounded-xl ${className || ''}`} />;"
)

# ============================================================
# 3. STATUS BADGE — dark mode
# ============================================================
content = content.replace(
    """const map: Record<string, { color: string; label: string; icon: any }> = {
    approved: { color: 'bg-brand-primary-bg text-brand-primary-text', label: 'Aprobado', icon: CheckCircle2 },
    pending: { color: 'bg-amber-100 text-amber-700', label: 'Pendiente', icon: Clock },
    rejected: { color: 'bg-red-100 text-red-700', label: 'Rechazado', icon: XCircle },
    refunded: { color: 'bg-slate-100 text-slate-600', label: 'Reembolsado', icon: AlertCircle },
  };""",
    """const map: Record<string, { color: string; label: string; icon: any }> = {
    approved: { color: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300', label: 'Aprobado', icon: CheckCircle2 },
    pending: { color: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300', label: 'Pendiente', icon: Clock },
    rejected: { color: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300', label: 'Rechazado', icon: XCircle },
    refunded: { color: 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300', label: 'Reembolsado', icon: AlertCircle },
  };"""
)

# ============================================================
# 4. TICKET BADGE — dark mode
# ============================================================
content = content.replace(
    """const map: Record<string, { color: string; label: string }> = {
    nuevo: { color: 'bg-blue-100 text-blue-700', label: 'Nuevo' },
    en_proceso: { color: 'bg-amber-100 text-amber-700', label: 'En Proceso' },
    resuelto: { color: 'bg-brand-primary-bg text-brand-primary-text', label: 'Resuelto' },
    cerrado: { color: 'bg-slate-100 text-slate-500', label: 'Cerrado' },
  };""",
    """const map: Record<string, { color: string; label: string }> = {
    nuevo: { color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300', label: 'Nuevo' },
    en_proceso: { color: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300', label: 'En Proceso' },
    resuelto: { color: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300', label: 'Resuelto' },
    cerrado: { color: 'bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400', label: 'Cerrado' },
  };"""
)

# ============================================================
# 5. ROLE BADGE — dark mode
# ============================================================
content = content.replace(
    """return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
        <ShieldCheck className="h-2.5 w-2.5" />Admin
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
      <UserCircle className="h-2.5 w-2.5" />Estudiante
    </span>""",
    """return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
        <ShieldCheck className="h-2.5 w-2.5" />Admin
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300">
      <UserCircle className="h-2.5 w-2.5" />Estudiante
    </span>"""
)

# ============================================================
# 6. BOTTOM NAV → RESPONSIVE NAV (sidebar on desktop)
# ============================================================
old_bottom_nav = '''function BottomNav({
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
}'''

new_responsive_nav = '''function ResponsiveNav({
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
    <>
      {/* ===== DESKTOP: Vertical Sidebar ===== */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 z-40 w-[220px] flex-col bg-white dark:bg-[var(--surface-1)] border-r border-slate-100 dark:border-slate-800 pt-5 pb-6">
        {/* Brand */}
        <div className="px-5 mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-brand-heading tracking-tight leading-tight">Admin Panel</h1>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Academia El Profe</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 relative group ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-emerald-500 dark:bg-emerald-400 rounded-r-full" />
                )}
                <div className="relative">
                  <Icon className="h-[18px] w-[18px]" />
                  {tab.id === 'tickets' && newTickets && newTickets > 0 ? (
                    <span className="absolute -top-1.5 -right-2.5 bg-red-500 text-white text-[8px] font-bold rounded-full min-w-[14px] h-3.5 flex items-center justify-center px-0.5 leading-none">
                      {newTickets}
                    </span>
                  ) : null}
                </div>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom info */}
        <div className="px-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[10px] text-slate-400 dark:text-slate-600">v1.0 &middot; Panel Admin</p>
        </div>
      </aside>

      {/* ===== MOBILE: Bottom Tab Bar ===== */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[var(--surface-1)]/95 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 pb-[env(safe-area-inset-bottom,8px)]">
        <div className="flex items-center justify-around px-2 pt-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center py-2 px-3 min-w-[64px] min-h-[52px] rounded-2xl transition-all duration-200 active:scale-95 ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-400 dark:text-slate-500 active:text-slate-500'
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
                <span className={`text-[10px] mt-0.5 tracking-tight transition-all duration-200 ${isActive ? 'font-semibold' : 'font-medium'}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <div className="absolute -bottom-0.5 w-4 h-[3px] bg-emerald-500 dark:bg-emerald-400 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}'''

content = content.replace(old_bottom_nav, new_responsive_nav)

# Rename all BottomNav references to ResponsiveNav
content = content.replace('BottomNav', 'ResponsiveNav')

# ============================================================
# 7. ADD THEME TOGGLE COMPONENT before main component
# ============================================================
content = content.replace(
    '// --- COMPONENTE PRINCIPAL ---',
    '''// --- THEME TOGGLE ---
function AdminThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-9 w-9 lg:w-auto lg:px-3" />;
  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="h-9 w-9 lg:w-auto lg:px-3 flex items-center justify-center lg:gap-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 active:scale-95"
      title={resolvedTheme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
    >
      {resolvedTheme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
      <span className="hidden lg:inline text-sm font-medium">{resolvedTheme === 'dark' ? 'Claro' : 'Oscuro'}</span>
    </button>
  );
}

// --- COMPONENTE PRINCIPAL ---'''
)

# ============================================================
# 8. LOADING SKELETON — dark mode
# ============================================================
content = content.replace(
    'className="min-h-screen bg-[#f8fafb]">\n        {/* Header skeleton */}\n        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl shadow-sm">',
    'className="min-h-screen bg-[#f8fafb] dark:bg-background">\n        {/* Header skeleton */}\n        <div className="sticky top-0 z-40 bg-white/95 dark:bg-[var(--surface-1)]/95 backdrop-blur-xl shadow-sm dark:shadow-none">'
)

# Skeleton KPI cards
content = content.replace(
    'className="bg-white rounded-2xl p-4 shadow-sm space-y-3">\n          <SkeletonPulse className="h-3 w-20"',
    'className="bg-white dark:bg-[var(--surface-2)] rounded-2xl p-4 shadow-sm dark:shadow-none space-y-3">\n          <SkeletonPulse className="h-3 w-20"'
)

# Skeleton card list items
content = content.replace(
    'className="bg-white rounded-2xl p-4 shadow-sm space-y-3">\n            <div className="flex items-center gap-3">',
    'className="bg-white dark:bg-[var(--surface-2)] rounded-2xl p-4 shadow-sm dark:shadow-none space-y-3">\n            <div className="flex items-center gap-3">'
)

# Skeleton section cards
content = content.replace(
    'className="bg-white rounded-2xl p-5 shadow-sm space-y-3">\n          <SkeletonPulse className="h-4 w-40"',
    'className="bg-white dark:bg-[var(--surface-2)] rounded-2xl p-5 shadow-sm dark:shadow-none space-y-3">\n          <SkeletonPulse className="h-4 w-40"'
)

content = content.replace(
    'className="bg-white rounded-2xl shadow-sm overflow-hidden space-y-3 p-5">',
    'className="bg-white dark:bg-[var(--surface-2)] rounded-2xl shadow-sm dark:shadow-none overflow-hidden space-y-3 p-5">'
)

# ============================================================
# 9. UNAUTHORIZED PAGE — dark mode
# ============================================================
content = content.replace(
    'className="min-h-screen bg-[#f8fafb] flex items-center justify-center px-4">\n        <div className="bg-white rounded-3xl p-8 shadow-sm max-w-sm w-full text-center">\n          <div className="h-16 w-16 rounded-2xl bg-red-50',
    'className="min-h-screen bg-[#f8fafb] dark:bg-background flex items-center justify-center px-4">\n        <div className="bg-white dark:bg-[var(--surface-2)] rounded-3xl p-8 shadow-sm dark:shadow-none max-w-sm w-full text-center">\n          <div className="h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-950/30'
)

# ============================================================
# 10. MAIN PAGE WRAPPER
# ============================================================
content = content.replace(
    '<div className="min-h-screen bg-[#f8fafb] flex flex-col">',
    '<div className="min-h-screen bg-[#f8fafb] dark:bg-background flex flex-col">'
)

# ============================================================
# 11. HEADER — dark mode + sidebar offset
# ============================================================
content = content.replace(
    '<header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">\n        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 h-14 flex items-center justify-between">',
    '<header className="sticky top-0 z-30 bg-white/95 dark:bg-[var(--surface-1)]/95 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none border-b border-transparent dark:border-slate-800">\n        <div className="max-w-[1400px] mx-auto px-4 lg:pl-[240px] lg:pr-8 h-14 flex items-center justify-between">'
)

# Hide logo area on desktop (shown in sidebar)
content = content.replace(
    '''<div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-brand-primary-bg-light flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-brand-primary-text" />
            </div>
            <h1 className="text-base font-bold text-brand-heading tracking-tight">Admin Panel</h1>
          </div>''',
    '''<div className="flex items-center gap-2.5 lg:hidden">
            <div className="h-8 w-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-base font-bold text-brand-heading tracking-tight">Admin Panel</h1>
          </div>'''
)

# Add theme toggle before signOut button
content = content.replace(
    '''<button
              onClick={signOut}
              className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 font-medium px-3 py-2 rounded-xl hover:bg-red-50 active:scale-95 transition-all duration-150"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden lg:inline">Salir</span>
            </button>''',
    '''<AdminThemeToggle />
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 font-medium px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 active:scale-95 transition-all duration-150"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden lg:inline">Salir</span>
            </button>'''
)

# Dashboard link dark mode
content = content.replace(
    'className="hidden lg:inline-flex text-sm text-slate-500 hover:text-brand-heading-secondary font-medium px-3 py-2 rounded-xl hover:bg-slate-50',
    'className="hidden lg:inline-flex text-sm text-slate-500 dark:text-slate-400 hover:text-brand-heading-secondary dark:hover:text-slate-200 font-medium px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60'
)

# Avatar ring
content = content.replace('ring-2 ring-slate-100"', 'ring-2 ring-slate-100 dark:ring-slate-700"')

# ============================================================
# 12. MAIN CONTENT — sidebar offset on desktop
# ============================================================
content = content.replace(
    '<main className="flex-1 max-w-[1400px] mx-auto w-full px-4 lg:px-8 py-5 pb-24 lg:pb-8">',
    '<main className="flex-1 max-w-[1400px] mx-auto w-full px-4 lg:pl-[240px] lg:pr-8 py-5 pb-24 lg:pb-8">'
)

# ============================================================
# 13. BULK DARK MODE REPLACEMENTS
# ============================================================
replacements = [
    # Warning box
    ('bg-amber-50 border border-amber-100', 'bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40'),
    ('text-amber-700">', 'text-amber-700 dark:text-amber-300">'),

    # KPI Cards
    ("{ label: 'Ingresos Totales', value: fmtSoles(m.totalRevenuePEN), sub: fmtUSD(m.totalRevenueUSD), icon: DollarSign, color: 'text-brand-primary-text', bg: 'bg-brand-primary-bg-light' },",
     "{ label: 'Ingresos Totales', value: fmtSoles(m.totalRevenuePEN), sub: fmtUSD(m.totalRevenueUSD), icon: DollarSign, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },"),
    ("{ label: 'Estudiantes', value: String(m.totalUsers), sub: `+${m.recentUsers?.length || 0} recientes`, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },",
     "{ label: 'Estudiantes', value: String(m.totalUsers), sub: `+${m.recentUsers?.length || 0} recientes`, icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },"),
    ("{ label: 'Compras Aprobadas', value: String(m.totalPurchases), sub: `${m.pendingPurchases} pendientes`, icon: ShoppingCart, color: 'text-purple-600', bg: 'bg-purple-50' },",
     "{ label: 'Compras Aprobadas', value: String(m.totalPurchases), sub: `${m.pendingPurchases} pendientes`, icon: ShoppingCart, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30' },"),
    ("{ label: 'Ticket Promedio', value: fmtSoles(m.ticketPromedio), sub: `${m.totalTickets} tickets`, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },",
     "{ label: 'Ticket Promedio', value: fmtSoles(m.ticketPromedio), sub: `${m.totalTickets} tickets`, icon: TrendingUp, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/30' },"),

    # KPI card container
    ('className="bg-white rounded-2xl p-4 shadow-sm active:scale', 'className="bg-white dark:bg-[var(--surface-2)] rounded-2xl p-4 shadow-sm dark:shadow-none active:scale'),

    # Gateway cards
    ('bg-sky-50/60', 'bg-sky-50/60 dark:bg-sky-950/30'),
    ('bg-amber-50/60', 'bg-amber-50/60 dark:bg-amber-950/30'),
    ('bg-sky-100 flex items-center justify-center text-sky-600', 'bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center text-sky-600 dark:text-sky-400'),
    ('bg-amber-100 flex items-center justify-center text-amber-600', 'bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400'),

    # Activity items
    ("{ label: 'Clases completadas', value: m.clasesCompletadas, icon: BookOpen, color: 'text-brand-primary-text', bg: 'bg-brand-primary-bg-light' },",
     "{ label: 'Clases completadas', value: m.clasesCompletadas, icon: BookOpen, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },"),
    ("{ label: 'Wishlist', value: m.wishlistCount, icon: CreditCard, color: 'text-pink-600', bg: 'bg-pink-50' },",
     "{ label: 'Wishlist', value: m.wishlistCount, icon: CreditCard, color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-900/30' },"),
    ("{ label: 'Tickets nuevos', value: m.newTickets, icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50' },",
     "{ label: 'Tickets nuevos', value: m.newTickets, icon: MessageSquare, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },"),
    ("{ label: 'Compras rechazadas', value: m.rejectedPurchases, icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },",
     "{ label: 'Compras rechazadas', value: m.rejectedPurchases, icon: XCircle, color: 'text-red-500 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/30' },"),

    # Activity card bg
    ('bg-slate-50/80', 'bg-slate-50/80 dark:bg-slate-800/50'),

    # Section cards (gateway + activity)
    ('className="bg-white rounded-2xl p-5 shadow-sm">\n                  <p', 'className="bg-white dark:bg-[var(--surface-2)] rounded-2xl p-5 shadow-sm dark:shadow-none">\n                  <p'),

    # "Ver todos" / "Ver todas" links
    ("className=\"text-xs text-brand-primary-text font-semibold", "className=\"text-xs text-emerald-600 dark:text-emerald-400 font-semibold"),

    # Recent users card
    ('className="bg-white rounded-2xl shadow-sm overflow-hidden">\n                <div className="px-5 py-4 flex items-center justify-between border-b border-slate-50">',
     'className="bg-white dark:bg-[var(--surface-2)] rounded-2xl shadow-sm dark:shadow-none overflow-hidden">\n                <div className="px-5 py-4 flex items-center justify-between border-b border-slate-50 dark:border-slate-800">'),

    # User rows
    ('className="px-4 py-3 flex items-center gap-3 active:bg-slate-50', 'className="px-4 py-3 flex items-center gap-3 active:bg-slate-50 dark:active:bg-slate-800/60'),
    ('className="divide-y divide-slate-50">', 'className="divide-y divide-slate-50 dark:divide-slate-800">'),

    # Avatar placeholder
    ('bg-brand-primary-bg-light flex items-center justify-center text-brand-primary-text font-bold',
     'bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold'),

    # Empty state
    ('className="h-10 w-10 mx-auto mb-3 text-slate-200"', 'className="h-10 w-10 mx-auto mb-3 text-slate-200 dark:text-slate-700"'),

    # Refresh button
    ('bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-brand-primary-text',
     'bg-white dark:bg-[var(--surface-2)] shadow-sm dark:shadow-none flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400'),
]

for old, new in replacements:
    content = content.replace(old, new)

# ============================================================
# 14. GLOBAL CARD REPLACEMENT (catch remaining bg-white cards)
# ============================================================
# Replace remaining standalone bg-white cards that weren't caught
content = re.sub(
    r'className="bg-white rounded-2xl shadow-sm(?! dark:)',
    r'className="bg-white dark:bg-[var(--surface-2)] rounded-2xl shadow-sm dark:shadow-none',
    content
)

# Replace remaining bg-white rounded-2xl p-5
content = re.sub(
    r'className="bg-white rounded-2xl p-5 shadow-sm(?! dark:)',
    r'className="bg-white dark:bg-[var(--surface-2)] rounded-2xl p-5 shadow-sm dark:shadow-none',
    content
)

# ============================================================
# 15. FIX remaining text-brand-primary-text in dark contexts
# ============================================================
# In card headers, "Ver todos" type links
content = content.replace(
    'text-brand-primary-text font-semibold',
    'text-emerald-600 dark:text-emerald-400 font-semibold'
)

# ============================================================
# 16. FIX remaining pastel bgs that weren't caught
# ============================================================
content = content.replace('bg-brand-primary-bg-light', 'bg-emerald-50 dark:bg-emerald-900/30')

# ============================================================
# 17. FIX search input dark mode
# ============================================================
content = content.replace(
    'bg-white/95 backdrop-blur-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)]',
    'bg-white/95 dark:bg-[var(--surface-2)]/95 backdrop-blur-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-none'
)

# ============================================================
# 18. FIX modal/overlay dark mode
# ============================================================
content = content.replace('bg-black/40 backdrop-blur-sm', 'bg-black/40 dark:bg-black/60 backdrop-blur-sm')
content = content.replace('bg-white rounded-t-3xl', 'bg-white dark:bg-[var(--surface-1)] rounded-t-3xl')
content = content.replace('bg-white rounded-3xl', 'bg-white dark:bg-[var(--surface-2)] rounded-3xl')

# ============================================================
# 19. FIX border-slate-200 (inputs etc)
# ============================================================
content = content.replace('border-slate-200', 'border-slate-200 dark:border-slate-700')
content = content.replace('border-slate-100 rounded', 'border-slate-100 dark:border-slate-800 rounded')

# ============================================================
# 20. FIX select/input bg
# ============================================================
content = content.replace(
    'bg-white border border-slate-200 rounded-xl',
    'bg-white dark:bg-[var(--surface-2)] border border-slate-200 dark:border-slate-700 rounded-xl'
)

# ============================================================
# WRITE BACK
# ============================================================
with open(FILE, 'w') as f:
    f.write(content)

print("Done! Admin panel: dark mode + desktop sidebar + theme toggle applied.")
print(f"File size: {len(content)} chars")