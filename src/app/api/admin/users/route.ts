import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const adminUid = searchParams.get('adminUid');

    if (!adminUid) return new NextResponse('Missing admin UID', { status: 401 });

    const OWNER_EMAIL = process.env.OWNER_EMAIL;
    const adminSnap = await adminDb.collection('users').doc(adminUid).get();
    let adminData = adminSnap.data();
    let email = adminData?.email;

    if (!adminData) {
      try {
        const authUser = await adminAuth.getUser(adminUid);
        email = authUser.email;
      } catch (e) {
        return new NextResponse('Admin user not found', { status: 401 });
      }
    }

    const isOwner = (adminData?.role === 'OWNER') || 
                    (OWNER_EMAIL && email && email.toLowerCase() === OWNER_EMAIL.toLowerCase());

    if (!isOwner) {
      return new NextResponse('Unauthorized', { status: 403 });
    }
    
    const usersSnap = await adminDb.collection('users').orderBy('createdAt', 'desc').limit(100).get();
    const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const adminUid = searchParams.get('adminUid');
    
    if (!adminUid) return new NextResponse('Missing admin UID', { status: 401 });

    const OWNER_EMAIL = process.env.OWNER_EMAIL;
    const adminSnap = await adminDb.collection('users').doc(adminUid).get();
    let adminData = adminSnap.data();
    let email = adminData?.email;

    if (!adminData) {
      try {
        const authUser = await adminAuth.getUser(adminUid);
        email = authUser.email;
      } catch (e) {
        return new NextResponse('Admin user not found', { status: 401 });
      }
    }

    const isOwner = (adminData?.role === 'OWNER') || 
                    (OWNER_EMAIL && email && email.toLowerCase() === OWNER_EMAIL.toLowerCase());

    if (!isOwner) {
      return new NextResponse('Unauthorized', { status: 403 });
    }
    
    if (!id) return new NextResponse('Missing ID', { status: 400 });

    // Delete from Auth
    await adminAuth.deleteUser(id);
    
    // Delete from Firestore
    await adminDb.collection('users').doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
