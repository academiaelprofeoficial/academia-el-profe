import re

def refactor_admin_page(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Dark Mode Color Replacements
    replacements = [
        ('bg-[#f8fafb]', 'bg-[#0B1120]'),
        ('bg-white/95', 'bg-[#111827]/95'),
        ('bg-white', 'bg-[#111827]'),
        ('text-brand-heading-secondary', 'text-slate-300'),
        ('text-brand-heading', 'text-white'),
        ('bg-slate-50', 'bg-slate-800/50'),
        ('border-slate-100', 'border-slate-800'),
        ('bg-slate-100', 'bg-slate-800'),
        ('border-slate-200', 'border-slate-700'),
        ('bg-slate-200/70', 'bg-slate-800/70'),
        ('text-slate-600', 'text-slate-300'),
        ('text-slate-500', 'text-slate-400'),
        ('text-slate-700', 'text-slate-200'),
        ('ring-slate-100', 'ring-slate-800'),
        ('bg-amber-50', 'bg-amber-900/20'),
        ('border-amber-100', 'border-amber-900/50'),
        ('text-amber-700', 'text-amber-400'),
        ('bg-blue-50', 'bg-blue-900/20'),
        ('bg-purple-50', 'bg-purple-900/20'),
        ('bg-orange-50', 'bg-orange-900/20'),
        ('text-blue-700', 'text-blue-400'),
        ('text-purple-700', 'text-purple-400'),
        ('shadow-[0_1px_3px_rgba(0,0,0,0.04)]', 'border-b border-slate-800'),
        ('bg-red-50', 'bg-red-900/20'),
        ('text-red-700', 'text-red-400'),
        ('bg-slate-200', 'bg-slate-700'),
    ]

    for old, new in replacements:
        content = content.replace(old, new)

    # 2. Structure modifications
    # Find the main return block
    #   return (
    #     <div className="min-h-screen bg-[#0B1120] flex flex-col">
    #       {/* ===== HEADER ===== */}
    
    old_layout_start = '''  return (
    <div className="min-h-screen bg-[#0B1120] flex flex-col">
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-40 bg-[#111827]/95 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-brand-primary-bg-light flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-brand-primary-text" />
            </div>
            <h1 className="text-base font-bold text-white tracking-tight">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-2">
            {user?.photoURL && (
              <img src={user.photoURL} alt="" className="h-8 w-8 rounded-full ring-2 ring-slate-800" />
            )}
            <button
              onClick={() => router.push('/dashboard/cursos')}
              className="hidden lg:inline-flex text-sm text-slate-400 hover:text-slate-300 font-medium px-3 py-2 rounded-xl hover:bg-slate-800/50 active:scale-95 transition-all duration-150"
            >
              Dashboard
            </button>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 font-medium px-3 py-2 rounded-xl hover:bg-red-900/20 active:scale-95 transition-all duration-150"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden lg:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 lg:px-8 py-5 pb-24 lg:pb-8">'''

    new_layout_start = '''  return (
    <div className="min-h-screen bg-[#0B1120] flex flex-col lg:flex-row">
      {/* Sidebar for PC */}
      <aside className="hidden lg:flex w-[260px] bg-[#111827] border-r border-slate-800 flex-col h-screen sticky top-0 shrink-0">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
          <div className="h-8 w-8 rounded-xl bg-brand-primary/10 flex items-center justify-center">
            <BarChart3 className="h-4 w-4 text-brand-primary" />
          </div>
          <h1 className="text-base font-bold text-white tracking-tight">Admin Panel</h1>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2">
          <button onClick={() => setActiveTab('resumen')} className={lex items-center gap-3 px-4 py-3 rounded-xl transition-all }>
            <BarChart3 className="h-5 w-5" />
            <span>Resumen</span>
          </button>
          <button onClick={() => setActiveTab('usuarios')} className={lex items-center gap-3 px-4 py-3 rounded-xl transition-all }>
            <Users className="h-5 w-5" />
            <span>Usuarios</span>
          </button>
          <button onClick={() => setActiveTab('compras')} className={lex items-center gap-3 px-4 py-3 rounded-xl transition-all }>
            <ShoppingCart className="h-5 w-5" />
            <span>Compras</span>
          </button>
          <button onClick={() => setActiveTab('soporte')} className={lex items-center gap-3 px-4 py-3 rounded-xl transition-all }>
            <MessageSquare className="h-5 w-5" />
            <span>Soporte</span>
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button onClick={() => router.push('/dashboard/cursos')} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all font-medium">
            <LogOut className="h-5 w-5 rotate-180" />
            <span>Volver a App</span>
          </button>
          <button onClick={signOut} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-all font-medium">
            <LogOut className="h-5 w-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header (Hidden on PC) */}
        <header className="lg:hidden sticky top-0 z-40 bg-[#111827]/95 backdrop-blur-xl border-b border-slate-800">
          <div className="max-w-[1400px] mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-brand-primary" />
              </div>
              <h1 className="text-base font-bold text-white tracking-tight">Admin</h1>
            </div>
            <div className="flex items-center gap-2">
              {user?.photoURL && (
                <img src={user.photoURL} alt="" className="h-8 w-8 rounded-full ring-2 ring-slate-800" />
              )}
            </div>
          </div>
        </header>

        {/* ===== MAIN CONTENT ===== */}
        <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 lg:px-8 py-5 pb-24 lg:pb-8">'''

    content = content.replace(old_layout_start, new_layout_start)

    # Wrap the bottom nav
    # <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    # </div>
    # );
    
    old_bottom = '''<BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>'''
    
    new_bottom = '''<div className="lg:hidden">
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      </div>
    </div>'''
    
    content = content.replace(old_bottom, new_bottom)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

refactor_admin_page('src/app/admin/page.tsx')
print("Admin page layout and colors updated!")
