const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');

test('les pages principales existent', () => {
  for (const file of ['emiliana-landing.html', 'emiliana-login.html', 'emiliana-chat.html', 'emiliana-admin.html', 'emiliana-about.html', 'emiliana.css', 'assets/app.js']) {
    assert.equal(fs.existsSync(path.join(root, file)), true, `${file} devrait exister`);
  }
});

test('Express expose l’application sans erreur de chargement', () => {
  const app = require('../src/app');
  assert.equal(typeof app, 'function');
  assert.equal(typeof app.listen, 'function');
});

test('les pages ne contiennent pas l’ancien thème gradient', () => {
  const css = fs.readFileSync(path.join(root, 'emiliana.css'), 'utf8');
  assert.equal(css.includes('--gradient-primary'), false);
  assert.equal(css.includes('backdrop-filter: blur(20px) saturate(180%)'), false);
});
