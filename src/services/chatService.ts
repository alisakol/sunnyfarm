import {
  collection,
  doc,
  setDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  text: string;
  createdAt: string;
  timestamp: number;
}

export interface ChatConversation {
  id: string;
  participants: string[];
  lastMessageText?: string;
  lastMessageSenderId?: string;
  lastMessageAt?: string;
  updatedAt?: string;
}

/**
 * Returns a deterministic, consistent chatId for two user IDs
 */
export function getChatId(uidA: string, uidB: string): string {
  return [uidA, uidB].sort().join('_');
}

/**
 * Sends a real-time message between two users
 */
export async function sendChatMessage(
  chatId: string,
  sender: {
    uid: string;
    displayName: string;
    photoURL?: string;
  },
  recipientUid: string,
  text: string
): Promise<boolean> {
  if (!auth.currentUser || auth.currentUser.uid !== sender.uid) {
    return false;
  }
  const cleanText = text.trim();
  if (!cleanText) return false;

  const now = new Date();
  const nowIso = now.toISOString();
  const timestamp = now.getTime();
  const messageId = `msg_${timestamp}_${Math.random().toString(36).substring(2, 7)}`;
  const chatPath = `chats/${chatId}`;

  try {
    // 1. Ensure / update the parent conversation doc
    const chatRef = doc(db, 'chats', chatId);
    const participants = [sender.uid, recipientUid].sort();

    await setDoc(
      chatRef,
      {
        id: chatId,
        participants,
        lastMessageText: cleanText.substring(0, 100),
        lastMessageSenderId: sender.uid,
        lastMessageAt: nowIso,
        updatedAt: nowIso,
      },
      { merge: true }
    );

    // 2. Add the message document inside the subcollection
    const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
    await setDoc(messageRef, {
      id: messageId,
      chatId,
      senderId: sender.uid,
      senderName: sender.displayName || 'Фермер',
      senderPhoto: sender.photoURL || '',
      text: cleanText,
      createdAt: nowIso,
      timestamp,
    });

    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, chatPath);
    return false;
  }
}

/**
 * Subscribes to real-time chat messages for a given chatId
 */
export function subscribeToChatMessages(
  chatId: string,
  onMessages: (messages: ChatMessage[]) => void
): Unsubscribe {
  if (!auth.currentUser) {
    onMessages([]);
    return () => {};
  }
  const messagesCol = collection(db, 'chats', chatId, 'messages');
  const q = query(messagesCol, orderBy('timestamp', 'asc'), limit(100));

  return onSnapshot(
    q,
    (snap) => {
      const msgs: ChatMessage[] = [];
      snap.forEach((docSnap) => {
        msgs.push(docSnap.data() as ChatMessage);
      });
      onMessages(msgs);
    },
    (err) => {
      console.warn('Chat messages subscription error:', err);
      onMessages([]);
    }
  );
}
