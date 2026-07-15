-- ============================================================
-- SQL: Crear tabla pagina_nosotros para contenido dinámico
-- Ejecutar en Supabase SQL Editor (una sola vez)
-- ============================================================

CREATE TABLE IF NOT EXISTS pagina_nosotros (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Contenido principal
  titulo_principal TEXT NOT NULL DEFAULT '',
  subtitulo_principal TEXT DEFAULT '',
  texto_historia TEXT DEFAULT '',

  -- Profesor fundador
  prof_nombre TEXT NOT NULL DEFAULT '',
  prof_titulo TEXT DEFAULT '',
  prof_descripcion TEXT DEFAULT '',
  prof_foto_url TEXT DEFAULT '',

  -- Características (4 tarjetas) en formato JSON
  caracteristicas JSONB DEFAULT '[]'::jsonb,

  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar datos iniciales
INSERT INTO pagina_nosotros (
  titulo_principal, subtitulo_principal, texto_historia,
  prof_nombre, prof_titulo, prof_descripcion,
  caracteristicas
) VALUES (
  'Conoce al Prof. Bruno Díaz',
  'Profesor de ingeniería con años de experiencia ayudando a estudiantes.',
  'Academia El Profe Oficial fue fundada por el Prof. Bruno Díaz, docente universitario con una pasión inquebrantable por la enseñanza de las ciencias básicas para ingeniería. Lo que comenzó como grabaciones compartidas por Drive se transformó en una plataforma educativa completa con videos y PDF para que los alumnos aprueben sus exámenes parciales y finales.',
  'Prof. Bruno Díaz',
  'Fundador de Academia El Profe',
  'Profesor universitario con amplia experiencia en la enseñanza de Cálculo 1,2,3, Física, Ecuaciones Diferenciales, Estática, Termodinámica y otras asignaturas de ciencias e ingeniería.',
  '[
    {"icono": "graduation-cap", "titulo": "Enfoque UTP", "descripcion": "Cada curso está diseñado específicamente para los ciclos, sílabos y exigencias de la Universidad Tecnológica del Perú. No es contenido genérico; es contenido que responde exactamente a lo que te examinan."},
    {"icono": "award", "titulo": "Experiencia Docente", "descripcion": "El Prof. Kali Bruno Díaz cuenta con más de 10 años de experiencia enseñando matemáticas y física a nivel universitario. Su metodología clara y directa ha ayudado a miles de estudiantes a aprobar sus cursos."},
    {"icono": "users", "titulo": "Comunidad Activa", "descripcion": "Más de 5,000 estudiantes confían en Academia El Profe Oficial. Cada curso cuenta con un sistema de preguntas y respuestas donde puedes resolver tus dudas con compañeros y el profesor."},
    {"icono": "shield-check", "titulo": "Garantía de Calidad", "descripcion": "Si el curso no cumple tus expectativas, ofrecemos una garantía de devolución de 7 días. Además, todos los cursos incluyen acceso de por vida y actualizaciones gratuitas del contenido."}
  ]'::jsonb
)
ON CONFLICT DO NOTHING;

-- Políticas RLS (Seguridad a nivel de fila)
ALTER TABLE pagina_nosotros ENABLE ROW LEVEL SECURITY;

-- Permitir lectura pública (la página /nosotros necesita ver los datos)
CREATE POLICY "Lectura pública"
ON pagina_nosotros FOR SELECT
USING (true);

-- Solo admins pueden actualizar (por correo)
CREATE POLICY "Solo admins pueden actualizar"
ON pagina_nosotros FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.email LIKE '%@academiaelprofeoficial.com'
  )
);
