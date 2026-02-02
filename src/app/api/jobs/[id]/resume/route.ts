export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions'; 
import { getAdminDb } from '@/lib/firebase/admin';
import { runPipeline } from '@/lib/pipeline/engine';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * Resumes a stalled or failed job by triggering the pipeline again.
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const jobId = params.id;
    const adminDb = getAdminDb();
    
    // 1. Get the job
    const jobSnap = await adminDb.collection('jobs').doc(jobId).get();
    if (!jobSnap.exists) {
      return new NextResponse('Job not found', { status: 404 });
    }

    const jobData = jobSnap.data();
    const job = { id: jobId, ...jobData } as any;

    // 2. Clear FAILED state if necessary to allow retry
    if (job.state === 'FAILED') {
      await adminDb.collection('jobs').doc(jobId).update({
        state: 'RUNNING',
        updatedAt: new Date()
      });
      job.state = 'RUNNING';
    }

    // 3. Trigger Pipeline with waitUntil to prevent premature termination
    // This allows the serverless function to stay alive until the pipeline finishes
    waitUntil(runPipeline(job).catch(e => console.error('[Resume Error]:', e)));

    return NextResponse.json({ 
      success: true, 
      message: 'Pipeline resumed. Agents are waking up.',
      jobId 
    });
  } catch (error: any) {
    console.error('Resume error:', error);
    return new NextResponse(error?.message || 'Internal Server Error', { status: 500 });
  }
}
