export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { logActivity } from '@/lib/pipeline/logger';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const jobId = params.id;
    const adminDb = getAdminDb();
    
    // 1. Get all steps for this job ordered by creation (or predefined order)
    const jobSnap = await adminDb.collection('jobs').doc(jobId).get();
    if (!jobSnap.exists) {
      return new NextResponse(JSON.stringify({ error: 'Job not found' }), { status: 404 });
    }

    const stepsSnap = await adminDb.collection('job_steps')
      .where('jobId', '==', jobId)
      .get();
    
    if (stepsSnap.empty) {
      return new NextResponse(JSON.stringify({ error: 'Job steps not initialized for this job' }), { status: 404 });
    }

    const steps = stepsSnap.docs
      .map((doc: any) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => {
        const order = ['jessica', 'sunny', 'rovert', 'tim', 'david', 'john'];
        return order.indexOf(a.stepName) - order.indexOf(b.stepName);
      });

    // 2. Find the current working step
    const currentStepIndex = steps.findIndex(s => s.state === 'WORKING');
    
    const batch = adminDb.batch();

    if (currentStepIndex === -1) {
      // If none are working, find the first non-DONE step
      const nextStepIndex = steps.findIndex(s => s.state === 'WAITING' || s.state === 'FAILED' || s.state === 'PAUSED');
      
      if (nextStepIndex !== -1) {
        const nextStep = steps[nextStepIndex];
        batch.update(adminDb.collection('job_steps').doc(nextStep.id), { 
          state: 'WORKING', 
          updatedAt: new Date() 
        });
        
        // Log the manual start immediately to the DB
        await adminDb.collection('activity_logs').add({
          jobId,
          agentName: nextStep.stepName,
          type: 'THOUGHT',
          content: `관리자 명령으로 활동을 시작합니다. 현재 단계: ${nextStep.stepName}`,
          timestamp: new Date()
        });
      } else {
        return NextResponse.json({ message: '모든 단계가 이미 완료되었습니다.' });
      }
    } else {
      // 3. Create a realistic artifact for the finished step
      const finishedStep = steps[currentStepIndex];
      const artifactRef = adminDb.collection('artifacts').doc();
      
      let artifactType = 'research';
      if (finishedStep.stepName === 'sunny') artifactType = 'script';
      if (finishedStep.stepName === 'rovert') artifactType = 'storyboard';
      if (finishedStep.stepName === 'tim') artifactType = 'bundle';

      const artifactData = {
        jobId,
        stepName: finishedStep.stepName,
        type: artifactType,
        contentJson: {
          title: `Simulated result for ${finishedStep.stepName}`,
          summary: `This is a mock artifact created manually or through simulation at ${new Date().toISOString()}`,
          status: 'COMPLETED'
        },
        createdAt: new Date(),
      };

      await adminDb.collection('activity_logs').add({
        jobId,
        agentName: finishedStep.stepName,
        type: 'THOUGHT',
        content: `${finishedStep.stepName} 단계의 상태 동기화를 시작합니다...`,
        timestamp: new Date()
      });

      await adminDb.collection('activity_logs').add({
        jobId,
        agentName: finishedStep.stepName,
        type: 'ACTION',
        content: `실시간 코어 아티팩트 생성 중: ${artifactData.type}`,
        timestamp: new Date()
      });

      batch.set(artifactRef, artifactData);

      // Finish current step
      batch.update(adminDb.collection('job_steps').doc(steps[currentStepIndex].id), {
        state: 'DONE',
        updatedAt: new Date()
      });

      // Start next step if exists
      if (currentStepIndex < steps.length - 1) {
        const nextAgentStep = steps[currentStepIndex + 1];
        batch.update(adminDb.collection('job_steps').doc(nextAgentStep.id), {
          state: 'WORKING',
          updatedAt: new Date()
        });

        // Add start-up log for the NEXT agent to make it feel alive immediately
        await adminDb.collection('activity_logs').add({
          jobId,
          agentName: nextAgentStep.stepName,
          type: 'THOUGHT',
          content: `${nextAgentStep.stepName} 페이즈의 실행 신호를 수신했습니다. 초기화 중...`,
          timestamp: new Date()
        });
      } else {
        // All steps done! Update the main job state
        batch.update(adminDb.collection('jobs').doc(jobId), {
          state: 'DONE',
          updatedAt: new Date()
        });
      }

      // Log the completion of the current step
      await adminDb.collection('activity_logs').add({
        jobId,
        agentName: finishedStep.stepName,
        type: 'RESULT',
        content: `실행이 정상적으로 마무리되었습니다. "${artifactData.type}" 결과물이 등록되었습니다.`,
        timestamp: new Date()
      });
    }

    await batch.commit();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Simulate API error:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to advance step', details: error?.message }), { status: 500 });
  }
}
