'use client';

// ============================================================
// Página de Iniciar Sesión — Academia El Profe Oficial
// Diseño premium con Google + Email/Password
// Framer Motion + shadcn/ui + react-hook-form + zod
// ============================================================

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  BookOpen,
  Shield,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  signInWithEmail,
  signInWithGoogle,
  resetPassword,
} from '@/lib/firebase';
// LandingHeader intentionally omitted — auth pages are full-screen focused

// --- Zod Schema ---
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo es obligatorio')
    .email('Ingresa un correo válido'),
  password: z
    .string()
    .min(1, 'La contraseña es obligatoria')
    .min(6, 'Mínimo 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

// --- Animaciones ---
const EASE_OUT: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

const containerVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: EASE_OUT,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.1 + i * 0.07,
      duration: 0.4,
      ease: EASE_OUT,
    },
  }),
};

const shakeVariants = {
  shake: {
    x: [0, -8, 8, -6, 6, -3, 3, 0] as number[],
    transition: { duration: 0.5 },
  },
};

export function IniciarSesionClient() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const triggerShake = () => setShakeKey((k) => k + 1);

  // --- Iniciar sesión con Email/Password ---
  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError(null);
    try {
      const loggedInUser = await signInWithEmail(data.email, data.password);
      // Verificar si es admin después del sync
      const idToken = await loggedInUser.getIdToken();
      try {
        const syncRes = await fetch('/api/user/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        });
        if (syncRes.ok) {
          const syncData = await syncRes.json();
          if (syncData.role === 'admin') {
            router.push('/admin');
            return;
          }
        }
      } catch { /* si falla el check, ir al dashboard normal */ }
      router.push('/dashboard/cursos');
    } catch (err: unknown) {
      triggerShake();
      const firebaseErr = err as { code?: string };
      switch (firebaseErr.code) {
        case 'auth/user-not-found':
          setError('No existe una cuenta con este correo');
          break;
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError('Contraseña incorrecta');
          break;
        case 'auth/invalid-email':
          setError('Correo electrónico no válido');
          break;
        case 'auth/too-many-requests':
          setError('Demasiados intentos. Intenta más tarde');
          break;
        default:
          setError('Error al iniciar sesión. Intenta de nuevo');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- Iniciar sesión con Google ---
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const loggedInUser = await signInWithGoogle();
      // Verificar si es admin después del sync
      const idToken = await loggedInUser.getIdToken();
      try {
        const syncRes = await fetch('/api/user/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        });
        if (syncRes.ok) {
          const syncData = await syncRes.json();
          if (syncData.role === 'admin' || loggedInUser.email === 'academiaelprofeoficial@gmail.com') {
            router.push('/admin');
            return;
          }
        }
      } catch { /* si falla el check, verificar por email */ }
      // Fallback: verificar por email
      if (loggedInUser.email === 'academiaelprofeoficial@gmail.com') {
        router.push('/admin');
        return;
      }
      router.push('/dashboard/cursos');
    } catch (err: unknown) {
      triggerShake();
      const firebaseErr = err as { code?: string };
      if (firebaseErr.code === 'auth/popup-closed-by-user') {
        setError('Ventana cerrada. Intenta de nuevo');
      } else {
        setError('Error con Google. Intenta de nuevo');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // --- Recuperar contraseña ---
  const handleResetPassword = async () => {
    const email = getValues('email');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Ingresa tu correo primero para recuperar la contraseña');
      return;
    }
    setIsLoading(true);
    try {
      await resetPassword(email);
      setResetSent(true);
      setError(null);
    } catch {
      setError('No se pudo enviar el correo de recuperación');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-dvh overflow-hidden flex items-center justify-center px-4 bg-slate-50/50 dark:bg-slate-950">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-[440px]"
        >
          {/* ====== Enlace volver ====== */}
          <motion.div variants={itemVariants} custom={0}>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-heading dark:hover:text-slate-200 transition-colors mb-4 md:mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio
            </Link>
          </motion.div>

          {/* ====== Card principal ====== */}
          <motion.div
            key={shakeKey}
            variants={shakeVariants}
            animate="shake"
            className="rounded-2xl border border-slate-200/80 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/40 dark:shadow-slate-900/40 overflow-hidden"
          >
            {/* Header decorativo con gradiente */}
            <div className="relative px-6 pt-7 pb-6 md:px-8 md:pt-10 md:pb-8 text-center bg-gradient-to-b from-brand-primary-bg-light/80 to-white dark:from-brand-primary-darkest/20 dark:to-slate-900">
              {/* Decoración de fondo */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-brand-primary-bg/60 dark:bg-brand-primary-darkest/20 blur-3xl" />
                <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-blue-100/40 dark:bg-blue-900/10 blur-3xl" />
              </div>

              {/* Logo */}
              <motion.div
                variants={itemVariants}
                custom={1}
                className="relative mx-auto mb-3 md:mb-5 h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-primary-hover flex items-center justify-center shadow-lg shadow-brand-primary/25"
              >
                <BookOpen className="h-8 w-8 text-white" />
              </motion.div>

              <motion.h1
                variants={itemVariants}
                custom={2}
                className="relative text-2xl font-extrabold text-brand-heading tracking-tight"
              >
                Bienvenido de vuelta
              </motion.h1>
              <motion.p
                variants={itemVariants}
                custom={3}
                className="relative mt-2 text-sm text-slate-500 dark:text-slate-400"
              >
                Ingresa a tu cuenta para continuar aprendiendo
              </motion.p>
            </div>

            {/* Formulario */}
            <div className="px-6 pb-6 md:px-8 md:pb-8 pt-3 md:pt-4">
              {/* Error message */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200/60 dark:border-red-800/40 text-sm text-red-600 dark:text-red-400"
                  >
                    {error}
                  </motion.div>
                )}
                {resetSent && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-5 px-4 py-3 rounded-xl bg-brand-primary-bg-light border border-brand-primary/30 dark:border-brand-primary/40 text-sm text-brand-primary-text"
                  >
                    Se envió un correo para restablecer tu contraseña.
                  </motion.div>
                )}
              </AnimatePresence>

              {/* --- Botón Google --- */}
              <motion.div variants={itemVariants} custom={4}>
                <Button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading || isLoading}
                  className="relative w-full h-12 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-brand-heading-secondary hover:bg-slate-50 dark:hover:bg-slate-750 transition-all shadow-sm hover:shadow-md"
                >
                  {googleLoading ? (
                    <Loader2 className="h-4.5 w-4.5 animate-spin mr-2.5" />
                  ) : (
                    <svg className="h-5 w-5 mr-2.5" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                  )}
                  Continuar con Google
                </Button>
              </motion.div>

              {/* --- Separador --- */}
              <motion.div
                variants={itemVariants}
                custom={5}
                className="relative my-6"
              >
                <Separator className="bg-slate-200/80 dark:bg-slate-700/60" />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-900 px-3 text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  o
                </span>
              </motion.div>

              {/* --- Formulario Email/Password --- */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Campo: Email */}
                <motion.div variants={itemVariants} custom={6} className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Correo electrónico
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@correo.com"
                      autoComplete="email"
                      disabled={isLoading || googleLoading}
                      className="h-12 pl-11 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-brand-heading dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:border-brand-primary focus-visible:ring-brand-primary/20 transition-all"
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-500 dark:text-red-400 font-medium pl-1"
                    >
                      {errors.email.message}
                    </motion.p>
                  )}
                </motion.div>

                {/* Campo: Password */}
                <motion.div variants={itemVariants} custom={7} className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Tu contraseña"
                      autoComplete="current-password"
                      disabled={isLoading || googleLoading}
                      className="h-12 pl-11 pr-11 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-brand-heading dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:border-brand-primary focus-visible:ring-brand-primary/20 transition-all"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      tabIndex={-1}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4.5 w-4.5" />
                      ) : (
                        <Eye className="h-4.5 w-4.5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-500 dark:text-red-400 font-medium pl-1"
                    >
                      {errors.password.message}
                    </motion.p>
                  )}
                </motion.div>

                {/* ¿Olvidaste tu contraseña? */}
                <motion.div variants={itemVariants} custom={8} className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={isLoading || googleLoading}
                    className="text-xs font-medium text-brand-primary-text hover:text-brand-primary-text dark:hover:text-brand-primary-light-text transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </motion.div>

                {/* Botón submit */}
                <motion.div variants={itemVariants} custom={9}>
                  <Button
                    type="submit"
                    disabled={isLoading || googleLoading}
                    className="w-full h-12 rounded-xl text-sm font-bold bg-gradient-to-r from-brand-primary to-brand-primary-hover hover:from-brand-primary-hover hover:to-brand-primary-hover text-white shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/35 transition-all active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4.5 w-4.5 animate-spin mr-2.5" />
                        Ingresando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Iniciar sesión
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>

              {/* --- Enlace a registrarse --- */}
              <motion.div
                variants={itemVariants}
                custom={10}
                className="mt-8 text-center"
              >
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  ¿No tienes una cuenta?{' '}
                  <Link
                    href="/registrarse"
                    className="font-semibold text-brand-primary-text hover:text-brand-primary-text dark:hover:text-brand-primary-light-text transition-colors"
                  >
                    Regístrate gratis
                  </Link>
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* ====== Footer de seguridad ====== */}
          <motion.div
            variants={itemVariants}
            custom={11}
            className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500"
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Conexión segura encriptada</span>
          </motion.div>
        </motion.div>
    </div>
  );
}