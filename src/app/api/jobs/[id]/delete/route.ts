import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const adminDb = getAdminDb();

    // 1. Delete the Job
    await adminDb.collection('jobs').doc(id).delete();

    // 2. Delete related job_steps (optional but good for cleanup)
    const stepsSnap = await adminDb.collection('job_steps').where('jobId', '==', id).get();
    const batch = adminDb.batch();
    stepsSnap.docs.forEach((doc) => batch.delete(doc.ref));
    
    // 3. Delete related artifacts
    const artifactsSnap = await adminDb.collection('artifacts').where('jobId', '==', id).get();
    artifactsSnap.docs.forEach((doc) => batch.delete(doc.ref));

    // 4. Delete related activity_logs
    const logsSnap = await adminDb.collection('activity_logs').where('jobId', '==', id).get();
    logsSnap.docs.forEach((doc) => batch.delete(doc.ref));

    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting job:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
