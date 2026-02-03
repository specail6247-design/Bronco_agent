import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

export async function POST(req: NextRequest) {
  try {
    const { uid, platform } = await req.json();

    if (!uid || !platform) {
      return new NextResponse('Missing uid or platform', { status: 400 });
    }

    const adminDb = getAdminDb();
    
    // Delete the specific platform connection document
    const userRef = adminDb.collection('users').doc(uid);
    const subConnRef = userRef.collection('connections').doc(platform);
    
    const batch = adminDb.batch();
    
    const { FieldValue } = require('firebase-admin/firestore');
    
    // 1. Delete from sub-collection (Credentials)
    batch.delete(subConnRef);
    
    // 2. Remove flag from root connections object
    batch.update(userRef, {
      [`connections.${platform}`]: FieldValue.delete() 
    });
    
    // Alternative for safety if FieldValue.delete is tricky
    await batch.commit();

    // Secondary cleanup for the root object map
    await userRef.set({
      connections: {
        [platform]: { connected: false, disconnectedAt: new Date() }
      }
    }, { merge: true });

    console.log(`[Disconnect] Successfully disconnected ${platform} for user ${uid}`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting platform:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
