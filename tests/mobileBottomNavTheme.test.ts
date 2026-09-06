import assert from 'node:assert/strict';
import test from 'node:test';

import * as mobileBottomNavModule from '../components/MobileBottomNav';

test('standard navigation uses the forest atmosphere while reader mode stays quiet', () => {
  const getAppearance = (
    mobileBottomNavModule as typeof mobileBottomNavModule & {
      getMobileBottomNavAppearance?: (isReaderMode: boolean) => {
        surface: 'forest' | 'reader';
        showSparkles: boolean;
      };
    }
  ).getMobileBottomNavAppearance;

  assert.deepEqual(getAppearance?.(false), { surface: 'forest', showSparkles: true });
  assert.deepEqual(getAppearance?.(true), { surface: 'reader', showSparkles: false });
});
