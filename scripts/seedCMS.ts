// ============================================================
// seedCMS.ts — Poblar Sanity con data de Academia El Profe
// Uso: npx tsx scripts/seedCMS.ts
// Requiere: NEXT_PUBLIC_SANITY_PROJECT_ID y SANITY_API_READ_TOKEN en .env.local
// ============================================================

import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_READ_TOKEN;

if (!projectId || !token) {
  console.error("❌ Faltan variables de entorno. Configura:");
  console.error("   NEXT_PUBLIC_SANITY_PROJECT_ID");
  console.error("   SANITY_API_READ_TOKEN");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2025-01-01",
  token,
  useCdn: false,
});

async function createOrReplace(doc: Record<string, unknown>, id: string) {
  try {
    const existing = await client.getDocument(id);
    if (existing) {
      await client.createOrReplace({ ...doc, _id: id });
      console.log(`  ✏️  Actualizado: ${id}`);
    } else {
      await client.create({ ...doc, _id: id });
      console.log(`  ✅ Creado: ${id}`);
    }
  } catch (err: any) {
    console.error(`  ❌ Error en ${id}:`, err.message);
  }
}

async function seed() {
  console.log("🌱 Seeding Sanity CMS — Academia El Profe Oficial\n");

  // ============================================================
  // 1. Site Settings
  // ============================================================
  console.log("⚙️  Site Settings...");
  await createOrReplace({
    _type: "siteSettings",
    companyName: "Academia El Profe Oficial",
    slogan: "Clases grabadas de ingeniería, disponibles 24/7",
    tagline: "Plataforma educativa de refuerzo académico para estudiantes de ingeniería en Perú. Cursos de Cálculo, Mecánica, Fluidos, Estadística y más.",
    phone: "+51 944 106 163",
    whatsapp: "51944106163",
    email: "academiaelprofeoficial@gmail.com",
    tiktokUrl: "",
    instagramUrl: "",
    youtubeUrl: "",
    facebookUrl: "",
    seoTitle: "Academia El Profe Oficial | Clases de Ingeniería para la UTP",
    seoDescription: "Plataforma educativa de refuerzo académico para estudiantes de la Universidad Tecnológica del Perú (UTP). Cursos de Cálculo, Mecánica, Fluidos, Estadística y más con el Prof. Kall Bruno Díaz.",
  }, "siteSettings");

  // ============================================================
  // 2. Hero Slides
  // ============================================================
  console.log("\n🖼️  Hero Slides...");
  const heroSlides = [
    {
      _type: "heroSlide",
      title: "ACADEMIA EL PROFE",
      subtitle: [
        { _type: "block", _key: "hs1b", children: [{ _type: "span", _key: "hs1s", text: "Clases grabadas de ingeniería para la UTP y más universidades" }], style: "normal" },
      ],
      ctaLabel: "VER CURSOS",
      ctaLink: "/cursos",
      ctaType: "primary",
      order: 1,
    },
  ];
  for (const slide of heroSlides) {
    await createOrReplace(slide, `hero-slide-${slide.order}`);
  }

  // ============================================================
  // 3. Stats
  // ============================================================
  console.log("\n📊 Estadísticas...");
  const stats = [
    { _type: "stat", label: "Estudiantes Registrados", value: 500, prefix: "+", suffix: "", icon: "users", order: 1 },
    { _type: "stat", label: "Clases Disponibles", value: 200, prefix: "", suffix: "+", icon: "book-open", order: 2 },
    { _type: "stat", label: "Cursos Activos", value: 8, prefix: "", suffix: "", icon: "graduation-cap", order: 3 },
    { _type: "stat", label: "Aprobados", value: 95, prefix: "", suffix: "%", icon: "award", order: 4 },
  ];
  for (const stat of stats) {
    await createOrReplace(stat, `stat-${stat.order}`);
  }

  // ============================================================
  // 4. Partners / Universities
  // ============================================================
  console.log("\n🎓 Universidades...");
  const partners = [
    { _type: "partner", name: "Universidad Tecnológica del Perú", abbreviation: "UTP", url: "https://www.utp.edu.pe", order: 1 },
    { _type: "partner", name: "Universidad Nacional de Ingeniería", abbreviation: "UNI", url: "https://www.uni.edu.pe", order: 2 },
    { _type: "partner", name: "Universidad Peruana de Ciencias Aplicadas", abbreviation: "UPC", url: "https://www.upc.edu.pe", order: 3 },
    { _type: "partner", name: "Pontificia Universidad Católica del Perú", abbreviation: "PUCP", url: "https://www.pucp.edu.pe", order: 4 },
    { _type: "partner", name: "Universidad de Lima", abbreviation: "UL", url: "https://www.ulima.edu.pe", order: 5 },
    { _type: "partner", name: "Universidad Ricardo Palma", abbreviation: "URP", url: "https://www.urp.edu.pe", order: 6 },
    { _type: "partner", name: "Universidad César Vallejo", abbreviation: "UCV", url: "https://www.ucv.edu.pe", order: 7 },
    { _type: "partner", name: "Universidad Señor de Sipán", abbreviation: "USS", url: "https://www.uss.edu.pe", order: 8 },
  ];
  for (const p of partners) {
    await createOrReplace(p, `partner-${p.order}`);
  }

  // ============================================================
  // 5. Testimonials
  // ============================================================
  console.log("\n💬 Testimonios...");
  const testimonials = [
    {
      _type: "testimonial", authorName: "Carlos M.", authorRole: "Estudiante de Ingeniería Industrial — UTP",
      quote: [
        { _type: "block", _key: "t1b", children: [{ _type: "span", _key: "t1s", text: "Las clases del Profe Kall me ayudaron a aprobar Cálculo Diferencial con nota sobresaliente. La mejor inversión que hice en mi carrera universitaria." }], style: "normal" },
      ],
      rating: 5, featured: true, order: 1,
    },
    {
      _type: "testimonial", authorName: "María L.", authorRole: "Estudiante de Ingeniería Civil — UPC",
      quote: [
        { _type: "block", _key: "t2b", children: [{ _type: "span", _key: "t2s", text: "Gracias a Academia El Profe pude entender Mecánica Clásica de verdad. Las explicaciones son claras y los ejercicios resueltos son un gold." }], style: "normal" },
      ],
      rating: 5, featured: true, order: 2,
    },
    {
      _type: "testimonial", authorName: "Diego R.", authorRole: "Estudiante de Ingeniería Electrónica — UNI",
      quote: [
        { _type: "block", _key: "t3b", children: [{ _type: "span", _key: "t3s", text: "Fluidos y Termodinámica eran mis pesadillas hasta que encontré esta plataforma. Ahora son mis cursos favoritos." }], style: "normal" },
      ],
      rating: 5, featured: false, order: 3,
    },
  ];
  for (const t of testimonials) {
    await createOrReplace(t, `testimonial-${t.order}`);
  }

  // ============================================================
  // 6. Team Members
  // ============================================================
  console.log("\n👤 Equipo...");
  await createOrReplace({
    _type: "teamMember",
    name: "Prof. Kall Bruno Díaz",
    role: "Fundador y Profesor Principal",
    bio: [
      { _type: "block", _key: "tm1b", children: [{ _type: "span", _key: "tm1s", text: "Profesor de ingeniería con amplia experiencia en la enseñanza de Cálculo, Mecánica, Fluidos, Termodinámica y Estadística. Especializado en帮助学生 de la UTP y universidades de ingeniería en Perú a aprobar sus cursos con sólida base matemática." }], style: "normal" },
    ],
    email: "academiaelprofeoficial@gmail.com",
    order: 1,
  }, "team-member-1");

  // ============================================================
  // 7. Guide
  // ============================================================
  console.log("\n📖 Guía de Uso...");
  await createOrReplace({
    _type: "studioGuide",
    title: "Guía de Uso — Academia El Profe CMS",
    content: [
      { _type: "block", _key: "g1", children: [{ _type: "span", _key: "s1", text: "Bienvenido al CMS de Academia El Profe Oficial." }], style: "h2" },
      { _type: "block", _key: "g2", children: [{ _type: "span", _key: "s2", text: "Desde aquí puedes editar el contenido del sitio web sin necesidad de un desarrollador." }], style: "normal" },
      { _type: "block", _key: "g3", children: [{ _type: "span", _key: "s3", text: "Secciones disponibles: Hero, Estadísticas, Universidades, Cursos, Testimonios, Equipo y Configuración." }], style: "normal" },
      { _type: "block", _key: "g4", children: [{ _type: "span", _key: "s4", text: "Para subir imágenes, haz clic en el campo de imagen y arrastra o selecciona un archivo. Las imágenes se optimizan automáticamente." }], style: "normal" },
      { _type: "block", _key: "g5", children: [{ _type: "span", _key: "s5", text: "Usa el botón 'Preview' (ojo) para ver cómo se ve tu contenido en el sitio en tiempo real con Visual Editing." }], style: "normal" },
      { _type: "block", _key: "g6", children: [{ _type: "span", _key: "s6", text: "Los cambios se publican cuando presionas el botón 'Publicar' (Publish)." }], style: "normal" },
    ],
  }, "studio-guide");

  // ============================================================
  // 8. Theme Settings (Color Customization)
  // ============================================================
  console.log("\n🎨 Theme Settings...");
  await createOrReplace({
    _type: "themeSettings",
    preset: "green-academy",
    colorsSection: {
      primaryColor: "#10B981",
      primaryHoverColor: "#059669",
      headingColor: "#1E293B",
      textColor: "#475569",
      linkColor: "#059669",
      buttonColor: "#10B981",
      buttonHoverColor: "#059669",
      buttonTextColor: "#FFFFFF",
      secondaryColor: "#3B82F6",
    },
  }, "themeSettings");

  // ============================================================
  // 9. Page Content (editable subpages)
  // ============================================================
  console.log("\n📄 Páginas Editables...");
  const pages = [
    {
      _type: "pageContent",
      pageId: "cursos",
      pageTitle: "Nuestros Cursos",
      heroTitle: "Nuestros Cursos",
      heroSubtitle: [
        { _type: "block", _key: "pc1b", children: [{ _type: "span", _key: "pc1s", text: "Clases grabadas de ingeniería para la UTP y más universidades" }], style: "normal" },
      ],
      ctaLabel: "VER TODOS LOS CURSOS",
      ctaLink: "/cursos",
      seoTitle: "Cursos de Ingeniería | Academia El Profe Oficial",
      seoDescription: "Explora nuestros cursos de Cálculo, Mecánica, Fluidos, Termodinámica y más. Clases grabadas con acceso 24/7.",
    },
    {
      _type: "pageContent",
      pageId: "nosotros",
      pageTitle: "Nosotros",
      heroTitle: "Conoce al Prof. Kall Bruno Díaz",
      heroSubtitle: [
        { _type: "block", _key: "pc2b", children: [{ _type: "span", _key: "pc2s", text: "Profesor de ingeniería con años de experiencia ayudando a estudiantes a aprobar sus cursos." }], style: "normal" },
      ],
      bodyContent: [
        { _type: "block", _key: "nb1", children: [{ _type: "span", _key: "ns1", text: "Academia El Profe Oficial fue fundada por el Prof. Kall Bruno Díaz, docente universitario con una pasión inquebrantable por la enseñanza de las ciencias básicas para ingeniería. Tras años de observar cómo cientos de estudiantes luchaban con cursos como Cálculo, Mecánica y Fluidos, decidió crear una plataforma que llevara sus clases de calidad directa al celular o computadora de cada estudiante." }], style: "normal" },
        { _type: "block", _key: "nb2", children: [{ _type: "span", _key: "ns2", text: "Lo que comenzó como grabaciones compartidas por WhatsApp se transformó en una plataforma educativa completa con video-lecciones estructuradas, material de apoyo en PDF, sistemas de evaluación y certificados que respaldan el esfuerzo de cada estudiante." }], style: "normal" },
      ],
      seoTitle: "Sobre Nosotros | Academia El Profe Oficial",
      seoDescription: "Conoce al Prof. Kall Bruno Díaz y la misión de Academia El Profe Oficial.",
    },
    {
      _type: "pageContent",
      pageId: "soporte",
      pageTitle: "Soporte",
      heroTitle: "Soporte y Ayuda",
      heroSubtitle: [
        { _type: "block", _key: "pc3b", children: [{ _type: "span", _key: "pc3s", text: "¿Tienes algún problema o consulta? Estamos aquí para ayudarte." }], style: "normal" },
      ],
      ctaLabel: "CONTACTAR POR WHATSAPP",
      ctaLink: "https://wa.me/51944106163",
      seoTitle: "Soporte | Academia El Profe Oficial",
      seoDescription: "Centro de soporte de Academia El Profe Oficial. Contáctanos por WhatsApp o email.",
    },
  ];
  for (const p of pages) {
    await createOrReplace(p, `page-${p.pageId}`);
  }

  // ============================================================
  // 9. Courses — documentos editables con videos
  // ============================================================
  console.log("\n📘 Cursos...");
  const courses = [
    {
      _type: "course",
      title: "Cálculo Diferencial",
      slug: { _type: "slug", current: "calculo-diferencial" },
      category: "calculo",
      description: [
        { _type: "block", _key: "cd1", children: [{ _type: "span", _key: "cds1", text: "Domina los fundamentos del Cálculo Diferencial: límites, derivadas y aplicaciones. Curso diseñado específicamente para el ciclo de la UTP con ejercicios resueltos paso a paso y evaluaciones tipo examen." }], style: "normal" },
      ],
      professor: "Prof. Kall Bruno Díaz",
      pricePEN: 80,
      priceUSD: 22,
      totalClasses: 28,
      totalHours: "42",
      level: "intermedio",
      featured: true,
      order: 1,
      topics: [
        { title: "Límites y Continuidad", description: "Definición de límite, propiedades, límites laterales, continuidad de funciones", classes: 4 },
        { title: "Derivadas", description: "Reglas de derivación, derivada de funciones trigonométricas, cadena, implícita", classes: 6 },
        { title: "Aplicaciones de la Derivada", description: "Valores máximos y mínimos, optimización, teorema de Rolle y Mean Value", classes: 4 },
        { title: "Función Logarítmica y Exponencial", description: "Propiedades, derivadas, integrales de funciones log y exp", classes: 4 },
        { title: "Integrales Impropias", description: "Criterios de convergencia, integrales de primera y segunda especie", classes: 3 },
        { title: "Función Gamma y Beta", description: "Definición, propiedades y aplicaciones en probabilidad", classes: 3 },
        { title: "Sucesiones y Series", description: "Convergencia, criterios de la razón, raíz e integral", classes: 4 },
      ],
      classVideos: [
        { title: "Clase 1 — Introducción a Límites", description: "Definición intuitiva y formal de límite", duration: "45:30", topic: "Límites y Continuidad", isFree: true, order: 1 },
        { title: "Clase 2 — Propiedades de Límites", description: "Límite de suma, producto, cociente", duration: "52:15", topic: "Límites y Continuidad", isFree: false, order: 2 },
        { title: "Clase 3 — Límites Laterales", description: "Límites por la derecha e izquierda, límites al infinito", duration: "48:00", topic: "Límites y Continuidad", isFree: false, order: 3 },
        { title: "Clase 4 — Continuidad", description: "Tipos de discontinuidad, teorema del valor intermedio", duration: "50:10", topic: "Límites y Continuidad", isFree: false, order: 4 },
      ],
    },
    {
      _type: "course",
      title: "Cálculo Integral",
      slug: { _type: "slug", current: "calculo-integral" },
      category: "calculo",
      description: [
        { _type: "block", _key: "ci1", children: [{ _type: "span", _key: "cis1", text: "Aprende integrales definidas e indefinidas, métodos de integración y aplicaciones geométricas. Preparación completa para el examen de Cálculo Integral de la UTP." }], style: "normal" },
      ],
      professor: "Prof. Kall Bruno Díaz",
      pricePEN: 80,
      priceUSD: 22,
      totalClasses: 24,
      totalHours: "36",
      level: "intermedio",
      featured: true,
      order: 2,
      topics: [
        { title: "Integral Indefinida", description: "Reglas básicas de integración", classes: 4 },
        { title: "Métodos de Integración", description: "Sustitución, partes, fracciones parciales", classes: 6 },
        { title: "Integral Definida", description: "Teorema fundamental del cálculo, área bajo la curva", classes: 4 },
        { title: "Aplicaciones de la Integral", description: "Volúmenes de revolución, longitud de arco, trabajo", classes: 5 },
      ],
      classVideos: [
        { title: "Clase 1 — Concepto de Integral", description: "Antiderivadas e integral indefinida", duration: "44:00", topic: "Integral Indefinida", isFree: true, order: 1 },
        { title: "Clase 2 — Reglas Básicas", description: "Potencia, constantes, suma y resta", duration: "47:30", topic: "Integral Indefinida", isFree: false, order: 2 },
      ],
    },
    {
      _type: "course",
      title: "Ecuaciones Diferenciales",
      slug: { _type: "slug", current: "ecuaciones-diferenciales" },
      category: "ecuaciones",
      description: [
        { _type: "block", _key: "ed1", children: [{ _type: "span", _key: "eds1", text: "Curso completo de Ecuaciones Diferenciales Ordinarias. Métodos de resolución, aplicaciones en ingeniería y preparación para exámenes universitarios." }], style: "normal" },
      ],
      professor: "Prof. Kall Bruno Díaz",
      pricePEN: 70,
      priceUSD: 19,
      totalClasses: 20,
      totalHours: "30",
      level: "avanzado",
      featured: false,
      order: 3,
      topics: [
        { title: "ED de Primer Orden", description: "Variables separables, lineales, exactas", classes: 5 },
        { title: "ED de Segundo Orden", description: "Homogéneas con coeficientes constantes, variación de parámetros", classes: 5 },
        { title: "Transformada de Laplace", description: "Definición, propiedades, inversa", classes: 5 },
      ],
      classVideos: [
        { title: "Clase 1 — Introducción a ED", description: "Conceptos fundamentales, orden y grado", duration: "40:00", topic: "ED de Primer Orden", isFree: true, order: 1 },
      ],
    },
    {
      _type: "course",
      title: "Mecánica Clásica (Estática)",
      slug: { _type: "slug", current: "mecanica-estatica" },
      category: "mecanica",
      description: [
        { _type: "block", _key: "me1", children: [{ _type: "span", _key: "mes1", text: "Fuerzas, equilibrio, centroides y momentos de inercia. Curso enfocado en la asignatura de Estática de la UTP con problemas tipo examen." }], style: "normal" },
      ],
      professor: "Prof. Kall Bruno Díaz",
      pricePEN: 75,
      priceUSD: 20,
      totalClasses: 22,
      totalHours: "33",
      level: "intermedio",
      featured: false,
      order: 4,
      topics: [
        { title: "Fuerzas y Vectores", description: "Descomposición de fuerzas, resultante", classes: 4 },
        { title: "Equilibrio", description: "Cuerpo rígido, diagrama de cuerpo libre", classes: 5 },
        { title: "Centroides y Baricentros", description: "Centro de gravedad y centroide de áreas compuestas", classes: 4 },
      ],
      classVideos: [
        { title: "Clase 1 — Sistemas de Fuerzas", description: "Fuerzas concurrentes y resultante", duration: "42:00", topic: "Fuerzas y Vectores", isFree: true, order: 1 },
      ],
    },
    {
      _type: "course",
      title: "Fluidos",
      slug: { _type: "slug", current: "fluidos" },
      category: "fluidos",
      description: [
        { _type: "block", _key: "fl1", children: [{ _type: "span", _key: "fls1", text: "Estática y dinámica de fluidos, ecuación de Bernoulli, pérdidas de carga y aplicaciones prácticas en ingeniería." }], style: "normal" },
      ],
      professor: "Prof. Kall Bruno Díaz",
      pricePEN: 70,
      priceUSD: 19,
      totalClasses: 18,
      totalHours: "27",
      level: "avanzado",
      featured: false,
      order: 5,
      topics: [
        { title: "Propiedades de los Fluidos", description: "Densidad, viscosidad, presión hidrostática", classes: 3 },
        { title: "Ecuación de Bernoulli", description: "Principio de conservación de energía, aplicaciones", classes: 5 },
        { title: "Pérdidas de Carga", description: "Pérdidas mayores y menores, número de Reynolds", classes: 4 },
      ],
      classVideos: [
        { title: "Clase 1 — Introducción a Fluidos", description: "Propiedades fundamentales", duration: "38:00", topic: "Propiedades de los Fluidos", isFree: true, order: 1 },
      ],
    },
    {
      _type: "course",
      title: "Termodinámica",
      slug: { _type: "slug", current: "termodinamica" },
      category: "termodinamica",
      description: [
        { _type: "block", _key: "td1", children: [{ _type: "span", _key: "tds1", text: "Leyes de la termodinámica, ciclos termodinámicos, entropía y sus aplicaciones en ingeniería." }], style: "normal" },
      ],
      professor: "Prof. Kall Bruno Díaz",
      pricePEN: 70,
      priceUSD: 19,
      totalClasses: 18,
      totalHours: "27",
      level: "avanzado",
      featured: false,
      order: 6,
      topics: [
        { title: "Primera Ley", description: "Trabajo, calor, energía interna", classes: 4 },
        { title: "Segunda Ley", description: "Entropía, reversible e irreversible", classes: 5 },
      ],
      classVideos: [],
    },
    {
      _type: "course",
      title: "Estadística Aplicada",
      slug: { _type: "slug", current: "estadistica" },
      category: "estadistica",
      description: [
        { _type: "block", _key: "ea1", children: [{ _type: "span", _key: "eas1", text: "Probabilidad, distribuciones, intervalos de confianza y pruebas de hipótesis aplicadas a la ingeniería." }], style: "normal" },
      ],
      professor: "Prof. Kall Bruno Díaz",
      pricePEN: 60,
      priceUSD: 16,
      totalClasses: 16,
      totalHours: "24",
      level: "basico",
      featured: false,
      order: 7,
      topics: [
        { title: "Probabilidad", description: "Eventos, reglas de probabilidad, bayes", classes: 4 },
        { title: "Distribuciones", description: "Normal, binomial, poisson", classes: 4 },
      ],
      classVideos: [],
    },
  ];
  for (const c of courses) {
    await createOrReplace(c, `course-${c.order}`);
  }

  console.log("\n✅ Seed completado con éxito.");
}

seed().catch((err) => {
  console.error("❌ Error fatal en seed:", err);
  process.exit(1);
});