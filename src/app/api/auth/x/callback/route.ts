export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { exchangeXCode, getXProfile } from '@/lib/auth/x';
import { getAdminDb } from '@/lib/firebase/admin';

export async function GET(req: NextRequest) {
  try {
    const adminDb = getAdminDb();
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const uid = searchParams.get('state');

    const codeVerifier = req.cookies.get('x_code_verifier')?.value;

    if (!code || !uid || !codeVerifier) {
      return new NextResponse('Invalid callback parameters or expired session', { status: 400 });
    }

    const data = await exchangeXCode(code, codeVerifier);
    
    if (data.error) {
      console.error('[XCallback] Token Exchange Error:', data.error);
      return new NextResponse(`X Auth Failed: ${data.error_description || data.error}`, { status: 500 });
    }

    const accessToken = data.access_token;
    const refreshToken = data.refresh_token; 
    const expiresIn = data.expires_in;

    // Fetch Profile
    const profileData = await getXProfile(accessToken);
    const profile = profileData.data;

    // Store in Firestore
    await adminDb
      .collection('users')
      .doc(uid)
      .collection('connections')
      .doc('x')
      .set({
        platform: 'x',
        accessToken: accessToken,
        refreshToken: refreshToken || null,
        expiryDate: Date.now() + (expiresIn * 1000),
        updatedAt: new Date(),
        connected: true,
        profile: {
          id: profile?.id || '',
          username: profile?.username || '',
          name: profile?.name || '',
          profile_image_url: profile?.profile_image_url || ''
        }
      }, { merge: true });

    // Update main user doc
    await adminDb.collection('users').doc(uid).set({
      connections: {
        x: { 
          connected: true, 
          updatedAt: new Date(),
          name: profile?.username || 'Social User' 
        }
      }
    }, { merge: true });

    const host = req.headers.get('host');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    
    const response = NextResponse.redirect(`${protocol}://${host}/dashboard?x=success`);
    response.cookies.delete('x_code_verifier');
    return response;

  } catch (error: any) {
    console.error('[XCallback] Fatal Error:', error);
    return new NextResponse(`Failed to connect X: ${error.message}`, { status: 500 });
  }
}
