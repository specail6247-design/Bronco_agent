import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getAdminDb } from '@/lib/firebase/admin';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const adminDb = getAdminDb();
    
    // Check if real Job exists in Firestore
    let jobData: any = null;
    let stepsData: any[] = [];
    let artifactsData: any[] = [];

    try {
      const jobDoc = await adminDb.collection('jobs').doc(id).get();
      if (jobDoc.exists) {
        const d = jobDoc.data() || {};
        jobData = { 
          id: jobDoc.id, 
          ...d,
          topic: d.topic || 'Unknown Topic',
          state: d.state || 'WAITING',
          scheduledAt: d?.scheduledAt?.toDate ? d.scheduledAt.toDate().toISOString() : d?.scheduledAt || new Date().toISOString(),
          createdAt: d?.createdAt?.toDate ? d.createdAt.toDate().toISOString() : d?.createdAt || new Date().toISOString(),
          updatedAt: d?.updatedAt?.toDate ? d.updatedAt.toDate().toISOString() : d?.updatedAt || new Date().toISOString(),
        };

        const stepsSnap = await adminDb.collection('job_steps').where('jobId', '==', id).get();
        stepsData = stepsSnap.docs.map((doc: any) => ({ 
          id: doc.id, 
          ...doc.data(),
          state: doc.data()?.state || 'WAITING',
          stepName: doc.data()?.stepName || 'unknown'
        }));

        const artifactsSnap = await adminDb.collection('artifacts')
          .where('jobId', '==', id)
          .limit(20)
          .get();
        artifactsData = artifactsSnap.docs.map((doc: any) => {
          const ad = doc.data() || {};
          return { 
            id: doc.id, 
            ...ad,
            createdAt: ad?.createdAt?.toDate ? ad.createdAt.toDate().toISOString() : ad?.createdAt || new Date().toISOString() 
          };
        });

        return NextResponse.json({ job: jobData, steps: stepsData, artifacts: artifactsData });
      } else {
        // If it specifically does not exist and it's not a numeric ID, return 404
        if (!['1', '2', '3'].includes(id)) {
           return new NextResponse(JSON.stringify({ error: 'Job not found' }), { status: 404 });
        }
      }
    } catch (dbError: any) {
      console.error('Database fetch failed:', dbError);
      return new NextResponse(JSON.stringify({ error: 'Database Error', details: dbError?.message }), { status: 500 });
    }

    // FALLBACK
    const isMock2 = id === '2';
    const mockJob = {
      id: id,
      topic: isMock2 ? 'Remote Work Setup Guide 2024' : 'AI Productivity Tools for Digital Nomads',
      state: isMock2 ? 'RUNNING' : 'SCHEDULED',
      scheduledAt: new Date(Date.now() + (isMock2 ? -3600000 : 86400000)).toISOString(),
      platforms: isMock2 ? ['youtube', 'threads'] : ['youtube', 'tiktok', 'instagram'],
      languageMode: isMock2 ? 'manual' : 'auto',
      preferredLanguage: isMock2 ? 'ko' : undefined,
    };

    const mockSteps = [
      { id: 's1', jobId: id, stepName: 'jessica', state: 'DONE' },
      { id: 's2', jobId: id, stepName: 'sunny', state: isMock2 ? 'WORKING' : 'WAITING' },
      { id: 's3', jobId: id, stepName: 'rovert', state: 'WAITING' },
      { id: 's4', jobId: id, stepName: 'tim', state: 'WAITING' },
      { id: 's5', jobId: id, stepName: 'david', state: 'WAITING' },
      { id: 's6', jobId: id, stepName: 'john', state: 'WAITING' },
    ];

    return NextResponse.json({ job: mockJob, steps: mockSteps, artifacts: [] });
  } catch (error) {
    console.error('Fatal API Error:', error);
    return NextResponse.json({ 
      job: { id: 'error', topic: 'Error loading job', state: 'FAILED', platforms: [] },
      steps: [],
      artifacts: []
    });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const adminDb = getAdminDb();
    const updates = await req.json();
    const jobRef = adminDb.collection('jobs').doc(id);
    const jobDoc = await jobRef.get();
    if (!jobDoc.exists) {
      return new NextResponse('Job not found', { status: 404 });
    }

    await jobRef.update({
      ...updates,
      updatedAt: new Date(),
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating job:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
