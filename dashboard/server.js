const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const express = require('express');

const app = express();
const port = process.env.PORT || 3100;
const rootDir = __dirname;
const dataDir = path.join(rootDir, 'data');
const backupDir = path.join(dataDir, 'backups');
const uploadsDir = path.join(rootDir, 'uploads');
const contentPath = path.join(dataDir, 'content.json');
const settingsPath = path.join(dataDir, 'settings.json');
const defaultContentPath = path.join(rootDir, 'default-content.json');

const defaultAdminUser = process.env.ADMIN_USERNAME || 'admin';
const defaultAdminPassword = process.env.ADMIN_PASSWORD || 'change-this-password';
const backupUser = process.env.BACKUP_USERNAME || '';
const backupPassword = process.env.BACKUP_PASSWORD || '';
const jsonUnlockPassword = process.env.JSON_UNLOCK_PASSWORD || '';
const sessionSecret = process.env.SESSION_SECRET || 'local-dashboard-secret';
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD || !process.env.SESSION_SECRET)) {
  throw new Error('ADMIN_USERNAME, ADMIN_PASSWORD, and SESSION_SECRET are required in production.');
}

fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(backupDir, { recursive: true });
fs.mkdirSync(uploadsDir, { recursive: true });

app.use(express.json({ limit: '20mb' }));
app.use(express.static(path.join(rootDir, 'public')));
app.use('/uploads', express.static(uploadsDir));
app.use('/site-images', express.static(path.join(rootDir, '..', 'images')));

app.use('/api/public-content', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.PUBLIC_SITE_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

function readContent() {
  if (!fs.existsSync(contentPath)) {
    const defaultContent = JSON.parse(fs.readFileSync(defaultContentPath, 'utf8'));
    writeContent(defaultContent);
    return defaultContent;
  }

  return JSON.parse(fs.readFileSync(contentPath, 'utf8'));
}

function atomicWriteJson(filePath, value) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const nextContent = `${JSON.stringify(value, null, 2)}\n`;
  const tempPath = path.join(path.dirname(filePath), `${path.basename(filePath)}-${timestamp}.tmp`);

  fs.writeFileSync(tempPath, nextContent);
  try {
    fs.renameSync(tempPath, filePath);
  } catch (renameError) {
    try {
      fs.unlinkSync(filePath);
      fs.renameSync(tempPath, filePath);
    } catch (replaceError) {
      try {
        fs.unlinkSync(tempPath);
      } catch {
        // Ignore cleanup failure; original content remains intact.
      }
      throw replaceError;
    }
  }
}

function writeContent(content) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `content-${timestamp}.json`);

  if (fs.existsSync(contentPath)) {
    try {
      fs.copyFileSync(contentPath, backupPath);
    } catch (error) {
      console.warn(`Content backup skipped: ${error.message}`);
    }
  }

  atomicWriteJson(contentPath, content);
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(String(password), salt, 120000, 32, 'sha256').toString('hex');
  return { salt, hash };
}

function readSettings() {
  if (fs.existsSync(settingsPath)) {
    try {
      return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    } catch (error) {
      console.warn(`Dashboard settings ignored: ${error.message}`);
    }
  }

  const password = hashPassword(defaultAdminPassword);
  return {
    username: defaultAdminUser,
    passwordSalt: password.salt,
    passwordHash: password.hash
  };
}

function writeSettings(settings) {
  atomicWriteJson(settingsPath, settings);
}

function verifyPassword(password, settings = readSettings()) {
  const attempt = hashPassword(password, settings.passwordSalt);
  const expected = Buffer.from(settings.passwordHash, 'hex');
  const actual = Buffer.from(attempt.hash, 'hex');
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

function sign(value) {
  return crypto.createHmac('sha256', sessionSecret).update(value).digest('hex');
}

function safeEqualString(a, b) {
  const left = Buffer.from(String(a || ''));
  const right = Buffer.from(String(b || ''));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function createSessionCookie(user) {
  const expiresAt = Date.now() + 1000 * 60 * 60 * 12;
  const payload = Buffer.from(JSON.stringify({ user, expiresAt })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

function parseCookies(header = '') {
  return Object.fromEntries(
    header.split(';')
      .map(part => part.trim().split('='))
      .filter(pair => pair[0])
      .map(([key, ...value]) => [key, decodeURIComponent(value.join('='))])
  );
}

function getSession(req) {
  const token = parseCookies(req.headers.cookie).mim_dashboard_session;
  if (!token || !token.includes('.')) return null;

  const [payload, signature] = token.split('.');
  if (signature !== sign(payload)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (session.expiresAt <= Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

function isAuthenticated(req) {
  const session = getSession(req);
  if (!session) return false;

  if (session.user === readSettings().username) return true;
  if (backupUser && backupPassword && session.user === backupUser) return true;
  return false;
}

function canLoginWithBackup(username, password) {
  if (!backupUser || !backupPassword) return false;
  return safeEqualString(username, backupUser) && safeEqualString(password, backupPassword);
}

function canLoginWithAdmin(username, password) {
  const settings = readSettings();
  if (username !== settings.username) {
    return false;
  }
  return verifyPassword(password, settings);
}

function requireAuth(req, res, next) {
  if (!isAuthenticated(req)) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }
  next();
}

function safeUploadName(fileName) {
  const ext = path.extname(fileName || '').toLowerCase();
  const base = path.basename(fileName || 'upload', ext).replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');
  const allowed = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
  if (!allowed.has(ext)) throw new Error('Only JPG, PNG, WEBP, and GIF uploads are allowed.');
  return `${base || 'upload'}-${Date.now()}${ext}`;
}

app.get('/api/session', (req, res) => {
  res.json({
    authenticated: isAuthenticated(req),
    production: isProduction
  });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  const isAdmin = canLoginWithAdmin(username, password);
  const isBackup = canLoginWithBackup(username, password);

  if (!isAdmin && !isBackup) {
    res.status(401).json({ error: 'Invalid username or password.' });
    return;
  }

  res.cookie('mim_dashboard_session', createSessionCookie(String(username)), {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    maxAge: 1000 * 60 * 60 * 12
  });
  res.json({ ok: true });
});

app.get('/api/profile', requireAuth, (req, res) => {
  res.json({ username: readSettings().username });
});

app.put('/api/profile', requireAuth, (req, res) => {
  const { username, currentPassword, newPassword } = req.body || {};
  const cleanUsername = String(username || '').trim();
  const cleanPassword = String(newPassword || '');
  const settings = readSettings();

  if (!verifyPassword(currentPassword, settings)) {
    res.status(400).json({ error: 'Current password is incorrect.' });
    return;
  }

  if (!cleanUsername) {
    res.status(400).json({ error: 'Username is required.' });
    return;
  }

  if (cleanPassword && cleanPassword.length < 8) {
    res.status(400).json({ error: 'New password must be at least 8 characters.' });
    return;
  }

  const nextSettings = {
    ...settings,
    username: cleanUsername
  };

  if (cleanPassword) {
    const password = hashPassword(cleanPassword);
    nextSettings.passwordSalt = password.salt;
    nextSettings.passwordHash = password.hash;
  }

  writeSettings(nextSettings);
  res.cookie('mim_dashboard_session', createSessionCookie(nextSettings.username), {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    maxAge: 1000 * 60 * 60 * 12
  });
  res.json({ ok: true, username: nextSettings.username });
});

app.post('/api/json-unlock', requireAuth, (req, res) => {
  const { password } = req.body || {};
  if (!jsonUnlockPassword) {
    res.status(500).json({ error: 'JSON unlock password is not configured.' });
    return;
  }

  if (!safeEqualString(password, jsonUnlockPassword)) {
    res.status(401).json({ error: 'Invalid JSON unlock password.' });
    return;
  }

  res.json({ ok: true });
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('mim_dashboard_session');
  res.json({ ok: true });
});

app.get('/api/content', requireAuth, (req, res) => {
  res.json(readContent());
});

app.get('/api/images', requireAuth, (req, res) => {
  const allowed = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
  const siteImagesDir = path.join(rootDir, '..', 'images');

  const fromDir = (dir, publicBase, source) => {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir, { withFileTypes: true })
      .filter(entry => entry.isFile() && allowed.has(path.extname(entry.name).toLowerCase()))
      .map(entry => ({
        name: entry.name,
        path: `${publicBase}/${entry.name}`,
        source
      }));
  };

  res.json([
    ...fromDir(siteImagesDir, '/site-images', 'Website'),
    ...fromDir(uploadsDir, '/uploads', 'Dashboard')
  ].sort((a, b) => a.name.localeCompare(b.name)));
});

app.put('/api/content', requireAuth, (req, res) => {
  writeContent(req.body);
  res.json({ ok: true, savedAt: new Date().toISOString() });
});

app.get('/api/public-content', (req, res) => {
  res.json(readContent());
});

app.get('/api/public-content.js', (req, res) => {
  res.type('application/javascript');
  res.send([
    `window.MIM_DASHBOARD_CONTENT = ${JSON.stringify(readContent())};`,
    `window.MIM_DASHBOARD_CONTENT_FEED_URL = ${JSON.stringify(`${req.protocol}://${req.get('host')}/api/public-content`)};`,
    `window.dispatchEvent(new CustomEvent('mim-dashboard-content', { detail: window.MIM_DASHBOARD_CONTENT }));`
  ].join('\n'));
});

app.post('/api/upload', requireAuth, (req, res) => {
  const { fileName, dataUrl } = req.body || {};
  const match = /^data:image\/(png|jpeg|jpg|webp|gif);base64,(.+)$/i.exec(dataUrl || '');
  if (!match) {
    res.status(400).json({ error: 'Image data is missing or invalid.' });
    return;
  }

  try {
    const uploadName = safeUploadName(fileName);
    const uploadPath = path.join(uploadsDir, uploadName);
    fs.writeFileSync(uploadPath, Buffer.from(match[2], 'base64'));
    res.json({ path: `/uploads/${uploadName}` });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(rootDir, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`My Instant Midwife dashboard running at http://localhost:${port}`);
});
