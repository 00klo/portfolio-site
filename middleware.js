import {
  createReviewSession,
  readCookie,
  REVIEW_SESSION_TTL_SECONDS,
  verifyReviewToken,
} from './edge-functions/_review-auth.js';

export async function middleware(context) {
  const { request, next, env } = context;
  const token = readCookie(request.headers, 'review_session');
  const authorized = await verifyReviewToken(token, String(env.REVIEW_SESSION_SECRET || ''));

  if (!authorized) {
    const requestUrl = new URL(request.url);
    const loginUrl = new URL('/review-login/', requestUrl.origin);
    loginUrl.searchParams.set('next', `${requestUrl.pathname}${requestUrl.search}`);
    return Response.redirect(loginUrl, 307);
  }

  const response = await next();
  const session = await createReviewSession(String(env.REVIEW_SESSION_SECRET), REVIEW_SESSION_TTL_SECONDS);
  const headers = new Headers(response.headers);
  headers.append('Set-Cookie', session.cookie);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export const config = {
  matcher: ['/review/aigc', '/review/aigc/:path*'],
};
