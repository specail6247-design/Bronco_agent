import crypto from 'crypto';

const TIKTOK_CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;
const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL;

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://bronco-agent.vercel.app').replace(/\/$/, "");
const REDIRECT_URI = `${APP_URL}/api/auth/callback/tiktok`;

// PKCE: Generate Code Verifier
export function generateCodeVerifier() {
  return crypto.randomBytes(32).toString('base64url');
}

// PKCE: Generate Code Challenge from Verifier
export function generateCodeChallenge(verifier: string) {
  return crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64url');
}

export function getTikTokAuthUrl(uid: string, codeChallenge: string) {
  const scope = [
    'user.info.basic',
    // Removed video.upload/publish temporarily to ensure basic login passes first
  ].join(',');

  const url = new URL('https://www.tiktok.com/v2/auth/authorize/');
  url.searchParams.append('client_key', TIKTOK_CLIENT_KEY || '');
  url.searchParams.append('scope', scope);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('redirect_uri', REDIRECT_URI);
  url.searchParams.append('state', uid);
  
  // PKCE Parameters
  url.searchParams.append('code_challenge', codeChallenge);
  url.searchParams.append('code_challenge_method', 'S256');

  return url.toString();
}

export async function exchangeTikTokCode(code: string, codeVerifier: string) {
  const params = new URLSearchParams();
  params.append('client_key', TIKTOK_CLIENT_KEY || '');
  params.append('client_secret', TIKTOK_CLIENT_SECRET || '');
  params.append('code', code);
  params.append('grant_type', 'authorization_code');
  params.append('redirect_uri', REDIRECT_URI);
  params.append('code_verifier', codeVerifier); // Required for PKCE flow

  const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cache-Control': 'no-cache',
    },
    body: params.toString(),
  });

  return response.json();
}
