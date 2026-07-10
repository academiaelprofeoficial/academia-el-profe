'use client';

// ============================================================
// /perfil — Página de Perfil del Estudiante
// Lee y actualiza perfil via API /api/user/profile
// Foto: comprime client-side y guarda como base64 data URI
// Diseño: glassmorphism, responsive, tema dark/light
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  User,
  Camera,
  Mail,
  Calendar,
  GraduationCap,
  Briefcase,
  BookOpen,
  Loader2,
  Check,
  X,
  ArrowLeft,
  Edit3,
  Save,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { MobileBottomBar } from '@/components/MobileBottomBar';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const UNIVERSIDADES = [
  { value: '', label: 'Selecciona una universidad' },
  { value: 'UNI', label: 'Universidad Nacional de Ingeniería (UNI)' },
  { value: 'UNMSM', label: 'Universidad Nacional Mayor de San Marcos (UNMSM)' },
  { value: 'UNAC', label: 'Universidad Nacional del Callao (UNAC)' },
  { value: 'UTP', label: 'Universidad Tecnológica del Perú (UTP)' },
  { value: 'ULima', label: 'Universidad de Lima (ULima)' },
  { value: 'UPC', label: 'Universidad Peruana de Ciencias Aplicadas (UPC)' },
  { value: 'Continental', label: 'Universidad Continental' },
  { value: 'UCV', label: 'Universidad César Vallejo (UCV)' },
  { value: 'UPT', label: 'Universidad Privada de Tacna (UPT)' },
  { value: 'Otra', label: 'Otra' },
] as const;

interface ProfileData {
  id: string;
  email: string;
  name: string | null;
  photoURL: string | null;
  role: string;
  age: number | null;
  university: string | null;
  career: string | null;
  createdAt: string;
  _count: {
    purchases: number;
    progress: number;
    wishlist: number;
    comments: number;
  };
}

/* ------------------------------------------------------------------ */
/*  Image compression helper                                            */
/* ------------------------------------------------------------------ */

function compressImage(file: File, maxWidth = 300, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(maxWidth / img.width, maxWidth / img.height, 1);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function PerfilClient() {
  const { user, idToken, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    university: '',
    career: '',
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [pendingPhotoURL, setPendingPhotoURL] = useState<string | null>(null);

  // Fetch profile
  const fetchProfile = useCallback(async () => {
    if (!idToken) return;
    setLoading(true);
    try {
      const res = await fetch('/api/user/profile', {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        setFormData({
          name: data.profile.name || '',
          age: data.profile.age ? String(data.profile.age) : '',
          university: data.profile.university || '',
          career: data.profile.career || '',
        });
        setPhotoPreview(data.profile.photoURL || null);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [idToken]);

  useEffect(() => {
    if (!authLoading && !user) return;
    if (idToken) fetchProfile();
  }, [idToken, authLoading, user, fetchProfile]);

  // Handle file change
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen debe ser menor a 5 MB.');
      return;
    }

    try {
      const compressed = await compressImage(file);
      setPendingPhotoURL(compressed);
      setPhotoPreview(compressed);
    } catch {
      setError('Error al procesar la imagen.');
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Save profile
  const handleSave = async () => {
    if (!idToken) return;
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const body: any = {
        name: formData.name,
        age: formData.age ? Number(formData.age) : null,
        university: formData.university || null,
        career: formData.career || null,
      };

      // Only send photoURL if changed
      if (pendingPhotoURL) {
        body.photoURL = pendingPhotoURL;
      }

      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Error al guardar.');
        return;
      }

      const data = await res.json();
      setProfile(data.profile);
      setPendingPhotoURL(null);
      setIsEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setPendingPhotoURL(null);
    setError(null);
    if (profile) {
      setFormData({
        name: profile.name || '',
        age: profile.age ? String(profile.age) : '',
        university: profile.university || '',
        career: profile.career || '',
      });
      setPhotoPreview(profile.photoURL || null);
    }
  };

  // Not authenticated
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
        <LandingHeader />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
          <User className="h-16 w-16 text-slate-300 dark:text-slate-600" />
          <p className="text-slate-500 dark:text-slate-400 text-center">
            Inicia sesión para ver tu perfil
          </p>
          <Link
            href="/iniciar-sesion"
            className="inline-flex items-center gap-2 h-10 px-6 rounded-lg bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold transition-colors"
          >
            Iniciar sesión
          </Link>
        </div>
        <MobileBottomBar />
      </div>
    );
  }

  const displayName = profile?.name || user?.displayName || user?.email?.split('@')[0] || 'Estudiante';
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <LandingHeader />

      <main className="flex-1 px-4 sm:px-6 py-6 lg:py-10">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Back link */}
          <Link
            href="/dashboard/cursos"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Mis Cursos
          </Link>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
            </div>
          )}

          {!loading && profile && (
            <>
              {/* Success banner */}
              {success && (
                <div className="flex items-center gap-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 px-5 py-4">
                  <Check className="h-5 w-5 text-emerald-600 shrink-0" />
                  <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                    Perfil actualizado correctamente
                  </p>
                </div>
              )}

              {/* Error banner */}
              {error && (
                <div className="flex items-center gap-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 px-5 py-4">
                  <X className="h-5 w-5 text-red-500 shrink-0" />
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
                </div>
              )}

              {/* Profile Card */}
              <div className="bg-white dark:bg-[var(--surface-1)] rounded-2xl border border-slate-200 dark:border-[var(--surface-border)] overflow-hidden shadow-sm">
                {/* Header with avatar */}
                <div className="bg-brand-primary px-6 py-8 flex flex-col items-center relative">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white/30 shadow-lg">
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Foto de perfil"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-white/20 flex items-center justify-center">
                          <span className="text-4xl sm:text-5xl font-bold text-white/90">
                            {initials}
                          </span>
                        </div>
                      )}
                    </div>

                    {isEditing && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-1 right-1 h-9 w-9 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
                      >
                        <Camera className="h-4 w-4 text-brand-primary" />
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>

                  <h1 className="mt-4 text-xl sm:text-2xl font-bold text-white text-center">
                    {displayName}
                  </h1>
                  <p className="text-sm text-white/70 mt-1">{profile.email}</p>
                </div>

                {/* Body */}
                <div className="px-6 py-6 space-y-6">
                  {isEditing ? (
                    /* ---- EDIT MODE ---- */
                    <div className="space-y-5">
                      {/* Name */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                          <User className="h-4 w-4 text-brand-primary" />
                          Nombre completo
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                          className="w-full h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-colors"
                          placeholder="Tu nombre completo"
                          maxLength={100}
                        />
                      </div>

                      {/* Email (read-only) */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                          <Mail className="h-4 w-4 text-slate-400" />
                          Correo electrónico
                        </label>
                        <input
                          type="email"
                          value={profile.email}
                          disabled
                          className="w-full h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-400 cursor-not-allowed"
                        />
                        <p className="text-[11px] text-slate-400 mt-1">El correo no se puede cambiar.</p>
                      </div>

                      {/* Age */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                          <Calendar className="h-4 w-4 text-brand-primary" />
                          Edad
                        </label>
                        <input
                          type="number"
                          value={formData.age}
                          onChange={(e) => setFormData((p) => ({ ...p, age: e.target.value }))}
                          className="w-full h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-colors"
                          placeholder="Ej: 20"
                          min={10}
                          max={120}
                        />
                      </div>

                      {/* University */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                          <GraduationCap className="h-4 w-4 text-brand-primary" />
                          Universidad
                        </label>
                        <select
                          value={formData.university}
                          onChange={(e) => setFormData((p) => ({ ...p, university: e.target.value }))}
                          className="w-full h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-colors"
                        >
                          {UNIVERSIDADES.map((u) => (
                            <option key={u.value} value={u.value}>
                              {u.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Career */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                          <Briefcase className="h-4 w-4 text-brand-primary" />
                          Carrera / Especialidad
                        </label>
                        <input
                          type="text"
                          value={formData.career}
                          onChange={(e) => setFormData((p) => ({ ...p, career: e.target.value }))}
                          className="w-full h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-colors"
                          placeholder="Ej: Ingeniería Industrial"
                          maxLength={150}
                        />
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="flex-1 h-11 rounded-lg bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                        >
                          {saving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          {saving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                        <button
                          onClick={cancelEdit}
                          disabled={saving}
                          className="flex-1 h-11 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-60"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ---- VIEW MODE ---- */
                    <div className="space-y-5">
                      {/* Info rows */}
                      <div className="space-y-0">
                        <InfoRow icon={User} label="Nombre" value={profile.name || 'No especificado'} />
                        <InfoRow icon={Mail} label="Correo" value={profile.email} />
                        <InfoRow icon={Calendar} label="Edad" value={profile.age ? `${profile.age} años` : 'No especificada'} />
                        <InfoRow icon={GraduationCap} label="Universidad" value={UNIVERSIDADES.find((u) => u.value === profile.university)?.label || profile.university || 'No especificada'} />
                        <InfoRow icon={Briefcase} label="Carrera" value={profile.career || 'No especificada'} />
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                        <StatCard icon={BookOpen} value={String(profile._count.purchases)} label="Cursos" />
                        <StatCard icon={BookOpen} value={String(profile._count.progress)} label="Progresos" />
                        <StatCard icon={BookOpen} value={String(profile._count.wishlist)} label="Deseos" />
                        <StatCard icon={BookOpen} value={String(profile._count.comments)} label="Comentarios" />
                      </div>

                      {/* Edit button */}
                      <button
                        onClick={() => setIsEditing(true)}
                        className="w-full h-12 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                      >
                        <Edit3 className="h-4 w-4" />
                        Editar Perfil
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Account info */}
              <div className="text-center text-xs text-slate-400 dark:text-slate-500">
                Miembro desde {new Date(profile.createdAt).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </>
          )}
        </div>
      </main>

      <MobileBottomBar />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Icon className="h-4 w-4" />
        {label}
      </span>
      <span className="text-sm font-medium text-slate-900 dark:text-slate-100 text-right max-w-[60%] truncate">
        {value}
      </span>
    </div>
  );
}

function StatCard({ icon: Icon, value, label }: { icon: any; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
      <Icon className="h-4 w-4 text-brand-primary" />
      <span className="text-lg font-bold text-slate-900 dark:text-white">{value}</span>
      <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</span>
    </div>
  );
}