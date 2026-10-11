import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  limit,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { NeighborFarm, PlayerGift, PlayerVisitLog } from '../types/game';

export interface FirestoreUserProfile {
  id: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  farmName?: string;
  level?: number;
  reputation?: number;
  specialty?: string;
  bio?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface FirestoreFriend {
  id: string;
  friendUid: string;
  displayName: string;
  photoURL?: string;
  farmName?: string;
  level: number;
  addedAt: string;
}

/**
 * Update or publish the player's farm profile so other real players can discover and visit it
 */
export async function syncUserProfile(
  uid: string,
  profile: Partial<FirestoreUserProfile>
): Promise<void> {
  const userPath = `users/${uid}`;
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(
      userRef,
      {
        id: uid,
        ...profile,
        lastLoginAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, userPath);
  }
}

/**
 * Fetch all registered real players from Firestore
 */
export async function fetchCommunityPlayers(currentUid?: string): Promise<FirestoreUserProfile[]> {
  const usersPath = 'users';
  try {
    const usersCol = collection(db, 'users');
    const q = query(usersCol, limit(30));
    const snap = await getDocs(q);

    const players: FirestoreUserProfile[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data() as FirestoreUserProfile;
      if (data && data.id && data.id !== currentUid) {
        players.push(data);
      }
    });

    return players;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, usersPath);
    return [];
  }
}

/**
 * Real-time listener for community players
 */
export function subscribeToCommunityPlayers(
  currentUid: string | undefined,
  onPlayers: (players: FirestoreUserProfile[]) => void
): Unsubscribe {
  const usersCol = collection(db, 'users');
  const q = query(usersCol, limit(50));

  return onSnapshot(
    q,
    (snap) => {
      const players: FirestoreUserProfile[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data() as FirestoreUserProfile;
        if (data && data.id && data.id !== currentUid) {
          players.push(data);
        }
      });
      onPlayers(players);
    },
    (err) => {
      console.warn('Community players subscription error:', err);
      onPlayers([]);
    }
  );
}

/**
 * Fetch the user's friend list from Firestore
 */
export async function fetchUserFriends(uid: string): Promise<FirestoreFriend[]> {
  const friendsPath = `users/${uid}/friends`;
  try {
    const friendsCol = collection(db, 'users', uid, 'friends');
    const snap = await getDocs(friendsCol);
    const friends: FirestoreFriend[] = [];
    snap.forEach((docSnap) => {
      friends.push(docSnap.data() as FirestoreFriend);
    });
    return friends;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, friendsPath);
    return [];
  }
}

/**
 * Real-time listener for user's friends list
 */
export function subscribeToUserFriends(
  uid: string,
  onFriends: (friends: FirestoreFriend[]) => void
): Unsubscribe {
  const friendsCol = collection(db, 'users', uid, 'friends');

  return onSnapshot(
    friendsCol,
    (snap) => {
      const friends: FirestoreFriend[] = [];
      snap.forEach((docSnap) => {
        friends.push(docSnap.data() as FirestoreFriend);
      });
      onFriends(friends);
    },
    (err) => {
      console.warn('Friends subscription error:', err);
      onFriends([]);
    }
  );
}

/**
 * Add a real player to the user's friends list
 */
export async function addFriend(
  uid: string,
  friend: {
    uid: string;
    displayName: string;
    photoURL?: string;
    farmName?: string;
    level: number;
  }
): Promise<boolean> {
  const friendPath = `users/${uid}/friends/${friend.uid}`;
  try {
    const friendRef = doc(db, 'users', uid, 'friends', friend.uid);
    await setDoc(friendRef, {
      id: friend.uid,
      friendUid: friend.uid,
      displayName: friend.displayName || 'Фермер',
      photoURL: friend.photoURL || '',
      farmName: friend.farmName || 'Солнечная Ферма',
      level: friend.level || 1,
      addedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, friendPath);
    return false;
  }
}

/**
 * Remove a friend from the user's friends list
 */
export async function removeFriend(uid: string, friendUid: string): Promise<boolean> {
  const friendPath = `users/${uid}/friends/${friendUid}`;
  try {
    const friendRef = doc(db, 'users', uid, 'friends', friendUid);
    await deleteDoc(friendRef);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, friendPath);
    return false;
  }
}

/**
 * Convert a real player profile into a NeighborFarm item with real products and interactive stands
 */
export function convertPlayerToNeighborFarm(
  player: FirestoreUserProfile,
  isFriend: boolean
): NeighborFarm {
  const lvl = Math.max(1, Number(player.level) || 1);
  const name = player.farmName || `Ферма ${player.displayName || 'Друга'}`;
  const ownerName = player.displayName || 'Фермер';
  const ownerAvatar = player.photoURL ? '🧑‍🌾' : '👨‍🌾';

  return {
    id: `player_${player.id}`,
    uid: player.id,
    isRealPlayer: true,
    isFriend,
    photoURL: player.photoURL || undefined,
    name,
    ownerName,
    ownerAvatar,
    level: lvl,
    reputation: player.reputation || 10,
    //bio: player.bio || 'Привет! Я фермер, и я развиваю свою солнечную ферму.',
    specialty: player.specialty || (lvl >= 4 ? 'Органическое земледелие и выпечка' : 'Свежее фермерское молоко и клубника'),
    coverEmoji: '✨',
    cropsPreview: [
      { name: 'Клубника', emoji: '🍓', status: 'Спеет' },
      { name: 'Пшеница', emoji: '🌾', status: 'Готова' },
      { name: 'Подсолнух', emoji: '🌻', status: 'Цветёт' },
    ],
    animalsPreview: [
      { name: 'Коровки', emoji: '🐮', count: 3 },
      { name: 'Курочки', emoji: '🐔', count: 4 },
    ],
    sellItems: [
      {
        id: `real_sell_${player.id}_1`,
        itemId: 'strawberry_pie',
        name: 'Клубничный пирог',
        emoji: '🥧',
        count: 2,
        price: 85,
        sold: false,
      },
      {
        id: `real_sell_${player.id}_2`,
        itemId: 'wheat',
        name: 'Пшеница',
        emoji: '🌾',
        count: 10,
        price: 25,
        sold: false,
      },
    ],
    buyItems: [
      {
        id: `real_buy_${player.id}_1`,
        itemId: 'carrot',
        name: 'Морковь',
        emoji: '🥕',
        count: 5,
        rewardCoins: 45,
        fulfilled: false,
      },
      {
        id: `real_buy_${player.id}_2`,
        itemId: 'apple',
        name: 'Яблоки',
        emoji: '🍎',
        count: 3,
        rewardCoins: 60,
        fulfilled: false,
      },
    ],
    canHelpWater: true,
    helpedWaterToday: false,
    guestbook: [
      {
        id: `comm_${player.id}_init`,
        author: ownerName,
        avatar: '👋',
        text: 'Добро пожаловать на мою настоящую ферму! Добавляйтесь в друзья!',
        timestamp: 'Недавно',
      },
    ],
  };
}

/**
 * Send a gift to a real Google player friend via Firestore
 */
export async function sendGiftToRealPlayer(
  sender: {
    uid: string;
    displayName: string;
    photoURL?: string;
    level: number;
  },
  recipientUid: string,
  gift: {
    giftType: 'seeds' | 'fertilizer' | 'coins' | 'gems' | 'pie';
    giftName: string;
    giftEmoji: string;
    count: number;
    note: string;
  }
): Promise<boolean> {
  const giftId = `gift_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const giftPath = `users/${recipientUid}/gifts/${giftId}`;
  const now = new Date();
  const timestampStr = now.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  try {
    const giftRef = doc(db, 'users', recipientUid, 'gifts', giftId);
    await setDoc(giftRef, {
      id: giftId,
      recipientUid,
      senderUid: sender.uid,
      senderName: sender.displayName || 'Фермер',
      senderAvatar: sender.photoURL || '🧑‍🌾',
      senderLevel: sender.level || 1,
      giftType: gift.giftType,
      giftName: gift.giftName,
      giftEmoji: gift.giftEmoji,
      count: gift.count,
      note: gift.note || 'С наилучшими пожеланиями для фермы! 🌾',
      timestamp: timestampStr,
      createdAt: now.toISOString(),
      claimed: false,
    });

    // Also record a visit log in recipient's farm visits
    try {
      const visitId = `visit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const visitRef = doc(db, 'users', recipientUid, 'visits', visitId);
      await setDoc(visitRef, {
        id: visitId,
        recipientUid,
        visitorUid: sender.uid,
        visitorName: sender.displayName || 'Фермер',
        visitorAvatar: sender.photoURL || '🧑‍🌾',
        visitorLevel: sender.level || 1,
        action: 'gifted',
        actionText: `Отправил(а) вам подарок: ${gift.giftEmoji} ${gift.giftName}!`,
        timestamp: timestampStr,
        createdAt: now.toISOString(),
        rewardClaimed: false,
      });
    } catch (e) {
      console.warn('Could not record visit log for gift:', e);
    }

    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, giftPath);
    return false;
  }
}

/**
 * Subscribe to real-time incoming gifts for a user
 */
export function subscribeToUserGifts(
  uid: string,
  onGifts: (gifts: PlayerGift[]) => void
): Unsubscribe {
  const giftsCol = collection(db, 'users', uid, 'gifts');

  return onSnapshot(
    giftsCol,
    (snap) => {
      const gifts: PlayerGift[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data && data.id) {
          gifts.push({
            id: data.id,
            senderName: data.senderName || 'Фермер',
            senderAvatar: data.senderAvatar || '🧑‍🌾',
            senderLevel: data.senderLevel || 1,
            giftType: data.giftType || 'seeds',
            giftName: data.giftName || 'Подарок',
            giftEmoji: data.giftEmoji || '🎁',
            count: data.count || 1,
            note: data.note || '',
            timestamp: data.timestamp || 'Недавно',
            claimed: !!data.claimed,
            senderUid: data.senderUid,
            recipientUid: data.recipientUid,
            isFromFirestore: true,
          });
        }
      });
      // Sort newest first
      gifts.sort((a, b) => (b.id > a.id ? 1 : -1));
      onGifts(gifts);
    },
    (err) => {
      console.warn('Gifts subscription error:', err);
      onGifts([]);
    }
  );
}

/**
 * Claim a gift in Firestore
 */
export async function claimGiftInFirestore(
  uid: string,
  giftId: string
): Promise<boolean> {
  const giftPath = `users/${uid}/gifts/${giftId}`;
  try {
    const giftRef = doc(db, 'users', uid, 'gifts', giftId);
    await setDoc(giftRef, { claimed: true }, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, giftPath);
    return false;
  }
}

/**
 * Subscribe to real-time farm visit logs
 */
export function subscribeToUserVisits(
  uid: string,
  onVisits: (visits: PlayerVisitLog[]) => void
): Unsubscribe {
  const visitsCol = collection(db, 'users', uid, 'visits');

  return onSnapshot(
    visitsCol,
    (snap) => {
      const visits: PlayerVisitLog[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data && data.id) {
          visits.push({
            id: data.id,
            visitorName: data.visitorName || 'Гость',
            visitorAvatar: data.visitorAvatar || '🧑‍🌾',
            visitorLevel: data.visitorLevel || 1,
            action: data.action || 'admired',
            actionText: data.actionText || 'Посетил вашу ферму',
            timestamp: data.timestamp || 'Недавно',
            rewardClaimed: !!data.rewardClaimed,
            visitorUid: data.visitorUid,
            recipientUid: data.recipientUid,
            isFromFirestore: true,
          });
        }
      });
      visits.sort((a, b) => (b.id > a.id ? 1 : -1));
      onVisits(visits);
    },
    (err) => {
      console.warn('Visits subscription error:', err);
      onVisits([]);
    }
  );
}

/**
 * Claim reciprocity visit bonus in Firestore
 */
export async function claimVisitBonusInFirestore(
  uid: string,
  visitId: string
): Promise<boolean> {
  const visitPath = `users/${uid}/visits/${visitId}`;
  try {
    const visitRef = doc(db, 'users', uid, 'visits', visitId);
    await setDoc(visitRef, { rewardClaimed: true }, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, visitPath);
    return false;
  }
}

/**
 * Record water assistance for a real player in Firestore
 */
export async function recordWaterHelpRealPlayer(
  visitor: {
    uid: string;
    displayName: string;
    photoURL?: string;
    level: number;
  },
  recipientUid: string
): Promise<boolean> {
  const visitId = `visit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const visitPath = `users/${recipientUid}/visits/${visitId}`;
  const timestampStr = new Date().toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
  try {
    const visitRef = doc(db, 'users', recipientUid, 'visits', visitId);
    await setDoc(visitRef, {
      id: visitId,
      recipientUid,
      visitorUid: visitor.uid,
      visitorName: visitor.displayName || 'Фермер',
      visitorAvatar: visitor.photoURL || '🧑‍🌾',
      visitorLevel: visitor.level || 1,
      action: 'watered',
      actionText: 'Полил(а) грядки на вашей ферме! (+15 🪙 бонус вам)',
      timestamp: timestampStr,
      createdAt: new Date().toISOString(),
      rewardClaimed: false,
    });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, visitPath);
    return false;
  }
}
