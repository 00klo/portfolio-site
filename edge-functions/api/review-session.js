import {
  createReviewSession,
  jsonResponse,
  readCookie,
  REVIEW_SESSION_TTL_SECONDS,
  verifyReviewToken,
} from '../_review-auth.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const token = readCookie(request.headers, 'review_session');
  const secret = String(env.REVIEW_SESSION_SECRET || '');
  const authorized = await verifyReviewToken(token, secret);
  if (!authorized) return jsonResponse({ ok: false, error: '登录已失效。' }, 401);

  const session = await createReviewSession(secret, REVIEW_SESSION_TTL_SECONDS);
  return jsonResponse(
    { ok: true, expiresIn: session.expiresIn },
    200,
    { 'Set-Cookie': session.cookie },
  );
}

export function onRequestPost() {
  return jsonResponse({ ok: false, error: 'Method not allowed.' }, 405, { Allow: 'GET' });
}
