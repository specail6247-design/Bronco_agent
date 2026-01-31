import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const adminDb = getAdminDb();
    const { searchParams } = new URL(req.url);
    const agentName = searchParams.get('agentName');

    console.log(`[Logs API] Fetching logs for Job: ${id}, Agent: ${agentName}`);

    // Fetch logs for this job
    let query: any = adminDb.collection('activity_logs').where('jobId', '==', id);
    
    if (agentName) {
      query = query.where('agentName', '==', agentName);
    }

    const logsSnap = await query.get();
    console.log(`[Logs API] Found ${logsSnap.size} logs in DB.`);
    
    // Process and sort in memory to avoid index requirement
    const logs = logsSnap.docs
      .map((doc: any) => {
        const data = doc.data();
        let ts: string;
        
        if (data.timestamp?.toDate) {
          ts = data.timestamp.toDate().toISOString();
        } else if (data.timestamp instanceof Date) {
          ts = data.timestamp.toISOString();
        } else if (typeof data.timestamp === 'string') {
          ts = data.timestamp;
        } else {
          ts = new Date().toISOString();
        }

        return {
          id: doc.id,
          ...data,
          timestamp: ts,
        };
      })
      .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json({ logs: [] });
  }
}
