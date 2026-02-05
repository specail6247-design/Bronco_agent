export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

// GET /api/admin/fix-job-owner?targetUid=xxx
// Updates all jobs to belong to the specified user
export async function GET(req: NextRequest) {
  try {
    const adminDb = getAdminDb();
    const { searchParams } = new URL(req.url);
    const targetUid = searchParams.get('targetUid');
    
    if (!targetUid) {
      return NextResponse.json({ 
        error: 'Missing targetUid parameter',
        usage: '/api/admin/fix-job-owner?targetUid=YOUR_UID'
      }, { status: 400 });
    }

    // Fetch all jobs
    const jobsSnap = await adminDb.collection('jobs').get();
    
    if (jobsSnap.empty) {
      return NextResponse.json({ message: 'No jobs found in database' });
    }
    
    // Update all jobs to belong to this user
    const batch = adminDb.batch();
    let updateCount = 0;
    const jobInfo: any[] = [];
    
    jobsSnap.forEach((doc: any) => {
      const data = doc.data();
      jobInfo.push({
        id: doc.id,
        topic: data.topic,
        oldOwner: data.ownerId,
        state: data.state
      });
      
      if (data.ownerId !== targetUid) {
        batch.update(doc.ref, { ownerId: targetUid });
        updateCount++;
      }
    });
    
    if (updateCount > 0) {
      await batch.commit();
    }
    
    return NextResponse.json({
      success: true,
      message: `Updated ${updateCount} jobs to owner: ${targetUid}`,
      totalJobs: jobsSnap.size,
      updatedJobs: updateCount,
      jobs: jobInfo
    });
    
  } catch (error: any) {
    console.error('Error fixing job owners:', error);
    return NextResponse.json({ 
      error: 'Failed to fix job owners',
      details: error.message 
    }, { status: 500 });
  }
}
