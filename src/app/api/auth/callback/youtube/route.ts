import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getYouTubeOAuthClient } from '@/lib/auth/youtube';
import { adminDb } from '@/lib/firebase/admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const uid = searchParams.get('state'); // login 할 때 보냈던 uid

    if (!code || !uid) {
      return new NextResponse('Invalid callback parameters', { status: 400 });
    }

    const client = getYouTubeOAuthClient();
    
    // 코드를 토큰으로 교환
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    // 구글 사용자 정보 가져오기 (어떤 채널인지 식별용)
    const oauth2 = google.oauth2({ version: 'v2', auth: client });
    const userInfo = await oauth2.userinfo.get();

    // Firestore에 토큰 저장 (사용자 문서 하위의 connections 컬렉션)
    await adminDb
      .collection('users')
      .doc(uid)
      .collection('connections')
      .doc('youtube')
      .set({
        platform: 'youtube',
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: tokens.expiry_date,
        email: userInfo.data.email,
        channelName: userInfo.data.name,
        updatedAt: new Date(),
      }, { merge: true });

    // 성공 후 대시보드로 이동
    const host = req.headers.get('host');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    return NextResponse.redirect(`${protocol}://${host}/dashboard?youtube=success`);

  } catch (error) {
    console.error('YouTube Auth Callback Error:', error);
    return new NextResponse('Failed to connect YouTube', { status: 500 });
  }
}
