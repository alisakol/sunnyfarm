import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../services/firebase';
import {
  CloudSavePayload,
  loginWithGooglePopup,
  logoutUser,
  saveFarmToFirestore,
  loadFarmFromFirestore,
  loginWithEmail,
  registerWithEmail,
  linkEmailPassword,
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

  const linkEmailAction = useCallback(async (email: string, password: string): Promise<User | null> => {
    try {
      setSyncError(null);
      const u = await linkEmailPassword(email, password);
      setUser(u);
      return u;
    } catch (err: any) {
      setSyncError(err?.message || 'Ошибка привязки почты');
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