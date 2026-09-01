const assert = require('node:assert/strict');
const fs = require('node:fs');

const page = fs.readFileSync('calculators/ebeam-pointing.md', 'utf8');
const script = fs.readFileSync('assets/js/ebeam-pointing.js', 'utf8');

for (const id of ['calc-progress-wrapper', 'calc-progress-bar', 'calc-progress-label', 'calc-progress-detail']) {
  assert.match(page, new RegExp(`id="${id}"`));
}
assert.match(page, /role="progressbar"/);
assert.match(script, /function showProgress\(/);
assert.match(script, /function hideProgress\(/);
assert.match(script, /function yieldToDOM\(/);
assert.match(script, /async function runCalculations\(/);
assert.match(script, /await yieldToDOM\(\)/);
assert.match(script, /finally \{/);
console.log('Electron-beam progress wiring checks passed');
