import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    // Fetch Job
    const jobDoc = await adminDb.collection('jobs').doc(id).get();
    if (!jobDoc.exists) {
      return new NextResponse('Job not found', { status: 404 });
    }
    const job = { 
      id: jobDoc.id, 
      ...jobDoc.data(),
      scheduledAt: jobDoc.data()?.scheduledAt.toDate().toISOString(),
      createdAt: jobDoc.data()?.createdAt.toDate().toISOString(),
      updatedAt: jobDoc.data()?.updatedAt.toDate().toISOString(),
    };

    // Fetch Steps
    const stepsSnap = await adminDb.collection('job_steps')
      .where('jobId', '==', id)
      .get();
    const steps = stepsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Fetch Artifacts
    const artifactsSnap = await adminDb.collection('artifacts')
      .where('jobId', '==', id)
      .orderBy('createdAt', 'desc')
      .get();
    const artifacts = artifactsSnap.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate().toISOString() 
    }));

    return NextResponse.json({ job, steps, artifacts });
  } catch (error) {
    console.error('Error fetching job details:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const updates = await req.json();
    
    await adminDb.collection('jobs').doc(id).update({
      ...updates,
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating job:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
