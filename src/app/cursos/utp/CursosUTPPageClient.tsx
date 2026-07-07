'use client';

// ============================================================
// Cursos UTP — Página pública (sin auth, sin dashboard)
// Ruta: /cursos/utp
// Muestra los mismos cursos que /dashboard/cursos/utp pero público
// ============================================================

import { useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import {
  Video,
  FileText,
  ShoppingCart,
  ListChecks,
  Search,
  Loader2,
  ArrowLeft,
  Zap,
  BookOpen,
} from 'lucide-react';
import { formatoSoles, formatoUSD } from '@/lib/formato';
import { plainText } from '@/lib/sanity.client';
import { useAuth } from '@/lib/auth-context';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { Footer } from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import type { SanityCourse } from '@/lib/sanity.client';

function extractHex(color?: string): string {
  return color || '#10B981';
}



