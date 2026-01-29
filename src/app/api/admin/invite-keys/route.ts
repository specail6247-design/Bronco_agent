import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { createNewInviteKey } from '@/lib/auth/invite-keys';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { expiryDays, allowedAgentCount, maxUses, adminUid } = body;
    
    // Server-side role check
    const OWNER_EMAIL = process.env.OWNER_EMAIL || 'specail6247@gmail.com';
    console.log('[AdminAPI] Request from UID:', adminUid);
    
    if (adminUid) {
      const userSnap = await adminDb.collection('users').doc(adminUid).get();
      let userData = userSnap.data();
      let email = userData?.email;

      if (!userData) {
        try {
          const authUser = await adminAuth.getUser(adminUid);
          email = authUser.email;
          console.log('[AdminAPI] Auth User Email:', email);
        } catch (e) {
          console.error('[AdminAPI] Auth Lookup failed:', e);
        }
      }

      const isOwner = (userData?.role === 'OWNER') || 
                      (email && email.toLowerCase() === OWNER_EMAIL.toLowerCase());

      if (!isOwner) {
        console.warn('[AdminAPI] Unauthorized attempt by:', email);
        return new NextResponse('Unauthorized: OWNER role required', { status: 403 });
      }
    } else {
      return new NextResponse('Missing admin UID', { status: 401 });
    }

    const result = await createNewInviteKey({
      expiryDays: Number(expiryDays) || 7,
      allowedAgentCount: Number(allowedAgentCount) || 2,
      maxUses: Number(maxUses) || 1,
    });

    console.log('[AdminAPI] Success! New key created:', result.keyId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating key:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Fetch lists logic...
  return NextResponse.json({ message: 'Not implemented for MVP' });
}
