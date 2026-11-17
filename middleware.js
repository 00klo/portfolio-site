export function middleware() {
  return new Response(null, {
    status: 410,
    headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' },
  });
}

export const config = {
  matcher: [
    '/review/aigc', '/review/aigc/:path*',
    '/review-login', '/review-login/:path*',
    '/api/review-library', '/api/review-login', '/api/review-logout',
    '/api/review-session', '/api/video-token',
  ],
};
