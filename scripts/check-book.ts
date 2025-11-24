#!/usr/bin/env tsx

import { config } from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '..', '.env.local') });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkBook() {
  console.log('🔍 Checking all books in Firestore...\n');
  
  const booksRef = collection(db, 'books');
  const snapshot = await getDocs(booksRef);
  
  console.log(`📚 Total books found: ${snapshot.docs.length}\n`);
  
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    console.log(`✅ ${doc.id}`);
    console.log(`   Title: ${data.title}`);
    console.log(`   Author: ${data.author}`);
    console.log(`   Summary: ${data.summary ? `${data.summary.length} chars` : 'None'}`);
    console.log('');
  });
  
  process.exit(0);
}

checkBook();
