import { NextRequest, NextResponse } from 'next/server';
import { exchangeTikTokCode } from '@/lib/auth/tiktok';
import { adminDb } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const uid = searchParams.get('state');

    if (!code || !uid) {
      return new NextResponse('Invalid callback parameters', { status: 400 });
    }

    // Retrieve PKCE verifier from cookies
    const verifier = cookies().get('tiktok_code_verifier')?.value;
    
    if (!verifier) {
      console.error('Missing code_verifier cookie');
      return new NextResponse('Authentication expired. Please try again.', { status: 400 });
    }

    const data = await exchangeTikTokCode(code, verifier);
    
    if (data.error) {
      console.error('TikTok Token Exchange Error:', data);
      return new NextResponse(`TikTok Auth Failed: ${data.error_description || data.error_msg}`, { status: 500 });
    }

    // Store tokens in Firestore
    await adminDb
      .collection('users')
      .doc(uid)
      .collection('connections')
      .doc('tiktok')
      .set({
        platform: 'tiktok',
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        openId: data.open_id,
        expiryDate: Date.now() + (data.expires_in * 1000),
        updatedAt: new Date(),
        connected: true, // Mark as connected
      }, { merge: true });

    // Also update main user doc for quick access in UI
    await adminDb.collection('users').doc(uid).set({
      connections: {
        tiktok: {
          connected: true,
          updatedAt: new Date(),
        }
      }
    }, { merge: true });

    const host = req.headers.get('host');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    return NextResponse.redirect(`${protocol}://${host}/dashboard?tiktok=success`);

  } catch (error) {
    console.error('TikTok Callback Error:', error);
    return new NextResponse('Failed to connect TikTok', { status: 500 });
  }
}
