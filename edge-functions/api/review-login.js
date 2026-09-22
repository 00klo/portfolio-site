import {
  createReviewSession,
  jsonResponse,
  REVIEW_SESSION_TTL_SECONDS,
  safeEqualText,
  sha256Hex,
} from '../_review-auth.js';

const LOGIN_WINDOW_MS = 10 * 60 * 1000;
const LOGIN_LOCK_MS = 15 * 60 * 1000;
const LOGIN_MAX_FAILURES = 5;
const loginAttempts = new Map();

const getClientKey = request => {
  const forwarded = request.headers.get('eo-connecting-ip')
    || request.headers.get('x-forwarded-for')
    || request.headers.get('x-real-ip')
    || 'unknown';
  return forwarded.split(',')[0].trim().slice(0, 96);
};

const pruneLoginAttempts = now => {
  if (loginAttempts.size < 1000) return;
  for (const [key, entry] of loginAttempts) {
    if (entry.lockedUntil <= now && now - entry.windowStartedAt > LOGIN_WINDOW_MS) loginAttempts.delete(key);
  }
};

const getLoginLimit = (key, now) => {
  const current = loginAttempts.get(key);
  if (!current) return null;
  if (current.lockedUntil > now) return current;
  if (now - current.windowStartedAt >= LOGIN_WINDOW_MS) {
    loginAttempts.delete(key);
    return null;
  }
  return current;
};

const recordLoginFailure = (key, now) => {
  const current = getLoginLimit(key, now) || { failures: 0, windowStartedAt: now, lockedUntil: 0 };
  current.failures += 1;
  if (current.failures >= LOGIN_MAX_FAILURES) current.lockedUntil = now + LOGIN_LOCK_MS;
  loginAttempts.set(key, current);
  return current;
};

export async function onRequestPost(context) {
  const { request, env } = context;
  const requestUrl = new URL(request.url);
  const origin = request.headers.get('origin');
  const now = Date.now();
  const clientKey = getClientKey(request);
  pruneLoginAttempts(now);

  if (origin && origin !== requestUrl.origin) {
    return jsonResponse({ ok: false, error: '请求来源无效。' }, 403);
  }

  const activeLimit = getLoginLimit(clientKey, now);
  if (activeLimit?.lockedUntil > now) {
    const retryAfter = Math.max(1, Math.ceil((activeLimit.lockedUntil - now) / 1000));
    return jsonResponse(
      { ok: false, error: '尝试次数过多，请稍后再试。' },
      429,
      { 'Retry-After': String(retryAfter) },
    );
  }

  if (!env.REVIEW_PASSWORD_HASH || !env.REVIEW_SESSION_SECRET) {
    return jsonResponse({ ok: false, error: '受限页面尚未完成服务器配置。' }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: '请求格式无效。' }, 400);
  }

  const password = typeof body.password === 'string' ? body.password : '';
  if (!password || password.length > 128) {
    recordLoginFailure(clientKey, now);
    return jsonResponse({ ok: false, error: '请输入有效密码。' }, 400);
  }

  const providedHash = await sha256Hex(password);
  const expectedHash = String(env.REVIEW_PASSWORD_HASH).trim().toLowerCase();
  if (!safeEqualText(providedHash, expectedHash)) {
    const limit = recordLoginFailure(clientKey, now);
    if (limit.lockedUntil > now) {
      return jsonResponse(
        { ok: false, error: '尝试次数过多，请稍后再试。' },
        429,
        { 'Retry-After': String(Math.ceil(LOGIN_LOCK_MS / 1000)) },
      );
    }
    return jsonResponse({ ok: false, error: '密码不正确。' }, 401);
  }

  loginAttempts.delete(clientKey);

  const session = await createReviewSession(String(env.REVIEW_SESSION_SECRET), REVIEW_SESSION_TTL_SECONDS);
  return jsonResponse(
    { ok: true, expiresIn: session.expiresIn },
    200,
    {
      'Set-Cookie': session.cookie,
    },
  );
}

export function onRequestGet() {
  return jsonResponse({ ok: false, error: 'Method not allowed.' }, 405, { Allow: 'POST' });
}
