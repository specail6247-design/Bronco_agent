import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid');

    if (!uid) {
      return new NextResponse('Missing UID', { status: 400 });
    }

    const OWNER_EMAIL = process.env.OWNER_EMAIL;
    let userData: any = null;
    let email: string | undefined = undefined;

    const userDoc = await adminDb.collection('users').doc(uid).get();
    
    if (userDoc.exists) {
      userData = userDoc.data();
      email = userData?.email;
    } else {
      // If Firestore doc is missing, check Firebase Auth directly
      try {
        const authUser = await adminAuth.getUser(uid);
        email = authUser.email;
        userData = {
          email: authUser.email,
          name: authUser.displayName,
          role: 'MEMBER', // Default, will be upgraded below if needed
          allowedAgents: ['jessica', 'sunny'],
          createdAt: new Date(),
        };
      } catch (authError) {
        console.error('Auth user not found:', authError);
        return new NextResponse('User not found', { status: 404 });
      }
    }
    
    let role = userData?.role || 'MEMBER';
    if (OWNER_EMAIL && email && email.toLowerCase() === OWNER_EMAIL.toLowerCase()) {
      role = 'OWNER';
    }

    // Ensure OWNER always has all agents
    const allowedAgents = role === 'OWNER' 
      ? ['jessica', 'sunny', 'rovert', 'tim', 'david', 'john']
      : (userData?.allowedAgents || ['jessica', 'sunny']);

    return NextResponse.json({
      user: { 
        id: uid, 
        ...userData,
        role,
        allowedAgents
      }
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
