# Academia El Profe Oficial

Plataforma educativa SaaS de refuerzo académico para estudiantes de ingeniería, liderada por el **Prof. Kall Bruno Díaz**. Diseñada para estudiantes de la **Universidad Tecnológica del Perú (UTP)**.

## Stack Tecnológico

| Tecnología | Versión | Propósito |
|---|---|---|
| Next.js | 15 (App Router) | Framework React con SSR/SSG y rutas SEO |
| TypeScript | 5 (Strict) | Tipado estático, cero `any` permitido |
| Tailwind CSS | 4 | Estilos utility-first, responsive mobile-first |
| shadcn/ui | New York | Componentes UI accesibles y personalizables |
| Lucide React | — | Iconografía consistente |
| next-themes | 0.4.x | Soporte claro/oscuro con persistencia |
| Prisma | 6.x | ORM para base de datos SQLite |

## Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js 15
│   ├── layout.tsx          # Layout raíz con SEO global
│   ├── page.tsx            # Inicio (/)
│   ├── cursos/
│   │   ├── page.tsx        # Catálogo (/cursos)
│   │   └── [slug]/page.tsx # Detalle (/cursos/calculo-1)
│   ├── certificados/       # /certificados
│   ├── soporte/            # /soporte
│   ├── nosotros/           # /nosotros
│   └── admin/              # /admin (no-index)
├── components/
│   ├── layout/             # Header, Sidebar, MobileNav, Footer
│   ├── course/             # CourseCard
│   ├── theme/              # ThemeProvider, ThemeToggle
│   ├── security/           # AntiPiracyShell
│   └── ui/                 # shadcn/ui (50+ componentes)
├── types/                  # Interfaces TypeScript estrictas
├── lib/                    # Utilidades y datos mock
└── hooks/                  # Custom hooks React
```

## Despliegue

El proyecto se despliega automáticamente en **Vercel** al hacer push a la rama `main`.

## Fases de Desarrollo

- [x] **Fase 1** — Fundación, layout dual, temas, anti-piratería, rutas SEO
- [ ] **Fase 2** — Búsqueda funcional, filtros, modal de temario, overlay de compra
- [ ] **Fase 3** — Reproductor de video, lecciones, comentarios en tiempo real
- [ ] **Fase 4** — Panel admin CRUD, gestión de estudiantes, métricas de ingresos
- [ ] **Fase 5** — Animaciones, accesibilidad, estados de carga, dark mode polish

## Licencia

Privado — Academia El Profe Oficial © 2026