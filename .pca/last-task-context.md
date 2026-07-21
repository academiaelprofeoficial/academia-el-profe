# PCA Task Context

## Task
hacer editable la pagina nosotros en sanity presentation overlay

## Mode
local-only — No vector retrieval. Context built from local memory files.

## Project Memory
# PCA Index — nextjs_tailwind_shadcn_ts

## Project
Academia El Profe Oficial

## Stack
Next.js 15, Sanity CMS, Prisma (PostgreSQL), Firebase Auth, MercadoPago, PayPal, Tailwind CSS 4, shadcn/ui, Framer Motion, GSAP

## Project Structure
src/

## Current Status
Plataforma educativa SaaS de refuerzo academico para estudiantes de ingenieria. Cursos de calculo, mecanica, fluidos, estadistica. Next.js 15, Sanity CMS, Prisma, Firebase, Tailwind 4.

## Key Decisions
Sanity CMS como fuente de datos principal. Videos anidados dentro de topics del curso. Comentarios via Prisma. Pagos con MP (PEN) y PayPal (USD). PWA instalable con service worker.

## Off-limits
Terminado: schema, pagos, comentarios, PWA, UI responsive. Pendiente: seed CMS para cursos faltantes, contenido de calculo-vectorial/fisica-1/fisica-2.

## Memory
This file is the source of truth for PCA context memory.
Updated: 2026-07-02T23:52:20.467Z

## Relevant Context Commits
- [general] hidden field para ocultar cursos sin eliminar (2026-07-09T04:29:48.043Z)
- [general] SecureVideo - proteccion contra grabacion en videos de cursos (2026-07-07T01:52:04.980Z)
- [general] cursos 100% editables desde CMS con grupo y color personalizado (2026-07-06T23:06:31.841Z)
- [general] cursos UTP independientes - 10 nuevos cursos exclusivos

- DASHBOARD_COURSES ahora tiene 10 cursos solo UTP con slugs unicos
- Sin relacion con cursos generales (Sanity CMS)
- Cursos: CALCULO 1/2, CALCULO TOMA DECISIONES, CALCULO AVANZADO,
  ESTATICA UTP, MECANICA CLASICA, ELECTROMAGNETISMO, FLUIDOS Y
  TERMODINAMICA, QUIMICA GENERAL, QUIMICA INORGANICA
- Agregados colores: cyan-600, lime-600, rose-600 (2026-07-05T22:09:56.934Z)
- [general] restructura schema courses - videos anidados en topics

- Schema Sanity: classVideos y materials movidos DENTRO de cada topic
- Eliminados arrays planos classVideos/topicMaterials del nivel curso
- Eliminado fuzzy matching (normalize/topicMatchScore/findBestTopic)
- GROQ queries, interfaces TS, seed data actualizados
- Fix: TemarioPageClient lee estructura anidada directamente (2026-07-02T23:50:43.104Z)
- [general] initial project setup - Academia El Profe platform

Next.js 15 + Sanity CMS + Prisma + Tailwind 4 + TypeScript.
Plataforma educativa SaaS con cursos, auth Firebase, pagos MP/PayPal, PWA. (2026-07-02T23:50:26.087Z)

## Agent Instructions
Use the project memory above as your only context source.
Do not read the full pca/ folder.
Do not invent decisions not listed here.
Validate before marking task as done.
When done, ask: Is this task complete?
