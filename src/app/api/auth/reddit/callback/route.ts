export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { exchangeRedditCode, getRedditProfile } from '@/lib/auth/reddit';
import { getAdminDb } from '@/lib/firebase/admin';

export async function GET(req: NextRequest) {
  try {
    const adminDb = getAdminDb();
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const uid = searchParams.get('state');

    if (!code || !uid) {
      return new NextResponse('Invalid callback parameters', { status: 400 });
    }

    const data = await exchangeRedditCode(code);
    
    if (data.error) {
      console.error('[RedditCallback] Token Exchange Error:', data.error);
      return new NextResponse(`Reddit Auth Failed: ${data.error}`, { status: 500 });
    }

    const accessToken = data.access_token;
    const refreshToken = data.refresh_token; // Received because of duration=permanent
    const expiresIn = data.expires_in;

    // Fetch Profile
    const profile = await getRedditProfile(accessToken);

    // Store in Firestore
    await adminDb
      .collection('users')
      .doc(uid)
      .collection('connections')
      .doc('reddit')
      .set({
        platform: 'reddit',
        accessToken: accessToken,
        refreshToken: refreshToken || null,
        expiryDate: Date.now() + (expiresIn * 1000),
        updatedAt: new Date(),
        connected: true,
        profile: {
          id: profile.id,
          name: profile.name,
          icon_img: profile.icon_img
        }
      }, { merge: true });

    // Update main user doc for UI
    await adminDb.collection('users').doc(uid).set({
      connections: {
        reddit: { 
          connected: true, 
          updatedAt: new Date(),
          name: profile.name 
        }
      }
    }, { merge: true });

    const host = req.headers.get('host');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    return NextResponse.redirect(`${protocol}://${host}/dashboard?reddit=success`);

  } catch (error: any) {
    console.error('[RedditCallback] Fatal Error:', error);
    return new NextResponse(`Failed to connect Reddit: ${error.message}`, { status: 500 });
  }
}
