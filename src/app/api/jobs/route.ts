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
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // 1. Create the Main Job
    const jobData = {
      ownerId,
      topic,
      platforms,
      languageMode: languageMode || 'auto',
      preferredLanguage: preferredLanguage || null,
      scheduledAt: new Date(scheduledAt),
      state: 'RUNNING', // Start in RUNNING state
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
    const { runPipeline } = await import('@/lib/pipeline/engine');
    const jobObject = { id: jobId, ...jobData } as any;
    
    // Trigger and log errors but don't block
    runPipeline(jobObject).catch(e => console.error('[Pipeline Error]:', e));

    return NextResponse.json({ id: jobId, ...jobData });
  } catch (error) {
    console.error('Error creating job:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const adminDb = getAdminDb();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    let query: any = adminDb.collection('jobs');
    
    if (userId) {
      query = query.where('ownerId', '==', userId);
    }

    const jobsSnap = await query.limit(50).get();
      
    const jobs = jobsSnap.docs.map((doc: any) => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        scheduledAt: data.scheduledAt && data.scheduledAt.toDate ? data.scheduledAt.toDate().toISOString() : (data.scheduledAt || new Date().toISOString()),
        createdAt: data.createdAt && data.createdAt.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString()),
        updatedAt: data.updatedAt && data.updatedAt.toDate ? data.updatedAt.toDate().toISOString() : (data.updatedAt || new Date().toISOString()),
      };
    });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ jobs: [] });
  }
}
