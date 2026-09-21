const encoder = new TextEncoder();

export const REVIEW_SESSION_TTL_SECONDS = 60 * 60;
const REVIEW_SESSION_VERSION = 2;

const encodeBase64Url = bytes => {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

const decodeBase64Url = value => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - normalized.length % 4) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, character => character.charCodeAt(0));
};

const encodeJson = value => encodeBase64Url(encoder.encode(JSON.stringify(value)));

const decodeJson = value => JSON.parse(new TextDecoder().decode(decodeBase64Url(value)));

const importHmacKey = (secret, usages) => crypto.subtle.importKey(
  'raw',
  encoder.encode(secret),
  { name: 'HMAC', hash: 'SHA-256' },
  false,
  usages,
);

export const issueReviewToken = async (secret, ttlSeconds = REVIEW_SESSION_TTL_SECONDS) => {
  const now = Math.floor(Date.now() / 1000);
  const header = encodeJson({ alg: 'HS256', typ: 'JWT' });
  const payload = encodeJson({ scope: 'aigc-review', version: REVIEW_SESSION_VERSION, iat: now, exp: now + ttlSeconds });
  const unsigned = `${header}.${payload}`;
  const key = await importHmacKey(secret, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(unsigned));
  return `${unsigned}.${encodeBase64Url(new Uint8Array(signature))}`;
};

export const verifyReviewToken = async (token, secret) => {
  if (!token || !secret) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  try {
    const header = decodeJson(parts[0]);
    const payload = decodeJson(parts[1]);
    if (header.alg !== 'HS256' || payload.scope !== 'aigc-review' || payload.version !== REVIEW_SESSION_VERSION) return false;
    if (!Number.isFinite(payload.exp) || payload.exp <= Math.floor(Date.now() / 1000)) return false;

    const key = await importHmacKey(secret, ['verify']);
    return crypto.subtle.verify(
      'HMAC',
      key,
      decodeBase64Url(parts[2]),
      encoder.encode(`${parts[0]}.${parts[1]}`),
    );
  } catch {
    return false;
  }
};

export const createReviewSession = async (secret, ttlSeconds = REVIEW_SESSION_TTL_SECONDS) => {
  const token = await issueReviewToken(secret, ttlSeconds);
  return {
    token,
    expiresIn: ttlSeconds,
    cookie: `review_session=${encodeURIComponent(token)}; Path=/; Max-Age=${ttlSeconds}; HttpOnly; Secure; SameSite=Strict`,
  };
};

export const readCookie = (headers, name) => {
  const cookieHeader = headers.get('cookie') || '';
  for (const part of cookieHeader.split(';')) {
    const separator = part.indexOf('=');
    if (separator === -1) continue;
    const key = part.slice(0, separator).trim();
    if (key === name) return decodeURIComponent(part.slice(separator + 1).trim());
  }
  return '';
};

export const sha256Hex = async value => {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
};

export const safeEqualText = (left, right) => {
  if (typeof left !== 'string' || typeof right !== 'string' || left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
};

export const jsonResponse = (body, status = 200, extraHeaders = {}) => new Response(
  JSON.stringify(body),
  {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store, max-age=0',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex, nofollow, noarchive, noimageindex',
      ...extraHeaders,
    },
  },
);
