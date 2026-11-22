import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const here = path.dirname(fileURLToPath(import.meta.url));
const APP_DIR = path.resolve(here, '..', 'app');
const { accounts } = JSON.parse(fs.readFileSync(path.join(here, 'accounts.json'), 'utf-8'));
const START_PORT = Number(process.env.PORT) || 4173;
const MAX_PORT_TRIES = 10;
const LIST_ENDPOINTS = ['/orders', '/products', '/shipments/assigned', '/issues', '/returns', '/users'];
const tokens = new Map();

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8', '.woff2': 'font/woff2', '.woff': 'font/woff',
};

// Writes a JSON response with the API envelope used by the web app.
function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}

// Sends a success envelope.
function ok(res, data) {
  sendJson(res, 200, { success: true, data, error: null });
}

// Sends an error envelope.
function fail(res, status, code, message) {
  sendJson(res, status, { success: false, data: null, error: { code, message } });
}

// Returns the account without its password.
function profile({ password, ...rest }) {
  return rest;
}

// Returns the current local time for log lines.
function now() {
  return new Date().toLocaleTimeString('en-GB');
}

// Reads and parses a JSON request body, or resolves null when it is not valid JSON.
function readBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => (raw += chunk));
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve(null);
      }
    });
  });
}

// Returns the signed-in account for the request's Bearer token.
function authUser(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? tokens.get(header.slice(7)) : undefined;
}

// Finds the account whose email matches after trimming, ignoring case, with the exact password.
function findAccount(email, password) {
  const normalized = email.trim().toLowerCase();
  return accounts.find((a) => a.email.toLowerCase() === normalized && a.password === password);
}

// Signs a user in and returns a token, or rejects with one generic error.
async function handleLogin(req, res) {
  const body = await readBody(req);
  if (!body || typeof body.email !== 'string' || typeof body.password !== 'string') {
    console.log(`[${now()}] Login: malformed request -> 400`);
    return fail(res, 400, 'VALIDATION_ERROR', 'Invalid request');
  }
  const account = findAccount(body.email, body.password);
  if (!account) {
    console.log(`[${now()}] Login FAILED: ${body.email} (password ${body.password.length} chars) -> 401`);
    return fail(res, 401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }
  const token = `test_${account.id}_${Date.now()}`;
  tokens.set(token, account);
  res.setHeader('Set-Cookie', `events_session=${token}; HttpOnly; SameSite=Strict; Path=/api/v1/events`);
  console.log(`[${now()}] Login OK: ${account.email} (${account.role}, password ${body.password.length} chars)`);
  return ok(res, { token, user: profile(account) });
}

// Ends the session of the request's token.
function handleLogout(req, res) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) tokens.delete(header.slice(7));
  console.log(`[${now()}] Logout`);
  return ok(res, null);
}

// Keeps an empty real-time event stream open.
function handleEvents(req, res) {
  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
  res.write(': connected\n\n');
  const timer = setInterval(() => res.write(': ping\n\n'), 15000);
  req.on('close', () => clearInterval(timer));
}

// Routes /api/v1 requests: login, logout, events, current user, and empty lists for landing screens.
async function handleApi(req, res, url) {
  const route = url.pathname.replace(/^\/api\/v1/, '') || '/';
  if (req.method === 'POST' && route === '/auth/login') return handleLogin(req, res);
  if (req.method === 'POST' && route === '/auth/logout') return handleLogout(req, res);
  if (req.method === 'GET' && route === '/events') return handleEvents(req, res);
  const user = authUser(req);
  if (!user) return fail(res, 401, 'UNAUTHORIZED', 'Authentication required');
  if (req.method === 'GET' && route === '/auth/me') return ok(res, profile(user));
  if (req.method === 'GET' && LIST_ENDPOINTS.includes(route)) return ok(res, []);
  return fail(res, 404, 'NOT_FOUND', `This test package only covers login, not ${req.method} ${route}`);
}

// Serves a file of the built web app, falling back to index.html for client-side routes.
function serveStatic(req, res, url) {
  let file = path.join(APP_DIR, decodeURIComponent(url.pathname));
  if (!file.startsWith(APP_DIR)) {
    res.writeHead(403);
    return res.end();
  }
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(APP_DIR, 'index.html');
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}

// Prints the address and opens the browser when asked to.
function announce(address) {
  console.log('==============================================================');
  console.log(' Login test app running at: ' + address);
  console.log(' Test accounts: see TEST-GUIDE.txt');
  console.log(' Stop: close this window or press Ctrl+C');
  console.log('==============================================================');
  if (process.env.OPEN_BROWSER === '1' && process.platform === 'win32') {
    spawn('cmd', ['/c', 'start', '', address], { detached: true, stdio: 'ignore' }).unref();
  }
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname.startsWith('/api/')) return handleApi(req, res, url);
  return serveStatic(req, res, url);
});

let portTriesLeft = MAX_PORT_TRIES;
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE' && portTriesLeft > 0) {
    portTriesLeft--;
    return server.listen((err.port || START_PORT) + 1, '127.0.0.1');
  }
  console.error('Cannot start the server:', err.message);
  process.exit(1);
});
server.once('listening', () => announce(`http://localhost:${server.address().port}`));
server.listen(START_PORT, '127.0.0.1');
