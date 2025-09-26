// Quick Firebase configuration test
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA9Ew4FIh409LI6SC34110-fzVCa_eLuPg",
  authDomain: "ta7leel-site-dc32f.firebaseapp.com",
  projectId: "ta7leel-site-dc32f",
  storageBucket: "ta7leel-site-dc32f.firebasestorage.app",
  messagingSenderId: "680418141410",
  appId: "1:680418141410:web:d2b44ed1403fd3835eeabb",
  measurementId: "G-8S0RPM3B4E"
};

try {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const googleProvider = new GoogleAuthProvider();
  
  console.log('✅ Firebase initialized successfully');
  console.log('✅ Auth initialized successfully');
  console.log('✅ Google provider initialized successfully');
  console.log('🔧 Current auth domain:', firebaseConfig.authDomain);
  console.log('🔧 Current project ID:', firebaseConfig.projectId);
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
}