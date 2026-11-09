import { test } from 'node:test';
import assert from 'node:assert/strict';

import { toLittleText } from './lib.mjs';

test('escapes reserved characters but keeps URLs and hashtags usable', () => {
  const out = toLittleText('Bakın (yeni): https://jurvia.com.tr/demo?utm_source=linkedin #hukukbürosu @ad');
  assert.equal(out, 'Bakın \\(yeni\\): https://jurvia.com.tr/demo?utm_source=linkedin {hashtag|\\#|hukukbürosu} \\@ad');
});
