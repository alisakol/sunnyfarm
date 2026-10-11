import { doc, getDoc, setDoc } from 'firebase/firestore';
import { signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './firebase';

export interface CloudSavePayload {
  coins: number;
  gems: number;
  level: number;
  xp: number;
  barnCapacity: number;
  inventory: Record<string, number>;
  plots: any[];
  animals: any[];
  buildings: any[];
  trees: any[];
  orders: any[];
  achievements: any[];
  stats: any;
  neighbors: any[];
  seasonMode: string;
  lastDailyClaimDate?: string | null;
  dailyStreak?: number;
  lastSeasonalSurpriseDate?: string | null;
  purchasedDecorations?: string[];
  placedDecorations?: string[];
  journalEntries?: any[];
  npcQuests?: any[];
  lastQuestsRefreshDate?: string | null;
  playerGifts?: any[];
  playerVisitLogs?: any[];
}

export async function loginWithGooglePopup(): Promise<User | null> {
  try {
    // Перенаправляем пользователя на авторизацию Google вместо открытия всплывающего окна
    await signInWithRedirect(auth, googleProvider);
    
    // Страница сразу перезагрузится, поэтому возвращаем null.
    // Пользователь вернется на сайт уже авторизованным.
    return null; 
  } catch (error) {
    console.error('Google Sign-In failed:', error);
    throw error;
  }
}


export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export async function saveFarmToFirestore(userId: string, farmState: CloudSavePayload): Promise<boolean> {
  const savePath = `users/${userId}/saves/current`;
  try {
    const serializedData = JSON.stringify(farmState);
    const saveRef = doc(db, 'users', userId, 'saves', 'current');
    await setDoc(saveRef, {
      userId,
      level: farmState.level,
      coins: farmState.coins,
      gems: farmState.gems,
      xp: farmState.xp,
      barnCapacity: farmState.barnCapacity,
      gameData: serializedData,
      updatedAt: new Date().toISOString(),
    });

    // Also update the public user profile document so friends and community immediately see the true level!
    const userRef = doc(db, 'users', userId);
    await setDoc(
      userRef,
      {
        id: userId,
        level: farmState.level,
        lastLoginAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, savePath);
    return false;
  }
}

export async function loadFarmFromFirestore(userId: string): Promise<CloudSavePayload | null> {
  const savePath = `users/${userId}/saves/current`;
  try {
    const saveRef = doc(db, 'users', userId, 'saves', 'current');
    const snap = await getDoc(saveRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data && data.gameData) {
        const parsed = JSON.parse(data.gameData) as CloudSavePayload;
        return parsed;
      }
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, savePath);
    return null;
  }
}
