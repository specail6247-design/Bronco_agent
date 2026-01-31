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
    await adminDb
      .collection('users')
      .doc(uid)
      .collection('connections')
      .doc(platform)
      .delete();

    console.log(`[Disconnect] Successfully disconnected ${platform} for user ${uid}`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting platform:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
