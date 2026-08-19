(() => {
  'use strict';

  const TOKEN_KEY = 'emiliana_token';
  const USER_KEY = 'emiliana_user';
  const API = '/api';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const storage = window.sessionStorage;

  const getUser = () => {
    try { return JSON.parse(storage.getItem(USER_KEY) || 'null'); } catch { return null; }
  };
  const getToken = () => storage.getItem(TOKEN_KEY);
  const setSession = (token, user) => {
    if (token) storage.setItem(TOKEN_KEY, token);
    if (user) storage.setItem(USER_KEY, JSON.stringify(user));
  };
  const clearSession = () => { storage.removeItem(TOKEN_KEY); storage.removeItem(USER_KEY); };
  const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const initials = (name) => String(name || 'E').trim().slice(0, 1).toUpperCase();
  const displayDate = (value) => value ? new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(new Date(value)) : '';

  function notify(message) {
    const toast = $('#toast');
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(notify.timeout);
    notify.timeout = window.setTimeout(() => { toast.hidden = true; }, 4200);
  }

  async function api(path, options = {}) {
    const headers = { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) };
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(`${API}${path}`, { ...options, headers });
    let payload = null;
    try { payload = await response.json(); } catch { payload = {}; }
    if (!response.ok) {
      const error = new Error(payload.message || payload.error || 'Une erreur est survenue.');
      error.status = response.status;
      error.payload = payload;
      throw error;
    }
    return payload;
  }

  function renderUserChip() {
    const user = getUser();
    $$('.js-user-name').forEach((element) => { element.textContent = user?.username || user?.email || 'Votre espace'; });
    $$('.js-user-email').forEach((element) => { element.textContent = user?.email || ''; });
    $$('.js-avatar').forEach((element) => { element.textContent = initials(user?.username || user?.email); });
  }

  function protectPage({ admin = false } = {}) {
    const user = getUser();
    if (!getToken() || !user) {
      window.location.replace('/login');
      return false;
    }
    if (admin && user.role !== 'admin') {
      window.location.replace('/chat');
      return false;
    }
    renderUserChip();
    return true;
  }

  function setupGlobal() {
    renderUserChip();
    const sidebar = $('.app-sidebar');
    const menuButton = $('[data-sidebar-toggle]');
    menuButton?.addEventListener('click', () => sidebar?.classList.toggle('is-open'));
    $$('.app-sidebar a').forEach((link) => link.addEventListener('click', () => sidebar?.classList.remove('is-open')));
    $$('.js-logout').forEach((button) => button.addEventListener('click', async () => {
      try { await api('/auth/logout', { method: 'POST' }); } catch { /* local cleanup is sufficient */ }
      clearSession();
      window.location.replace('/');
    }));
  }

  async function firebaseUserToken() {
    if (!window.auth?.currentUser) throw new Error('Session Firebase indisponible.');
    return window.auth.currentUser.getIdToken(true);
  }

  function setupAuth() {
    const loginForm = $('#login-form');
    const registerForm = $('#register-form');
    const message = $('#form-message');
    const tabs = $$('.auth-tab');
    if (!loginForm || !registerForm) return;

    const showMessage = (text, isSuccess = false) => { message.textContent = text; message.style.color = isSuccess ? 'var(--accent)' : 'var(--danger)'; };
    tabs.forEach((tab) => tab.addEventListener('click', () => {
      tabs.forEach((item) => item.classList.toggle('is-active', item === tab));
      const mode = tab.dataset.mode;
      loginForm.hidden = mode !== 'login';
      registerForm.hidden = mode !== 'register';
      showMessage('');
    }));

    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const button = $('button[type="submit"]', loginForm);
      button.disabled = true; button.textContent = 'Connexion…'; showMessage('');
      try {
        if (!window.auth) throw new Error('Le service d’authentification n’est pas configuré.');
        const credentials = await window.auth.signInWithEmailAndPassword($('#login-email').value.trim(), $('#login-password').value);
        const token = await credentials.user.getIdToken(true);
        const result = await api('/auth/login', { method: 'POST', body: JSON.stringify({ idToken: token }) });
        setSession(result.token || token, result.user);
        window.location.replace('/chat');
      } catch (error) { showMessage(error.message || 'Connexion impossible.'); }
      finally { button.disabled = false; button.textContent = 'Se connecter'; }
    });

    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const button = $('button[type="submit"]', registerForm);
      const password = $('#register-password').value;
      if (password !== $('#register-confirm').value) return showMessage('Les mots de passe ne correspondent pas.');
      if (password.length < 8) return showMessage('Le mot de passe doit contenir au moins 8 caractères.');
      button.disabled = true; button.textContent = 'Création…'; showMessage('');
      try {
        if (!window.auth) throw new Error('Le service d’authentification n’est pas configuré.');
        const username = $('#register-name').value.trim();
        const credentials = await window.auth.createUserWithEmailAndPassword($('#register-email').value.trim(), password);
        await credentials.user.updateProfile({ displayName: username });
        const token = await credentials.user.getIdToken(true);
        const result = await api('/auth/register', { method: 'POST', body: JSON.stringify({ idToken: token, username }) });
        setSession(result.token || token, result.user);
        window.location.replace('/chat');
      } catch (error) { showMessage(error.message || 'Création du compte impossible.'); }
      finally { button.disabled = false; button.textContent = 'Créer mon compte'; }
    });

    $$('.js-social').forEach((button) => button.addEventListener('click', async () => {
      try {
        if (!window.auth) throw new Error('Le service d’authentification n’est pas configuré.');
        const provider = new firebase.auth.GoogleAuthProvider();
        const credentials = await window.auth.signInWithPopup(provider);
        const token = await credentials.user.getIdToken(true);
        const result = await api('/auth/social', { method: 'POST', body: JSON.stringify({ idToken: token, provider: 'google' }) });
        setSession(result.token || token, result.user);
        window.location.replace('/chat');
      } catch (error) { showMessage(error.message || 'Connexion sociale impossible.'); }
    }));
  }

  const companions = [
    { type: 'bienveillant', name: 'Emiliana', role: 'Présence attentive', initial: 'E', description: 'Une conversation calme pour déposer ce qui compte.' },
    { type: 'creatif', name: 'Milo', role: 'Élan créatif', initial: 'M', description: 'Des idées et des perspectives pour avancer autrement.' },
    { type: 'mentor', name: 'Sacha', role: 'Regard structurant', initial: 'S', description: 'Un échange concret, sans pression ni jugement.' },
    { type: 'complice', name: 'Nina', role: 'Complicité légère', initial: 'N', description: 'Une conversation vivante, simple et spontanée.' }
  ];

  function setupChat() {
    if (!protectPage()) return;
    const list = $('#companion-list'); const messages = $('#message-list'); const form = $('#chat-form'); const input = $('#chat-input'); const status = $('#chat-status'); const title = $('#chat-companion-name'); const role = $('#chat-companion-role'); const avatar = $('#chat-avatar');
    let selected = companions[0]; const history = [];

    function renderCompanions() {
      list.textContent = '';
      companions.forEach((companion) => {
        const button = document.createElement('button'); button.type = 'button'; button.className = `companion-item${companion.type === selected.type ? ' is-active' : ''}`;
        button.innerHTML = `<span class="avatar avatar-sm">${escape(companion.initial)}</span><span><strong>${escape(companion.name)}</strong><small>${escape(companion.role)}</small></span>`;
        button.addEventListener('click', () => { selected = companion; renderCompanions(); updateHeader(); renderWelcome(); });
        list.appendChild(button);
      });
    }
    function updateHeader() { title.textContent = selected.name; role.textContent = selected.role; avatar.textContent = selected.initial; }
    function renderWelcome() { messages.textContent = ''; addMessage('assistant', `Bonjour, je suis ${selected.name}. ${selected.description}`); }
    function addMessage(kind, content) {
      const row = document.createElement('div'); row.className = `message-row ${kind}`;
      const avatarNode = document.createElement('span'); avatarNode.className = 'avatar avatar-sm'; avatarNode.textContent = kind === 'user' ? initials(getUser()?.username) : selected.initial;
      const wrapper = document.createElement('div'); const body = document.createElement('div'); body.className = 'message-content'; body.textContent = content;
      const time = document.createElement('div'); time.className = 'message-time'; time.textContent = displayDate(new Date()); wrapper.append(body, time); row.append(avatarNode, wrapper); messages.appendChild(row); messages.scrollTop = messages.scrollHeight;
    }
    async function loadHistory() {
      try {
        const result = await api('/chat/history?limit=30');
        if (!result.messages?.length) return;
        messages.textContent = '';
        result.messages.reverse().forEach((item) => { addMessage('user', item.userMessage); addMessage('assistant', item.botResponse); history.push({ role: 'user', content: item.userMessage }, { role: 'assistant', content: item.botResponse }); });
      } catch { /* history is optional; chat remains usable */ }
    }
    renderCompanions(); updateHeader(); renderWelcome(); loadHistory();
    form.addEventListener('submit', async (event) => {
      event.preventDefault(); const text = input.value.trim(); if (!text) return;
      input.value = ''; input.disabled = true; $('button[type="submit"]', form).disabled = true; addMessage('user', text); history.push({ role: 'user', content: text }); status.textContent = 'Réponse en cours…';
      try {
        const result = await api('/chat/message', { method: 'POST', body: JSON.stringify({ message: text, botType: selected.type, companionProfile: { name: selected.name, archetype: selected.role, expectations: selected.description }, conversationHistory: history.slice(-12) }) });
        addMessage('assistant', result.response); history.push({ role: 'assistant', content: result.response }); status.textContent = result.messagesRemaining === undefined ? 'Votre espace de conversation' : `${result.messagesRemaining} message${result.messagesRemaining > 1 ? 's' : ''} restant${result.messagesRemaining > 1 ? 's' : ''} aujourd’hui`;
      } catch (error) {
        addMessage('assistant', error.status === 429 ? 'Votre quota quotidien est atteint. Revenez demain.' : 'Je rencontre un problème temporaire. Réessayez dans un instant.'); status.textContent = 'La réponse n’a pas pu être générée.';
      } finally { input.disabled = false; $('button[type="submit"]', form).disabled = false; input.focus(); }
    });
    input.addEventListener('keydown', (event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); form.requestSubmit(); } });
  }

  async function setupAdmin() {
    if (!protectPage({ admin: true })) return;
    const stats = $('#admin-stats'); const users = $('#users-table');
    try {
      const [statsResult, usersResult] = await Promise.all([api('/admin/stats'), api('/admin/users')]);
      const data = statsResult.stats || statsResult;
      [['total-users', data.totalUsers], ['total-messages', data.totalMessages], ['total-conversations', data.totalConversations], ['active-users', data.activeUsers]].forEach(([id, value]) => { const node = $(`#${id}`); if (node) node.textContent = value ?? '—'; });
      users.textContent = '';
      (usersResult.users || []).forEach((user) => { const row = document.createElement('tr'); row.innerHTML = `<td>${escape(user.username || '—')}</td><td>${escape(user.email || '—')}</td><td>${escape(user.role || 'user')}</td><td>${escape(user.messagesToday ?? 0)}</td><td>${escape(user.lastActivityDate ? displayDate(user.lastActivityDate) : '—')}</td>`; users.appendChild(row); });
    } catch (error) { notify(error.message || 'Les données admin ne sont pas disponibles.'); }
  }

  function boot() {
    setupGlobal();
    const page = document.body.dataset.page;
    if (page === 'auth') setupAuth();
    if (page === 'chat') setupChat();
    if (page === 'admin') setupAdmin();
  }
  document.addEventListener('DOMContentLoaded', boot);
})();
