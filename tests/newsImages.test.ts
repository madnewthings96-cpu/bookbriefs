import assert from 'node:assert/strict';
import test from 'node:test';
import { buildNewsImageUrl } from '../components/news/newsImages';

test('buildNewsImageUrl returns a tokenless URL with an encoded image path', () => {
  assert.equal(
    buildNewsImageUrl('gs://ta7leel.firebasestorage.app/', 'news/story/lead image.webp'),
    'https://firebasestorage.googleapis.com/v0/b/ta7leel.firebasestorage.app/o/news%2Fstory%2Flead%20image.webp?alt=media',
  );
});

test('buildNewsImageUrl rejects missing bucket or image path', () => {
  assert.throws(() => buildNewsImageUrl('', 'news/story/lead.webp'));
  assert.throws(() => buildNewsImageUrl('ta7leel.firebasestorage.app', ''));
});
