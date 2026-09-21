import { jsonResponse } from '../_review-auth.js';

export function onRequestPost() {
  return jsonResponse(
    { ok: true },
    200,
    {
      'Set-Cookie': 'review_session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict',
    },
  );
}
