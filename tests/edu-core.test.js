'use strict';
const assert = require('assert');
const EduCore = require('../assets/core.js');

const all = (n) => Array.from({length: 12}, (_, i) => (i === 10 ? 4 : n));

assert.strictEqual(EduCore.valid(all(3)), true, 'T01 valid complete 1–5');
assert.strictEqual(EduCore.valid(all(3).slice(0, 11)), false, 'T02 reject length 11');
assert.strictEqual(EduCore.valid(all(3).map((v, i) => (i === 0 ? 0 : v))), false, 'T03 reject 0');
assert.strictEqual(EduCore.valid(all(3).map((v, i) => (i === 0 ? 6 : v))), false, 'T04 reject 6');
assert.strictEqual(EduCore.valid(all(3).map((v, i) => (i === 0 ? 2.5 : v))), false, 'T05 reject non-integer');

const s3 = EduCore.summarize(all(3));
assert.ok(s3, 'T06 summarize complete');
assert.strictEqual(s3.capabilityMean, 3, 'T06 capability excludes item 11');
assert.strictEqual(s3.attitude, 4, 'T11 attitude is item 11');
assert.strictEqual(EduCore.summarize(all(5)).capabilityMean, 5, 'T07 all fives');

const mixed = [1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 2, 3];
const sm = EduCore.summarize(mixed);
assert.strictEqual(sm.capabilityMean, (1 + 2 + 3 + 4 + 5 + 1 + 2 + 3 + 4 + 5 + 3) / 11, 'T08 mixed mean');
assert.strictEqual(sm.attitude, 2, 'T08 attitude 2');

const cmp = EduCore.compare(all(2), all(4));
assert.ok(cmp, 'T09 compare both complete');
assert.strictEqual(cmp.change, 2, 'T09 change is after-before');
assert.strictEqual(EduCore.compare(all(3), null), null, 'T10 missing after');
assert.strictEqual(EduCore.compare(null, all(3)), null, 'T10 missing before');

assert.strictEqual(
  EduCore.safeDiscussionUrl('https://github.com/example-org/ayutthaya-education/discussions'),
  'https://github.com/example-org/ayutthaya-education/discussions',
  'T12 github discussions'
);
assert.strictEqual(EduCore.safeDiscussionUrl('http://github.com/example-org/ayutthaya-education/discussions'), null, 'T13 reject http');
assert.strictEqual(EduCore.safeDiscussionUrl('https://example.com/discussions'), null, 'T14 reject other host');
assert.strictEqual(EduCore.safeDiscussionUrl('https://github.com/example-org/ayutthaya-education/discussions?x=1'), null, 'T15 reject query');
assert.strictEqual(EduCore.safeDiscussionUrl('https://github.com/example-org/ayutthaya-education/discussions#x'), null, 'T16 reject hash');
assert.strictEqual(EduCore.safeDiscussionUrl(''), null, 'T17 reject empty');

assert.strictEqual(EduCore.projectIdFromSearch('?project=E1'), 'E1', 'T18 E1');
assert.strictEqual(EduCore.projectIdFromSearch('?project=E6'), 'E6', 'T19 E6');
assert.strictEqual(EduCore.projectIdFromSearch('?project=E7'), null, 'T20 reject E7');
assert.strictEqual(EduCore.projectIdFromSearch(''), null, 'T21 missing project');

console.log('edu-core: 21 assertions passed');
