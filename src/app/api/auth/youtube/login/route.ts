export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getYouTubeOAuthClient, YOUTUBE_SCOPES } from '@/lib/auth/youtube';
import { CONFIG } from '@/lib/config';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid');

    if (!uid) {
      return new NextResponse('Missing UID', { status: 400 });
    }

    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const protocol = req.headers.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https');
    const dynamicUrl = host ? `${protocol}://${host}` : undefined;
    
    // Prioritize the actual host being visited, then fall back to env vars
    const appUrl = dynamicUrl || process.env.NEXT_PUBLIC_APP_URL || CONFIG.APP_URL;

    const client = getYouTubeOAuthClient(appUrl);
    
    // Auth URL 생성 (사용자가 로그인 후 돌아올 때 uid를 상태값으로 전달)
    const url = client.generateAuthUrl({
      access_type: 'offline', // 나중에 사용자가 없어도 업로드하려면 필수!
      scope: YOUTUBE_SCOPES,
      prompt: 'consent', // 매번 권한 확인 질문 (테스트 시 안전함)
      state: uid, // 콜백 때 다시 이 UID를 돌려받음
    });

    return NextResponse.redirect(url);
  } catch (error) {
    console.error('Failed to generate YouTube auth URL:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
