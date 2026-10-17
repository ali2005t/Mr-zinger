import { deleteApp, getApp, getApps, initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.messagingSenderId &&
  firebaseConfig.appId
);

const app = isFirebaseConfigured
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

export const firebaseAuth = app ? getAuth(app) : null;
export const firestore = app ? getFirestore(app) : null;
const supportApp = isFirebaseConfigured
  ? getApps().find((candidate) => candidate.name === "mr-zinger-support") ?? initializeApp(firebaseConfig, "mr-zinger-support")
  : null;
// Guest support uses a secondary auth instance so anonymous sign-in never replaces
// a customer's or administrator's primary session.
export const supportAuth = supportApp ? getAuth(supportApp) : null;

// Create staff logins in a temporary Firebase app so adding an employee does not
// sign the owner out of the admin dashboard.
export async function createStaffLogin(email: string, password: string): Promise<string> {
  if (!isFirebaseConfigured) throw new Error("Firebase is not configured.");
  const secondaryApp = initializeApp(firebaseConfig, `staff-setup-${crypto.randomUUID()}`);
  const secondaryAuth = getAuth(secondaryApp);
  try {
    const credential = await createUserWithEmailAndPassword(secondaryAuth, email.trim(), password);
    return credential.user.uid;
  } finally {
    await signOut(secondaryAuth).catch(() => undefined);
    await deleteApp(secondaryApp);
  }
}
