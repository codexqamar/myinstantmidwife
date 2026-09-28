const app = document.getElementById('app');

let state = {
  authenticated: false,
  content: null,
  images: [],
  profile: null,
  jsonUnlocked: false,
  tab: 'home',
  status: '',
  mobileNavOpen: false
};

const tabs = [
  ['home', 'Home Content'],
  ['packages', 'Subscriptions'],
  ['courses', 'Courses'],
  ['footer', 'Footer & Social'],
  ['images', 'Images'],
  ['profile', 'Profile'],
  ['json', 'JSON']
];

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function setByPath(path, value) {
  const keys = path.split('.');
  let target = state.content;
  while (keys.length > 1) target = target[keys.shift()];
  target[keys[0]] = value;
}

function field(label, path, options = {}) {
  const value = path.split('.').reduce((target, key) => target?.[key], state.content) ?? '';
  const input = options.type === 'textarea'
    ? `<textarea data-path="${path}" ${options.rows ? `rows="${options.rows}"` : ''}>${escapeHtml(value)}</textarea>`
    : `<input data-path="${path}" value="${escapeHtml(value)}">`;

  return `<label class="field"><span>${label}</span>${input}</label>`;
}

function imageSelect(label, path) {
  const value = path.split('.').reduce((target, key) => target?.[key], state.content) ?? '';
  const options = state.images.map(image => `
    <option value="${escapeHtml(image.path)}" ${image.path === value ? 'selected' : ''}>
      ${escapeHtml(image.source)} - ${escapeHtml(image.name)}
    </option>
  `).join('');

  return `
    <div class="image-picker">
      <div class="image-picker-label">${escapeHtml(label)}</div>
      <div class="image-picker-box">
        <img src="${escapeHtml(value)}" alt="">
        <div class="image-picker-meta">
          <strong>Current website image</strong>
          <span>${escapeHtml((state.images.find(image => image.path === value)?.name) || 'Selected image')}</span>
        </div>
      </div>
      <select data-path="${path}" data-image-select>
        ${options}
      </select>
    </div>
  `;
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

async function boot() {
  const session = await api('/api/session');
  state.authenticated = session.authenticated;
  if (state.authenticated) {
    state.content = await api('/api/content');
    state.images = await loadImages();
    state.profile = await api('/api/profile');
  }
  render();
}

async function loadImages() {
  const images = await api('/api/images');
  return Array.isArray(images) ? images : [];
}

function renderLogin() {
  app.innerHTML = `
    <section class="login-shell">
      <div class="login-hero">
        <div class="eyebrow">My Instant Midwife</div>
        <h1>Content dashboard</h1>
        <p>Update website copy, prices, and image references from one calm workspace.</p>
      </div>
      <div class="login-panel">
        <form class="login-card" id="loginForm">
          <div class="eyebrow">Secure Access</div>
          <h2>Sign in</h2>
          <label class="field"><span>Username</span><input name="username" autocomplete="username" required></label>
          <label class="field"><span>Password</span><input name="password" type="password" autocomplete="current-password" required></label>
          <p class="message" id="loginMessage"></p>
          <button class="btn btn-primary" type="submit">Open Dashboard</button>
        </form>
      </div>
    </section>
  `;

  document.getElementById('loginForm').addEventListener('submit', async event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const message = document.getElementById('loginMessage');
    try {
      await api('/api/login', {
        method: 'POST',
        body: JSON.stringify({
          username: form.get('username'),
          password: form.get('password')
        })
      });
      state.authenticated = true;
      state.content = await api('/api/content');
      state.images = await loadImages();
      state.profile = await api('/api/profile');
      render();
    } catch (error) {
      message.textContent = error.message;
    }
  });
}

function renderShell() {
  app.innerHTML = `
    <section class="app-shell ${state.mobileNavOpen ? 'mobile-nav-open' : ''}">
      <header class="mobile-header">
        <button class="mobile-nav-toggle" id="mobileNavToggle" aria-label="Toggle dashboard menu" aria-expanded="${state.mobileNavOpen ? 'true' : 'false'}">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <img src="/site-images/logo-white.png" alt="My Instant Midwife">
      </header>
      <aside class="sidebar">
        <div class="brand">
          <img src="/site-images/logo-white.png" alt="My Instant Midwife">
          <span>Dashboard for content, prices, and image updates.</span>
        </div>
        <nav class="nav">
          ${tabs.map(([id, label]) => `<button class="${state.tab === id ? 'active' : ''}" data-tab="${id}">${label}</button>`).join('')}
        </nav>
        <div class="sidebar-footer">
          <button class="btn btn-ghost sidebar-logout" data-logout>Logout</button>
        </div>
      </aside>
      <section class="content">
        <div class="topbar">
          <div class="page-title">
            <h1>${escapeHtml(tabs.find(([id]) => id === state.tab)?.[1] || 'Dashboard')}</h1>
            <p>Changes save to this dashboard project. Existing public website files stay untouched.</p>
          </div>
          <div class="actions">
            <span class="status">${escapeHtml(state.status)}</span>
            <button class="btn btn-primary" id="saveBtn">${state.tab === 'profile' ? 'Save Profile' : 'Save Changes'}</button>
          </div>
        </div>
        ${renderTab()}
      </section>
    </section>
  `;

  document.getElementById('mobileNavToggle')?.addEventListener('click', () => {
    state.mobileNavOpen = !state.mobileNavOpen;
    render();
  });

  document.querySelectorAll('[data-tab]').forEach(button => {
    button.addEventListener('click', () => {
      state.tab = button.dataset.tab;
      state.status = '';
      state.mobileNavOpen = false;
      render();
    });
  });

  document.querySelectorAll('[data-path]').forEach(input => {
    const eventName = input.matches('select') ? 'change' : 'input';
    input.addEventListener(eventName, event => {
      setByPath(event.currentTarget.dataset.path, event.currentTarget.value);
      if (event.currentTarget.dataset.imageSelect !== undefined) render();
    });
  });

  document.getElementById('saveBtn').addEventListener('click', state.tab === 'profile' ? saveProfile : saveContent);
  document.querySelectorAll('[data-logout]').forEach(button => {
    button.addEventListener('click', logout);
  });
  bindTabEvents();
}

function renderTab() {
  if (state.tab === 'home') return renderHome();
  if (state.tab === 'packages') return renderPackages();
  if (state.tab === 'courses') return renderCourses();
  if (state.tab === 'footer') return renderFooter();
  if (state.tab === 'images') return renderImages();
  if (state.tab === 'profile') return renderProfile();
  if (state.tab === 'json') return renderJson();
  return '';
}

function renderHome() {
  return `
    <div class="grid">
      <div>
        <section class="panel">
          <h2 class="panel-title">Site Basics</h2>
          <div class="two-col">
            ${field('Brand', 'site.brand')}
            ${field('Primary CTA', 'site.primaryCta')}
          </div>
          ${field('Tagline', 'site.tagline')}
          ${field('Primary CTA URL', 'site.primaryCtaUrl')}
        </section>
        <section class="panel">
          <h2 class="panel-title">Hero</h2>
          ${field('Eyebrow', 'home.hero.eyebrow')}
          ${field('Title', 'home.hero.title')}
          ${field('Body', 'home.hero.body', { type: 'textarea' })}
          ${imageSelect('Hero Image', 'home.hero.image')}
        </section>
        <section class="panel">
          <h2 class="panel-title">Who I Am</h2>
          <div class="two-col">
            ${field('Title', 'home.who.title')}
            ${field('Subtitle', 'home.who.subtitle')}
          </div>
          ${field('Name', 'home.who.name')}
          ${field('Body', 'home.who.body', { type: 'textarea' })}
          ${imageSelect('Who I Am Image', 'home.who.image')}
        </section>
      </div>
      ${heroPreview()}
    </div>
  `;
}

function heroPreview() {
  const hero = state.content.home.hero;
  return `
    <aside class="preview-card">
      <img class="preview-image" src="${escapeHtml(hero.image)}" alt="">
      <div class="preview-body">
        <div class="eyebrow">${escapeHtml(hero.eyebrow)}</div>
        <h2 class="preview-title">${escapeHtml(hero.title)}</h2>
        <p>${escapeHtml(hero.body)}</p>
        <button class="btn btn-primary">${escapeHtml(state.content.site.primaryCta)}</button>
      </div>
    </aside>
  `;
}

function renderPackages() {
  return `
    <div class="grid">
      <div>
        ${state.content.packages.map((item, index) => packageEditor(item, index)).join('')}
        <button class="btn btn-dark" data-add-package>Add Plan</button>
      </div>
      ${packagePreview(state.content.packages[0])}
    </div>
  `;
}

function packageEditor(item, index) {
  return `
    <article class="item-card">
      <div class="item-head">
        <strong>${escapeHtml(item.title || 'Plan')}</strong>
        <button class="btn btn-danger" data-remove-package="${index}">Remove</button>
      </div>
      <div class="two-col">
        ${field('ID', `packages.${index}.id`)}
        ${field('Title', `packages.${index}.title`)}
        ${field('Price', `packages.${index}.price`)}
        ${field('Period', `packages.${index}.period`)}
      </div>
      ${field('Note', `packages.${index}.note`)}
      ${imageSelect('Plan Image', `packages.${index}.image`)}
      <h3>Features</h3>
      ${(item.features || []).map((feature, featureIndex) => `
        <div class="feature-row">
          <input data-feature="${index}.${featureIndex}" value="${escapeHtml(feature)}">
          <button class="btn btn-danger" data-remove-feature="${index}.${featureIndex}">Remove</button>
        </div>
      `).join('')}
      <button class="btn btn-ghost" data-add-feature="${index}">Add Feature</button>
    </article>
  `;
}

function packagePreview(item) {
  return `
    <aside class="preview-card">
      <img class="preview-image" src="${escapeHtml(item?.image || '')}" alt="">
      <div class="preview-body">
        <h2 class="preview-title">${escapeHtml(item?.title || 'Plan')}</h2>
        <div class="price">${escapeHtml(item?.price || '')}<span>${escapeHtml(item?.period || '')}</span></div>
        <p>${escapeHtml(item?.note || '')}</p>
        <ul>${(item?.features || []).slice(0, 4).map(feature => `<li>${escapeHtml(feature)}</li>`).join('')}</ul>
      </div>
    </aside>
  `;
}

function renderCourses() {
  return `
    <div class="grid">
      <div>
        ${state.content.courses.map((item, index) => courseEditor(item, index)).join('')}
        <button class="btn btn-dark" data-add-course>Add Course</button>
      </div>
      ${coursePreview(state.content.courses[0])}
    </div>
  `;
}

function courseEditor(item, index) {
  return `
    <article class="item-card">
      <div class="item-head">
        <strong>${escapeHtml(item.title || 'Course')}</strong>
        <button class="btn btn-danger" data-remove-course="${index}">Remove</button>
      </div>
      <div class="two-col">
        ${field('ID', `courses.${index}.id`)}
        ${field('Title', `courses.${index}.title`)}
        ${field('Price', `courses.${index}.price`)}
        ${field('Subtitle', `courses.${index}.subtitle`)}
      </div>
      ${field('Description', `courses.${index}.body`, { type: 'textarea' })}
      ${imageSelect('Course Image', `courses.${index}.image`)}
    </article>
  `;
}

function coursePreview(item) {
  return `
    <aside class="preview-card">
      <img class="preview-image" src="${escapeHtml(item?.image || '')}" alt="">
      <div class="preview-body">
        <h2 class="preview-title">${escapeHtml(item?.title || 'Course')}</h2>
        <p><strong>${escapeHtml(item?.subtitle || '')}</strong></p>
        <div class="price">${escapeHtml(item?.price || '')}</div>
        <p>${escapeHtml(item?.body || '')}</p>
      </div>
    </aside>
  `;
}

function renderFooter() {
  return `
    <section class="panel">
      <h2 class="panel-title">Footer CTA</h2>
      ${field('Question Title', 'footer.questionTitle')}
      ${field('Question Body', 'footer.questionBody')}
      <div class="two-col">
        ${field('Facebook URL', 'footer.facebookUrl')}
        ${field('Instagram URL', 'footer.instagramUrl')}
      </div>
    </section>
  `;
}

function collectImagePaths() {
  const paths = new Set();
  const walk = value => {
    if (typeof value === 'string' && (value.startsWith('/site-images/') || value.startsWith('/uploads/'))) paths.add(value);
    if (Array.isArray(value)) value.forEach(walk);
    if (value && typeof value === 'object') Object.values(value).forEach(walk);
  };
  walk(state.content);
  return [...paths].sort();
}

function renderImages() {
  return `
    <section class="upload-card">
      <h2 class="panel-title">Upload Image</h2>
      <input type="file" id="imageUpload" accept="image/png,image/jpeg,image/webp,image/gif">
      <p class="message" id="uploadMessage"></p>
    </section>
    <section class="library-grid">
      ${state.images.map(image => `
        <div class="image-tile">
          <img src="${escapeHtml(image.path)}" alt="">
          <strong>${escapeHtml(image.source)}</strong>
          <code>${escapeHtml(image.name)}</code>
        </div>
      `).join('')}
    </section>
  `;
}

function renderJson() {
  if (!state.jsonUnlocked) {
    return `
      <section class="panel json-lock-panel">
        <h2 class="panel-title">Unlock JSON</h2>
        <p class="muted-copy">Raw JSON is protected for developer access. Enter the JSON unlock password to continue.</p>
        <form id="jsonUnlockForm">
          <label class="field">
            <span>JSON Unlock Password</span>
            <input id="jsonUnlockPassword" name="password" type="password" autocomplete="current-password" required>
          </label>
          <p class="message" id="jsonUnlockMessage"></p>
          <button class="btn btn-primary" type="submit">Unlock JSON</button>
        </form>
      </section>
    `;
  }

  return `
    <section class="panel">
      <h2 class="panel-title">Raw Content JSON</h2>
      <textarea class="json-box" id="jsonBox">${escapeHtml(JSON.stringify(state.content, null, 2))}</textarea>
    </section>
  `;
}

function renderProfile() {
  const username = state.profile?.username || '';
  return `
    <div class="grid profile-grid">
      <section class="panel">
        <h2 class="panel-title">Account Access</h2>
        <p class="muted-copy">Update dashboard login details. Current password is required before username or password changes are saved.</p>
        <form id="profileForm">
          <div class="two-col">
            <label class="field">
              <span>Username</span>
              <input id="profileUsername" name="username" value="${escapeHtml(username)}" autocomplete="username" required>
            </label>
            <label class="field">
              <span>Current Password</span>
              <input id="profileCurrentPassword" name="currentPassword" type="password" autocomplete="current-password" required>
            </label>
          </div>
          <div class="two-col">
            <label class="field">
              <span>New Password</span>
              <input id="profileNewPassword" name="newPassword" type="password" autocomplete="new-password" minlength="8">
            </label>
            <label class="field">
              <span>Confirm New Password</span>
              <input id="profileConfirmPassword" name="confirmPassword" type="password" autocomplete="new-password" minlength="8">
            </label>
          </div>
          <p class="message" id="profileMessage"></p>
        </form>
      </section>
      <aside class="preview-card profile-card">
        <div class="profile-avatar">${escapeHtml(username.slice(0, 1).toUpperCase() || 'A')}</div>
        <div class="preview-body">
          <div class="eyebrow">Signed In</div>
          <h2 class="preview-title">${escapeHtml(username || 'Admin')}</h2>
          <p>Use strong client-owned credentials before handing this dashboard over.</p>
        </div>
      </aside>
    </div>
  `;
}

function bindTabEvents() {
  document.querySelectorAll('[data-feature]').forEach(input => {
    input.addEventListener('input', event => {
      const [itemIndex, featureIndex] = event.currentTarget.dataset.feature.split('.').map(Number);
      state.content.packages[itemIndex].features[featureIndex] = event.currentTarget.value;
    });
  });

  document.querySelectorAll('[data-add-feature]').forEach(button => {
    button.addEventListener('click', () => {
      state.content.packages[Number(button.dataset.addFeature)].features.push('New feature');
      render();
    });
  });

  document.querySelectorAll('[data-remove-feature]').forEach(button => {
    button.addEventListener('click', () => {
      const [itemIndex, featureIndex] = button.dataset.removeFeature.split('.').map(Number);
      state.content.packages[itemIndex].features.splice(featureIndex, 1);
      render();
    });
  });

  document.querySelectorAll('[data-remove-package]').forEach(button => {
    button.addEventListener('click', () => {
      state.content.packages.splice(Number(button.dataset.removePackage), 1);
      render();
    });
  });

  document.querySelector('[data-add-package]')?.addEventListener('click', () => {
    state.content.packages.push({ id: 'new-plan', title: 'New Plan', price: '£0', period: '', note: '', image: '/site-images/offer1.png', features: [] });
    render();
  });

  document.querySelectorAll('[data-remove-course]').forEach(button => {
    button.addEventListener('click', () => {
      state.content.courses.splice(Number(button.dataset.removeCourse), 1);
      render();
    });
  });

  document.querySelector('[data-add-course]')?.addEventListener('click', () => {
    state.content.courses.push({ id: 'new-course', title: 'New Course', subtitle: '', price: '£0', image: '/site-images/yoga.jpg', body: '' });
    render();
  });

  document.getElementById('imageUpload')?.addEventListener('change', uploadImage);
  document.getElementById('jsonUnlockForm')?.addEventListener('submit', unlockJson);
}

async function uploadImage(event) {
  const file = event.currentTarget.files[0];
  const message = document.getElementById('uploadMessage');
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const result = await api('/api/upload', {
        method: 'POST',
        body: JSON.stringify({ fileName: file.name, dataUrl: reader.result })
      });
      message.textContent = `Uploaded: ${result.path}`;
      message.style.color = 'var(--success)';
      state.content.uploadedImages = [...(state.content.uploadedImages || []), result.path];
      state.images = await loadImages();
      render();
    } catch (error) {
      message.textContent = error.message;
      message.style.color = 'var(--danger)';
    }
  };
  reader.readAsDataURL(file);
}

async function saveContent() {
  if (state.tab === 'json' && !state.jsonUnlocked) {
    state.status = 'JSON locked';
    render();
    return;
  }

  if (state.tab === 'json') {
    try {
      state.content = JSON.parse(document.getElementById('jsonBox').value);
    } catch (error) {
      state.status = `Invalid JSON: ${error.message}`;
      render();
      return;
    }
  }

  await api('/api/content', { method: 'PUT', body: JSON.stringify(state.content) });
  state.status = 'Saved';
  render();
}

async function unlockJson(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const message = document.getElementById('jsonUnlockMessage');

  try {
    await api('/api/json-unlock', {
      method: 'POST',
      body: JSON.stringify({ password: form.get('password') })
    });
    state.jsonUnlocked = true;
    state.status = 'JSON unlocked';
    render();
  } catch (error) {
    if (message) message.textContent = error.message;
  }
}

async function saveProfile() {
  const form = document.getElementById('profileForm');
  const message = document.getElementById('profileMessage');
  if (!form) return;

  const formData = new FormData(form);
  const username = String(formData.get('username') || '').trim();
  const currentPassword = String(formData.get('currentPassword') || '');
  const newPassword = String(formData.get('newPassword') || '');
  const confirmPassword = String(formData.get('confirmPassword') || '');

  if (newPassword !== confirmPassword) {
    if (message) message.textContent = 'New passwords do not match.';
    return;
  }

  try {
    const result = await api('/api/profile', {
      method: 'PUT',
      body: JSON.stringify({ username, currentPassword, newPassword })
    });
    state.profile = { username: result.username };
    state.status = 'Profile saved';
    render();
  } catch (error) {
    if (message) message.textContent = error.message;
  }
}

async function logout() {
  await api('/api/logout', { method: 'POST', body: '{}' });
  state.authenticated = false;
  state.content = null;
  state.images = [];
  state.profile = null;
  state.jsonUnlocked = false;
  render();
}

function render() {
  if (!state.authenticated) renderLogin();
  else renderShell();
}

boot().catch(error => {
  app.innerHTML = `<p class="message">${escapeHtml(error.message)}</p>`;
});
