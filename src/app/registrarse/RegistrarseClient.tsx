'use client';

// ============================================================
// Página de Registro — Academia El Profe Oficial
// Diseño premium con Google + Email/Password + Nombre
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
  User,
  Check,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { signUpWithEmail, signInWithGoogle } from '@/lib/firebase';
// LandingHeader intentionally omitted — auth pages are full-screen focused

// --- Zod Schema ---
const registerSchema = z
  .object({
    nombre: z
      .string()
      .min(1, 'El nombre es obligatorio')
      .min(3, 'Mínimo 3 caracteres')
      .max(50, 'Máximo 50 caracteres'),
    email: z
      .string()
      .min(1, 'El correo es obligatorio')
      .email('Ingresa un correo válido'),
    password: z
      .string()
      .min(1, 'La contraseña es obligatoria')
      .min(6, 'Mínimo 6 caracteres'),
    confirmPassword: z
      .string()
      .min(1, 'Confirma tu contraseña'),
    acceptTerms: z.boolean().refine((v) => v === true, {
      message: 'Debes aceptar los términos',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

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
      delay: 0.1 + i * 0.06,
      duration: 0.4,
      ease: EASE_OUT,
    },
  }),
};

// --- Validador de contraseña en tiempo real ---
function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
  checks: { label: string; met: boolean }[];
} {
  const checks = [
    { label: '6+ caracteres', met: password.length >= 6 },
    { label: 'Una mayúscula', met: /[A-Z]/.test(password) },
    { label: 'Un número', met: /\d/.test(password) },
    { label: 'Un carácter especial', met: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.met).length;

  if (score <= 1) return { score, label: 'Débil', color: 'bg-red-400', checks };
  if (score === 2) return { score, label: 'Regular', color: 'bg-yellow-400', checks };
  if (score === 3) return { score, label: 'Buena', color: 'bg-blue-400', checks };
  return { score, label: 'Fuerte', color: 'bg-brand-primary', checks };
}

export function RegistrarseClient() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nombre: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password', '');

  const passwordStrength = getPasswordStrength(passwordValue);

  // --- Registrarse con Email/Password ---
  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setError(null);
    try {
      await signUpWithEmail(data.email, data.password, data.nombre);
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/cursos');
      }, 2000);
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string };
      switch (firebaseErr.code) {
        case 'auth/email-already-in-use':
          setError('Este correo ya está registrado. Inicia sesión');
          break;
        case 'auth/weak-password':
          setError('La contraseña es muy débil');
          break;
        case 'auth/invalid-email':
          setError('Correo electrónico no válido');
          break;
        case 'auth/too-many-requests':
          setError('Demasiados intentos. Intenta más tarde');
          break;
        default:
          setError('Error al crear la cuenta. Intenta de nuevo');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- Registrarse con Google ---
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      router.push('/dashboard/cursos');
    } catch (err: unknown) {
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

  // --- Pantalla de éxito ---
  if (success) {
    return (
      <div className="h-dvh overflow-hidden flex items-center justify-center px-4 bg-slate-50/50 dark:bg-slate-950">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="text-center max-w-sm"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
              className="mx-auto mb-6 h-20 w-20 rounded-full bg-brand-primary-bg dark:bg-brand-primary-darkest/30 flex items-center justify-center"
            >
              <CheckCircle2 className="h-10 w-10 text-brand-primary-text" />
            </motion.div>
            <h2 className="text-2xl font-extrabold text-brand-heading mb-2">
              ¡Cuenta creada!
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Bienvenido a Academia El Profe. Redirigiendo...
            </p>
          </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh overflow-y-auto flex flex-col items-center px-4 py-4 md:py-8 bg-slate-50/50 dark:bg-slate-950">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-[460px] my-auto"
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
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/40 dark:shadow-slate-900/40 overflow-hidden">
            {/* Header decorativo */}
            <div className="relative px-6 pt-7 pb-6 md:px-8 md:pt-10 md:pb-8 text-center bg-gradient-to-b from-brand-primary-bg-light/80 to-white dark:from-brand-primary-darkest/20 dark:to-slate-900">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -left-20 h-40 w-40 rounded-full bg-brand-primary-bg/60 dark:bg-brand-primary-darkest/20 blur-3xl" />
                <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-purple-100/40 dark:bg-purple-900/10 blur-3xl" />
              </div>

              {/* Logo */}
              <motion.div
                variants={itemVariants}
                custom={1}
                className="relative mx-auto mb-5 h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-primary-hover flex items-center justify-center shadow-lg shadow-brand-primary/25"
              >
                <BookOpen className="h-8 w-8 text-white" />
              </motion.div>

              <motion.h1
                variants={itemVariants}
                custom={2}
                className="relative text-2xl font-extrabold text-brand-heading tracking-tight"
              >
                Crear tu cuenta
              </motion.h1>
              <motion.p
                variants={itemVariants}
                custom={3}
                className="relative mt-2 text-sm text-slate-500 dark:text-slate-400"
              >
                Únete a la comunidad de estudiantes UTP
              </motion.p>
            </div>

            {/* Formulario */}
            <div className="px-8 pb-8 pt-4">
              {/* Error message */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200/60 dark:border-red-800/40 text-sm text-red-600 dark:text-red-400"
                  >
                    {error}
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
                  Registrarse con Google
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
                {/* Campo: Nombre */}
                <motion.div variants={itemVariants} custom={6} className="space-y-2">
                  <Label
                    htmlFor="nombre"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Nombre completo
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                    <Input
                      id="nombre"
                      type="text"
                      placeholder="Ej: Carlos García"
                      autoComplete="name"
                      disabled={isLoading || googleLoading}
                      className="h-12 pl-11 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-brand-heading dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:border-brand-primary focus-visible:ring-brand-primary/20 transition-all"
                      {...register('nombre')}
                    />
                  </div>
                  {errors.nombre && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-500 dark:text-red-400 font-medium pl-1"
                    >
                      {errors.nombre.message}
                    </motion.p>
                  )}
                </motion.div>

                {/* Campo: Email */}
                <motion.div variants={itemVariants} custom={7} className="space-y-2">
                  <Label
                    htmlFor="reg-email"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Correo electrónico
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                    <Input
                      id="reg-email"
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

                {/* Campo: Contraseña */}
                <motion.div variants={itemVariants} custom={8} className="space-y-2">
                  <Label
                    htmlFor="reg-password"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                    <Input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 6 caracteres"
                      autoComplete="new-password"
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

                  {/* Indicador de fortaleza */}
                  {passwordValue.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-2"
                    >
                      {/* Barra de progreso */}
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                              level <= passwordStrength.score
                                ? passwordStrength.color
                                : 'bg-slate-200 dark:bg-slate-700'
                            }`}
                          />
                        ))}
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 ml-2 self-center">
                          {passwordStrength.label}
                        </span>
                      </div>
                      {/* Checks visuales */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        {passwordStrength.checks.map((check) => (
                          <div
                            key={check.label}
                            className={`flex items-center gap-1.5 text-[11px] transition-colors ${
                              check.met
                                ? 'text-brand-primary-text'
                                : 'text-slate-400 dark:text-slate-500'
                            }`}
                          >
                            {check.met ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <div className="h-3 w-3 rounded-full border border-current" />
                            )}
                            {check.label}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

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

                {/* Campo: Confirmar contraseña */}
                <motion.div variants={itemVariants} custom={9} className="space-y-2">
                  <Label
                    htmlFor="confirm-password"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Confirmar contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                    <Input
                      id="confirm-password"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Repite tu contraseña"
                      autoComplete="new-password"
                      disabled={isLoading || googleLoading}
                      className="h-12 pl-11 pr-11 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-brand-heading dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:border-brand-primary focus-visible:ring-brand-primary/20 transition-all"
                      {...register('confirmPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      tabIndex={-1}
                      aria-label={showConfirm ? 'Ocultar' : 'Mostrar'}
                    >
                      {showConfirm ? (
                        <EyeOff className="h-4.5 w-4.5" />
                      ) : (
                        <Eye className="h-4.5 w-4.5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-500 dark:text-red-400 font-medium pl-1"
                    >
                      {errors.confirmPassword.message}
                    </motion.p>
                  )}
                </motion.div>

                {/* Checkbox: Términos */}
                <motion.div variants={itemVariants} custom={10}>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      {...register('acceptTerms')}
                      className="mt-0.5 h-4.5 w-4.5 rounded border-slate-300 dark:border-slate-600 text-brand-primary focus:ring-brand-primary/20 cursor-pointer accent-brand-primary"
                    />
                    <span className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Acepto los{' '}
                      <Link href="#" className="text-brand-primary-text font-medium hover:underline">
                        Términos y Condiciones
                      </Link>{' '}
                      y la{' '}
                      <Link href="#" className="text-brand-primary-text font-medium hover:underline">
                        Política de Privacidad
                      </Link>
                    </span>
                  </label>
                  {errors.acceptTerms && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-500 dark:text-red-400 font-medium pl-7 mt-1"
                    >
                      {errors.acceptTerms.message}
                    </motion.p>
                  )}
                </motion.div>

                {/* Botón submit */}
                <motion.div variants={itemVariants} custom={11}>
                  <Button
                    type="submit"
                    disabled={isLoading || googleLoading}
                    className="w-full h-12 rounded-xl text-sm font-bold bg-gradient-to-r from-brand-primary to-brand-primary-hover hover:from-brand-primary-hover hover:to-brand-primary-hover text-white shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/35 transition-all active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4.5 w-4.5 animate-spin mr-2.5" />
                        Creando cuenta...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Crear mi cuenta
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>

              {/* --- Enlace a iniciar sesión --- */}
              <motion.div
                variants={itemVariants}
                custom={12}
                className="mt-8 text-center"
              >
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  ¿Ya tienes una cuenta?{' '}
                  <Link
                    href="/iniciar-sesion"
                    className="font-semibold text-brand-primary-text hover:text-brand-primary-text dark:hover:text-brand-primary-light-text transition-colors"
                  >
                    Inicia sesión
                  </Link>
                </p>
              </motion.div>
            </div>
          </div>

          {/* ====== Footer de seguridad ====== */}
          <motion.div
            variants={itemVariants}
            custom={13}
            className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500"
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Tus datos están protegidos</span>
          </motion.div>
        </motion.div>
    </div>
  );
}