import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { after, before, beforeEach, describe, it } from 'node:test';

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

const PROJECT_ID = 'demo-bookbriefs-rules';
const RULES = readFileSync('firestore.rules', 'utf8');

let testEnv;

const timestamp = () => firebase.firestore.FieldValue.serverTimestamp();
const storedTimestamp = () => firebase.firestore.Timestamp.fromMillis(0);

const authContext = (uid = 'reader-1', email = 'reader@example.com') =>
  testEnv.authenticatedContext(uid, { email });

const adminContext = () =>
  testEnv.authenticatedContext('admin-user', { email: 'belhalyt01@proton.me' });

const feedbackPayload = (uid = 'reader-1', email = 'reader@example.com') => ({
  message: 'The summary was useful.',
  userId: uid,
  userEmail: email,
  userName: 'Reader One',
  timestamp: timestamp(),
  page: '/feedback',
  userAgent: 'node-rules-test',
  status: 'new',
});

const challengePayload = (uid = 'reader-1') => ({
  userId: uid,
  year: 2026,
  goal: 12,
  booksRead: [],
  createdAt: timestamp(),
  updatedAt: timestamp(),
});

const seedDocument = async (path, data) => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await context.firestore().doc(path).set(data);
  });
};

const newsPayload = (overrides = {}) => ({
  title: 'Weekly outlook', slug: 'weekly-outlook', excerpt: 'The week ahead.',
  body: '## Outlook\nRates remain in focus.', category: 'markets', language: 'en',
  authorName: 'Ta7leel Editorial', imageUrl: 'https://example.com/lead.webp',
  imagePath: 'news/story/lead.webp', imageAlt: 'Market chart on a desk', sources: [],
  status: 'published', createdAt: timestamp(), updatedAt: timestamp(), publishedAt: timestamp(),
  ...overrides,
});

describe('Firestore security rules', () => {
  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: { rules: RULES },
    });
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  after(async () => {
    await testEnv.cleanup();
  });

  describe('editorial news', () => {
    it('permits published public gets and constrained lists, but hides drafts', async () => {
      await seedDocument('newsArticles/story', newsPayload());
      await seedDocument('newsArticles/draft', newsPayload({ status: 'draft', publishedAt: null }));
      for (const context of [testEnv.unauthenticatedContext(), authContext()]) {
        const db = context.firestore();
        await assertSucceeds(db.doc('newsArticles/story').get());
        await assertFails(db.doc('newsArticles/draft').get());
        await assertFails(db.collection('newsArticles').get());
        await assertFails(db.collection('newsArticles').where('status', '==', 'draft').get());
        const published = db.collection('newsArticles').where('status', '==', 'published');
        await assertSucceeds(published.orderBy('publishedAt', 'desc').orderBy(firebase.firestore.FieldPath.documentId(), 'desc').limit(10).get());
        await assertSucceeds(published.where('category', '==', 'markets').orderBy('publishedAt', 'desc').orderBy(firebase.firestore.FieldPath.documentId(), 'desc').limit(10).get());
      }
      await assertSucceeds(adminContext().firestore().collection('newsArticles').orderBy('updatedAt', 'desc').orderBy(firebase.firestore.FieldPath.documentId(), 'desc').get());
      await assertSucceeds(adminContext().firestore().collection('newsArticles').where('status', '==', 'draft').orderBy('updatedAt', 'desc').orderBy(firebase.firestore.FieldPath.documentId(), 'desc').get());
    });

    it('restricts every news write to admins', async () => {
      await seedDocument('newsArticles/story', newsPayload());
      for (const context of [testEnv.unauthenticatedContext(), authContext()]) {
        const db = context.firestore();
        await assertFails(db.doc('newsArticles/new').set(newsPayload()));
        await assertFails(db.doc('newsArticles/story').update({ title: 'Changed' }));
        await assertFails(db.doc('newsArticles/story').delete());
        await assertFails(db.doc('newsArticleSlugs/weekly-outlook').set({ articleId: 'story' }));
        await assertFails(db.doc('newsConfig/editorial').set({ featuredArticleId: 'story', updatedAt: timestamp() }));
      }
      await assertSucceeds(adminContext().firestore().doc('newsArticles/story').delete());
    });

    it('validates administrator article creates and updates without a wildcard bypass', async () => {
      const db = adminContext().firestore();
      await assertSucceeds(db.doc('newsArticles/story').set(newsPayload()));
      await assertSucceeds(db.doc('newsArticles/max-body').set(newsPayload({ body: 'a'.repeat(100000) })));
      const invalidFields = [
        { category: 'sports' }, { language: 'ar' }, { status: 'scheduled' },
        { title: '' }, { title: 'a'.repeat(141) }, { excerpt: 'a'.repeat(241) },
        { body: 'a'.repeat(100001) }, { authorName: 'a'.repeat(81) }, { imageAlt: 'a'.repeat(181) },
        { slug: 'Bad Slug' }, { slug: 'a'.repeat(101) }, { sources: 'bad' },
        { sources: [{ label: 'Source', url: 'http://example.com' }] },
        { sources: [{ label: 123, url: 'https://example.com' }] },
        { imageUrl: 123 }, { imagePath: 123 }, { createdAt: 'now' }, { updatedAt: null },
        { publishedAt: null }, { unexpected: true }, { body: '' }, { imageAlt: '' },
      ];
      for (const [index, fields] of invalidFields.entries()) {
        await assertFails(db.doc(`newsArticles/invalid-${index}`).set(newsPayload(fields)));
        const updateFields = { ...fields };
        if (!Object.hasOwn(updateFields, 'updatedAt')) updateFields.updatedAt = timestamp();
        await assertFails(db.doc('newsArticles/story').update(updateFields));
      }
      const { title, ...missingTitle } = newsPayload();
      await assertFails(db.doc('newsArticles/missing').set(missingTitle));
    });

    it('requires server timestamps and protects first-publication time', async () => {
      const db = adminContext().firestore();
      await assertFails(db.doc('newsArticles/forged-draft').set(newsPayload({
        status: 'draft', createdAt: storedTimestamp(), updatedAt: storedTimestamp(), publishedAt: storedTimestamp(),
      })));
      await assertFails(db.doc('newsArticles/forged-publication').set(newsPayload({ publishedAt: storedTimestamp() })));

      const article = db.doc('newsArticles/timestamped');
      await assertSucceeds(article.set(newsPayload({ status: 'draft', publishedAt: null })));
      await assertFails(article.update({ status: 'published', publishedAt: storedTimestamp(), updatedAt: timestamp() }));
      await assertSucceeds(article.update({ status: 'published', publishedAt: timestamp(), updatedAt: timestamp() }));
      const publishedAt = (await article.get()).data().publishedAt;
      await assertFails(article.update({ status: 'draft', publishedAt: storedTimestamp(), updatedAt: timestamp() }));
      await assertFails(article.update({ status: 'draft', publishedAt, updatedAt: storedTimestamp() }));
      await assertSucceeds(article.update({ status: 'draft', updatedAt: timestamp() }));
      await assertSucceeds(article.update({ status: 'published', updatedAt: timestamp() }));
      assert.equal((await article.get()).data().publishedAt.toMillis(), publishedAt.toMillis());
    });

    it('supports incomplete drafts and the publish, feature, unpublish, republish, delete lifecycle', async () => {
      const db = adminContext().firestore();
      const article = db.doc('newsArticles/story');
      const config = db.doc('newsConfig/editorial');
      await assertSucceeds(article.set(newsPayload({ status: 'draft', publishedAt: null, slug: '', excerpt: '', body: '', authorName: '', imageUrl: '', imagePath: '', imageAlt: '' })));
      const createdAt = (await article.get()).data().createdAt;
      const batch = db.batch();
      batch.set(article, newsPayload({ createdAt }));
      batch.set(db.doc('newsArticleSlugs/weekly-outlook'), { articleId: 'story', createdAt: timestamp() });
      batch.set(config, { featuredArticleId: 'story', updatedAt: timestamp() });
      await assertSucceeds(batch.commit());
      const publishedAt = (await article.get()).data().publishedAt;
      await assertFails(article.update({ slug: 'changed', updatedAt: timestamp() }));
      await assertFails(article.update({ publishedAt: timestamp(), updatedAt: timestamp() }));
      const unpublish = db.batch();
      unpublish.update(article, { status: 'draft', updatedAt: timestamp() });
      unpublish.update(config, { featuredArticleId: null, updatedAt: timestamp() });
      await assertSucceeds(unpublish.commit());
      await assertFails(testEnv.unauthenticatedContext().firestore().doc('newsArticleSlugs/weekly-outlook').get());
      await assertSucceeds(testEnv.unauthenticatedContext().firestore().doc('newsConfig/editorial').get());
      await assertSucceeds(article.update({ status: 'published', updatedAt: timestamp() }));
      assert.equal((await article.get()).data().publishedAt.toMillis(), publishedAt.toMillis());
      await assertSucceeds(article.delete());
      await assertFails(testEnv.unauthenticatedContext().firestore().doc('newsArticleSlugs/weekly-outlook').get());
    });

    it('only exposes slug and featured references to published articles', async () => {
      await seedDocument('newsArticles/story', newsPayload());
      await seedDocument('newsArticles/draft', newsPayload({ status: 'draft', publishedAt: null }));
      const publicDb = testEnv.unauthenticatedContext().firestore();
      for (const id of ['story', 'draft', 'missing']) {
        await seedDocument(`newsArticleSlugs/${id}`, { articleId: id });
        await seedDocument('newsConfig/editorial', { featuredArticleId: id, updatedAt: storedTimestamp() });
        const assertion = id === 'story' ? assertSucceeds : assertFails;
        await assertion(publicDb.doc(`newsArticleSlugs/${id}`).get());
        await assertion(publicDb.doc('newsConfig/editorial').get());
      }
      await assertFails(publicDb.collection('newsArticleSlugs').get());
      await assertFails(publicDb.collection('newsConfig').get());
    });

    it('validates slug/config writes and preserves permanent slug reservations', async () => {
      const db = adminContext().firestore();
      await db.doc('newsArticles/story').set(newsPayload());
      await db.doc('newsArticles/draft').set(newsPayload({ status: 'draft', publishedAt: null }));
      const slug = db.doc('newsArticleSlugs/weekly-outlook');
      await assertSucceeds(slug.set({ articleId: 'story' }));
      await assertFails(slug.update({ articleId: 'draft' }));
      await assertFails(slug.delete());
      await assertFails(db.doc('newsArticleSlugs/bad').set({ articleId: 123 }));
      await assertFails(db.doc('newsArticleSlugs/wrong-slug').set({ articleId: 'story' }));
      await assertFails(db.doc('newsConfig/editorial').set({ featuredArticleId: 'draft', updatedAt: timestamp() }));
      await assertFails(db.doc('newsConfig/editorial').set({ featuredArticleId: 'missing', updatedAt: timestamp() }));
      await assertFails(db.doc('newsConfig/editorial').set({ featuredArticleId: 'story', updatedAt: 'now' }));
      await assertFails(db.doc('newsConfig/other').set({ featuredArticleId: 'story', updatedAt: timestamp() }));
      await assertSucceeds(db.doc('newsConfig/editorial').set({ featuredArticleId: null, updatedAt: timestamp() }));
    });
  });

  describe('existing administrator capabilities', () => {
    it('retains admin CRUD on every previously matched collection and user subcollection', async () => {
      for (const context of [adminContext(), authContext('ME2iHxeBWgcSTpc1HKwKbSCrQ7t2', 'other@example.com')]) {
        for (const path of ['users/other', 'users/other/goals/item', 'users/other/trades/item', 'users/other/custom/item', 'feedback/item', 'reading_challenges/item', 'communityMessages/item', 'books/item', 'progress/other', 'favorites/other', 'notes/other', 'highlights/other']) {
          const doc = context.firestore().doc(path);
          await assertSucceeds(doc.set({ adminManaged: true }));
          await assertSucceeds(doc.get());
          await assertSucceeds(doc.update({ changed: true }));
          await assertSucceeds(doc.delete());
        }
      }
      await assertFails(adminContext().firestore().doc('unlisted/item').set({ value: true }));
    });
  });

  describe('feedback', () => {
    it('lets authenticated users create only their own valid feedback', async () => {
      const db = authContext().firestore();

      await assertSucceeds(db.collection('feedback').doc('valid').set(feedbackPayload()));
    });

    it('rejects anonymous feedback and spoofed user fields', async () => {
      await assertFails(
        testEnv.unauthenticatedContext().firestore()
          .collection('feedback')
          .doc('anonymous')
          .set(feedbackPayload())
      );

      await assertFails(
        authContext('reader-1', 'reader@example.com').firestore()
          .collection('feedback')
          .doc('spoofed')
          .set(feedbackPayload('someone-else', 'reader@example.com'))
      );

      await assertFails(
        authContext('reader-1', 'reader@example.com').firestore()
          .collection('feedback')
          .doc('email-spoofed')
          .set(feedbackPayload('reader-1', 'other@example.com'))
      );
    });

    it('keeps feedback private to admins after creation', async () => {
      await seedDocument('feedback/private', {
        ...feedbackPayload(),
        timestamp: storedTimestamp(),
      });

      await assertFails(
        authContext().firestore().collection('feedback').doc('private').get()
      );

      await assertSucceeds(
        adminContext().firestore().collection('feedback').doc('private').get()
      );
    });

    it('rejects non-null ratings and extra fields on feedback creation', async () => {
      const db = authContext().firestore();

      await assertFails(
        db.collection('feedback').doc('rating').set({
          ...feedbackPayload(),
          rating: 5,
        })
      );

      await assertFails(
        db.collection('feedback').doc('extra').set({
          ...feedbackPayload(),
          debug: true,
        })
      );
    });
  });

  describe('reading challenges', () => {
    it('lets users create their own valid challenge', async () => {
      await assertSucceeds(
        authContext().firestore()
          .collection('reading_challenges')
          .doc('reader-1_2026')
          .set(challengePayload())
      );
    });

    it('rejects anonymous, spoofed, and malformed challenge creates', async () => {
      await assertFails(
        testEnv.unauthenticatedContext().firestore()
          .collection('reading_challenges')
          .doc('reader-1_2026')
          .set(challengePayload())
      );

      await assertFails(
        authContext('reader-1').firestore()
          .collection('reading_challenges')
          .doc('reader-1_2026')
          .set(challengePayload('someone-else'))
      );

      await assertFails(
        authContext('reader-1').firestore()
          .collection('reading_challenges')
          .doc('reader-1_2026')
          .set({
            ...challengePayload(),
            goal: 1001,
          })
      );

      await assertFails(
        authContext('reader-1').firestore()
          .collection('reading_challenges')
          .doc('reader-1_2026')
          .set({
            ...challengePayload(),
            unexpected: true,
          })
      );
    });

    it('lets only the owner update progress without changing ownership or creation metadata', async () => {
      await seedDocument('reading_challenges/reader-1_2026', {
        userId: 'reader-1',
        year: 2026,
        goal: 12,
        booksRead: [],
        createdAt: storedTimestamp(),
        updatedAt: storedTimestamp(),
      });

      await assertSucceeds(
        authContext('reader-1').firestore()
          .collection('reading_challenges')
          .doc('reader-1_2026')
          .update({
            booksRead: ['atomic-habits'],
            updatedAt: timestamp(),
          })
      );

      await assertFails(
        authContext('reader-2').firestore()
          .collection('reading_challenges')
          .doc('reader-1_2026')
          .update({
            booksRead: ['atomic-habits', 'deep-work'],
            updatedAt: timestamp(),
          })
      );

      await assertFails(
        authContext('reader-1').firestore()
          .collection('reading_challenges')
          .doc('reader-1_2026')
          .update({
            userId: 'reader-2',
            updatedAt: timestamp(),
          })
      );

      await assertFails(
        authContext('reader-1').firestore()
          .collection('reading_challenges')
          .doc('reader-1_2026')
          .update({
            createdAt: timestamp(),
            updatedAt: timestamp(),
          })
      );
    });

    it('keeps public reads but restricts deletes to the owner', async () => {
      await seedDocument('reading_challenges/reader-1_2026', {
        userId: 'reader-1',
        year: 2026,
        goal: 12,
        booksRead: [],
        createdAt: storedTimestamp(),
        updatedAt: storedTimestamp(),
      });

      const publicDoc = testEnv.unauthenticatedContext().firestore()
        .collection('reading_challenges')
        .doc('reader-1_2026');

      await assertSucceeds(publicDoc.get());
      assert.equal((await publicDoc.get()).exists, true);

      await assertFails(
        authContext('reader-2').firestore()
          .collection('reading_challenges')
          .doc('reader-1_2026')
          .delete()
      );

      await assertSucceeds(
        authContext('reader-1').firestore()
          .collection('reading_challenges')
          .doc('reader-1_2026')
          .delete()
      );
    });
  });
});
