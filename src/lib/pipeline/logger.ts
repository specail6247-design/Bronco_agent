import { getAdminDb } from '@/lib/firebase/admin';

export type ActivityType = 'THOUGHT' | 'ACTION' | 'RESULT' | 'ERROR';

export async function logActivity(
  jobId: string,
  agentName: string,
  type: ActivityType,
  content: string,
  metadata?: any
) {
  const adminDb = getAdminDb();
  await adminDb.collection('activity_logs').add({
    jobId,
    agentName,
    type,
    content,
    metadata: metadata || {},
    timestamp: new Date(),
  });
}
