export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { exchangeLinkedInCode, getLinkedInProfile, getLinkedInOrganizations } from '@/lib/auth/linkedin';
import { getAdminDb } from '@/lib/firebase/admin';

export async function GET(req: NextRequest) {
  try {
    const adminDb = getAdminDb();
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const uid = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    console.log(`[LinkedInCallback] UID: ${uid}, Code present: ${!!code}, Error: ${error}`);

    if (error) {
      return new NextResponse(`LinkedIn Auth Error: ${error} - ${errorDescription}`, { status: 400 });
    }

    if (!code || !uid) {
      return new NextResponse(`Invalid callback parameters: Missing ${!code ? 'code' : ''} ${!uid ? 'state/uid' : ''}`, { status: 400 });
    }

    const data = await exchangeLinkedInCode(code);
    
    if (data.error) {
      console.error('[LinkedInCallback] Token Exchange Error:', data.error);
      return new NextResponse(`LinkedIn Token Exchange Failed: ${data.error_description || data.error}`, { status: 500 });
    }

    const accessToken = data.access_token;
    const expiresIn = data.expires_in;

    // Fetch Profile and Organizations
    const profile = await getLinkedInProfile(accessToken);
    let organizations = [];
    try {
      organizations = await getLinkedInOrganizations(accessToken);
    } catch (orgError) {
      console.error('[LinkedInCallback] Org Fetch Error (Non-fatal):', orgError);
    }

    // Store in Firestore
    await adminDb
      .collection('users')
      .doc(uid)
      .collection('connections')
      .doc('linkedin')
      .set({
        platform: 'linkedin',
        accessToken: accessToken,
        expiryDate: Date.now() + (expiresIn * 1000),
        updatedAt: new Date(),
        connected: true,
        profile: {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          picture: profile.picture
        },
        organizations
      }, { merge: true });

    // Update main user doc
    await adminDb.collection('users').doc(uid).set({
      connections: {
        linkedin: { 
          connected: true, 
          updatedAt: new Date(),
          name: profile.name 
        }
      }
    }, { merge: true });

    const host = req.headers.get('host');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    return NextResponse.redirect(`${protocol}://${host}/dashboard?linkedin=success`);

  } catch (error: any) {
    console.error('[LinkedInCallback] Fatal Error:', error);
    return new NextResponse(`Failed to connect LinkedIn: ${error.message}`, { status: 500 });
  }
}
