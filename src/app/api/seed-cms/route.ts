import { NextResponse } from "next/server";
import { createClient } from "@sanity/client";

export async function POST() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const token = process.env.SANITY_API_READ_TOKEN;
  if (!projectId || !token) {
    return NextResponse.json({ error: "Missing env vars" }, { status: 500 });
  }

  const client = createClient({
    projectId,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
    apiVersion: "2025-01-01",
    token,
    useCdn: false,
  });

  const results: string[] = [];

  async function upsert(doc: Record<string, unknown>, id: string) {
    try {
      await client.createOrReplace({ ...doc, _id: id });
      results.push(`OK: ${id}`);
    } catch (err: any) {
      results.push(`ERR ${id}: ${err.message?.slice(0, 100)}`);
    }
  }

  // --- Courses ---
  const courses: Record<string, unknown>[] = [
    {
      _type: "course", title: "Cálculo Diferencial",
      slug: { _type: "slug", current: "calculo-diferencial" }, category: "calculo",
      description: [{ _type: "block", _key: "cd1", children: [{ _type: "span", _key: "cds1", text: "Domina los fundamentos del Cálculo Diferencial: límites, derivadas y aplicaciones. Curso diseñado para la UTP con ejercicios resueltos paso a paso." }], style: "normal" }],
      professor: "Prof. Kall Bruno Díaz", pricePEN: 80, priceUSD: 22, totalClasses: 28, totalHours: "42", level: "intermedio", featured: true, order: 1,
      topics: [
        { title: "Límites y Continuidad", description: "Definición de límite, propiedades, continuidad", classes: 4 },
        { title: "Derivadas", description: "Reglas de derivación, cadena, implícita", classes: 6 },
        { title: "Aplicaciones de la Derivada", description: "Máximos, mínimos, optimización", classes: 4 },
        { title: "Función Logarítmica y Exponencial", description: "Propiedades y derivadas", classes: 4 },
        { title: "Integrales Impropias", description: "Criterios de convergencia", classes: 3 },
        { title: "Función Gamma y Beta", description: "Definición y aplicaciones", classes: 3 },
        { title: "Sucesiones y Series", description: "Convergencia, criterios", classes: 4 },
      ],
      classVideos: [
        { title: "Clase 1 — Introducción a Límites", description: "Definición de límite", duration: "45:30", topic: "Límites y Continuidad", isFree: true, order: 1 },
        { title: "Clase 2 — Propiedades de Límites", description: "Suma, producto, cociente", duration: "52:15", topic: "Límites y Continuidad", isFree: false, order: 2 },
        { title: "Clase 3 — Límites Laterales", description: "Laterales y al infinito", duration: "48:00", topic: "Límites y Continuidad", isFree: false, order: 3 },
        { title: "Clase 4 — Continuidad", description: "Tipos de discontinuidad", duration: "50:10", topic: "Límites y Continuidad", isFree: false, order: 4 },
      ],
    },
    {
      _type: "course", title: "Cálculo Integral",
      slug: { _type: "slug", current: "calculo-integral" }, category: "calculo",
      description: [{ _type: "block", _key: "ci1", children: [{ _type: "span", _key: "cis1", text: "Aprende integrales definidas e indefinidas, métodos de integración y aplicaciones geométricas." }], style: "normal" }],
      professor: "Prof. Kall Bruno Díaz", pricePEN: 80, priceUSD: 22, totalClasses: 24, totalHours: "36", level: "intermedio", featured: true, order: 2,
      topics: [
        { title: "Integral Indefinida", description: "Reglas básicas", classes: 4 },
        { title: "Métodos de Integración", description: "Sustitución, partes, fracciones", classes: 6 },
        { title: "Integral Definida", description: "Teorema fundamental", classes: 4 },
        { title: "Aplicaciones", description: "Volúmenes, longitud de arco", classes: 5 },
      ],
      classVideos: [
        { title: "Clase 1 — Concepto de Integral", description: "Antiderivadas", duration: "44:00", topic: "Integral Indefinida", isFree: true, order: 1 },
      ],
    },
    {
      _type: "course", title: "Ecuaciones Diferenciales",
      slug: { _type: "slug", current: "ecuaciones-diferenciales" }, category: "ecuaciones",
      description: [{ _type: "block", _key: "ed1", children: [{ _type: "span", _key: "eds1", text: "Curso completo de Ecuaciones Diferenciales Ordinarias con métodos de resolución." }], style: "normal" }],
      professor: "Prof. Kall Bruno Díaz", pricePEN: 70, priceUSD: 19, totalClasses: 20, totalHours: "30", level: "avanzado", featured: false, order: 3,
      topics: [
        { title: "ED de Primer Orden", description: "Variables separables, lineales", classes: 5 },
        { title: "ED de Segundo Orden", description: "Coeficientes constantes", classes: 5 },
        { title: "Transformada de Laplace", description: "Definición y propiedades", classes: 5 },
      ],
      classVideos: [],
    },
    {
      _type: "course", title: "Mecánica Clásica (Estática)",
      slug: { _type: "slug", current: "mecanica-estatica" }, category: "mecanica",
      description: [{ _type: "block", _key: "me1", children: [{ _type: "span", _key: "mes1", text: "Fuerzas, equilibrio, centroides y momentos de inercia para la UTP." }], style: "normal" }],
      professor: "Prof. Kall Bruno Díaz", pricePEN: 75, priceUSD: 20, totalClasses: 22, totalHours: "33", level: "intermedio", featured: false, order: 4,
      topics: [
        { title: "Fuerzas y Vectores", description: "Descomposición, resultante", classes: 4 },
        { title: "Equilibrio", description: "Cuerpo rígido, DCL", classes: 5 },
        { title: "Centroides", description: "Centro de gravedad", classes: 4 },
      ],
      classVideos: [],
    },
    {
      _type: "course", title: "Fluidos",
      slug: { _type: "slug", current: "fluidos" }, category: "fluidos",
      description: [{ _type: "block", _key: "fl1", children: [{ _type: "span", _key: "fls1", text: "Estática y dinámica de fluidos, ecuación de Bernoulli y aplicaciones." }], style: "normal" }],
      professor: "Prof. Kall Bruno Díaz", pricePEN: 70, priceUSD: 19, totalClasses: 18, totalHours: "27", level: "avanzado", featured: false, order: 5,
      topics: [
        { title: "Propiedades de Fluidos", description: "Densidad, viscosidad", classes: 3 },
        { title: "Ecuación de Bernoulli", description: "Conservación de energía", classes: 5 },
      ],
      classVideos: [],
    },
    {
      _type: "course", title: "Termodinámica",
      slug: { _type: "slug", current: "termodinamica" }, category: "termodinamica",
      description: [{ _type: "block", _key: "td1", children: [{ _type: "span", _key: "tds1", text: "Leyes de la termodinámica, ciclos termodinámicos y entropía." }], style: "normal" }],
      professor: "Prof. Kall Bruno Díaz", pricePEN: 70, priceUSD: 19, totalClasses: 18, totalHours: "27", level: "avanzado", featured: false, order: 6,
      topics: [{ title: "Primera Ley", description: "Trabajo, calor", classes: 4 }, { title: "Segunda Ley", description: "Entropía", classes: 5 }],
      classVideos: [],
    },
    {
      _type: "course", title: "Estadística Aplicada",
      slug: { _type: "slug", current: "estadistica" }, category: "estadistica",
      description: [{ _type: "block", _key: "ea1", children: [{ _type: "span", _key: "eas1", text: "Probabilidad, distribuciones, intervalos de confianza y pruebas de hipótesis." }], style: "normal" }],
      professor: "Prof. Kall Bruno Díaz", pricePEN: 60, priceUSD: 16, totalClasses: 16, totalHours: "24", level: "basico", featured: false, order: 7,
      topics: [{ title: "Probabilidad", description: "Eventos, bayes", classes: 4 }, { title: "Distribuciones", description: "Normal, binomial", classes: 4 }],
      classVideos: [],
    },
  ];

  // --- Page content ---
  await upsert({
    _type: "pageContent", pageId: "nosotros", pageTitle: "Sobre Nosotros",
    heroTitle: "Conoce al Prof. Kall Bruno Díaz",
    heroSubtitle: [{ _type: "block", _key: "pc2b", children: [{ _type: "span", _key: "pc2s", text: "Profesor de ingeniería con años de experiencia ayudando a estudiantes." }], style: "normal" }],
    bodyContent: [
      { _type: "block", _key: "nb1", children: [{ _type: "span", _key: "ns1", text: "Academia El Profe Oficial fue fundada por el Prof. Kall Bruno Díaz, docente universitario con una pasión inquebrantable por la enseñanza de las ciencias básicas para ingeniería." }], style: "normal" },
      { _type: "block", _key: "nb2", children: [{ _type: "span", _key: "ns2", text: "Lo que comenzó como grabaciones compartidas por WhatsApp se transformó en una plataforma educativa completa con video-lecciones estructuradas y certificados." }], style: "normal" },
    ],
  }, "page-nosotros");

  await upsert({
    _type: "pageContent", pageId: "soporte", pageTitle: "Soporte",
    heroTitle: "Soporte y Ayuda",
    heroSubtitle: [{ _type: "block", _key: "pc3b", children: [{ _type: "span", _key: "pc3s", text: "¿Tienes algún problema o consulta? Estamos aquí para ayudarte." }], style: "normal" }],
  }, "page-soporte");

  await upsert({
    _type: "pageContent", pageId: "cursos", pageTitle: "Nuestros Cursos",
    heroTitle: "Nuestros Cursos",
    heroSubtitle: [{ _type: "block", _key: "pc1b", children: [{ _type: "span", _key: "pc1s", text: "Clases grabadas de ingeniería para la UTP y más universidades" }], style: "normal" }],
  }, "page-cursos");

  for (const c of courses) {
    const order = c.order as number;
    await upsert(c, `course-${order}`);
  }

  return NextResponse.json({ success: true, count: results.length, results });
}