import { NextRequest, NextResponse } from 'next/server';
import { exchangeMetaCode } from '@/lib/auth/meta';
import { adminDb } from '@/lib/firebase/admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const uid = searchParams.get('state');

    if (!code || !uid) {
      return new NextResponse('Invalid callback parameters', { status: 400 });
    }

    const data = await exchangeMetaCode(code);
    
    if (data.error) {
      console.error('Meta Token Exchange Error:', data.error);
      return new NextResponse(`Meta Auth Failed: ${data.error.message}`, { status: 500 });
    }

    // Store tokens in Firestore
    // Note: This token is a User Access Token. We might need to exchange it 
    // for Long-Lived tokens or Page tokens depending on the specific platform.
    await adminDb
      .collection('users')
      .doc(uid)
      .collection('connections')
      .doc('meta')
      .set({
        platform: 'meta',
        accessToken: data.access_token,
        updatedAt: new Date(),
        connected: true,
      }, { merge: true });

    // Update main user doc for UI reflect
    await adminDb.collection('users').doc(uid).set({
      connections: {
        instagram: { connected: true, updatedAt: new Date() },
        facebook: { connected: true, updatedAt: new Date() },
      }
    }, { merge: true });

    const host = req.headers.get('host');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    return NextResponse.redirect(`${protocol}://${host}/dashboard?meta=success`);

  } catch (error) {
    console.error('Meta Callback Error:', error);
    return new NextResponse('Failed to connect Meta services', { status: 500 });
  }
}
