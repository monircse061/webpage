const CONTENT_FILES = {
  homeProfile: 'data/home-profile.json',
  education: 'data/education.json',
  experience: 'data/experience.json',
  milestones: 'data/milestones.json',
  testScores: 'data/test-scores.json',
  publications: 'data/publications.json',
  researchProjects: 'data/research-projects.json',
  academicProjects: 'data/academic-projects.json',
  teachingCourses: 'data/teaching-courses.json',
  certifications: 'data/certifications.json',
  leadership: 'data/leadership.json',
  achievements: 'data/achievements.json',
  showcases: 'data/showcases.json'
};
const SESSION_TTL = 60 * 60 * 12;
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers }
  });
}
function randomId(bytes = 32) {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
function getCookie(request, name) {
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}
function secureCookie(value, maxAge = SESSION_TTL) {
  return `admin_session=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}
async function getSession(request, env) {
  const id = getCookie(request, 'admin_session');
  if (!id) return null;
  const raw = await env.ADMIN_SESSIONS.get(`session:${id}`);
  if (!raw) return null;
  try { return { id, ...JSON.parse(raw) }; } catch (_) { return null; }
}
function assertSameOrigin(request) {
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) throw new Error('Request origin was not accepted. Refresh the dashboard and try again.');
}
function githubHeaders(token) {
  return {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'Monir-Academic-Website-Admin'
  };
}
async function githubRequest(url, token, options = {}) {
  const response = await fetch(url, { ...options, headers: { ...githubHeaders(token), ...(options.headers || {}) } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = body?.message || `GitHub API request failed (${response.status}).`;
    throw new Error(error);
  }
  return body;
}
function base64ToUtf8(base64) {
  const binary = atob(base64.replace(/\s/g, ''));
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
function utf8ToBase64(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return btoa(binary);
}
function repoBase(env) {
  return `https://api.github.com/repos/${encodeURIComponent(env.GITHUB_OWNER)}/${encodeURIComponent(env.GITHUB_REPO)}`;
}
async function getRepoFile(path, branch, token, env) {
  const url = `${repoBase(env)}/contents/${path.split('/').map(encodeURIComponent).join('/')}?ref=${encodeURIComponent(branch)}`;
  const response = await fetch(url, { headers: githubHeaders(token) });
  if (response.status === 404) return { exists: false, content: null, sha: null };
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || `Could not read ${path} from GitHub.`);
  if (body.type !== 'file' || !body.content) throw new Error(`${path} is not a readable file.`);
  return { exists: true, content: base64ToUtf8(body.content), sha: body.sha };
}
async function putRepoFile(path, contentBase64, message, token, env, mimeType) {
  const branch = env.GITHUB_BRANCH || 'main';
  const current = await getRepoFile(path, branch, token, env);
  const body = { message, content: contentBase64, branch };
  if (current.sha) body.sha = current.sha;
  const result = await githubRequest(`${repoBase(env)}/contents/${path.split('/').map(encodeURIComponent).join('/')}`, token, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  });
  return { path, sha: result.content?.sha, url: result.content?.html_url, commit: result.commit?.html_url, mimeType };
}
async function authenticate(request, env) {
  const session = await getSession(request, env);
  if (!session?.login) return null;
  return session;
}
async function handleLogin(request, env) {
  const state = randomId(24);
  await env.ADMIN_SESSIONS.put(`oauth:${state}`, '1', { expirationTtl: 600 });
  const callback = new URL('/auth/callback', request.url).href;
  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    redirect_uri: callback,
    scope: env.GITHUB_SCOPE || 'read:user',
    state
  });
  return Response.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`, 302);
}
async function handleCallback(request, env) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  if (!code || !state) return new Response('GitHub sign-in was not completed. Please return to the admin page and try again.', { status: 400 });
  const stateKey = `oauth:${state}`;
  const storedState = await env.ADMIN_SESSIONS.get(stateKey);
  await env.ADMIN_SESSIONS.delete(stateKey);
  if (!storedState) return new Response('The sign-in session expired or was invalid. Please try again.', { status: 400 });

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, code, state })
  });
  const tokenData = await tokenResponse.json().catch(() => ({}));
  if (!tokenResponse.ok || !tokenData.access_token) return new Response('GitHub could not complete authentication. Check the OAuth application settings.', { status: 401 });

  const user = await githubRequest('https://api.github.com/user', tokenData.access_token);
  const allowed = String(env.GITHUB_ALLOWED_USER || '').toLowerCase();
  if (!allowed || String(user.login).toLowerCase() !== allowed) {
    return new Response('Access denied. This dashboard is restricted to its approved GitHub account.', { status: 403 });
  }
  const sessionId = randomId(32);
  await env.ADMIN_SESSIONS.put(`session:${sessionId}`, JSON.stringify({ login: user.login }), { expirationTtl: SESSION_TTL });
  return new Response(null, { status: 302, headers: { 'Location': new URL('/', request.url).href, 'Set-Cookie': secureCookie(sessionId) } });
}
async function handleApi(request, env) {
  const url = new URL(request.url);
  if (url.pathname === '/api/me' && request.method === 'GET') {
    const session = await authenticate(request, env);
    return session ? json({ user: { login: session.login } }) : json({ error: 'Not signed in.' }, 401);
  }
  if (url.pathname === '/auth/logout' && request.method === 'POST') {
    assertSameOrigin(request);
    const id = getCookie(request, 'admin_session');
    if (id) await env.ADMIN_SESSIONS.delete(`session:${id}`);
    return json({ ok: true }, 200, { 'Set-Cookie': secureCookie('', 0) });
  }

  assertSameOrigin(request);
  const session = await authenticate(request, env);
  if (!session) return json({ error: 'Your admin session has expired. Please sign in again.' }, 401);
  if (!env.GITHUB_REPO_TOKEN) return json({ error: 'The repository access token is not configured. Ask the site administrator to add GITHUB_REPO_TOKEN in Cloudflare.' }, 503);
  const repoToken = env.GITHUB_REPO_TOKEN;

  if (url.pathname === '/api/content' && request.method === 'GET') {
    const type = url.searchParams.get('type');
    const path = CONTENT_FILES[type];
    if (!path) return json({ error: 'Unknown content type.' }, 400);
    const result = await getRepoFile(path, env.GITHUB_BRANCH || 'main', repoToken, env);
    let items = [];
    if (result.exists) {
      try { items = JSON.parse(result.content); } catch (_) { return json({ error: `${path} contains invalid JSON. Please fix it in GitHub before editing.` }, 500); }
      if (!Array.isArray(items)) return json({ error: `${path} must contain a JSON array.` }, 500);
    }
    return json({ items });
  }

  if (url.pathname === '/api/content' && request.method === 'PUT') {
    const type = url.searchParams.get('type');
    const path = CONTENT_FILES[type];
    if (!path) return json({ error: 'Unknown content type.' }, 400);
    const payload = await request.json().catch(() => null);
    if (!payload || !Array.isArray(payload.items)) return json({ error: 'A valid list of content items is required.' }, 400);
    if (payload.items.length > 500) return json({ error: 'The list is too large.' }, 400);
    const serialized = JSON.stringify(payload.items, null, 2) + '\n';
    if (serialized.length > 900000) return json({ error: 'The content file is too large for this dashboard.' }, 413);
    const result = await putRepoFile(path, utf8ToBase64(serialized), `Update ${type} from website admin`, repoToken, env, 'application/json');
    return json({ ok: true, path, commitUrl: result.commit, fileUrl: result.url });
  }

  if (url.pathname === '/api/upload' && request.method === 'POST') {
    const payload = await request.json().catch(() => null);
    if (!payload || typeof payload.contentBase64 !== 'string' || typeof payload.name !== 'string') return json({ error: 'A file and filename are required.' }, 400);
    const mime = String(payload.mimeType || '').toLowerCase();
    const allowed = { 'application/pdf': 'pdf', 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };
    if (!allowed[mime]) return json({ error: 'Only PDF, PNG, JPG, and WebP files are accepted.' }, 400);
    const bytes = Math.floor(payload.contentBase64.length * 3 / 4);
    if (bytes > MAX_UPLOAD_BYTES) return json({ error: 'The file must be smaller than 8 MB.' }, 413);
    const original = payload.name.split(/[\\/]/).pop().normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90) || `upload.${allowed[mime]}`;
    const filename = `${Date.now()}-${randomId(4)}-${original}`;
    const path = `uploads/${filename}`;
    const result = await putRepoFile(path, payload.contentBase64, `Upload ${filename} from website admin`, repoToken, env, mime);
    return json({ ok: true, path, url: result.url, commitUrl: result.commit });
  }
  return json({ error: 'API endpoint not found.' }, 404);
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    try {
      if (url.pathname === '/auth/login' && request.method === 'GET') {
        if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET || !env.GITHUB_ALLOWED_USER) return new Response('The admin worker is not configured. Follow the setup guide to add its GitHub OAuth settings.', { status: 503 });
        return await handleLogin(request, env);
      }
      if (url.pathname === '/auth/callback' && request.method === 'GET') return await handleCallback(request, env);
      if (url.pathname.startsWith('/api/') || url.pathname === '/auth/logout') return await handleApi(request, env);
      return await env.ASSETS.fetch(request);
    } catch (error) {
      return json({ error: error?.message || 'An unexpected server error occurred.' }, 500);
    }
  }
};
