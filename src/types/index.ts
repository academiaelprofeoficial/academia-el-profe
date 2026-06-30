// ============================================================
// Sistema de Tipos — Academia El Profe Oficial
// Tipado estricto, cero 'any' permitido.
// ============================================================

/** Categoría de curso con color asociado */
export interface CourseCategory {
  readonly slug: string;
  readonly nombre: string;
  readonly color: string; // Clase Tailwind de fondo (ej: 'bg-blue-600')
  readonly colorHover: string; // Clase Tailwind hover
  readonly icono: string; // Clave para el ícono de Lucide
}

/** Curso completo del catálogo */
export interface Course {
  readonly id: string;
  readonly slug: string;
  readonly titulo: string;
  readonly subtitulo: string;
  readonly descripcion: string;
  readonly precio: number; // Precio en soles (ej: 100)
  readonly precioUSD: number; // Precio en dólares (ej: 30)
  readonly categoria: CourseCategory;
  readonly tieneClasesGrabadas: boolean;
  readonly tieneMaterialPDF: boolean;
  readonly estaBloqueado: boolean;
  readonly numeroLecciones: number;
  readonly numeroHoras: number;
  readonly temario: TemarioItem[];
  readonly calificacion: number; // 1 a 5
  readonly numeroEstudiantes: number;
  readonly imagenUrl: string;
  readonly createdAt: string; // ISO date string
}

/** Ítem del temario de un curso */
export interface TemarioItem {
  readonly id: string;
  readonly numero: number;
  readonly titulo: string;
  readonly duracion: string; // ej: '45 min'
  readonly esGratuito: boolean;
}

/** Usuario del sistema */
export interface User {
  readonly id: string;
  readonly nombre: string;
  readonly apellido: string;
  readonly email: string;
  readonly avatarUrl: string;
  readonly rol: UserRole;
  readonly cursosInscritos: string[]; // Slugs de cursos
  readonly certificados: Certificado[];
}

/** Roles de usuario */
export type UserRole = 'estudiante' | 'admin' | 'profesor';

/** Certificado emitido */
export interface Certificado {
  readonly id: string;
  readonly cursoSlug: string;
  readonly cursoNombre: string;
  readonly fechaEmision: string;
  readonly codigoVerificacion: string;
}

/** Comentario en una lección */
export interface Comment {
  readonly id: string;
  readonly usuario: Pick<User, 'id' | 'nombre' | 'apellido' | 'avatarUrl'>;
  readonly leccionId: string;
  readonly cursoSlug: string;
  readonly contenido: string;
  readonly fechaCreacion: string;
  readonly likes: number;
}

/** Métricas de ingresos para el panel admin */
export interface RevenueMetric {
  readonly mes: string; // ej: 'Enero 2026'
  readonly ingresos: number;
  readonly cursosVendidos: number;
  readonly nuevosEstudiantes: number;
}

/** Vista activa para la navegación */
export type AppView = 'inicio' | 'mis-cursos' | 'certificados' | 'soporte' | 'admin';

/** Datos del perfil de navegación del sidebar */
export interface SidebarNavItem {
  readonly etiqueta: string;
  readonly href: string;
  readonly icono: string; // Clave para ícono de Lucide
}

/** Props genéricas con children tipados */
export interface LayoutProps {
  readonly children: React.ReactNode;
}

/** Curso para la landing (diseño nuevo) */
export interface CourseLanding {
  readonly id: string;
  readonly title: string;
  readonly desc: string;
  readonly formula: string;
  readonly formulaIcon: string; // Clave para ícono de Lucide (vacío si es texto)
  readonly modules: number;
  readonly price: number;
  readonly priceUSD: number;
  readonly colorKey: string; // 'emerald' | 'blue' | 'orange' | 'purple' | 'teal' | 'red' | 'sky'
}

/** Materia con badge */
export interface MateriaBadge {
  readonly nombre: string;
}

/** Universidad aliada */
export interface Universidad {
  readonly nombre: string;
  readonly abreviatura: string;
}