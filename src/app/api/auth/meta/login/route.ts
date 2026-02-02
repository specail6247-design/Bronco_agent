import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get('uid');

  if (!uid) {
    return new NextResponse('Missing UID', { status: 400 });
  }

  const client_id = process.env.META_APP_ID;
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, "");
  const redirect_uri = `${appUrl}/api/auth/callback/meta`;
  
  // Extra-Dietted scopes: Removed 'email' to bypass the final "Invalid Scope" error.
  // We only keep the permissions verified in the Meta Dashboard.
  const scopes = [
    'public_profile',
    'instagram_basic',
    'pages_show_list',
    'pages_read_engagement'
  ].join(',');

  const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&state=${uid}&scope=${encodeURIComponent(scopes)}&response_type=code`;

  return NextResponse.redirect(authUrl);
}
