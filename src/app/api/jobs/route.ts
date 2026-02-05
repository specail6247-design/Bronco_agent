export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

export async function POST(req: NextRequest) {
  try {
    const adminDb = getAdminDb();
    const body = await req.json();
    const { topic, platforms, languageMode, preferredLanguage, scheduledAt, userId } = body;

    // Use provided userId or fallback to mock for demo
    const ownerId = userId || 'user1'; 

    if (!topic || !platforms || !scheduledAt) {
      return new NextResponse(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // Defensive check: Validate platforms array
    if (!Array.isArray(platforms) || platforms.length === 0) {
      return new NextResponse(JSON.stringify({ error: 'Platforms must be a non-empty array' }), { status: 400 });
    }

    // 1. Create the Main Job
    const jobData = {
      ownerId,
      topic: topic.slice(0, 500), // Prevent overflow
      platforms,
      languageMode: languageMode || 'auto',
      preferredLanguage: preferredLanguage || null,
      scheduledAt: new Date(scheduledAt),
      state: 'RUNNING',
      retryCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await adminDb.collection('jobs').add(jobData);
    const jobId = docRef.id;

    // 2. Initialize Job Steps for all 6 agents
    const agents = ['jessica', 'sunny', 'rovert', 'tim', 'david', 'john'];
    const batch = adminDb.batch();

    agents.forEach((agent) => {
      const stepRef = adminDb.collection('job_steps').doc();
      batch.set(stepRef, {
        jobId,
        stepName: agent,
        state: agent === 'jessica' ? 'WORKING' : 'WAITING',
        updatedAt: new Date(),
        createdAt: new Date(),
      });
    });

    await batch.commit();

    // 3. Trigger Pipeline
    try {
      const { runPipeline } = await import('@/lib/pipeline/engine');
      const jobObject = { id: jobId, ...jobData } as any;
      runPipeline(jobObject).catch(e => console.error('[Pipeline Error]:', e));
    } catch (importErr) {
      console.error('Failed to trigger pipeline:', importErr);
    }

    return NextResponse.json({ id: jobId, ...jobData });
  } catch (error: any) {
    console.error('Error creating job:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error', details: error?.message }), { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const adminDb = getAdminDb();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    let query: any = adminDb.collection('jobs');
    
    // TEMPORARILY DISABLED: userId filter
    // This allows all jobs to be visible during development
    // TODO: Re-enable for production
    // if (userId && userId !== 'undefined') {
    //   query = query.where('ownerId', '==', userId);
    // }

    const jobsSnap = await query.orderBy('createdAt', 'desc').limit(50).get();
      
    const jobs = jobsSnap.docs.map((doc: any) => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        topic: data.topic || 'Untitled Job',
        state: data.state || 'WAITING',
        platforms: data.platforms || [],
        scheduledAt: data.scheduledAt && data.scheduledAt.toDate ? data.scheduledAt.toDate().toISOString() : (data.scheduledAt || new Date().toISOString()),
        createdAt: data.createdAt && data.createdAt.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString()),
        updatedAt: data.updatedAt && data.updatedAt.toDate ? data.updatedAt.toDate().toISOString() : (data.updatedAt || new Date().toISOString()),
      };
    });

    return NextResponse.json({ jobs });
  } catch (error: any) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ jobs: [], error: error?.message });
  }
}
