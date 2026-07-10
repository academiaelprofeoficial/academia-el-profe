# PCA Project Context

## Project
Name: Project Brief - nextjs_tailwind_shadcn_ts

Academia El Profe Oficial

## Stack
# Stack

[Document languages, frameworks, services, and runtime requirements.]

## Architecture
# Architecture

[Describe the system architecture and major technical decisions.]

## Git
Active branch: main

## Latest Context Commits
- 2026-07-02T23:52:20.470Z [product] Bootstrap: initial context snapshot generated
- 2026-07-02T23:50:51.742Z [general] sistema de comentarios + pagos + PWA + UI fixes

- Comentarios reales por clase (Prisma Comment model + API + UI)
- Botones de pago directo MP (PEN) y PayPal (USD) en cards y temario
- FixedBuyBar + MobileBottomBar con WhatsApp/App/Tema
- PWA instalable con boton dorado, detecta standalone
- Lightning WebGL background + Particles canvas effect
- Fix: back link dinamico, video sin autoplay, reading progress bar
- Cards alineadas con flex-1/mt-auto, UTP slug mapping
- 2026-07-02T23:50:43.104Z [general] restructura schema courses - videos anidados en topics

- Schema Sanity: classVideos y materials movidos DENTRO de cada topic
- Eliminados arrays planos classVideos/topicMaterials del nivel curso
- Eliminado fuzzy matching (normalize/topicMatchScore/findBestTopic)
- GROQ queries, interfaces TS, seed data actualizados
- Fix: TemarioPageClient lee estructura anidada directamente
- 2026-07-02T23:50:26.087Z [general] initial project setup - Academia El Profe platform

Next.js 15 + Sanity CMS + Prisma + Tailwind 4 + TypeScript.
Plataforma educativa SaaS con cursos, auth Firebase, pagos MP/PayPal, PWA.

## Active Decisions
No active decisions file found.
