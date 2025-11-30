import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import dotenv from 'dotenv';

import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

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

async function listBooks() {
    console.log('Listing all books...\n');
    const booksRef = collection(db, 'books');
    const snapshot = await getDocs(booksRef);

    console.log(`Total books: ${snapshot.size}\n`);

    const books: any[] = [];
    snapshot.forEach(doc => {
        const data = doc.data();
        books.push({
            id: doc.id,
            title: data.title || 'Unknown',
            author: data.author || 'Unknown',
            rating: data.rating || 'N/A'
        });
    });

    // Sort by title for easier viewing
    books.sort((a, b) => a.title.localeCompare(b.title));

    books.forEach(book => {
        console.log(`ID: ${book.id}`);
        console.log(`Title: "${book.title}"`);
        console.log(`Author: ${book.author}`);
        console.log(`Rating: ${book.rating}`);
        console.log('---');
    });
}

listBooks().catch(console.error);
