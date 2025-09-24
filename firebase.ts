// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// PASTE YOUR FIREBASE CONFIGURATION OBJECT HERE
const firebaseConfig = {
  apiKey: "AIzaSyA9Ew4FIh409LI6SC34110-fzVCa_eLuPg",
  authDomain: "ta7leel-site-dc32f.firebaseapp.com",
  projectId: "ta7leel-site-dc32f",
  storageBucket: "ta7leel-site-dc32f.firebasestorage.app",
  messagingSenderId: "680418141410",
  appId: "1:680418141410:web:d2b44ed1403fd3835eeabb",
  measurementId: "G-8S0RPM3B4E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Export the services you'll need
export const auth = getAuth(app);
export const db = getFirestore(app);