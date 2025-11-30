import { initializeApp } from 'firebase/app';
import { getFirestore, deleteDoc, doc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env.local') });

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
const auth = getAuth(app);

async function deleteDuplicates() {
    const duplicateIds = [
        'howtodaytradeforaliving',
        'marketwizards',
        'influence',
        'secretsofthemillionairemind',
        'the48lawsofpower',
        'the33strategiesofwar'
    ];

    // Get credentials from command line arguments
    const email = process.argv[2];
    const password = process.argv[3];

    if (!email || !password) {
        console.error('❌ Usage: npx tsx delete-duplicates-auto.ts <email> <password>');
        process.exit(1);
    }

    try {
        console.log('🔄 Authenticating...');
        await signInWithEmailAndPassword(auth, email, password);
        console.log('✅ Authenticated successfully!\n');

        console.log(`🗑️  Deleting ${duplicateIds.length} duplicate books...\n`);

        for (const bookId of duplicateIds) {
            try {
                await deleteDoc(doc(db, 'books', bookId));
                console.log(`✅ Deleted: ${bookId}`);
            } catch (error: any) {
                console.error(`❌ Failed to delete ${bookId}:`, error.message);
            }
        }

        console.log('\n✅ Deletion complete!');
        process.exit(0);
    } catch (error: any) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

deleteDuplicates().catch(console.error);
