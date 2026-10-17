import { doc, getDoc, setDoc } from 'firebase/firestore';
import { signInWithPopup, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, User } from 'firebase/auth';
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
  treasureHuntState?: any;
}

export async function loginWithGooglePopup(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    if (result.user) {
      // Upsert profile document
      const userRef = doc(db, 'users', result.user.uid);
      try {
        await setDoc(
          userRef,
          {
            id: result.user.uid,
            email: result.user.email || '',
            displayName: result.user.displayName || 'Фермер',
            photoURL: result.user.photoURL || '',
            lastLoginAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('Could not save user profile to firestore:', err);
      }
    }
    return result.user;
  } catch (error) {
    console.error('Google Sign-In failed:', error);
    throw error;
  }
}

export async function loginWithEmail(email: string, password: string): Promise<User | null> {
  const result = await signInWithEmailAndPassword(auth, email, password);
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
  }
  return result.user;
}

export async function registerWithEmail(email: string, password: string): Promise<User | null> {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  if (result.user) {
    const userRef = doc(db, 'users', result.user.uid);
    try {
      await setDoc(
        userRef,
        {
          id: result.user.uid,
          email: result.user.email || email,
          displayName: email.split('@')[0] || 'Фермер',
          lastLoginAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('Could not create user profile in firestore:', err);
    }
  }
  return result.user;
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export async function saveFarmToFirestore(userId: string, farmState: CloudSavePayload): Promise<boolean> {
  if (!auth.currentUser || auth.currentUser.uid !== userId) {
    return false;
  }
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
  if (!auth.currentUser || auth.currentUser.uid !== userId) {
    return null;
  }
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
