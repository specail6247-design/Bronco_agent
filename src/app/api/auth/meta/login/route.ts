import { NextRequest, NextResponse } from 'next/server';
import { getMetaAuthUrl } from '@/lib/auth/meta';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid');

    if (!uid) {
      return new NextResponse('Missing UID', { status: 400 });
    }

    const authUrl = getMetaAuthUrl(uid);
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Failed to generate Meta auth URL:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
