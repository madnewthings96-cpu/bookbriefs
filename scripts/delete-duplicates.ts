import { initializeApp } from 'firebase/app';
import { getFirestore, deleteDoc, doc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import * as readline from 'readline';

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

function askQuestion(query: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }));
}

async function deleteDuplicates() {
    const duplicateIds = [
        'howtodaytradeforaliving',
        'marketwizards',
        'influence',
        'secretsofthemillionairemind',
        'the48lawsofpower',
        'the33strategiesofwar'
    ];

    try {
        console.log('🔐 Authentication required\n');
        const email = await askQuestion('Email: ');
        const password = await askQuestion('Password: ');

        console.log('\n🔄 Authenticating...');
        await signInWithEmailAndPassword(auth, email, password);
        console.log('✅ Authenticated successfully!\n');

        console.log(`🗑️  Deleting ${duplicateIds.length} duplicate books...\n`);

        for (const bookId of duplicateIds) {
            try {
                await deleteDoc(doc(db, 'books', bookId));
                console.log(`✅ Deleted: ${bookId}`);
            } catch (error) {
                console.error(`❌ Failed to delete ${bookId}:`, error);
            }
        }

        console.log('\n✅ Deletion complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

deleteDuplicates().catch(console.error);
