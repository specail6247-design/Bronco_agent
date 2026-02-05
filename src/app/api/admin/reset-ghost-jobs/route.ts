export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

/**
 * Reset all ghost jobs (jobs stuck in WORKING state)
 * GET /api/admin/reset-ghost-jobs
 */
export async function GET(req: NextRequest) {
  try {
    const adminDb = getAdminDb();
    
    console.log('🔍 Searching for ghost jobs...');
    
    // Find all WORKING steps
    const workingSteps = await adminDb.collection('job_steps')
      .where('state', '==', 'WORKING')
      .get();
    
    if (workingSteps.empty) {
      return NextResponse.json({ 
        success: true, 
        message: 'No ghost jobs found. All clear!',
        resetCount: 0 
      });
    }
    
    console.log(`Found ${workingSteps.size} WORKING steps`);
    
    // Group by jobId
    const jobSteps = new Map<string, any[]>();
    workingSteps.forEach(doc => {
      const data = doc.data();
      if (!jobSteps.has(data.jobId)) {
        jobSteps.set(data.jobId, []);
      }
      jobSteps.get(data.jobId)!.push({ id: doc.id, ...data });
    });
    
    const results = [];
    
    // Reset each job
    for (const [jobId, steps] of jobSteps.entries()) {
      const jobDoc = await adminDb.collection('jobs').doc(jobId).get();
      const jobData = jobDoc.data();
      
      const batch = adminDb.batch();
      
      // Reset steps
      steps.forEach(step => {
        const stepRef = adminDb.collection('job_steps').doc(step.id);
        batch.update(stepRef, {
          state: 'WAITING',
          updatedAt: new Date(),
          errorLog: 'Auto-reset from ghost state'
        });
      });
      
      // Update job
      batch.update(jobDoc.ref, {
        state: 'RUNNING',
        updatedAt: new Date()
      });
      
      await batch.commit();
      
      results.push({
        jobId,
        topic: jobData?.topic || 'Unknown',
        stepsReset: steps.map(s => s.stepName)
      });
    }
    
    return NextResponse.json({
      success: true,
      message: `Reset ${results.length} ghost job(s)`,
      jobs: results
    });
    
  } catch (error: any) {
    console.error('Reset error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
