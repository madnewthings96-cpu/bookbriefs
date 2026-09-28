// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// This code securely reads the keys from your .env.local file
const firebaseEnvironment: Record<string, string | undefined> = (import.meta.env ?? {}) as Record<string, string | undefined>;
const firebaseConfig = {
  apiKey: firebaseEnvironment.VITE_FIREBASE_API_KEY,
  authDomain: firebaseEnvironment.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: firebaseEnvironment.VITE_FIREBASE_PROJECT_ID,
  storageBucket: firebaseEnvironment.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: firebaseEnvironment.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: firebaseEnvironment.VITE_FIREBASE_APP_ID,
  measurementId: firebaseEnvironment.VITE_FIREBASE_MEASUREMENT_ID
};

// Check that the keys were loaded correctly from the .env.local file
if (!firebaseConfig.apiKey) {
  console.warn("Firebase API key is missing. Using demo configuration. Make sure it's set in your .env.local file for production.");
  // Use demo Firebase config for development
  firebaseConfig.apiKey = "demo-api-key";
  firebaseConfig.authDomain = "demo.firebaseapp.com";
  firebaseConfig.projectId = "demo-project";
  firebaseConfig.storageBucket = "demo-project.appspot.com";
  firebaseConfig.messagingSenderId = "123456789";
  firebaseConfig.appId = "1:123456789:web:abcdef123456";
  firebaseConfig.measurementId = "G-ABCDEFGHIJ";
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
let storage: ReturnType<typeof getStorage>;
try {
  storage = getStorage(app);
} catch (error) {
  console.warn('Firebase Storage initialization failed:', error);
  storage = {} as any;
}
const googleProvider = new GoogleAuthProvider();
let analytics: any;

googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Lazy getters with auto-initialization
export const getAuthInstance = () => {
  return auth;
};

export const getDbInstance = () => {
  return db;
};

export const getGoogleProvider = () => {
  return googleProvider;
};

// Initialize Firebase Analytics lazily (only when user interacts)
export const getAnalyticsInstance = () => {
  if (typeof window !== 'undefined' && !analytics) {
    // Only initialize analytics after user interaction (mobile optimization)
    const initAnalytics = () => {
      if (!analytics) {
        try {
          analytics = getAnalytics(app);
        } catch (error) {
          console.warn('Firebase Analytics unavailable:', error);
        }
      }
    };

    // Wait for user interaction before loading analytics
    if (!analytics) {
      ['click', 'scroll', 'touchstart', 'keydown'].forEach(event => {
        document.addEventListener(event, initAnalytics, { once: true, passive: true });
      });
      // Or after 10 seconds of idle time
      setTimeout(initAnalytics, 10000);
    }
  }
  return analytics;
};

export { auth, db, storage, googleProvider, analytics };
