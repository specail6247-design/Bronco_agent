import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get('uid');

  if (!uid) {
    return new NextResponse('Missing UID', { status: 400 });
  }

  const client_id = process.env.X_CLIENT_ID?.trim();
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, "");
  const redirect_uri = `${appUrl}/api/auth/x/callback`;
  
  // PKCE: Code Verifier and Challenge
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');

  /**
   * duration: offline.access (to get a refresh token)
   * scope: tweet.read, tweet.write, users.read
   */
  const scopes = ['tweet.read', 'tweet.write', 'users.read', 'offline.access'].join(' ');
  const state = uid;

  const authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=${encodeURIComponent(scopes)}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

  const response = NextResponse.redirect(authUrl);
  
  // Temporarily store code_verifier in a cookie for the callback to use
  response.cookies.set('x_code_verifier', codeVerifier, { 
    path: '/', 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production', 
    sameSite: 'lax',
    maxAge: 600 // 10 minutes
  });

  return response;
}
