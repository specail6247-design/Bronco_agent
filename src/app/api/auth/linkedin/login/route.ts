import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get('uid');

  if (!uid) {
    return new NextResponse('Missing UID', { status: 400 });
  }

  const client_id = process.env.LINKEDIN_CLIENT_ID?.trim();
  const redirect_uri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/linkedin/callback`;
  
  // Adjusted Scopes: Removed 'w_organization_social' for now
  // 'openid', 'profile', 'email' are basic OpenID Connect scopes
  // 'w_member_social' is for personal profile posting
  const scopes = [
    'openid',
    'profile',
    'email',
    'w_member_social'
  ].join(' ');

  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&state=${uid}&scope=${encodeURIComponent(scopes)}`;

  return NextResponse.redirect(authUrl);
}
