// ============================================================
// Datos de referencia — Academia El Profe Oficial
// Datos mock para el catálogo de cursos y configuración.
// ============================================================

import type { CourseCategory, SidebarNavItem, Course, CourseLanding, MateriaBadge, Universidad } from '@/types';

/** Categorías de cursos con colores institucionales */
export const CATEGORIAS: readonly CourseCategory[] = [
  {
    slug: 'calculo-diferencial',
    nombre: 'Cálculo Diferencial',
    color: 'bg-emerald-600',
    colorHover: 'hover:bg-emerald-700',
    icono: 'FunctionSquare',
  },
  {
    slug: 'calculo-integral',
    nombre: 'Cálculo Integral',
    color: 'bg-blue-600',
    colorHover: 'hover:bg-blue-700',
    icono: 'Sigma',
  },
  {
    slug: 'ecuaciones-diferenciales',
    nombre: 'Ecuaciones Diferenciales',
    color: 'bg-orange-500',
    colorHover: 'hover:bg-orange-600',
    icono: 'TrendingUp',
  },
  {
    slug: 'calculo-vectorial',
    nombre: 'Cálculo Vectorial',
    color: 'bg-purple-600',
    colorHover: 'hover:bg-purple-700',
    icono: 'MoveUpRight',
  },
  {
    slug: 'fisica-1',
    nombre: 'Física 1',
    color: 'bg-teal-600',
    colorHover: 'hover:bg-teal-700',
    icono: 'Atom',
  },
  {
    slug: 'fisica-2',
    nombre: 'Física 2',
    color: 'bg-red-600',
    colorHover: 'hover:bg-red-700',
    icono: 'Magnet',
  },
  {
    slug: 'estatica',
    nombre: 'Estática',
    color: 'bg-sky-600',
    colorHover: 'hover:bg-sky-700',
    icono: 'Triangle',
  },
] as const;

/** Items de navegación del sidebar */
export const SIDEBAR_NAV: readonly SidebarNavItem[] = [
  { etiqueta: 'Volver al inicio', href: '/', icono: 'Home' },
  { etiqueta: 'Mis cursos', href: '/dashboard/cursos', icono: 'BookOpen' },
  { etiqueta: 'Mis certificados', href: '/dashboard/certificados', icono: 'Award' },
  { etiqueta: 'Lista de deseos', href: '/dashboard/deseos', icono: 'Heart' },
  { etiqueta: 'Historial de clases', href: '/dashboard/historial', icono: 'Clock' },
] as const;

/** Cursos mock del catálogo — Slugs alineados con CURSOS_LANDING */
export const CURSOS_MOCK: readonly Course[] = [
  {
    id: '1',
    slug: 'calculo-diferencial',
    titulo: 'CÁLCULO DIFERENCIAL',
    subtitulo: 'Funciones, límites, derivadas y aplicaciones',
    descripcion: 'Domina los fundamentos del cálculo diferencial con enfoque en problemas de ingeniería. Este curso abarca funciones reales, límites, continuidad, derivadas y sus aplicaciones en optimización y tasas de cambio.',
    precio: 100,
    precioUSD: 30,
    categoria: CATEGORIAS[0],
    tieneClasesGrabadas: true,
    tieneMaterialPDF: true,
    estaBloqueado: true,
    numeroLecciones: 14,
    numeroHoras: 12,
    calificacion: 4.8,
    numeroEstudiantes: 1247,
    imagenUrl: '/placeholder-course.svg',
    createdAt: '2026-01-15T00:00:00Z',
    temario: [
      { id: 't1-1', numero: 1, titulo: 'Límites por definición', duracion: '45 min', esGratuito: true },
      { id: 't1-2', numero: 2, titulo: 'Límites algebraicos', duracion: '38 min', esGratuito: true },
      { id: 't1-3', numero: 3, titulo: 'Límites trigonométricos', duracion: '42 min', esGratuito: false },
      { id: 't1-4', numero: 4, titulo: 'Límites al infinito', duracion: '35 min', esGratuito: false },
      { id: 't1-5', numero: 5, titulo: 'Continuidad de funciones', duracion: '37 min', esGratuito: false },
      { id: 't1-6', numero: 6, titulo: 'Derivadas por definición', duracion: '44 min', esGratuito: false },
      { id: 't1-7', numero: 7, titulo: 'Regla de derivadas', duracion: '50 min', esGratuito: false },
      { id: 't1-8', numero: 8, titulo: 'Aplicación: recta tangente', duracion: '36 min', esGratuito: false },
      { id: 't1-9', numero: 9, titulo: 'Aplicación: máximos y mínimos', duracion: '47 min', esGratuito: false },
      { id: 't1-10', numero: 10, titulo: 'Regla de L\'Hôpital', duracion: '43 min', esGratuito: false },
      { id: 't1-11', numero: 11, titulo: 'Límites exponenciales y logarítmicos', duracion: '40 min', esGratuito: false },
      { id: 't1-12', numero: 12, titulo: 'Derivación implícita', duracion: '39 min', esGratuito: false },
      { id: 't1-13', numero: 13, titulo: 'Derivadas de orden superior', duracion: '35 min', esGratuito: false },
      { id: 't1-14', numero: 14, titulo: 'Aplicación a la economía', duracion: '41 min', esGratuito: false },
    ],
  },
  {
    id: '2',
    slug: 'calculo-integral',
    titulo: 'CÁLCULO INTEGRAL',
    subtitulo: 'Integrales, técnicas de integración y aplicaciones',
    descripcion: 'Profundiza en el cálculo integral con técnicas avanzadas de integración, aplicaciones geométricas y físicas de las integrales, y una introducción a las series infinitas.',
    precio: 150,
    precioUSD: 42,
    categoria: CATEGORIAS[1],
    tieneClasesGrabadas: true,
    tieneMaterialPDF: true,
    estaBloqueado: true,
    numeroLecciones: 19,
    numeroHoras: 18,
    calificacion: 4.9,
    numeroEstudiantes: 983,
    imagenUrl: '/placeholder-course.svg',
    createdAt: '2026-02-01T00:00:00Z',
    temario: [
      { id: 't2-1', numero: 1, titulo: 'Integral indefinida', duracion: '50 min', esGratuito: true },
      { id: 't2-2', numero: 2, titulo: 'Métodos de integración', duracion: '55 min', esGratuito: true },
      { id: 't2-3', numero: 3, titulo: 'Integración por partes', duracion: '45 min', esGratuito: false },
      { id: 't2-4', numero: 4, titulo: 'Integrales definidas', duracion: '60 min', esGratuito: false },
      { id: 't2-5', numero: 5, titulo: 'Aplicaciones geométricas', duracion: '50 min', esGratuito: false },
      { id: 't2-6', numero: 6, titulo: 'Aplicaciones físicas', duracion: '48 min', esGratuito: false },
      { id: 't2-7', numero: 7, titulo: 'Integrales impropias', duracion: '42 min', esGratuito: false },
      { id: 't2-8', numero: 8, titulo: 'Sustitución trigonométrica', duracion: '55 min', esGratuito: false },
      { id: 't2-9', numero: 9, titulo: 'Fracciones parciales', duracion: '50 min', esGratuito: false },
      { id: 't2-10', numero: 10, titulo: 'Series infinitas', duracion: '45 min', esGratuito: false },
    ],
  },
  {
    id: '3',
    slug: 'ecuaciones-diferenciales',
    titulo: 'ECUACIONES DIFERENCIALES',
    subtitulo: 'Ecuaciones diferenciales ordinarias y aplicaciones',
    descripcion: 'Curso avanzado para estudiantes que desean dominar ecuaciones diferenciales ordinarias y parciales, funciones de variable compleja, y transformadas integrales aplicadas a la ingeniería.',
    precio: 150,
    precioUSD: 42,
    categoria: CATEGORIAS[2],
    tieneClasesGrabadas: true,
    tieneMaterialPDF: true,
    estaBloqueado: true,
    numeroLecciones: 20,
    numeroHoras: 20,
    calificacion: 4.9,
    numeroEstudiantes: 542,
    imagenUrl: '/placeholder-course.svg',
    createdAt: '2026-03-01T00:00:00Z',
    temario: [
      { id: 't3-1', numero: 1, titulo: 'Ecuaciones de primer orden', duracion: '55 min', esGratuito: true },
      { id: 't3-2', numero: 2, titulo: 'Ecuaciones separables', duracion: '50 min', esGratuito: true },
      { id: 't3-3', numero: 3, titulo: 'Ecuaciones lineales', duracion: '60 min', esGratuito: false },
      { id: 't3-4', numero: 4, titulo: 'Transformada de Laplace', duracion: '50 min', esGratuito: false },
      { id: 't3-5', numero: 5, titulo: 'Ecuaciones de segundo orden', duracion: '55 min', esGratuito: false },
    ],
  },
  {
    id: '4',
    slug: 'calculo-vectorial',
    titulo: 'CÁLCULO VECTORIAL',
    subtitulo: 'Vectores, campos vectoriales y teoremas integrales',
    descripcion: 'Domina el cálculo vectorial: operadores diferenciales, integrales de línea y superficie, y los teoremas fundamentales de Green, Stokes y Gauss.',
    precio: 150,
    precioUSD: 42,
    categoria: CATEGORIAS[3],
    tieneClasesGrabadas: true,
    tieneMaterialPDF: true,
    estaBloqueado: true,
    numeroLecciones: 18,
    numeroHoras: 16,
    calificacion: 4.8,
    numeroEstudiantes: 634,
    imagenUrl: '/placeholder-course.svg',
    createdAt: '2026-03-15T00:00:00Z',
    temario: [
      { id: 't4-1', numero: 1, titulo: 'Vectores en R3', duracion: '45 min', esGratuito: true },
      { id: 't4-2', numero: 2, titulo: 'Producto escalar y vectorial', duracion: '50 min', esGratuito: true },
      { id: 't4-3', numero: 3, titulo: 'Derivadas parciales', duracion: '55 min', esGratuito: false },
      { id: 't4-4', numero: 4, titulo: 'Integrales múltiples', duracion: '60 min', esGratuito: false },
      { id: 't4-5', numero: 5, titulo: 'Teorema de Stokes', duracion: '45 min', esGratuito: false },
    ],
  },
  {
    id: '5',
    slug: 'fisica-1',
    titulo: 'FÍSICA 1',
    subtitulo: 'Cinemática, dinámica y leyes de Newton',
    descripcion: 'Comprende los principios fundamentales de la mecánica newtoniana. Desde la cinemática del movimiento rectilíneo hasta la dinámica de sistemas de partículas y cuerpos rígidos.',
    precio: 120,
    precioUSD: 35,
    categoria: CATEGORIAS[4],
    tieneClasesGrabadas: true,
    tieneMaterialPDF: true,
    estaBloqueado: true,
    numeroLecciones: 18,
    numeroHoras: 15,
    calificacion: 4.8,
    numeroEstudiantes: 1105,
    imagenUrl: '/placeholder-course.svg',
    createdAt: '2026-03-15T00:00:00Z',
    temario: [
      { id: 't5-1', numero: 1, titulo: 'Vectores y cinemática', duracion: '45 min', esGratuito: true },
      { id: 't5-2', numero: 2, titulo: 'Leyes de Newton', duracion: '50 min', esGratuito: true },
      { id: 't5-3', numero: 3, titulo: 'Trabajo y energía', duracion: '55 min', esGratuito: false },
      { id: 't5-4', numero: 4, titulo: 'Cantidad de movimiento', duracion: '40 min', esGratuito: false },
      { id: 't5-5', numero: 5, titulo: 'Rotación de cuerpos rígidos', duracion: '60 min', esGratuito: false },
    ],
  },
  {
    id: '6',
    slug: 'fisica-2',
    titulo: 'FÍSICA 2',
    subtitulo: 'Electromagnetismo, ondas y óptica',
    descripcion: 'Estudia los principios del electromagnetismo, ondas mecánicas y electromagnéticas, y óptica geométrica y física con aplicaciones en ingeniería.',
    precio: 120,
    precioUSD: 35,
    categoria: CATEGORIAS[5],
    tieneClasesGrabadas: true,
    tieneMaterialPDF: true,
    estaBloqueado: true,
    numeroLecciones: 18,
    numeroHoras: 15,
    calificacion: 4.7,
    numeroEstudiantes: 689,
    imagenUrl: '/placeholder-course.svg',
    createdAt: '2026-04-01T00:00:00Z',
    temario: [
      { id: 't6-1', numero: 1, titulo: 'Campos eléctricos', duracion: '45 min', esGratuito: true },
      { id: 't6-2', numero: 2, titulo: 'Ley de Gauss', duracion: '50 min', esGratuito: true },
      { id: 't6-3', numero: 3, titulo: 'Potencial eléctrico', duracion: '55 min', esGratuito: false },
      { id: 't6-4', numero: 4, titulo: 'Circuitos y corriente', duracion: '50 min', esGratuito: false },
      { id: 't6-5', numero: 5, titulo: 'Ondas y sonido', duracion: '45 min', esGratuito: false },
    ],
  },
  {
    id: '7',
    slug: 'estatica',
    titulo: 'ESTÁTICA',
    subtitulo: 'Equilibrio de fuerzas y estructuras',
    descripcion: 'Aprende los principios de la estática: sistemas de fuerzas, equilibrio, centroides, momentos de inercia y análisis de estructuras.',
    precio: 120,
    precioUSD: 35,
    categoria: CATEGORIAS[6],
    tieneClasesGrabadas: true,
    tieneMaterialPDF: true,
    estaBloqueado: true,
    numeroLecciones: 15,
    numeroHoras: 12,
    calificacion: 4.8,
    numeroEstudiantes: 478,
    imagenUrl: '/placeholder-course.svg',
    createdAt: '2026-04-15T00:00:00Z',
    temario: [
      { id: 't7-1', numero: 1, titulo: 'Sistemas de fuerzas', duracion: '40 min', esGratuito: true },
      { id: 't7-2', numero: 2, titulo: 'Equilibrio de partículas', duracion: '45 min', esGratuito: true },
      { id: 't7-3', numero: 3, titulo: 'Fuerzas distribuidas', duracion: '50 min', esGratuito: false },
      { id: 't7-4', numero: 4, titulo: 'Análisis de estructuras', duracion: '55 min', esGratuito: false },
      { id: 't7-5', numero: 5, titulo: 'Momentos de inercia', duracion: '45 min', esGratuito: false },
    ],
  },
] as const;

// ============================================================
// Datos Landing (diseño nuevo) — Academia El Profe Oficial
// ============================================================

/** Materias para badges del hero */
export const MATERIAS: readonly MateriaBadge[] = [
  { nombre: 'Matemática' },
  { nombre: 'Cálculo' },
  { nombre: 'Física' },
  { nombre: 'Estática' },
  { nombre: 'Termodinámica' },
  { nombre: 'Química' },
  { nombre: 'Estadística' },
] as const;

/** Universidades aliadas */
export const UNIVERSIDADES: readonly Universidad[] = [
  { nombre: 'Universidad Nacional Mayor de San Marcos', abreviatura: 'UNMSM' },
  { nombre: 'Universidad Nacional de Ingeniería', abreviatura: 'UNI' },
  { nombre: 'Universidad de Lima', abreviatura: 'U. Lima' },
  { nombre: 'Universidad Tecnológica del Perú', abreviatura: 'UTP' },
  { nombre: 'Universidad Continental', abreviatura: 'U. Continental' },
  { nombre: 'Universidad Peruana de Ciencias Aplicadas', abreviatura: 'UPC' },
] as const;

/** Cursos para la landing page (catálogo nuevo) */
export const CURSOS_LANDING: readonly CourseLanding[] = [
  { id: 'calculo-diferencial', title: 'CÁLCULO DIFERENCIAL', desc: 'Funciones, límites, derivadas y aplicaciones.', formula: 'f(x)', formulaIcon: 'FunctionSquare', modules: 14, price: 100, priceUSD: 30, colorKey: 'emerald' },
  { id: 'calculo-integral', title: 'CÁLCULO INTEGRAL', desc: 'Integrales, técnicas de integración y aplicaciones.', formula: '∫dx', formulaIcon: 'Sigma', modules: 19, price: 150, priceUSD: 42, colorKey: 'blue' },
  { id: 'ecuaciones-diferenciales', title: 'ECUACIONES DIFERENCIALES', desc: 'Ecuaciones diferenciales ordinarias y aplicaciones.', formula: 'd²y/dx²', formulaIcon: 'TrendingUp', modules: 20, price: 150, priceUSD: 42, colorKey: 'orange' },
  { id: 'calculo-vectorial', title: 'CÁLCULO VECTORIAL', desc: 'Vectores, campos vectoriales y teoremas integrales.', formula: 'F', formulaIcon: 'MoveUpRight', modules: 18, price: 150, priceUSD: 42, colorKey: 'purple' },
  { id: 'fisica-1', title: 'FÍSICA 1', desc: 'Cinemática, dinámica y leyes de Newton.', formula: '', formulaIcon: 'Atom', modules: 18, price: 120, priceUSD: 35, colorKey: 'teal' },
  { id: 'fisica-2', title: 'FÍSICA 2', desc: 'Electromagnetismo, ondas y óptica.', formula: '', formulaIcon: 'Magnet', modules: 18, price: 120, priceUSD: 35, colorKey: 'red' },
  { id: 'estatica', title: 'ESTÁTICA', desc: 'Equilibrio de fuerzas y estructuras.', formula: '', formulaIcon: 'Triangle', modules: 15, price: 120, priceUSD: 35, colorKey: 'sky' },
] as const;

/** Mapa de colores para cursos landing */
export const COLOR_MAP: Record<string, { bg: string; text: string; hover: string; light: string; badge: string }> = {
  emerald: { bg: 'bg-emerald-500', text: 'text-emerald-600', hover: 'hover:bg-emerald-600', light: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700' },
  blue: { bg: 'bg-blue-500', text: 'text-blue-600', hover: 'hover:bg-blue-600', light: 'bg-blue-50', badge: 'bg-blue-100 text-blue-700' },
  orange: { bg: 'bg-orange-500', text: 'text-orange-600', hover: 'hover:bg-orange-600', light: 'bg-orange-50', badge: 'bg-orange-100 text-orange-700' },
  purple: { bg: 'bg-purple-500', text: 'text-purple-600', hover: 'hover:bg-purple-600', light: 'bg-purple-50', badge: 'bg-purple-100 text-purple-700' },
  teal: { bg: 'bg-teal-500', text: 'text-teal-600', hover: 'hover:bg-teal-600', light: 'bg-teal-50', badge: 'bg-teal-100 text-teal-700' },
  red: { bg: 'bg-red-500', text: 'text-red-600', hover: 'hover:bg-red-600', light: 'bg-red-50', badge: 'bg-red-100 text-red-700' },
  sky: { bg: 'bg-sky-500', text: 'text-sky-600', hover: 'hover:bg-sky-600', light: 'bg-sky-50', badge: 'bg-sky-100 text-sky-700' },
};

// ============================================================
// Temas del Temario (Cálculo Diferencial — 14 Temas)
// ============================================================

export interface ModuloTemario {
  readonly numero: number;
  readonly titulo: string;
  readonly duracion: string;
  readonly recursos: number;
}

export const MODULOS_CALCULO_DIFERENCIAL: readonly ModuloTemario[] = [
  { numero: 1, titulo: 'Límites por definición', duracion: '45:12', recursos: 2 },
  { numero: 2, titulo: 'Límites algebraicos', duracion: '38:45', recursos: 2 },
  { numero: 3, titulo: 'Límites trigonométricos', duracion: '42:30', recursos: 2 },
  { numero: 4, titulo: 'Límites al infinito', duracion: '35:20', recursos: 2 },
  { numero: 5, titulo: 'Límites exponenciales-logarítmicos', duracion: '40:15', recursos: 2 },
  { numero: 6, titulo: 'Límites laterales y continuidad', duracion: '37:50', recursos: 2 },
  { numero: 7, titulo: 'Criterio de continuidad', duracion: '33:10', recursos: 2 },
  { numero: 8, titulo: 'Derivadas por definición', duracion: '44:25', recursos: 2 },
  { numero: 9, titulo: 'Regla de derivadas', duracion: '50:00', recursos: 2 },
  { numero: 10, titulo: 'Aplicación a la recta tangente', duracion: '36:40', recursos: 2 },
  { numero: 11, titulo: 'Aplicación a la economía', duracion: '41:15', recursos: 2 },
  { numero: 12, titulo: 'Aplicación máximos y mínimos', duracion: '47:30', recursos: 2 },
  { numero: 13, titulo: 'Regla de cambio variable-constante', duracion: '39:55', recursos: 2 },
  { numero: 14, titulo: "Regla de L'Hôpital", duracion: '43:20', recursos: 2 },
] as const;

export const COMENTARIOS_MOCK: readonly ComentarioMock[] = [
  { id: 'c1', autor: 'Juan Pérez', tiempo: 'Hace 2 horas', texto: 'Profe, en el ejemplo 3 de la página 12, ¿por qué se toma ese valor de 6?', likes: 5 },
  { id: 'c2', autor: 'María López', tiempo: 'Hace 5 horas', texto: 'Excelente explicación, ahora sí entendí el concepto. ¡Gracias profe!', likes: 8 },
  { id: 'c3', autor: 'Carlos Ramírez', tiempo: 'Hace 1 día', texto: '¿Podría subir un ejercicio adicional similar para practicar?', likes: 3 },
] as const;

export interface ComentarioMock {
  readonly id: string;
  readonly autor: string;
  readonly tiempo: string;
  readonly texto: string;
  readonly likes: number;
}

// ============================================================
// Sistema de Evaluaciones UTP — PC1, PC2, PC3, Portafolio
// Estructura por prácticas calificadas de la UTP.
// ============================================================

export interface UTPTema {
  readonly numero: number;
  readonly titulo: string;
  readonly duracion: string;
  readonly completado?: boolean;
}

export interface UTPEvaluacion {
  readonly id: string;
  readonly label: string;
  readonly fullLabel: string;
  readonly colorHex: string;
  readonly bgTw: string;
  readonly textTw: string;
  readonly borderTw: string;
  readonly bgLightTw: string;
  readonly badgeTw: string;
  readonly temasCount: number;
  readonly temas: readonly UTPTema[];
}

/** Datos UTP para Cálculo 2 (y cualquier curso con estructura PC) */
export const UTP_EVALUACIONES: readonly UTPEvaluacion[] = [
  {
    id: 'pc1',
    label: 'PC1',
    fullLabel: 'PC1 (4 temas)',
    colorHex: '#10B981',
    bgTw: 'bg-emerald-500',
    textTw: 'text-emerald-700',
    borderTw: 'border-emerald-500',
    bgLightTw: 'bg-emerald-50',
    badgeTw: 'bg-emerald-100 text-emerald-700',
    temasCount: 4,
    temas: [
      { numero: 1, titulo: 'Integrales impropias', duracion: '45:12', completado: true },
      { numero: 2, titulo: 'Función Gamma', duracion: '38:45' },
      { numero: 3, titulo: 'Función Beta', duracion: '42:30' },
      { numero: 4, titulo: 'Coordenadas polares', duracion: '35:20' },
    ],
  },
  {
    id: 'pc2',
    label: 'PC2',
    fullLabel: 'PC2 (4 temas)',
    colorHex: '#3B82F6',
    bgTw: 'bg-blue-500',
    textTw: 'text-blue-700',
    borderTw: 'border-blue-500',
    bgLightTw: 'bg-blue-50',
    badgeTw: 'bg-blue-100 text-blue-700',
    temasCount: 4,
    temas: [
      { numero: 1, titulo: 'Integrales trigonométricas', duracion: '40:15' },
      { numero: 2, titulo: 'Sustitución trigonométrica', duracion: '37:50' },
      { numero: 3, titulo: 'Fracciones parciales', duracion: '33:10' },
      { numero: 4, titulo: 'Integración por partes', duracion: '44:25' },
    ],
  },
  {
    id: 'pc3',
    label: 'PC3',
    fullLabel: 'PC3 (4 temas)',
    colorHex: '#8B5CF6',
    bgTw: 'bg-purple-500',
    textTw: 'text-purple-700',
    borderTw: 'border-purple-500',
    bgLightTw: 'bg-purple-50',
    badgeTw: 'bg-purple-100 text-purple-700',
    temasCount: 4,
    temas: [
      { numero: 1, titulo: 'Sucesiones y series', duracion: '41:20' },
      { numero: 2, titulo: 'Criterios de convergencia', duracion: '45:00' },
      { numero: 3, titulo: 'Series de potencias', duracion: '38:30' },
      { numero: 4, titulo: 'Series de Taylor y Maclaurin', duracion: '50:10' },
    ],
  },
  {
    id: 'portafolio',
    label: 'PORTAFOLIO',
    fullLabel: 'Portafolio (Evaluación final)',
    colorHex: '#F97316',
    bgTw: 'bg-orange-500',
    textTw: 'text-orange-700',
    borderTw: 'border-orange-500',
    bgLightTw: 'bg-orange-50',
    badgeTw: 'bg-orange-100 text-orange-700',
    temasCount: 2,
    temas: [
      { numero: 1, titulo: 'Portafolio - Parte 1', duracion: '60:00' },
      { numero: 2, titulo: 'Portafolio - Parte 2', duracion: '55:00' },
    ],
  },
] as const;

export const DASHBOARD_COURSES: readonly DashboardCourse[] = [
  { id: 'calculo-diferencial', title: 'CÁLCULO DIFERENCIAL', desc: 'Funciones, límites, derivadas y aplicaciones.', formula: 'f(x)', color: 'bg-emerald-600', price: 100, priceUSD: 30 },
  { id: 'calculo-integral', title: 'CÁLCULO INTEGRAL', desc: 'Integrales, técnicas de integración y aplicaciones.', formula: '∫dx', color: 'bg-blue-600', price: 150, priceUSD: 42 },
  { id: 'ecuaciones-diferenciales', title: 'ECUACIONES DIFERENCIALES', desc: 'Ecuaciones diferenciales ordinarias y aplicaciones.', formula: "d²y/dx²", color: 'bg-orange-500', price: 150, priceUSD: 42 },
  { id: 'calculo-vectorial', title: 'CÁLCULO VECTORIAL', desc: 'Vectores, campos vectoriales y teoremas integrales.', formula: 'F', color: 'bg-purple-600', price: 150, priceUSD: 42 },
  { id: 'fisica-1', title: 'FÍSICA 1', desc: 'Cinemática, dinámica y leyes de Newton.', formula: '⚛', color: 'bg-teal-600', price: 120, priceUSD: 35 },
  { id: 'fisica-2', title: 'FÍSICA 2', desc: 'Electromagnetismo, ondas y óptica.', formula: '∿', color: 'bg-red-600', price: 120, priceUSD: 35 },
  { id: 'estatica', title: 'ESTÁTICA', desc: 'Equilibrio de fuerzas y análisis de estructuras.', formula: '△', color: 'bg-sky-600', price: 120, priceUSD: 35 },
] as const;

export interface DashboardCourse {
  readonly id: string;
  readonly title: string;
  readonly desc: string;
  readonly formula: string;
  readonly color: string;
  readonly price: number;
  readonly priceUSD: number;
}

// ============================================================
// Certificados del usuario
// ============================================================

export interface CertificadoUsuario {
  readonly id: string;
  readonly cursoNombre: string;
  readonly fechaEmision: string;
  readonly codigoVerificacion: string;
  readonly progreso: number;
}

export const CERTIFICADOS_USUARIO: readonly CertificadoUsuario[] = [
  { id: 'cert-1', cursoNombre: 'Estadística', fechaEmision: '15 de mayo de 2026', codigoVerificacion: 'AEP-2026-STAT-0891', progreso: 100 },
  { id: 'cert-2', cursoNombre: 'Álgebra Lineal', fechaEmision: '1 de junio de 2026', codigoVerificacion: 'AEP-2026-ALG-0734', progreso: 100 },
] as const;

// ============================================================
// Lista de deseos
// ============================================================

export interface DeseoCurso {
  readonly id: string;
  readonly cursoId: string;
  readonly cursoNombre: string;
  readonly formula: string;
  readonly color: string;
  readonly price: number;
  readonly fechaAgregado: string;
}

export const DESEOS_USUARIO: readonly DeseoCurso[] = [
  { id: 'd-1', cursoId: 'calculo-vectorial', cursoNombre: 'CÁLCULO VECTORIAL', formula: 'F', color: 'bg-purple-600', price: 150, fechaAgregado: '10 de junio de 2026' },
  { id: 'd-2', cursoId: 'fisica-2', cursoNombre: 'FÍSICA 2', formula: '∿', color: 'bg-red-600', price: 120, fechaAgregado: '12 de junio de 2026' },
] as const;

// ============================================================
// Historial de clases
// ============================================================

export interface ClaseHistorial {
  readonly id: string;
  readonly cursoNombre: string;
  readonly temaTitulo: string;
  readonly fecha: string;
  readonly duracion: string;
  readonly progreso: number;
  readonly color: string;
}

export const HISTORIAL_CLASES: readonly ClaseHistorial[] = [
  { id: 'h-1', cursoNombre: 'CÁLCULO DIFERENCIAL', temaTitulo: 'Límites por definición', fecha: '14 de junio de 2026', duracion: '45 min', progreso: 100, color: 'bg-emerald-500' },
  { id: 'h-2', cursoNombre: 'CÁLCULO DIFERENCIAL', temaTitulo: 'Límites algebraicos', fecha: '14 de junio de 2026', duracion: '38 min', progreso: 100, color: 'bg-emerald-500' },
  { id: 'h-3', cursoNombre: 'CÁLCULO DIFERENCIAL', temaTitulo: 'Derivadas por definición', fecha: '13 de junio de 2026', duracion: '44 min', progreso: 75, color: 'bg-emerald-500' },
  { id: 'h-4', cursoNombre: 'CÁLCULO INTEGRAL', temaTitulo: 'Integral indefinida', fecha: '12 de junio de 2026', duracion: '50 min', progreso: 100, color: 'bg-blue-500' },
  { id: 'h-5', cursoNombre: 'CÁLCULO INTEGRAL', temaTitulo: 'Métodos de integración', fecha: '11 de junio de 2026', duracion: '55 min', progreso: 60, color: 'bg-blue-500' },
  { id: 'h-6', cursoNombre: 'ECUACIONES DIFERENCIALES', temaTitulo: 'Ecuaciones de primer orden', fecha: '10 de junio de 2026', duracion: '55 min', progreso: 100, color: 'bg-orange-500' },
  { id: 'h-7', cursoNombre: 'ECUACIONES DIFERENCIALES', temaTitulo: 'Ecuaciones separables', fecha: '9 de junio de 2026', duracion: '50 min', progreso: 40, color: 'bg-orange-500' },
] as const;