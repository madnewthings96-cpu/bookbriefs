import { config } from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, doc, getDoc } from 'firebase/firestore';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '.env.local') });

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

async function testFirestore() {
  console.log('\n📚 Testing Firestore Connection\n');
  
  // Test 1: Get all books
  console.log('1️⃣ Fetching all books...');
  const booksRef = collection(db, 'books');
  const q = query(booksRef);
  const snapshot = await getDocs(q);
  
  console.log(`✅ Found ${snapshot.docs.length} books in Firestore\n`);
  
  // Test 2: Check Darvas book specifically
  console.log('2️⃣ Checking Darvas book...');
  const darvasRef = doc(db, 'books', 'how-i-made-2000000-in-the-stock-market');
  const darvasDoc = await getDoc(darvasRef);
  
  if (darvasDoc.exists()) {
    const data = darvasDoc.data();
    console.log('✅ Darvas book found!');
    console.log('\nBook details:');
    console.log(`   ID: ${darvasDoc.id}`);
    console.log(`   Title: ${data.title}`);
    console.log(`   Author: ${data.author}`);
    console.log(`   Category: ${data.category}`);
    console.log(`   Rating: ${data.rating}`);
    console.log(`   Has titleLowerCase: ${!!data.titleLowerCase}`);
    console.log(`   Has authorLowerCase: ${!!data.authorLowerCase}`);
    console.log(`   Has categoryLowerCase: ${!!data.categoryLowerCase}`);
    console.log(`   Has ratingsCount: ${!!data.ratingsCount} (${data.ratingsCount})`);
    console.log(`   Has summary: ${!!data.summary}`);
    console.log(`   Has keyTakeaways: ${!!data.keyTakeaways} (${data.keyTakeaways?.length} items)`);
  } else {
    console.log('❌ Darvas book NOT found in Firestore!');
  }
  
  // Test 3: List all book IDs
  console.log('\n3️⃣ All book IDs in Firestore:');
  snapshot.docs.forEach(doc => {
    console.log(`   - ${doc.id}`);
  });
  
  console.log('\n✅ Test complete!\n');
  process.exit(0);
}

testFirestore().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
