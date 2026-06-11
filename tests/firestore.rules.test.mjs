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
