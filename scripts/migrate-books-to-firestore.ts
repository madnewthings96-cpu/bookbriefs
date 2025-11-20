/**
 * Migration Script: Move Books from constants.ts to Firestore
 * 
 * This script will:
 * 1. Read all books from constants.ts
 * 2. Upload them to Firebase Firestore
 * 3. Create proper indexes for searching
 * 
 * Run once: npx tsx scripts/migrate-books-to-firestore.ts
 */

import * as dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import { BOOKS } from '../constants';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateBooks() {
  console.log('🚀 Starting book migration to Firestore...');
  console.log(`📚 Found ${BOOKS.length} books to migrate`);

  let successCount = 0;
  let errorCount = 0;
  
  // Firestore has a batch limit of 500 operations
  const BATCH_SIZE = 500;
  const batches = [];
  
  for (let i = 0; i < BOOKS.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const booksChunk = BOOKS.slice(i, i + BATCH_SIZE);
    
    booksChunk.forEach((book) => {
      const bookRef = doc(collection(db, 'books'), book.id);
      batch.set(bookRef, {
        ...book,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Add search-friendly fields
        titleLowerCase: book.title.toLowerCase(),
        authorLowerCase: book.author.toLowerCase(),
        categoryLowerCase: book.category.toLowerCase(),
      });
    });
    
    batches.push(batch);
  }

  // Execute all batches
  for (let i = 0; i < batches.length; i++) {
    try {
      await batches[i].commit();
      const batchSize = Math.min(BATCH_SIZE, BOOKS.length - i * BATCH_SIZE);
      successCount += batchSize;
      console.log(`✅ Batch ${i + 1}/${batches.length} committed (${batchSize} books)`);
    } catch (error) {
      console.error(`❌ Error in batch ${i + 1}:`, error);
      errorCount += Math.min(BATCH_SIZE, BOOKS.length - i * BATCH_SIZE);
    }
  }

  console.log('\n📊 Migration Summary:');
  console.log(`   ✅ Successfully migrated: ${successCount} books`);
  console.log(`   ❌ Failed: ${errorCount} books`);
  console.log(`   📈 Total: ${BOOKS.length} books`);
  
  if (successCount === BOOKS.length) {
    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Update your app to use BooksContext');
    console.log('   2. Test that books load correctly');
    console.log('   3. Remove BOOKS array from constants.ts');
  } else {
    console.log('\n⚠️  Migration completed with errors. Please review the logs.');
  }
  
  process.exit(0);
}

// Run the migration
migrateBooks().catch((error) => {
  console.error('💥 Fatal error during migration:', error);
  process.exit(1);
});
