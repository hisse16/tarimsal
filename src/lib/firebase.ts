import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword as fbSignIn,
  createUserWithEmailAndPassword as fbCreateUser,
  sendPasswordResetEmail as fbResetPassword,
  signOut as fbSignOut,
  onAuthStateChanged as fbOnAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  collection as fbCollection,
  doc as fbDoc,
  setDoc as fbSetDoc,
  getDoc as fbGetDoc,
  getDocs as fbGetDocs,
  addDoc as fbAddDoc,
  deleteDoc as fbDeleteDoc,
  onSnapshot as fbOnSnapshot,
  query as fbQuery,
  where as fbWhere
} from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

// Detect if Firebase is configured with real credentials
const isRealFirebaseConfigured =
  firebaseConfig &&
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== "";

let app: any;
let realDb: any;
let realAuth: any;

if (isRealFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    realDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    realAuth = getAuth(app);
  } catch (err) {
    console.error("Firebase initialization failed:", err);
  }
}

// -----------------------------------------------------------------
// LOCAL FALLBACK DATA STORAGE ENGINE
// -----------------------------------------------------------------
const localDbListeners: { [key: string]: Array<(snapshot: any) => void> } = {};

const triggerLocalListeners = (collectionName: string) => {
  if (localDbListeners[collectionName]) {
    const list = getLocalCollectionData(collectionName);
    const mockSnapshot = {
      empty: list.length === 0,
      docs: list.map((item: any) => ({
        id: item.id,
        data: () => item,
      })),
      forEach: (callback: (doc: any) => void) => {
        list.forEach((item: any) => callback({ id: item.id, data: () => item }));
      },
      docChanges: () => [], // simulated for simple cases
    };
    localDbListeners[collectionName].forEach((cb) => {
      try {
        cb(mockSnapshot);
      } catch (e) {
        console.error("Local snapshot callback error:", e);
      }
    });
  }
};

const getLocalCollectionData = (collectionName: string): any[] => {
  const dataStr = localStorage.getItem(`mock_db_${collectionName}`);
  if (dataStr) {
    try {
      return JSON.parse(dataStr);
    } catch (e) {
      return [];
    }
  }
  return [];
};

const saveLocalCollectionData = (collectionName: string, data: any[]) => {
  localStorage.setItem(`mock_db_${collectionName}`, JSON.stringify(data));
  triggerLocalListeners(collectionName);
};

// Simulated current user session
let mockCurrentUser: any = null;
const savedUserSession = localStorage.getItem("mock_auth_current_user");
if (savedUserSession) {
  try {
    mockCurrentUser = JSON.parse(savedUserSession);
  } catch (e) {}
}

const mockAuthListeners: Array<(user: any) => void> = [];

const triggerAuthListeners = () => {
  mockAuthListeners.forEach((cb) => {
    try {
      cb(mockCurrentUser);
    } catch (e) {}
  });
};

// -----------------------------------------------------------------
// COMPATIBILITY EXPORTS (Switches between Real and Fallback)
// -----------------------------------------------------------------

export const db = isRealFirebaseConfigured ? realDb : { isMock: true };

export const auth = isRealFirebaseConfigured
  ? realAuth
  : {
      get currentUser() {
        return mockCurrentUser;
      },
    };

export const collection = (dbInstance: any, path: string) => {
  if (isRealFirebaseConfigured) {
    return fbCollection(dbInstance, path);
  }
  return { collectionName: path };
};

export const doc = (dbInstance: any, path: string, ...pathSegments: string[]) => {
  if (isRealFirebaseConfigured) {
    return fbDoc(dbInstance, path, ...pathSegments);
  }
  return { collectionName: path, docId: pathSegments[0] };
};

export const setDoc = async (docRef: any, data: any) => {
  if (isRealFirebaseConfigured) {
    return await fbSetDoc(docRef, data);
  }
  const colName = docRef.collectionName;
  const docId = docRef.docId;
  const list = getLocalCollectionData(colName);
  const existingIdx = list.findIndex((item) => item.id === docId);
  const updatedItem = { ...data, id: docId };

  if (existingIdx > -1) {
    list[existingIdx] = updatedItem;
  } else {
    list.push(updatedItem);
  }
  saveLocalCollectionData(colName, list);
  return { success: true };
};

export const getDoc = async (docRef: any) => {
  if (isRealFirebaseConfigured) {
    return await fbGetDoc(docRef);
  }
  const colName = docRef.collectionName;
  const docId = docRef.docId;
  const list = getLocalCollectionData(colName);
  const item = list.find((item) => item.id === docId);
  return {
    exists: () => !!item,
    data: () => item,
  };
};

export const getDocs = async (collectionRef: any) => {
  if (isRealFirebaseConfigured) {
    return await fbGetDocs(collectionRef);
  }
  const colName = collectionRef.collectionName;
  const list = getLocalCollectionData(colName);
  return {
    empty: list.length === 0,
    docs: list.map((item) => ({
      id: item.id,
      data: () => item,
    })),
    forEach: (callback: (doc: any) => void) => {
      list.forEach((item) => callback({ id: item.id, data: () => item }));
    },
  };
};

export const addDoc = async (collectionRef: any, data: any) => {
  if (isRealFirebaseConfigured) {
    return await fbAddDoc(collectionRef, data);
  }
  const colName = collectionRef.collectionName;
  const list = getLocalCollectionData(colName);
  const id = `doc_${Math.random().toString(36).substring(2, 11)}`;
  const newItem = { ...data, id };
  list.push(newItem);
  saveLocalCollectionData(colName, list);
  return { id };
};

export const deleteDoc = async (docRef: any) => {
  if (isRealFirebaseConfigured) {
    return await fbDeleteDoc(docRef);
  }
  const colName = docRef.collectionName;
  const docId = docRef.docId;
  const list = getLocalCollectionData(colName);
  const filtered = list.filter((item) => item.id !== docId);
  saveLocalCollectionData(colName, filtered);
  return { success: true };
};

export const onSnapshot = (
  reference: any,
  onNext: (snapshot: any) => void,
  onError?: (error: any) => void
) => {
  if (isRealFirebaseConfigured) {
    return fbOnSnapshot(reference, onNext, onError);
  }

  const colName = reference.collectionName;
  if (!localDbListeners[colName]) {
    localDbListeners[colName] = [];
  }
  localDbListeners[colName].push(onNext);

  // Trigger initial fetch
  const list = getLocalCollectionData(colName);
  const mockSnapshot = {
    empty: list.length === 0,
    docs: list.map((item) => ({
      id: item.id,
      data: () => item,
    })),
    forEach: (callback: (doc: any) => void) => {
      list.forEach((item) => callback({ id: item.id, data: () => item }));
    },
    docChanges: () => [],
  };
  onNext(mockSnapshot);

  // Return unsubscribe handler
  return () => {
    if (localDbListeners[colName]) {
      localDbListeners[colName] = localDbListeners[colName].filter((cb) => cb !== onNext);
    }
  };
};

export const signInWithEmailAndPassword = async (authInstance: any, emailStr: string, pass: string) => {
  if (isRealFirebaseConfigured) {
    return await fbSignIn(authInstance, emailStr, pass);
  }

  // Handle local user storage authentication
  const users = getLocalCollectionData("users");
  const matched = users.find((u) => u.email?.toLowerCase() === emailStr.toLowerCase());
  if (matched) {
    if (matched.passwordHash === pass) {
      mockCurrentUser = {
        uid: matched.id,
        email: matched.email,
        displayName: matched.name,
        emailVerified: true,
      };
      localStorage.setItem("mock_auth_current_user", JSON.stringify(mockCurrentUser));
      triggerAuthListeners();
      return { user: mockCurrentUser };
    } else {
      const err = new Error("auth/wrong-password");
      (err as any).code = "auth/wrong-password";
      throw err;
    }
  } else {
    const err = new Error("auth/user-not-found");
    (err as any).code = "auth/user-not-found";
    throw err;
  }
};

export const createUserWithEmailAndPassword = async (authInstance: any, emailStr: string, pass: string) => {
  if (isRealFirebaseConfigured) {
    return await fbCreateUser(authInstance, emailStr, pass);
  }

  const users = getLocalCollectionData("users");
  const matched = users.find((u) => u.email?.toLowerCase() === emailStr.toLowerCase());
  if (matched) {
    const err = new Error("auth/email-already-in-use");
    (err as any).code = "auth/email-already-in-use";
    throw err;
  }

  const userId = `user_${Math.random().toString(36).substring(2, 11)}`;
  const newUser = {
    id: userId,
    email: emailStr,
    passwordHash: pass,
    name: emailStr.split('@')[0],
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveLocalCollectionData("users", users);

  mockCurrentUser = {
    uid: userId,
    email: emailStr,
    displayName: newUser.name,
    emailVerified: true,
  };
  localStorage.setItem("mock_auth_current_user", JSON.stringify(mockCurrentUser));
  triggerAuthListeners();

  return { user: mockCurrentUser };
};

export const sendPasswordResetEmail = async (authInstance: any, emailStr: string) => {
  if (isRealFirebaseConfigured) {
    return await fbResetPassword(authInstance, emailStr);
  }
  return { success: true };
};

export const signOut = async (authInstance: any) => {
  if (isRealFirebaseConfigured) {
    return await fbSignOut(authInstance);
  }
  mockCurrentUser = null;
  localStorage.removeItem("mock_auth_current_user");
  triggerAuthListeners();
  return { success: true };
};

export const onAuthStateChanged = (authInstance: any, callback: (user: any) => void) => {
  if (isRealFirebaseConfigured) {
    return fbOnAuthStateChanged(authInstance, callback);
  }
  mockAuthListeners.push(callback);
  callback(mockCurrentUser);
  return () => {
    const idx = mockAuthListeners.indexOf(callback);
    if (idx > -1) {
      mockAuthListeners.splice(idx, 1);
    }
  };
};
