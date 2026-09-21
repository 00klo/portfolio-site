import { md5Base64Url } from '../_md5.js';
import { findReviewItem } from '../_review-media.js';
import {
  createReviewSession,
  jsonResponse,
  readCookie,
  REVIEW_SESSION_TTL_SECONDS,
  verifyReviewToken,
} from '../_review-auth.js';

const MEDIA_ORIGIN = 'https://media.lin77.xyz';
const VIDEO_TOKEN_TTL_SECONDS = 15 * 60;

const signMediaPath = (path, expires, secret) => {
  const signature = md5Base64Url(`${expires}${path} ${secret}`);
  return `${MEDIA_ORIGIN}${path}?md5=${encodeURIComponent(signature)}&expires=${expires}`;
};

export async function onRequestPost(context) {
  const { request, env } = context;
  const requestUrl = new URL(request.url);
  const origin = request.headers.get('origin');
  if (origin && origin !== requestUrl.origin) {
    return jsonResponse({ ok: false, error: '请求来源无效。' }, 403);
  }

  const sessionSecret = String(env.REVIEW_SESSION_SECRET || '');
  const token = readCookie(request.headers, 'review_session');
  const authorized = await verifyReviewToken(token, sessionSecret);
  if (!authorized) return jsonResponse({ ok: false, error: '登录已失效。' }, 401);
  if (!env.MEDIA_SIGNING_SECRET) {
    return jsonResponse({ ok: false, error: '媒体签名服务尚未完成配置。' }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: '请求格式无效。' }, 400);
  }

  const item = findReviewItem(typeof body.videoId === 'string' ? body.videoId : '');
  if (!item) return jsonResponse({ ok: false, error: '视频不存在。' }, 404);

  const expires = Math.floor(Date.now() / 1000) + VIDEO_TOKEN_TTL_SECONDS;
  const session = await createReviewSession(sessionSecret, REVIEW_SESSION_TTL_SECONDS);
  return jsonResponse({
    ok: true,
    videoId: item.id,
    expires,
    expiresIn: VIDEO_TOKEN_TTL_SECONDS,
    videoUrl: signMediaPath(item.video, expires, String(env.MEDIA_SIGNING_SECRET)),
  }, 200, { 'Set-Cookie': session.cookie });
}

export function onRequestGet() {
  return jsonResponse({ ok: false, error: 'Method not allowed.' }, 405, { Allow: 'POST' });
}
