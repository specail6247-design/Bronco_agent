import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/lib/firebase/admin';
import { isOwner } from '@/lib/config';

export async function GET(req: NextRequest) {
  try {
    const adminDb = getAdminDb();
    const adminAuth = getAdminAuth();
    const { searchParams } = new URL(req.url);
    const adminUid = searchParams.get('adminUid');

    if (!adminUid) return new NextResponse('Missing admin UID', { status: 401 });

    const authUser = await adminAuth.getUser(adminUid).catch(() => null);
    const adminSnap = await adminDb.collection('users').doc(adminUid).get();
    const adminData = adminSnap.data();
    const email = adminData?.email || authUser?.email;

    if (!isOwner(email)) {
      return new NextResponse('Unauthorized: OWNER role required', { status: 403 });
    }
    
    // Removed orderBy to prevent production build failure without manual indexing
    const usersSnap = await adminDb.collection('users').limit(100).get();
    const users = usersSnap.docs.map((doc: any) => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString())
      };
    });
    
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const adminDb = getAdminDb();
    const adminAuth = getAdminAuth();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const adminUid = searchParams.get('adminUid');
    
    if (!adminUid) return new NextResponse('Missing admin UID', { status: 401 });

    const authUser = await adminAuth.getUser(adminUid).catch(() => null);
    const adminSnap = await adminDb.collection('users').doc(adminUid).get();
    const adminData = adminSnap.data();
    const email = adminData?.email || authUser?.email;

    if (!isOwner(email)) {
      return new NextResponse('Unauthorized: OWNER role required', { status: 403 });
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
