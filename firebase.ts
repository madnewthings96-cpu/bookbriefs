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

// CRITICAL: Defer Firebase initialization until after first paint
let app: any;
let auth: any;
let db: any;
let analytics: any;
let googleProvider: any;
let isInitialized = false;

// Initialize Firebase lazily - only when needed
const initializeFirebase = () => {
  if (isInitialized) return;

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);

  // Initialize and configure Google Auth Provider
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });

  isInitialized = true;
};

// Initialize Firebase after the page has loaded (non-blocking)
if (typeof window !== 'undefined') {
  // Wait for page to be interactive before initializing
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initializeFirebase, 0);
  } else {
    window.addEventListener('DOMContentLoaded', () => {
      setTimeout(initializeFirebase, 0);
    });
  }
}

// Lazy getters with auto-initialization
export const getAuthInstance = () => {
  if (!isInitialized) initializeFirebase();
  return auth;
};

export const getDbInstance = () => {
  if (!isInitialized) initializeFirebase();
  return db;
};

export const getGoogleProvider = () => {
  if (!isInitialized) initializeFirebase();
  return googleProvider;
};

// Initialize Firebase Analytics lazily (only when user interacts)
export const getAnalyticsInstance = () => {
  if (typeof window !== 'undefined' && !analytics) {
    if (!isInitialized) initializeFirebase();

    // Only initialize analytics after user interaction (mobile optimization)
    const initAnalytics = () => {
      if (!analytics) {
        const { getAnalytics } = require('firebase/analytics');
        analytics = getAnalytics(app);
        console.log('📊 Firebase Analytics initialized');
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

// Legacy exports for backward compatibility - these will auto-initialize when accessed
export { auth, db, googleProvider, analytics };