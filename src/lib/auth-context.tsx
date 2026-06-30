'use client';

// ============================================================
// AuthProvider — Contexto global de autenticación Firebase
// Envuelve <ThemeProvider> en layout.tsx
// Sincroniza el usuario con la DB al iniciar sesión.
// Expone isAdmin para redirecciones y protección de rutas.
// ============================================================

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

// Flag global para evitar múltiples redirecciones durante el ciclo de vida
let _signOutRedirecting = false;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  idToken: string | null;
  signOut: () => Promise<void>;
  purchasedCourseIds: string[];
  refreshPurchases: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  isOwner: false,
  idToken: null,
  signOut: async () => {},
  purchasedCourseIds: [],
  refreshPurchases: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [purchasedCourseIds, setPurchasedCourseIds] = useState<string[]>([]);

  // Sincronizar usuario con DB y obtener sus compras + rol
  const syncAndLoadPurchases = useCallback(async (firebaseUser: User | null) => {
    if (!firebaseUser) {
      setPurchasedCourseIds([]);
      setIsAdmin(false);
      setIdToken(null);
      return;
    }

    try {
      // Obtener ID token (necesario para API calls autenticadas)
      const token = await firebaseUser.getIdToken();
      setIdToken(token);

      // 1. Sincronizar usuario con la DB y obtener rol
      const syncRes = await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: token }),
      });

      const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'academiaelprofeoficial@gmail.com').split(',').map(e => e.trim().toLowerCase());
      const ownerEmails = (process.env.NEXT_PUBLIC_OWNER_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'academiaelprofeoficial@gmail.com').split(',').map(e => e.trim().toLowerCase());
      const isAdminByEmail = firebaseUser.email ? adminEmails.includes(firebaseUser.email.toLowerCase()) : false;
      const isOwnerByEmail = firebaseUser.email ? ownerEmails.includes(firebaseUser.email.toLowerCase()) : false;

      if (syncRes.ok) {
        const syncData = await syncRes.json();
        const roleFromDB = syncData.role;
        setIsAdmin(roleFromDB === 'admin' || isAdminByEmail || isOwnerByEmail);
        setIsOwner(isOwnerByEmail);
      } else {
        setIsAdmin(isAdminByEmail || isOwnerByEmail);
        setIsOwner(isOwnerByEmail);
      }

      // 2. Owner tiene acceso completo a todos los cursos
      if (isOwnerByEmail) {
        setPurchasedCourseIds(['__ALL_COURSES__']);
      } else {
        // 3. Obtener cursos comprados + accesos otorgados manualmente
        const res = await fetch(`/api/user/purchases?uid=${firebaseUser.uid}`);
        if (res.ok) {
          const data = await res.json();
          setPurchasedCourseIds(data.purchasedCourseIds || []);
        }
      }
    } catch (err) {
      console.error('[Auth] Error al sincronizar:', err);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      await syncAndLoadPurchases(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [syncAndLoadPurchases]);

  const refreshPurchases = useCallback(async () => {
    await syncAndLoadPurchases(user);
  }, [user, syncAndLoadPurchases]);

  const signOut = useCallback(async () => {
    if (_signOutRedirecting) return;
    _signOutRedirecting = true;
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setIsAdmin(false);
      setIsOwner(false);
      setIdToken(null);
      setPurchasedCourseIds([]);
      if (typeof window !== 'undefined') {
        window.location.href = '/#hero';
      }
    } finally {
      setTimeout(() => { _signOutRedirecting = false; }, 2000);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, isOwner, idToken, signOut, purchasedCourseIds, refreshPurchases }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return context;
}