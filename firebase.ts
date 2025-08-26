import firebase from 'firebase/compat/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, arrayUnion, Timestamp } from 'firebase/firestore';

/**
 * Firebase configuration
 * These values should be set via environment variables for security
 * In production, use proper environment variable management
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validate required configuration
const requiredConfig = ['apiKey', 'authDomain', 'projectId'];
const missingConfig = requiredConfig.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);

if (missingConfig.length > 0) {
  throw new Error(`Missing Firebase configuration: ${missingConfig.join(', ')}`);
}

// Initialize Firebase using the compat library to ensure the default app is created robustly.
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Export modular auth instance for use in other parts of the app.
// getAuth() will use the default app initialized by the compat library.
export const auth = getAuth();

// Export modular Firestore instance
export const db = getFirestore();

// Export other useful Firestore utilities
export { arrayUnion, Timestamp };
