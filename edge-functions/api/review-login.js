import {
  createReviewSession,
  jsonResponse,
  REVIEW_SESSION_TTL_SECONDS,
  safeEqualText,
  sha256Hex,
} from '../_review-auth.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  const requestUrl = new URL(request.url);
  const origin = request.headers.get('origin');

  if (origin && origin !== requestUrl.origin) {
    return jsonResponse({ ok: false, error: '请求来源无效。' }, 403);
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
    return jsonResponse({ ok: false, error: '请输入有效密码。' }, 400);
  }

  const providedHash = await sha256Hex(password);
  const expectedHash = String(env.REVIEW_PASSWORD_HASH).trim().toLowerCase();
  if (!safeEqualText(providedHash, expectedHash)) {
    return jsonResponse({ ok: false, error: '密码不正确。' }, 401);
  }

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
