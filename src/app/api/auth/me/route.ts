export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/lib/firebase/admin';
import { isOwner, CONFIG } from '@/lib/config';

export async function GET(req: NextRequest) {
  try {
    const adminDb = getAdminDb();
    const adminAuth = getAdminAuth();
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid');

    if (!uid) {
      return new NextResponse('Missing UID', { status: 400 });
    }
    
    let userData: any = null;
    let email: string | undefined = undefined;

    const userDoc = await adminDb.collection('users').doc(uid).get();
    const authUser = await adminAuth.getUser(uid).catch(() => null);
    
    if (userDoc.exists) {
      userData = userDoc.data();
      email = userData?.email || authUser?.email;
    } else {
      // If Firestore doc is missing, use Auth data
      email = authUser?.email;
      userData = {
        email: authUser?.email,
        name: authUser?.displayName,
        role: 'MEMBER',
        allowedAgents: CONFIG.DEFAULT_AGENTS,
        createdAt: new Date(),
      };
    }
    
    const role = isOwner(email) ? 'OWNER' : (userData?.role || 'MEMBER');

    // Ensure OWNER always has all agents
    const allowedAgents = role === 'OWNER' 
      ? CONFIG.FULL_WORKFORCE
      : (userData?.allowedAgents || CONFIG.DEFAULT_AGENTS);

    // MERGE Connections: Sub-collection + Root field
    // Some connections might be in root 'connections' map, some in sub-collection
    const connectionsSnap = await adminDb.collection('users').doc(uid).collection('connections').get();
    const subCollectionConnections = connectionsSnap.docs.reduce((acc, doc) => {
      acc[doc.id] = { connected: true, ...doc.data() };
      return acc;
    }, {} as any);

    // Final Merged Connections
    const mergedConnections = {
      ...(userData?.connections || {}),
      ...subCollectionConnections
    };

    return NextResponse.json({
      user: { 
        id: uid, 
        email: email,
        name: userData?.name || authUser?.displayName || email?.split('@')[0],
        ...userData,
        role,
        allowedAgents,
        connections: mergedConnections
      }
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
