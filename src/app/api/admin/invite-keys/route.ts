import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/lib/firebase/admin';
import { createNewInviteKey } from '@/lib/auth/invite-keys';
import { isOwner } from '@/lib/config';

export async function POST(req: NextRequest) {
  try {
    const adminDb = getAdminDb();
    const adminAuth = getAdminAuth();
    const body = await req.json();
    const { expiryDays, allowedAgentCount, maxUses, adminUid } = body;
    
    // Server-side role check
    if (adminUid) {
      const authUser = await adminAuth.getUser(adminUid).catch(() => null);
      const userSnap = await adminDb.collection('users').doc(adminUid).get();
      const userData = userSnap.data();
      const email = userData?.email || authUser?.email;

      if (!isOwner(email)) {
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
