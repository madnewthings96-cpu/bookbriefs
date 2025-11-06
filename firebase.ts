// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// This code securely reads the keys from your .env.local file
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

// Initialize Firebase Analytics lazily (only when needed, not on initial load)
let analytics: any;
export const getAnalyticsInstance = () => {
  if (typeof window !== 'undefined' && !analytics) {
    analytics = getAnalytics(app);
  }
  return analytics;
};

// Export the services you'll need throughout your app
export const auth = getAuth(app);
export const db = getFirestore(app);
export { analytics };