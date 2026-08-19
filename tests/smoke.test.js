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
  assert.equal(css.includes('purple'), false);
});

test('les nouvelles pages MPA et la source de vérité produit existent', () => {
  for (const page of ['emiliana-companions.html', 'emiliana-account.html', 'docs/PROMPT_GAP_ANALYSIS.md', 'docs/SKILLS_USED.md', 'src/config/plans.js', 'src/config/companions.js', 'assets/virelia-hero-editorial.jpg', 'assets/virelia-silver-surfer.jpg']) assert.equal(fs.existsSync(path.join(root, page)), true, page);
  const landing = fs.readFileSync(path.join(root, 'emiliana-landing.html'), 'utf8');
  assert.match(landing, /VIRELIA/);
  assert.match(landing, /LIA/);
});

test('Vercel publie les assets et route l’API vers le handler serverless', () => {
  const vercel = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
  const api = fs.readFileSync(path.join(root, 'api/index.js'), 'utf8');
  assert.equal(vercel.builds.some((build) => build.src === 'api/index.js'), true);
  assert.equal(vercel.builds.some((build) => build.src === 'assets/**'), true);
  assert.equal(vercel.routes.some((route) => route.src === '/api/(.*)' && route.dest === '/api/index.js'), true);
  assert.match(api, /require\('\.\.\/src\/app'\)/);
});

test('la landing applique la direction spatiale et le motion system', () => {
  const landing = fs.readFileSync(path.join(root, 'emiliana-landing.html'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'emiliana.css'), 'utf8');
  const app = fs.readFileSync(path.join(root, 'assets/app.js'), 'utf8');
  assert.match(landing, /hero-space/);
  assert.match(landing, /virelia-silver-surfer\.jpg/);
  assert.match(landing, /site-header-space/);
  assert.match(landing, /data-reveal=/);
  assert.match(landing, /data-parallax=/);
  assert.match(css, /backdrop-filter: blur\(18px\)/);
  assert.match(css, /--space-cyan/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(app, /IntersectionObserver/);
  assert.match(app, /requestAnimationFrame/);
});

test('les vues disposent de contrôles mobiles et de règles responsive', () => {
  const css = fs.readFileSync(path.join(root, 'emiliana.css'), 'utf8');
  const chat = fs.readFileSync(path.join(root, 'emiliana-chat.html'), 'utf8');
  const admin = fs.readFileSync(path.join(root, 'emiliana-admin.html'), 'utf8');
  const app = fs.readFileSync(path.join(root, 'assets/app.js'), 'utf8');
  const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
  assert.match(css, /@media \(max-width: 620px\)/);
  assert.match(css, /overflow-x: auto/);
  assert.match(chat, /data-chat-rail-toggle/);
  assert.match(admin, /data-cms-nav-toggle/);
  assert.match(app, /chatRailButton/);
  assert.match(app, /cmsNavButton/);
  assert.match(readme, /git push origin main/);
});

test('le chat et le CMS respectent le périmètre fonctionnel', () => {
  const chat = fs.readFileSync(path.join(root, 'emiliana-chat.html'), 'utf8');
  const admin = fs.readFileSync(path.join(root, 'emiliana-admin.html'), 'utf8');
  assert.match(chat, /class="chat-workspace"/);
  assert.match(chat, /class="composer-wrap"/);
  assert.doesNotMatch(chat, /audio|video|drag|drop|upload/i);
  assert.match(admin, /class="space-admin"/);
  for (const section of ['overview', 'companions', 'prompts', 'conversations', 'users', 'security', 'providers', 'knowledge', 'automations', 'moderation', 'billing', 'alerts', 'widget', 'deployments', 'settings', 'audit']) assert.match(admin, new RegExp(`data-cms-view="${section}"`));
});
