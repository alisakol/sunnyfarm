import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { onAuthStateChanged, User, EmailAuthProvider, linkWithCredential } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import {
  CloudSavePayload,
  loginWithGooglePopup,
  logoutUser,
  saveFarmToFirestore,
  loadFarmFromFirestore,
  loginWithEmail,
  registerWithEmail,
} from '../services/cloudSync';

interface AuthContextType {
  user: User | null;
  isLoadingAuth: boolean;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  syncError: string | null;
  login: () => Promise<User | null>;
  loginEmail: (email: string, password: string) => Promise<User | null>;
  registerEmail: (email: string, password: string) => Promise<User | null>;
  linkEmail: (email: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
  saveToCloud: (state: CloudSavePayload) => Promise<boolean>;
  loadFromCloud: () => Promise<CloudSavePayload | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoadingAuth(false);
      setSyncError(null);
    });
    return () => unsubscribe();
  }, []);

  const login = useCallback(async (): Promise<User | null> => {
    try {
      setSyncError(null);
      return await loginWithGooglePopup();
    } catch (err: any) {
      setSyncError(err?.message || 'Ошибка авторизации через Google');
      throw err;
    }
  }, []);

  const loginEmailAction = useCallback(async (email: string, password: string): Promise<User | null> => {
    try {
      setSyncError(null);
      return await loginWithEmail(email, password);
    } catch (err: any) {
      setSyncError(err?.message || 'Неверный логин или пароль');
      throw err;
    }
  }, []);

  const registerEmailAction = useCallback(async (email: string, password: string): Promise<User | null> => {
    try {
      setSyncError(null);
      return await registerWithEmail(email, password);
    } catch (err: any) {
      setSyncError(err?.message || 'Ошибка при создании аккаунта');
      throw err;
    }
  }, []);

  // --- Реализация привязки почты прямо в контексте ---
  const linkEmailAction = useCallback(async (email: string, password: string): Promise<User | null> => {
    try {
      setSyncError(null);
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Нет активного пользователя для привязки');
      }

      const credential = EmailAuthProvider.credential(email, password);
      const result = await linkWithCredential(currentUser, credential);

      if (result.user) {
        const userRef = doc(db, 'users', result.user.uid);
        try {
          await setDoc(
            userRef,
            {
              id: result.user.uid,
              email: result.user.email || email,
              lastLoginAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch (err) {
          console.warn('Could not update user profile in firestore:', err);
        }
        setUser(result.user);
      }
      return result.user;
    } catch (err: any) {
      const msg = err?.message || 'Ошибка привязки почты';
      setSyncError(msg);
      throw err;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      setSyncError(null);
      await logoutUser();
      setUser(null);
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  }, []);

  const saveToCloud = useCallback(
    async (state: CloudSavePayload): Promise<boolean> => {
      if (!user) return false;
      setIsSyncing(true);
      setSyncError(null);
      try {
        const success = await saveFarmToFirestore(user.uid, state);
        if (success) setLastSyncedAt(new Date());
        return success;
      } catch (err: any) {
        setSyncError('Не удалось синхронизировать с облаком');
        return false;
      } finally {
        setIsSyncing(false);
      }
    },
    [user]
  );

  const loadFromCloud = useCallback(async (): Promise<CloudSavePayload | null> => {
    if (!user) return null;
    setIsSyncing(true);
    setSyncError(null);
    try {
      const data = await loadFarmFromFirestore(user.uid);
      if (data) setLastSyncedAt(new Date());
      return data;
    } catch (err: any) {
      setSyncError('Ошибка загрузки из облака');
      return null;
    } finally {
      setIsSyncing(false);
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoadingAuth,
        isSyncing,
        lastSyncedAt,
        syncError,
        login,
        loginEmail: loginEmailAction,
        registerEmail: registerEmailAction,
        linkEmail: linkEmailAction,
        logout,
        saveToCloud,
        loadFromCloud,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};