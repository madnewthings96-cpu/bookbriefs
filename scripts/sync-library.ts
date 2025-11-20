#!/usr/bin/env tsx

/**
 * Library Sync Script
 * 
 * Syncs all books from scripts/library/ to Firestore
 * 
 * Usage:
 *   npm run sync-library
 *   npm run sync-library -- --force  (to update existing books)
 */

import { config } from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as readline from 'readline';
import { BookDefinition, SyncResult, SyncStats } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '..', '.env.local') });

// Firebase config
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

// Helper to get user input
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

// Generate search terms for better discoverability
function generateSearchTerms(book: BookDefinition): string[] {
  const terms = new Set<string>();
  
  // Add title words
  book.title.toLowerCase().split(/\s+/).forEach(word => {
    if (word.length > 2) terms.add(word);
  });
  
  // Add author words
  book.author.toLowerCase().split(/\s+/).forEach(word => {
    if (word.length > 2) terms.add(word);
  });
  
  // Add category
  terms.add(book.category.toLowerCase());
  
  // Add full title and author
  terms.add(book.title.toLowerCase());
  terms.add(book.author.toLowerCase());
  
  return Array.from(terms);
}

// Validate book data
function validateBook(book: BookDefinition): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!book.id) errors.push('Missing id');
  if (!book.title) errors.push('Missing title');
  if (!book.author) errors.push('Missing author');
  if (!book.category) errors.push('Missing category');
  if (!book.coverImageUrl) errors.push('Missing coverImageUrl');
  if (typeof book.rating !== 'number' || book.rating < 0 || book.rating > 5) {
    errors.push('Invalid rating (must be 0-5)');
  }
  if (!book.publicationYear || book.publicationYear < 1000) {
    errors.push('Invalid publicationYear');
  }
  if (!book.pageCount || book.pageCount < 1) {
    errors.push('Invalid pageCount');
  }
  if (!book.summary || book.summary.length < 100) {
    errors.push('Summary too short (min 100 characters)');
  }
  if (!book.keyTakeaways || book.keyTakeaways.length === 0) {
    errors.push('Missing keyTakeaways');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Sync a single book to Firestore
async function syncBook(book: BookDefinition, forceUpdate: boolean = false): Promise<SyncResult> {
  try {
    // Validate book
    const validation = validateBook(book);
    if (!validation.valid) {
      return {
        success: false,
        bookId: book.id,
        operation: 'error',
        message: `Validation failed: ${validation.errors.join(', ')}`
      };
    }

    const bookRef = doc(db, 'books', book.id);
    
    // Check if book already exists
    const existingDoc = await getDoc(bookRef);
    const exists = existingDoc.exists();
    
    // Skip if exists and not forcing update
    if (exists && !forceUpdate) {
      return {
        success: true,
        bookId: book.id,
        operation: 'skipped',
        message: 'Book already exists (use --force to update)'
      };
    }

    // Prepare book data for Firestore
    const bookData = {
      ...book,
      searchTerms: generateSearchTerms(book),
      updatedAt: new Date().toISOString(),
      createdAt: exists ? existingDoc.data()?.createdAt : new Date().toISOString()
    };

    // Save to Firestore
    await setDoc(bookRef, bookData);

    return {
      success: true,
      bookId: book.id,
      operation: exists ? 'updated' : 'created',
      message: `Successfully ${exists ? 'updated' : 'created'} book`
    };

  } catch (error: any) {
    return {
      success: false,
      bookId: book.id,
      operation: 'error',
      message: error.message,
      error
    };
  }
}

// Load all books from library folder
async function loadBooksFromLibrary(): Promise<BookDefinition[]> {
  const libraryPath = join(__dirname, 'library');
  const files = readdirSync(libraryPath).filter(f => f.endsWith('.ts'));
  
  const books: BookDefinition[] = [];
  
  for (const file of files) {
    try {
      const module = await import(join(libraryPath, file));
      if (module.book) {
        books.push(module.book);
      }
    } catch (error) {
      console.error(`❌ Error loading ${file}:`, error);
    }
  }
  
  return books;
}

// Main sync function
async function syncLibrary() {
  console.log('\n📚 BookBriefs Library Sync Tool\n');
  console.log('═══════════════════════════════════════\n');

  try {
    // Check for --force flag
    const forceUpdate = process.argv.includes('--force');
    
    // Authenticate
    console.log('🔐 Authentication required\n');
    const email = await askQuestion('Email: ');
    const password = await askQuestion('Password: ');
    
    console.log('\n🔄 Authenticating...');
    await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Authenticated successfully!\n');

    // Load books
    console.log('📖 Loading books from library...');
    const books = await loadBooksFromLibrary();
    console.log(`Found ${books.length} book(s)\n`);

    if (books.length === 0) {
      console.log('⚠️  No books found in scripts/library/');
      console.log('\n💡 Create a new book file:');
      console.log('   scripts/library/your-book-name.ts\n');
      process.exit(0);
    }

    // Sync books
    console.log('🔄 Syncing to Firestore...\n');
    
    const stats: SyncStats = {
      total: books.length,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
      books: []
    };

    for (const book of books) {
      process.stdout.write(`   ${book.title}... `);
      
      const result = await syncBook(book, forceUpdate);
      stats.books.push(result);

      if (result.success) {
        if (result.operation === 'created') {
          stats.created++;
          console.log('✅ Created');
        } else if (result.operation === 'updated') {
          stats.updated++;
          console.log('🔄 Updated');
        } else {
          stats.skipped++;
          console.log('⏭️  Skipped');
        }
      } else {
        stats.errors++;
        console.log(`❌ Error: ${result.message}`);
      }
    }

    // Print summary
    console.log('\n═══════════════════════════════════════');
    console.log('📊 Sync Summary\n');
    console.log(`   Total:   ${stats.total}`);
    console.log(`   Created: ${stats.created}`);
    console.log(`   Updated: ${stats.updated}`);
    console.log(`   Skipped: ${stats.skipped}`);
    console.log(`   Errors:  ${stats.errors}`);
    console.log('═══════════════════════════════════════\n');

    if (stats.errors > 0) {
      console.log('❌ Errors occurred:\n');
      stats.books.filter(b => !b.success).forEach(b => {
        console.log(`   ${b.bookId}: ${b.message}`);
      });
      console.log();
    } else {
      console.log('✅ All books synced successfully!');
    }

    console.log('\n💡 Tips:');
    console.log('   • Use --force flag to update existing books');
    console.log('   • Check your Firestore console to verify the data');
    console.log('   • Refresh your website to see new books\n');

    process.exit(stats.errors > 0 ? 1 : 0);

  } catch (error: any) {
    console.error('\n❌ Fatal error:', error.message);
    if (error.code === 'auth/invalid-credential') {
      console.error('Invalid email or password.');
    }
    process.exit(1);
  }
}

// Run the script
syncLibrary();
