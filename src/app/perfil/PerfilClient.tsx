'use client';

// ============================================================
// /perfil — Página de Perfil Completa del Estudiante
// Tabs: Información Personal + Seguridad
// Foto: comprime client-side y guarda como base64 data URI
// Diseño: adaptado al proyecto (dark/light, brand-primary, CSS vars)
// Auth: Firebase + Prisma via /api/user/profile
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  User,
  Camera,
  Mail,
  Phone,
  MapPin,
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
  Shield,
  Lock,
  Eye,
  EyeOff,
  MessageSquare,
  Heart,
  Clock,
  FileText,
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
  { value: 'PUCP', label: 'Pontificia Universidad Católica del Perú (PUCP)' },
  { value: 'Otra', label: 'Otra' },
] as const;

const GENEROS = [
  { value: '', label: 'Selecciona' },
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'otro', label: 'Otro' },
] as const;

interface ProfileData {
  id: string;
  email: string;
  name: string | null;
  photoURL: string | null;
  role: string;
  phone: string | null;
  address: string | null;
  age: number | null;
  birthDate: string | null;
  gender: string | null;
  university: string | null;
  career: string | null;
  biography: string | null;
  createdAt: string;
  _count: {
    purchases: number;
    progress: number;
    wishlist: number;
    comments: number;
  };
}

type TabId = 'personal' | 'seguridad';

/* ------------------------------------------------------------------ */
/*  Image compression helper                                            */
/* ------------------------------------------------------------------ */

function compressImage(file: File, maxWidth = 400, quality = 0.8): Promise<string> {
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
/*  Input Component                                                     */
/* ------------------------------------------------------------------ */

function FieldInput({
  icon: Icon,
  label,
  children,
}: {
  icon: any;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
        <Icon className="h-4 w-4 text-brand-primary" />
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  'w-full h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-colors';

const selectClass =
  'w-full h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-colors appearance-none cursor-pointer';

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
  const [activeTab, setActiveTab] = useState<TabId>('personal');

  // Form state — personal
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    age: '',
    birthDate: '',
    gender: '',
    university: '',
    career: '',
    biography: '',
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [pendingPhotoURL, setPendingPhotoURL] = useState<string | null>(null);

  // Password state
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Fetch profile
  const fetchProfile = useCallback(async () => {
    if (!idToken) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/user/profile', {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.profile) {
        setProfile(data.profile);
        setFormData({
          name: data.profile.name || '',
          phone: data.profile.phone || '',
          address: data.profile.address || '',
          age: data.profile.age ? String(data.profile.age) : '',
          birthDate: data.profile.birthDate || '',
          gender: data.profile.gender || '',
          university: data.profile.university || '',
          career: data.profile.career || '',
          biography: data.profile.biography || '',
        });
        setPhotoPreview(data.profile.photoURL || null);
      } else {
        const msg = data?.error || `Error del servidor (${res.status})`;
        setError(msg);
        console.error('[Perfil] Error cargando perfil:', msg);
      }
    } catch (err: any) {
      const msg = err?.message || 'Error de conexión. Verifica tu internet.';
      setError(msg);
      console.error('[Perfil] Error de conexión:', err);
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
        phone: formData.phone || null,
        address: formData.address || null,
        age: formData.age ? Number(formData.age) : null,
        birthDate: formData.birthDate || null,
        gender: formData.gender || null,
        university: formData.university || null,
        career: formData.career || null,
        biography: formData.biography || null,
      };

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
        phone: profile.phone || '',
        address: profile.address || '',
        age: profile.age ? String(profile.age) : '',
        birthDate: profile.birthDate || '',
        gender: profile.gender || '',
        university: profile.university || '',
        career: profile.career || '',
        biography: profile.biography || '',
      });
      setPhotoPreview(profile.photoURL || null);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (!idToken) return;

    if (passwordData.newPassword.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Las contraseñas no coinciden.');
      return;
    }

    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(false);

    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ newPassword: passwordData.newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordError(data.error || 'Error al cambiar contraseña.');
        return;
      }

      setPasswordSuccess(true);
      setPasswordData({ newPassword: '', confirmPassword: '' });
      setShowPassword(false);
      setShowConfirm(false);
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch {
      setPasswordError('Error de conexión. Intenta de nuevo.');
    } finally {
      setPasswordLoading(false);
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

  const displayName =
    profile?.name || user?.displayName || user?.email?.split('@')[0] || 'Estudiante';
  const initials = displayName.charAt(0).toUpperCase();

  const tabs: { id: TabId; label: string; icon: any }[] = [
    { id: 'personal', label: 'Información Personal', icon: User },
    { id: 'seguridad', label: 'Seguridad', icon: Shield },
  ];

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

          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Mi Perfil
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Gestiona tu información personal y configuración de seguridad
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setError(null);
                    setSuccess(false);
                    setPasswordError(null);
                    setPasswordSuccess(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? 'border-brand-primary text-brand-primary'
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Cargando perfil...</p>
            </div>
          )}

          {/* Error state — show error with retry */}
          {!loading && error && !profile && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
                <X className="h-8 w-8 text-red-500" />
              </div>
              <div className="text-center max-w-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Error al cargar el perfil
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  {error}
                </p>
                <button
                  onClick={fetchProfile}
                  className="inline-flex items-center gap-2 h-10 px-6 rounded-lg bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold transition-colors"
                >
                  <Loader2 className="h-4 w-4" />
                  Reintentar
                </button>
              </div>
            </div>
          )}

          {!loading && profile && (
            <>
              {/* ===================== TAB: PERSONAL ===================== */}
              {activeTab === 'personal' && (
                <div className="space-y-6">
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
                          <FieldInput icon={User} label="Nombre completo">
                            <input
                              type="text"
                              value={formData.name}
                              onChange={(e) =>
                                setFormData((p) => ({ ...p, name: e.target.value }))
                              }
                              className={inputClass}
                              placeholder="Tu nombre completo"
                              maxLength={100}
                            />
                          </FieldInput>

                          {/* Email (read-only) */}
                          <FieldInput icon={Mail} label="Correo electrónico">
                            <input
                              type="email"
                              value={profile.email}
                              disabled
                              className="w-full h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-400 cursor-not-allowed"
                            />
                            <p className="text-[11px] text-slate-400 mt-1">
                              El correo no se puede cambiar.
                            </p>
                          </FieldInput>

                          {/* Phone + Age row */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FieldInput icon={Phone} label="Teléfono">
                              <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) =>
                                  setFormData((p) => ({ ...p, phone: e.target.value }))
                                }
                                className={inputClass}
                                placeholder="+51 999 999 999"
                                maxLength={20}
                              />
                            </FieldInput>

                            <FieldInput icon={Calendar} label="Edad">
                              <input
                                type="number"
                                value={formData.age}
                                onChange={(e) =>
                                  setFormData((p) => ({ ...p, age: e.target.value }))
                                }
                                className={inputClass}
                                placeholder="Ej: 20"
                                min={10}
                                max={120}
                              />
                            </FieldInput>
                          </div>

                          {/* Birth Date + Gender row */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FieldInput icon={Calendar} label="Fecha de nacimiento">
                              <input
                                type="date"
                                value={formData.birthDate}
                                onChange={(e) =>
                                  setFormData((p) => ({ ...p, birthDate: e.target.value }))
                                }
                                className={inputClass}
                              />
                            </FieldInput>

                            <FieldInput icon={User} label="Género">
                              <select
                                value={formData.gender}
                                onChange={(e) =>
                                  setFormData((p) => ({ ...p, gender: e.target.value }))
                                }
                                className={selectClass}
                              >
                                {GENEROS.map((g) => (
                                  <option key={g.value} value={g.value}>
                                    {g.label}
                                  </option>
                                ))}
                              </select>
                            </FieldInput>
                          </div>

                          {/* Address */}
                          <FieldInput icon={MapPin} label="Dirección">
                            <input
                              type="text"
                              value={formData.address}
                              onChange={(e) =>
                                setFormData((p) => ({ ...p, address: e.target.value }))
                              }
                              className={inputClass}
                              placeholder="Ciudad, País"
                              maxLength={200}
                            />
                          </FieldInput>

                          {/* University + Career row */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FieldInput icon={GraduationCap} label="Universidad">
                              <select
                                value={formData.university}
                                onChange={(e) =>
                                  setFormData((p) => ({ ...p, university: e.target.value }))
                                }
                                className={selectClass}
                              >
                                {UNIVERSIDADES.map((u) => (
                                  <option key={u.value} value={u.value}>
                                    {u.label}
                                  </option>
                                ))}
                              </select>
                            </FieldInput>

                            <FieldInput icon={Briefcase} label="Carrera / Especialidad">
                              <input
                                type="text"
                                value={formData.career}
                                onChange={(e) =>
                                  setFormData((p) => ({ ...p, career: e.target.value }))
                                }
                                className={inputClass}
                                placeholder="Ej: Ingeniería Industrial"
                                maxLength={150}
                              />
                            </FieldInput>
                          </div>

                          {/* Biography */}
                          <FieldInput icon={MessageSquare} label="Biografía">
                            <textarea
                              value={formData.biography}
                              onChange={(e) =>
                                setFormData((p) => ({ ...p, biography: e.target.value }))
                              }
                              rows={3}
                              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-colors resize-none"
                              placeholder="Cuéntanos un poco sobre ti..."
                              maxLength={500}
                            />
                            <p className="text-[11px] text-slate-400 mt-1 text-right">
                              {formData.biography.length}/500
                            </p>
                          </FieldInput>

                          {/* Delete photo option when editing */}
                          {photoPreview && (
                            <button
                              type="button"
                              onClick={() => {
                                setPendingPhotoURL('');
                                setPhotoPreview(null);
                              }}
                              className="text-sm text-red-500 hover:text-red-400 transition-colors"
                            >
                              Eliminar foto de perfil
                            </button>
                          )}

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
                            <InfoRow icon={Phone} label="Teléfono" value={profile.phone || 'No especificado'} />
                            <InfoRow icon={MapPin} label="Dirección" value={profile.address || 'No especificada'} />
                            <InfoRow icon={Calendar} label="Edad" value={profile.age ? `${profile.age} años` : 'No especificada'} />
                            <InfoRow
                              icon={Calendar}
                              label="Fecha de nacimiento"
                              value={
                                profile.birthDate
                                  ? new Date(profile.birthDate + 'T00:00:00').toLocaleDateString('es-PE', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                    })
                                  : 'No especificada'
                              }
                            />
                            <InfoRow
                              icon={User}
                              label="Género"
                              value={
                                profile.gender
                                  ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)
                                  : 'No especificado'
                              }
                            />
                            <InfoRow
                              icon={GraduationCap}
                              label="Universidad"
                              value={
                                UNIVERSIDADES.find((u) => u.value === profile.university)?.label ||
                                profile.university ||
                                'No especificada'
                              }
                            />
                            <InfoRow icon={Briefcase} label="Carrera" value={profile.career || 'No especificada'} />
                          </div>

                          {/* Biography */}
                          {profile.biography && (
                            <div className="pt-2">
                              <span className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                                <MessageSquare className="h-4 w-4 text-brand-primary" />
                                Biografía
                              </span>
                              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                {profile.biography}
                              </p>
                            </div>
                          )}

                          {/* Stats */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                            <StatCard icon={BookOpen} value={String(profile._count.purchases)} label="Cursos" />
                            <StatCard icon={Clock} value={String(profile._count.progress)} label="Progresos" />
                            <StatCard icon={Heart} value={String(profile._count.wishlist)} label="Deseos" />
                            <StatCard icon={FileText} value={String(profile._count.comments)} label="Comentarios" />
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
                    Miembro desde{' '}
                    {new Date(profile.createdAt).toLocaleDateString('es-PE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              )}

              {/* ===================== TAB: SEGURIDAD ===================== */}
              {activeTab === 'seguridad' && (
                <div className="space-y-6">
                  {/* Password success */}
                  {passwordSuccess && (
                    <div className="flex items-center gap-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 px-5 py-4">
                      <Check className="h-5 w-5 text-emerald-600 shrink-0" />
                      <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                        Contraseña actualizada correctamente
                      </p>
                    </div>
                  )}

                  {/* Password error */}
                  {passwordError && (
                    <div className="flex items-center gap-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 px-5 py-4">
                      <X className="h-5 w-5 text-red-500 shrink-0" />
                      <p className="text-sm font-medium text-red-800 dark:text-red-300">
                        {passwordError}
                      </p>
                    </div>
                  )}

                  {/* Change Password Card */}
                  <div className="bg-white dark:bg-[var(--surface-1)] rounded-2xl border border-slate-200 dark:border-[var(--surface-border)] overflow-hidden shadow-sm">
                    <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Lock className="h-5 w-5 text-brand-primary" />
                        Cambiar Contraseña
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Actualiza tu contraseña para mantener tu cuenta segura
                      </p>
                    </div>

                    <div className="px-6 py-6 space-y-5">
                      {/* New password */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                          <Lock className="h-4 w-4 text-brand-primary" />
                          Nueva contraseña
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) =>
                              setPasswordData((p) => ({ ...p, newPassword: e.target.value }))
                            }
                            className={inputClass + ' pr-11'}
                            placeholder="Mínimo 6 caracteres"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Mínimo 6 caracteres
                        </p>
                      </div>

                      {/* Confirm password */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                          <Lock className="h-4 w-4 text-brand-primary" />
                          Confirmar nueva contraseña
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirm ? 'text' : 'password'}
                            value={passwordData.confirmPassword}
                            onChange={(e) =>
                              setPasswordData((p) => ({
                                ...p,
                                confirmPassword: e.target.value,
                              }))
                            }
                            className={inputClass + ' pr-11'}
                            placeholder="Repite tu nueva contraseña"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                          >
                            {showConfirm ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Password strength indicator */}
                      {passwordData.newPassword.length > 0 && (
                        <div className="space-y-1">
                          <div className="flex gap-1.5">
                            {[1, 2, 3, 4].map((level) => {
                              const strength = getPasswordStrength(passwordData.newPassword);
                              const colors = [
                                'bg-red-500',
                                'bg-orange-500',
                                'bg-yellow-500',
                                'bg-emerald-500',
                              ];
                              const isActive = strength >= level;
                              return (
                                <div
                                  key={level}
                                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                                    isActive ? colors[strength - 1] : 'bg-slate-200 dark:bg-slate-700'
                                  }`}
                                />
                              );
                            })}
                          </div>
                          <p className="text-[11px] text-slate-400">
                            {getPasswordStrengthLabel(passwordData.newPassword)}
                          </p>
                        </div>
                      )}

                      {/* Submit */}
                      <button
                        onClick={handleChangePassword}
                        disabled={passwordLoading || passwordData.newPassword.length < 6}
                        className="w-full h-11 rounded-lg bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                      >
                        {passwordLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Shield className="h-4 w-4" />
                        )}
                        {passwordLoading ? 'Actualizando...' : 'Cambiar Contraseña'}
                      </button>
                    </div>
                  </div>

                  {/* Security Info Card */}
                  <div className="bg-white dark:bg-[var(--surface-1)] rounded-2xl border border-slate-200 dark:border-[var(--surface-border)] overflow-hidden shadow-sm">
                    <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Shield className="h-5 w-5 text-brand-primary" />
                        Información de la Cuenta
                      </h2>
                    </div>

                    <div className="px-6 py-5 space-y-4">
                      {/* Last login */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            Último acceso
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {user?.metadata?.lastSignInTime
                              ? new Date(user.metadata.lastSignInTime).toLocaleString('es-PE')
                              : 'No disponible'}
                          </p>
                        </div>
                        <Check className="h-5 w-5 text-emerald-500" />
                      </div>

                      {/* Account creation */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            Cuenta creada
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {user?.metadata?.creationTime
                              ? new Date(user.metadata.creationTime).toLocaleDateString('es-PE', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })
                              : 'No disponible'}
                          </p>
                        </div>
                        <Calendar className="h-5 w-5 text-brand-primary" />
                      </div>

                      {/* Provider info */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            Proveedor de acceso
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {user?.providerData?.[0]?.providerId === 'google.com'
                              ? 'Google'
                              : user?.providerData?.[0]?.providerId === 'password'
                                ? 'Email y contraseña'
                                : user?.providerData?.[0]?.providerId || 'Email'}
                          </p>
                        </div>
                        <Mail className="h-5 w-5 text-brand-primary" />
                      </div>
                    </div>
                  </div>

                  {/* Danger zone */}
                  <div className="bg-white dark:bg-[var(--surface-1)] rounded-2xl border border-slate-200 dark:border-[var(--surface-border)] overflow-hidden shadow-sm">
                    <div className="px-6 py-5">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                        Zona de Peligro
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        Estas acciones no se pueden deshacer.
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        Para eliminar tu cuenta o solicitar la baja de tus datos, contacta al soporte.
                      </p>
                    </div>
                  </div>
                </div>
              )}
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

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
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

function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: any;
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
      <Icon className="h-4 w-4 text-brand-primary" />
      <span className="text-lg font-bold text-slate-900 dark:text-white">{value}</span>
      <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Password strength helper                                            */
/* ------------------------------------------------------------------ */

function getPasswordStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(4, score);
}

function getPasswordStrengthLabel(password: string): string {
  const strength = getPasswordStrength(password);
  switch (strength) {
    case 1:
      return 'Débil';
    case 2:
      return 'Regular';
    case 3:
      return 'Buena';
    case 4:
      return 'Excelente';
    default:
      return 'Muy débil';
  }
}