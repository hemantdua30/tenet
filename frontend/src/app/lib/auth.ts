import { doc, getDoc, collection, query, where, getDocs, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

// User interface
export interface User {
  uid: string;
  name: string;
  username: string;
  role: string;
  userRole?: 'inspector' | 'admin';
}

// Browser-safe SHA-256 hashing to hex
async function sha256Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  // Use Web Crypto API in browser; in Node (SSR) globalThis.crypto is also available in Next 19+
  const digest = await (globalThis.crypto || (await import('crypto')).webcrypto).subtle.digest('SHA-256', data);
  const bytes = new Uint8Array(digest);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Sign in a user with username and password via Firestore collection `users`
 */
export const signIn = async (username: string, password: string): Promise<User> => {
  // Hash password for comparison
  const hashedPassword = await sha256Hex(password);

  // Generate user ID from username (same logic as when creating)
  const userId = username.replace(/[^a-zA-Z0-9]/g, '_');

  // Try to get user directly by ID (fast path)
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);

  const verify = async (data: any, id: string): Promise<User> => {
    if (!data || !data.password) throw new Error('User record is invalid');
    if (data.password !== hashedPassword) throw new Error('Invalid password');

    // Update last login timestamp (fire-and-forget)
    try { await updateDoc(doc(db, 'users', id), { lastLogin: serverTimestamp() }); } catch {}

    const userRole: 'inspector' | 'admin' = data.role === 'inspector' ? 'inspector' : 'admin';
    // Store userRole for client routing
    if (typeof window !== 'undefined') {
      localStorage.setItem('userRole', userRole);
    }

    return {
      uid: id,
      name: data.name,
      username: data.username,
      role: data.role,
      userRole,
    };
  };

  if (userDoc.exists()) {
    return verify(userDoc.data(), userDoc.id);
  }

  // Fallback: query by username field
  const q = query(collection(db, 'users'), where('username', '==', username));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) throw new Error('User not found');

  const docSnap = querySnapshot.docs[0];
  return verify(docSnap.data(), docSnap.id);
};

/**
 * Add a new user (admin function)
 */
export const addUser = async (userData: {
  name: string;
  username: string;
  password: string;
  role: 'admin' | 'user' | 'inspector';
}) => {
  const hashedPassword = await sha256Hex(userData.password);
  const userId = userData.username.replace(/[^a-zA-Z0-9]/g, '_');

  await setDoc(doc(db, 'users', userId), {
    id: userId,
    name: userData.name,
    username: userData.username,
    password: hashedPassword,
    role: userData.role,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    uid: userId,
    name: userData.name,
    username: userData.username,
    role: userData.role,
  } as User;
};
