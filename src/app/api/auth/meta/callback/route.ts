export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { exchangeMetaCode, getInstagramAccounts } from '@/lib/auth/meta';
import { getAdminDb } from '@/lib/firebase/admin';

export async function GET(req: NextRequest) {
  try {
    const adminDb = getAdminDb();
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const uid = searchParams.get('state');

    console.log(`[MetaCallback] UID: ${uid}, Code present: ${!!code}`);

    if (!code || !uid) {
      return new NextResponse('Invalid callback parameters', { status: 400 });
    }

    // Security Check
    const userDoc = await adminDb.collection('users').doc(uid).get();
    if (!userDoc.exists) return new NextResponse('User Not Found', { status: 403 });

    const data = await exchangeMetaCode(code);
    
    if (data.error) {
      console.error('[MetaCallback] Token Exchange Error:', data.error);
      return new NextResponse(`Meta Auth Failed: ${data.error.message || 'Token exchange failed'}`, { status: 500 });
    }

    const accessToken = data.access_token;
    const expiresIn = Number(data.expires_in) || 5184000; // Default 60 days
    const expiryDate = Date.now() + (expiresIn * 1000);

    console.log('[MetaCallback] Token exchanged successfully');

    // Optional: Get Instagram Accounts
    let igAccounts = [];
    try {
      igAccounts = await getInstagramAccounts(accessToken);
    } catch (igError) {
      console.error('[MetaCallback] IG Account Fetch Error (Non-fatal):', igError);
    }
    
    const primaryIg = igAccounts[0] || null;

    console.log(`[MetaCallback] Found ${igAccounts.length} IG accounts. Primary: ${primaryIg?.username || 'None'}`);

    const baseConnectionData = {
      accessToken,
      tokenType: data.token_type || 'Bearer',
      expiryDate,
      updatedAt: new Date(),
      connected: true,
      metaAppId: process.env.META_APP_ID
    };

    // Store in connections subcollection for UI synchronization
    // We save as 'instagram', 'facebook', and 'threads' so the cards light up
    const batch = adminDb.batch();
    const userRef = adminDb.collection('users').doc(uid);
    const connColl = userRef.collection('connections');

    // 1. Save Instagram connection
    batch.set(connColl.doc('instagram'), {
      ...baseConnectionData,
      platform: 'instagram',
      instagramAccount: primaryIg,
      allAccounts: igAccounts
    }, { merge: true });

    // 2. Save Facebook connection
    batch.set(connColl.doc('facebook'), {
      ...baseConnectionData,
      platform: 'facebook'
    }, { merge: true });

    // 3. Save Threads connection
    batch.set(connColl.doc('threads'), {
      ...baseConnectionData,
      platform: 'threads'
    }, { merge: true });

    // 4. Save original 'meta' doc as back-link/master
    batch.set(connColl.doc('meta'), {
      ...baseConnectionData,
      platform: 'meta',
      instagramAccount: primaryIg,
      allAccounts: igAccounts
    }, { merge: true });

    await batch.commit();

    console.log('[MetaCallback] Batch commit successful. All platforms linked.');

    const host = req.headers.get('host');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    return NextResponse.redirect(`${protocol}://${host}/dashboard?meta=success`);

  } catch (error: any) {
    console.error('[MetaCallback] Fatal Error:', error);
    return new NextResponse(`Failed to connect Meta: ${error.message || 'Unknown error'}`, { status: 500 });
  }
}
