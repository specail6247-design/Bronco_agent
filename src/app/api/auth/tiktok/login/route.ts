export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getTikTokAuthUrl, generateCodeVerifier, generateCodeChallenge } from '@/lib/auth/tiktok';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid');

    if (!uid) {
      return new NextResponse('Missing UID', { status: 400 });
    }

    // Generate PKCE values
    const verifier = generateCodeVerifier();
    const challenge = generateCodeChallenge(verifier);

    // Store verifier in an HTTP-only cookie for the callback
    cookies().set('tiktok_code_verifier', verifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    });

    const authUrl = getTikTokAuthUrl(uid, challenge);
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Failed to generate TikTok auth URL:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
