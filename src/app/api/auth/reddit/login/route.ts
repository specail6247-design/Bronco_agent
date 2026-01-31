import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get('uid');

  if (!uid) {
    return new NextResponse('Missing UID', { status: 400 });
  }

  const client_id = process.env.REDDIT_CLIENT_ID?.trim();
  const redirect_uri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/reddit/callback`;
  
  /**
   * duration: permanent (to get a refresh token)
   * scope: identity (profile info), submit (post content)
   */
  const scopes = ['identity', 'submit'].join(' ');
  const state = uid; // Using UID as state for simplicity, ideally should be a random string + UID

  const authUrl = `https://www.reddit.com/api/v1/authorize?client_id=${client_id}&response_type=code&state=${state}&redirect_uri=${encodeURIComponent(redirect_uri)}&duration=permanent&scope=${encodeURIComponent(scopes)}`;

  return NextResponse.redirect(authUrl);
}
