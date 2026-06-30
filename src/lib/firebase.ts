// ============================================================
// Firebase Configuration — Academia El Profe Oficial
// Client-side only — NO exportar `app` en Server Components
// ============================================================

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  type User,
  type Auth,
} from 'firebase/auth';

// --- Configuración de Firebase ---
const firebaseConfig = {
  apiKey: "AIzaSyAeMHlQZtUwZqbH5o7nsb4eoUYXLM2y0PU",
  authDomain: "academia-el-profe.firebaseapp.com",
  projectId: "academia-el-profe",
  storageBucket: "academia-el-profe.firebasestorage.app",
  messagingSenderId: "503462172387",
  appId: "1:503462172387:web:3eed47f5763c396a1cd7d6",
};

// --- Inicialización singleton (evita reinicializar en dev hot-reload) ---
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// --- Servicios de Firebase ---
export const auth: Auth = getAuth(app);

// --- Proveedor de Google ---
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

// --- Funciones de autenticación ---
export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function signUpWithEmail(email: string, password: string, displayName?: string): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  // Firebase actualiza displayName automáticamente con Google, 
  // pero para email/password hay que hacerlo manualmente
  if (displayName && credential.user) {
    await updateProfile(credential.user, { displayName });
  }
  return credential.user;
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email, {
    url: `${window.location.origin}/iniciar-sesion`,
    handleCodeInApp: false,
  });
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export { onAuthStateChanged, type User as FirebaseUser };