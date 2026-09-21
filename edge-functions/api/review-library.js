import {
  createReviewSession,
  jsonResponse,
  readCookie,
  REVIEW_SESSION_TTL_SECONDS,
  verifyReviewToken,
} from '../_review-auth.js';
import { reviewItems } from '../_review-media.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const token = readCookie(request.headers, 'review_session');
  const authorized = await verifyReviewToken(token, String(env.REVIEW_SESSION_SECRET || ''));
  if (!authorized) return jsonResponse({ ok: false, error: '登录已失效。' }, 401);

  const session = await createReviewSession(String(env.REVIEW_SESSION_SECRET), REVIEW_SESSION_TTL_SECONDS);
  return jsonResponse({
    ok: true,
    notice: '本页面仅供受邀招聘人员评估个人制作能力。内容禁止转载、下载或二次传播。',
    items: reviewItems.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      unofficial: Boolean(item.unofficial),
      posterUrl: item.posterUrl,
    })),
  }, 200, { 'Set-Cookie': session.cookie });
}

export function onRequestPost() {
  return jsonResponse({ ok: false, error: 'Method not allowed.' }, 405, { Allow: 'GET' });
}
