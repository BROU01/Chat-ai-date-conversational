(() => {
  'use strict';

  const TOKEN_KEY = 'emiliana_token';
  const USER_KEY = 'emiliana_user';
  const API = '/api';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const storage = window.sessionStorage;

  const getUser = () => { try { return JSON.parse(storage.getItem(USER_KEY) || 'null'); } catch { return null; } };
  const getToken = () => storage.getItem(TOKEN_KEY);
  const setSession = (token, user) => { if (token) storage.setItem(TOKEN_KEY, token); if (user) storage.setItem(USER_KEY, JSON.stringify(user)); };
  const clearSession = () => { storage.removeItem(TOKEN_KEY); storage.removeItem(USER_KEY); };
  const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const initials = (name) => String(name || 'E').trim().slice(0, 1).toUpperCase();
  const displayDate = (value) => value ? new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value)) : '—';

  function notify(message) {
    const toast = $('#toast'); if (!toast) return;
    toast.textContent = message; toast.hidden = false; window.clearTimeout(notify.timeout);
    notify.timeout = window.setTimeout(() => { toast.hidden = true; }, 4200);
  }

  async function api(path, options = {}) {
    const headers = { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) };
    const token = getToken(); if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(`${API}${path}`, { ...options, headers });
    let payload = {}; try { payload = await response.json(); } catch { /* empty */ }
    if (!response.ok) { const error = new Error(payload.message || payload.error || 'Une erreur est survenue.'); error.status = response.status; error.payload = payload; throw error; }
    return payload;
  }

  function renderUserChip() {
    const user = getUser();
    $$('.js-user-name').forEach((node) => { node.textContent = user?.username || user?.email || 'Votre espace'; });
    $$('.js-user-email').forEach((node) => { node.textContent = user?.email || ''; });
    $$('.js-avatar').forEach((node) => { node.textContent = initials(user?.username || user?.email); });
  }

  function protectPage({ admin = false } = {}) {
    const user = getUser();
    if (!getToken() || !user) { window.location.replace('/login'); return false; }
    if (admin && user.role !== 'admin') { window.location.replace('/chat'); return false; }
    renderUserChip(); return true;
  }

  function setupTheme() {
    const saved = localStorage.getItem('virelia-theme');
    const theme = saved || (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.dataset.theme = theme;
    $$('[data-theme-toggle]').forEach((button) => { button.textContent = theme === 'dark' ? 'Clair' : 'Sombre'; button.setAttribute('aria-pressed', String(theme === 'dark')); button.addEventListener('click', () => { const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = next; localStorage.setItem('virelia-theme', next); $$('[data-theme-toggle]').forEach((item) => { item.textContent = next === 'dark' ? 'Clair' : 'Sombre'; item.setAttribute('aria-pressed', String(next === 'dark')); }); }); });
  }

  function setupMotion() {
    const revealNodes = $$('[data-reveal]');
    if (!revealNodes.length) return;
    revealNodes.filter((node) => node.dataset.reveal === 'card').forEach((node, index) => { node.style.setProperty('--reveal-index', String(index % 3)); });
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !('IntersectionObserver' in window)) { revealNodes.forEach((node) => node.classList.add('is-visible')); return; }
    const observer = new IntersectionObserver((entries, instance) => { entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); instance.unobserve(entry.target); } }); }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    revealNodes.forEach((node) => observer.observe(node));
    const parallaxNodes = $$('[data-parallax]');
    if (!parallaxNodes.length) return;
    let ticking = false;
    const updateParallax = () => { const scrollY = window.scrollY; parallaxNodes.forEach((node) => { const speed = Number(node.dataset.parallax) || 0; const rect = node.parentElement?.getBoundingClientRect(); const offset = rect ? (rect.top + rect.height / 2 - window.innerHeight / 2) * speed : scrollY * speed; node.style.transform = `translate3d(0, ${offset * -1}px, 0) scale(1.08)`; }); ticking = false; };
    const onScroll = () => { if (!ticking) { window.requestAnimationFrame(updateParallax); ticking = true; } };
    window.addEventListener('scroll', onScroll, { passive: true }); updateParallax();
  }

  function setupGlobal() {
    setupTheme();
    setupMotion();
    renderUserChip();
    const sidebar = $('.app-sidebar'); const menuButton = $('[data-sidebar-toggle]');
    menuButton?.addEventListener('click', () => sidebar?.classList.toggle('is-open'));
    $$('.app-sidebar a').forEach((link) => link.addEventListener('click', () => sidebar?.classList.remove('is-open')));
    const chatRail = $('.chat-rail'); const chatRailButton = $('[data-chat-rail-toggle]');
    chatRailButton?.addEventListener('click', () => { const open = chatRail?.classList.toggle('is-open'); chatRailButton.setAttribute('aria-expanded', String(Boolean(open))); });
    $$('.chat-rail a').forEach((link) => link.addEventListener('click', () => { chatRail?.classList.remove('is-open'); chatRailButton?.setAttribute('aria-expanded', 'false'); }));
    const cmsNav = $('.cms-nav'); const cmsNavButton = $('[data-cms-nav-toggle]');
    cmsNavButton?.addEventListener('click', () => { const open = cmsNav?.classList.toggle('is-open'); cmsNavButton.setAttribute('aria-expanded', String(Boolean(open))); });
    $$('.cms-nav button').forEach((button) => button.addEventListener('click', () => { cmsNav?.classList.remove('is-open'); cmsNavButton?.setAttribute('aria-expanded', 'false'); }));
    $$('.js-logout').forEach((button) => button.addEventListener('click', async () => {
      try { await api('/auth/logout', { method: 'POST' }); } catch { /* local cleanup is enough */ }
      clearSession(); window.location.replace('/');
    }));
  }

  function setupAuth() {
    const loginForm = $('#login-form'); const registerForm = $('#register-form'); const message = $('#form-message'); if (!loginForm || !registerForm) return;
    const showMessage = (text, success = false) => { message.textContent = text; message.style.color = success ? 'var(--accent)' : 'var(--danger)'; };
    $$('.auth-tab').forEach((tab) => tab.addEventListener('click', () => { $$('.auth-tab').forEach((item) => item.classList.toggle('is-active', item === tab)); const mode = tab.dataset.mode; loginForm.hidden = mode !== 'login'; registerForm.hidden = mode !== 'register'; showMessage(''); }));
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault(); const button = $('button[type="submit"]', loginForm); button.disabled = true; button.textContent = 'Connexion…'; showMessage('');
      try { if (!window.auth) throw new Error('Le service d’authentification n’est pas configuré.'); const credentials = await window.auth.signInWithEmailAndPassword($('#login-email').value.trim(), $('#login-password').value); const token = await credentials.user.getIdToken(true); const result = await api('/auth/login', { method: 'POST', body: JSON.stringify({ idToken: token }) }); setSession(result.token || token, result.user); window.location.replace('/chat'); }
      catch (error) { showMessage(error.message || 'Connexion impossible.'); } finally { button.disabled = false; button.textContent = 'Se connecter'; }
    });
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault(); const button = $('button[type="submit"]', registerForm); const password = $('#register-password').value; if (password !== $('#register-confirm').value) return showMessage('Les mots de passe ne correspondent pas.'); if (password.length < 8) return showMessage('Le mot de passe doit contenir au moins 8 caractères.'); button.disabled = true; button.textContent = 'Création…'; showMessage('');
      try { if (!window.auth) throw new Error('Le service d’authentification n’est pas configuré.'); const username = $('#register-name').value.trim(); const credentials = await window.auth.createUserWithEmailAndPassword($('#register-email').value.trim(), password); await credentials.user.updateProfile({ displayName: username }); const token = await credentials.user.getIdToken(true); const result = await api('/auth/register', { method: 'POST', body: JSON.stringify({ idToken: token, username }) }); setSession(result.token || token, result.user); window.location.replace('/chat'); }
      catch (error) { showMessage(error.message || 'Création du compte impossible.'); } finally { button.disabled = false; button.textContent = 'Créer mon compte'; }
    });
    $$('.js-social').forEach((button) => button.addEventListener('click', async () => { try { if (!window.auth) throw new Error('Le service d’authentification n’est pas configuré.'); const result = await window.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()); const token = await result.user.getIdToken(true); const session = await api('/auth/social', { method: 'POST', body: JSON.stringify({ idToken: token, provider: 'google' }) }); setSession(session.token || token, session.user); window.location.replace('/chat'); } catch (error) { showMessage(error.message || 'Connexion sociale impossible.'); } }));
  }

  const companions = [
    { type: 'simon', name: 'Simon', role: 'Ami bienveillant', initial: 'S', description: 'Une présence chaleureuse pour déposer ce qui compte, sans jugement.' },
    { type: 'junior', name: 'Junior', role: 'Ami créatif', initial: 'J', description: 'Une énergie curieuse pour chercher des idées et ouvrir de nouvelles pistes.' },
    { type: 'kevin', name: 'Kevin', role: 'Ami confident', initial: 'K', description: 'Un échange discret et profond pour prendre du recul en sécurité.' },
    { type: 'ludmilla', name: 'Ludmilla', role: 'Mentor inspirant', initial: 'L', description: 'Un regard structurant pour transformer une intention en prochaine étape.' },
    { type: 'annabella', name: 'Annabella', role: 'Complice', initial: 'A', description: 'Une conversation vivante, légère et attentive à votre rythme.' },
    { type: 'lia', name: 'LIA', role: 'Présence attentive', initial: 'L', description: 'Le compagnon par défaut de VIRELIA pour commencer simplement.' }
  ];

  function setupChat() {
    if (!protectPage()) return;
    const list = $('#companion-list'); const messages = $('#message-list'); const form = $('#chat-form'); const input = $('#chat-input'); const status = $('#chat-status'); const title = $('#chat-companion-name'); const role = $('#chat-companion-role'); const avatar = $('#chat-avatar'); const personalityType = $('#personality-type'); const characterTrait = $('#character-trait'); const adultCheck = $('#adult-check'); const quotaDisplay = $('#quota-display');
    if (!list || !messages || !form) return;
    let selected = companions[5]; const history = [];
    const syncMatureTraits = () => { $$('[data-mature]', characterTrait).forEach((option) => { option.hidden = !adultCheck?.checked; }); if (characterTrait?.selectedOptions[0]?.dataset.mature && !adultCheck?.checked) characterTrait.value = 'caring'; };
    function updateHeader() { title.textContent = selected.name; role.textContent = selected.role; avatar.textContent = selected.initial; }
    function renderCompanions() { list.textContent = ''; companions.forEach((companion) => { const button = document.createElement('button'); button.type = 'button'; button.className = `companion-item${companion.type === selected.type ? ' is-active' : ''}`; button.innerHTML = `<span class="avatar">${escape(companion.initial)}</span><span><strong>${escape(companion.name)}</strong><small>${escape(companion.role)}</small></span>`; button.addEventListener('click', () => { selected = companion; renderCompanions(); updateHeader(); renderWelcome(); }); list.appendChild(button); }); }
    function addMessage(kind, content, timestamp = new Date()) { const row = document.createElement('div'); row.className = `message-row ${kind}`; const avatarNode = document.createElement('span'); avatarNode.className = 'avatar avatar-sm'; avatarNode.textContent = kind === 'user' ? initials(getUser()?.username) : selected.initial; const wrap = document.createElement('div'); wrap.className = 'message-content-wrap'; const author = document.createElement('div'); author.className = 'message-author'; author.textContent = kind === 'user' ? 'Vous' : selected.name; const body = document.createElement('div'); body.className = 'message-content'; body.textContent = content; const time = document.createElement('div'); time.className = 'message-time'; time.textContent = displayDate(timestamp); wrap.append(author, body, time); row.append(avatarNode, wrap); messages.appendChild(row); messages.scrollTop = messages.scrollHeight; }
    function renderWelcome() { messages.textContent = ''; addMessage('assistant', `Bonjour, je suis ${selected.name}. ${selected.description}`); }
    async function loadHistory() { try { const result = await api('/chat/history?limit=30'); if (!result.messages?.length) return; messages.textContent = ''; result.messages.reverse().forEach((item) => { addMessage('user', item.userMessage, item.createdAt); addMessage('assistant', item.botResponse, item.createdAt); history.push({ role: 'user', content: item.userMessage }, { role: 'assistant', content: item.botResponse }); }); } catch { /* conversation remains usable */ } }
    renderCompanions(); updateHeader(); syncMatureTraits(); renderWelcome(); loadHistory();
    adultCheck?.addEventListener('change', syncMatureTraits);
    personalityType?.addEventListener('change', () => { status.textContent = `Personnalité : ${personalityType.selectedOptions[0].textContent}`; });
    characterTrait?.addEventListener('change', () => { if (characterTrait.selectedOptions[0]?.dataset.mature && !adultCheck.checked) { characterTrait.value = 'caring'; notify('La confirmation 18+ est nécessaire pour ce trait.'); } });
    form.addEventListener('submit', async (event) => { event.preventDefault(); const text = input.value.trim(); if (!text) return; input.value = ''; input.disabled = true; $('button[type="submit"]', form).disabled = true; addMessage('user', text); history.push({ role: 'user', content: text }); status.textContent = 'Réponse en cours…'; try { const result = await api('/chat/message', { method: 'POST', body: JSON.stringify({ message: text, botType: selected.type, personalityType: personalityType?.value || 'friend_kind', characterTrait: characterTrait?.value || 'caring', is18PlusAcknowledged: Boolean(adultCheck?.checked), companionProfile: { name: selected.name, archetype: selected.role, expectations: selected.description }, conversationHistory: history.slice(-12) }) }); addMessage('assistant', result.response); history.push({ role: 'assistant', content: result.response }); if (result.messagesRemaining !== undefined) { if (quotaDisplay) quotaDisplay.textContent = `${result.messagesRemaining} / 150`; status.textContent = `${result.messagesRemaining} message${result.messagesRemaining > 1 ? 's' : ''} restant${result.messagesRemaining > 1 ? 's' : ''} aujourd’hui`; } else status.textContent = 'Votre espace de conversation'; } catch (error) { addMessage('assistant', error.status === 429 ? 'Votre quota quotidien est atteint. Revenez demain.' : 'Je rencontre un problème temporaire. Réessayez dans un instant.'); status.textContent = 'La réponse n’a pas pu être générée.'; } finally { input.disabled = false; $('button[type="submit"]', form).disabled = false; input.focus(); } });
    input.addEventListener('keydown', (event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); form.requestSubmit(); } });
    input.addEventListener('input', () => { input.style.height = 'auto'; input.style.height = `${Math.min(input.scrollHeight, 150)}px`; });
  }

  function renderUsers(users) {
    const summary = $('#users-table'); const full = $('#users-table-full');
    const row = (user, withAction = false) => `<tr><td>${escape(user.username || '—')}</td><td>${escape(user.email || '—')}</td><td><span class="badge ${user.role === 'admin' ? '' : 'badge-neutral'}">${escape(user.role || 'user')}</span></td><td>${escape(user.messagesToday ?? 0)}</td><td>${escape(user.lastActivityDate ? displayDate(user.lastActivityDate) : '—')}</td>${withAction ? `<td><button class="btn btn-quiet btn-small js-role-toggle" type="button" data-uid="${escape(user.uid)}" data-role="${user.role === 'admin' ? 'user' : 'admin'}">${user.role === 'admin' ? 'Retirer admin' : 'Promouvoir'}</button></td>` : ''}</tr>`;
    if (summary) summary.innerHTML = users.length ? users.slice(0, 8).map((user) => row(user)).join('') : '<tr><td colspan="5" class="table-empty">Aucun utilisateur à afficher.</td></tr>';
    if (full) full.innerHTML = users.length ? users.map((user) => row(user, true)).join('') : '<tr><td colspan="6" class="table-empty">Aucun utilisateur à afficher.</td></tr>';
    $$('.js-role-toggle').forEach((button) => button.addEventListener('click', async () => { try { await api('/admin/users/role', { method: 'PATCH', body: JSON.stringify({ uid: button.dataset.uid, role: button.dataset.role }) }); notify('Rôle mis à jour.'); loadAdminData(); } catch (error) { notify(error.message || 'Modification impossible.'); } }));
  }

  async function loadAdminData() {
    try { const [statsResult, usersResult] = await Promise.all([api('/admin/stats'), api('/admin/users?limit=100')]); const stats = statsResult.stats || {}; [['total-users', stats.totalUsers], ['total-messages', stats.totalMessages], ['total-conversations', stats.totalConversations], ['active-users', stats.activeUsers]].forEach(([id, value]) => { const node = $(`#${id}`); if (node) node.textContent = value ?? '—'; }); const health = $('#admin-health-time'); if (health) health.textContent = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); renderUsers(usersResult.users || []); } catch (error) { notify(error.message || 'Les données admin ne sont pas disponibles.'); renderUsers([]); }
  }

  async function loadAdminConfig() { try { const result = await api('/admin/config'); const config = result.config || {}; const identity = config.botIdentity || {}; if ($('#setting-bot-name')) $('#setting-bot-name').value = identity.name || 'LIA'; if ($('#setting-description')) $('#setting-description').value = identity.description || ''; if ($('#system-prompt')) $('#system-prompt').value = identity.systemPrompt || ''; if ($('#setting-daily-limit')) $('#setting-daily-limit').value = config.quotas?.dailyLimit || 150; } catch { /* defaults remain visible */ } }
  async function loadAdminCompanions() {
    const node = $('#admin-companion-list'); if (!node) return;
    try {
      const result = await api('/admin/companions');
      const items = result.companions || [];
      node.innerHTML = items.length ? items.map((item) => `<article class="admin-record"><div class="admin-record-main"><span class="avatar avatar-sm">${escape(initials(item.name))}</span><div><strong>${escape(item.name)}</strong><small>${escape(item.archetype || 'Présence')}</small><p>${escape(item.description || 'Aucune description')}</p></div></div><div class="admin-record-actions"><span class="badge ${item.active === false ? 'badge-neutral' : ''}">${item.active === false ? 'Inactif' : 'Actif'}</span><button class="btn btn-quiet btn-small js-companion-edit" type="button" data-companion='${escape(JSON.stringify(item))}'>Modifier</button><button class="btn btn-quiet btn-small js-companion-toggle" type="button" data-id="${escape(item.id)}" data-active="${item.active !== false}">${item.active === false ? 'Activer' : 'Désactiver'}</button></div></article>`).join('') : '<div class="table-empty">Aucun compagnon personnalisé.</div>';
      $$('.js-companion-edit').forEach((button) => button.addEventListener('click', () => {
        const item = JSON.parse(button.dataset.companion); const form = $('#companion-form');
        if (!form) return;
        $('#companion-id').value = item.id || ''; $('#companion-form-title').textContent = `Modifier ${item.name}`;
        $('#companion-name').value = item.name || ''; $('#companion-archetype').value = item.archetype || 'Bienveillant'; $('#companion-description').value = item.description || ''; $('#companion-system-prompt').value = item.systemPrompt || ''; $('#companion-active').checked = item.active !== false;
        $('#companion-name').focus();
      }));
      $$('.js-companion-toggle').forEach((button) => button.addEventListener('click', async () => {
        try { await api(`/admin/companions/${encodeURIComponent(button.dataset.id)}`, { method: 'PATCH', body: JSON.stringify({ active: button.dataset.active !== 'true' }) }); notify('Disponibilité de la présence mise à jour.'); loadAdminCompanions(); } catch (error) { notify(error.message || 'Mise à jour impossible.'); }
      }));
    } catch { node.innerHTML = '<div class="table-empty">Catalogue indisponible.</div>'; }
  }

  async function loadBlacklist() { const node = $('#blacklist-list'); if (!node) return; try { const result = await api('/admin/blacklist'); const items = result.blacklist || []; node.innerHTML = items.length ? items.map((item) => `<div class="info-row"><span>${escape(item.ip)}</span><span>${escape(item.reason || '—')}</span></div>`).join('') : '<div class="table-empty">Aucune adresse bloquée.</div>'; } catch (error) { node.innerHTML = '<div class="table-empty">Accès refusé ou données indisponibles.</div>'; } }
  async function loadConversations() {
    const node = $('#admin-conversations'); if (!node) return;
    try {
      const result = await api('/admin/messages?limit=50');
      const messages = result.messages || [];
      node.innerHTML = messages.length ? messages.map((item) => `<div class="log-row"><time>${escape(displayDate(item.createdAt || item.timestamp))}</time><span><strong>${escape(item.companionName || 'Compagnon')}</strong><br>${escape(item.userMessage || 'Message indisponible')}</span></div>`).join('') : '<div class="table-empty">Aucune conversation récente.</div>';
    } catch { node.innerHTML = '<div class="table-empty">Conversations indisponibles.</div>'; }
  }

  async function loadAudit() { const node = $('#audit-logs'); if (!node) return; try { const result = await api('/admin/audit?limit=100'); const logs = result.logs || []; node.innerHTML = logs.length ? logs.map((log) => `<div class="log-row"><time>${escape(displayDate(log.timestamp))}</time><span><strong>${escape(log.action || 'Action')}</strong><br>${escape(log.adminId || 'Administrateur')}</span></div>`).join('') : '<div class="table-empty">Aucune action enregistrée.</div>'; } catch { node.innerHTML = '<div class="table-empty">Journal indisponible.</div>'; } }

  function setupAdmin() {
    if (!protectPage({ admin: true })) return;
    const panels = $$('[data-cms-panel]'); const navButtons = $$('[data-cms-view]'); const sidebarLinks = $$('[data-cms-sidebar-jump]');
    const showPanel = (name) => { panels.forEach((panel) => { panel.hidden = panel.dataset.cmsPanel !== name; }); navButtons.forEach((button) => button.classList.toggle('is-active', button.dataset.cmsView === name)); sidebarLinks.forEach((link) => { const active = link.dataset.cmsSidebarJump === name; link.toggleAttribute('aria-current', active); }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    navButtons.forEach((button) => button.addEventListener('click', () => showPanel(button.dataset.cmsView)));
    $$('[data-cms-jump]').forEach((button) => button.addEventListener('click', () => showPanel(button.dataset.cmsJump)));
    $$('[data-cms-sidebar-jump]').forEach((link) => link.addEventListener('click', (event) => { event.preventDefault(); showPanel(link.dataset.cmsSidebarJump); sidebar?.classList.remove('is-open'); }));
    $$('[data-refresh-admin]').forEach((button) => button.addEventListener('click', loadAdminData));
    $('[data-refresh-audit]')?.addEventListener('click', loadAudit);
    loadConversations();
    $('#settings-form')?.addEventListener('submit', async (event) => { event.preventDefault(); try { await api('/admin/config', { method: 'POST', body: JSON.stringify({ botIdentity: { name: $('#setting-bot-name').value.trim(), description: $('#setting-description').value.trim() }, quotas: { dailyLimit: Number($('#setting-daily-limit').value) } }) }); notify('Paramètres enregistrés.'); } catch (error) { notify(error.message || 'Enregistrement impossible.'); } });
    $('#config-form')?.addEventListener('submit', async (event) => { event.preventDefault(); try { await api('/admin/config', { method: 'POST', body: JSON.stringify({ botIdentity: { systemPrompt: $('#system-prompt').value.trim() } }) }); notify('Brouillon de prompt enregistré.'); } catch (error) { notify(error.message || 'Enregistrement impossible.'); } });
    $('#blacklist-form')?.addEventListener('submit', async (event) => { event.preventDefault(); try { await api('/admin/blacklist', { method: 'POST', body: JSON.stringify({ ip: $('#blacklist-ip').value.trim(), reason: $('#blacklist-reason').value.trim() }) }); notify('Adresse ajoutée au blocage.'); $('#blacklist-ip').value = ''; $('#blacklist-reason').value = ''; loadBlacklist(); } catch (error) { notify(error.message || 'Ajout impossible.'); } });
    const resetCompanionForm = () => { const form = $('#companion-form'); if (!form) return; form.reset(); $('#companion-id').value = ''; $('#companion-form-title').textContent = 'Nouvelle présence'; $('#companion-active').checked = true; };
    $('[data-open-companion-form]')?.addEventListener('click', () => { showPanel('companions'); resetCompanionForm(); $('#companion-name')?.focus(); });
    $('[data-cancel-companion]')?.addEventListener('click', resetCompanionForm);
    $('#companion-form')?.addEventListener('submit', async (event) => { event.preventDefault(); const id = $('#companion-id').value.trim(); const payload = { name: $('#companion-name').value.trim(), archetype: $('#companion-archetype').value, description: $('#companion-description').value.trim(), systemPrompt: $('#companion-system-prompt').value.trim(), active: $('#companion-active').checked }; try { await api(id ? `/admin/companions/${encodeURIComponent(id)}` : '/admin/companions', { method: id ? 'PATCH' : 'POST', body: JSON.stringify(payload) }); notify(id ? 'Présence mise à jour.' : 'Présence créée.'); resetCompanionForm(); loadAdminCompanions(); } catch (error) { notify(error.message || 'Enregistrement impossible.'); } });
    $('#user-search')?.addEventListener('input', () => { const query = $('#user-search').value.toLowerCase(); $$('#users-table-full tr').forEach((row) => { row.hidden = query && !row.textContent.toLowerCase().includes(query); }); });
    $('#user-role-filter')?.addEventListener('change', () => { const role = $('#user-role-filter').value; $$('#users-table-full tr').forEach((row) => { row.hidden = role && !row.textContent.toLowerCase().includes(role); }); });
    loadAdminData(); loadAdminConfig(); loadAdminCompanions(); loadBlacklist(); loadConversations(); loadAudit();
  }

  function boot() { setupGlobal(); const page = document.body.dataset.page; if (page === 'auth') setupAuth(); if (page === 'chat') setupChat(); if (page === 'admin') setupAdmin(); }
  document.addEventListener('DOMContentLoaded', boot);
})();
