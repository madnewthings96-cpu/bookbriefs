import { readFileSync } from 'node:fs';
import { after, before, beforeEach, describe, it } from 'node:test';
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

const PROJECT_ID = 'demo-bookbriefs-rules';
let testEnv;
const adminContext = () => testEnv.authenticatedContext('admin-user', { email: 'belhalyt01@proton.me' });
const authContext = () => testEnv.authenticatedContext('reader', { email: 'reader@example.com' });
const upload = (context, path = 'news/story/lead.jpg', contentType = 'image/jpeg', bytes = new Uint8Array(5)) =>
  context.storage().ref(path).put(bytes, { contentType });

describe('News Storage security rules', () => {
  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: { rules: readFileSync('firestore.rules', 'utf8') },
      storage: { rules: readFileSync('storage.rules', 'utf8') },
    });
  });
  beforeEach(async () => {
    await testEnv.clearStorage();
    await testEnv.clearFirestore();
  });
  after(async () => { await testEnv?.cleanup(); });

  it('rejects anonymous and non-admin uploads, replacements, and deletes', async () => {
    await assertSucceeds(upload(adminContext()));
    for (const context of [testEnv.unauthenticatedContext(), authContext()]) {
      await assertFails(upload(context, 'news/story/new.jpg'));
      await assertFails(upload(context));
      await assertFails(context.storage().ref('news/story/lead.jpg').delete());
    }
  });

  it('accepts JPEG, PNG, and WebP up to exactly 5 MiB for either admin identity', async () => {
    for (const type of ['jpeg', 'png', 'webp']) {
      await assertSucceeds(upload(adminContext(), `news/story/lead.${type}`, `image/${type}`));
    }
    await assertSucceeds(upload(testEnv.authenticatedContext('ME2iHxeBWgcSTpc1HKwKbSCrQ7t2'), 'news/story/limit.jpg', 'image/jpeg', new Uint8Array(5 * 1024 * 1024)));
  });

  it('rejects oversized and unsupported admin creates and updates', async () => {
    await assertSucceeds(upload(adminContext()));
    for (const path of ['news/story/new.jpg', 'news/story/lead.jpg']) {
      for (const type of ['image/svg+xml', 'image/gif', 'text/html', 'application/octet-stream']) {
        await assertFails(upload(adminContext(), path, type));
      }
      await assertFails(upload(adminContext(), path, 'image/jpeg', new Uint8Array(5 * 1024 * 1024 + 1)));
    }
    await assertFails(upload(adminContext(), 'outside/story/lead.jpg'));
    await assertFails(upload(adminContext(), 'news/story/nested/lead.jpg'));
  });

  it('allows public image reads only while their article is published', async () => {
    for (const id of ['published', 'draft', 'missing']) {
      await assertSucceeds(upload(adminContext(), `news/${id}/lead.jpg`));
      if (id !== 'missing') await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().doc(`newsArticles/${id}`).set({ status: id });
      });
      for (const context of [testEnv.unauthenticatedContext(), authContext()]) {
        await (id === 'published' ? assertSucceeds : assertFails)(context.storage().ref(`news/${id}/lead.jpg`).getMetadata());
      }
      await assertSucceeds(adminContext().storage().ref(`news/${id}/lead.jpg`).getMetadata());
    }
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().doc('newsArticles/published').update({ status: 'draft' });
    });
    await assertFails(testEnv.unauthenticatedContext().storage().ref('news/published/lead.jpg').getMetadata());
  });

  it('allows admin deletes even after the article is removed and request.resource is null', async () => {
    await assertSucceeds(upload(adminContext()));
    await assertSucceeds(adminContext().storage().ref('news/story/lead.jpg').delete());
  });
});
