import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import dotenv from 'dotenv';

dotenv.config();

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

async function findDuplicate() {
    console.log('Searching for "How to Day Trade for a Living"...');
    const booksRef = collection(db, 'books');
    // We can't easily query by title if it's not exact match or if we want to see all. 
    // Let's just get all books and filter in memory since the DB isn't huge, or query by title if we are sure.
    // The user screenshot shows the title is "How To Day Trade for a Living" (Capital T in To?). 
    // Let's just fetch all books to be safe and print the ones that look like it.

    const snapshot = await getDocs(booksRef);

    snapshot.forEach(doc => {
        const data = doc.data();
        if (data.title && data.title.toLowerCase().includes('day trade')) {
            console.log(`Found: "${data.title}" | ID: ${doc.id} | Rating: ${data.rating}`);
        }
    });
}

findDuplicate().catch(console.error);
