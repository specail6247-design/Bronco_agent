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
    const stepsSnap = await adminDb.collection('job_steps')
      .where('jobId', '==', jobId)
      .get();
    
    if (stepsSnap.empty) {
      return new NextResponse('No steps found for this job', { status: 404 });
    }

    const steps = stepsSnap.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        stepName: data.stepName as string,
        state: data.state as string
      };
    });
    
    const agentOrder = ['jessica', 'sunny', 'rovert', 'tim', 'david', 'john'];
    
    // Sort steps based on our predefined agent order
    steps.sort((a, b) => agentOrder.indexOf(a.stepName) - agentOrder.indexOf(b.stepName));

    // 2. Find the current working step
    const currentStepIndex = steps.findIndex(s => s.state === 'WORKING');
    
    const batch = adminDb.batch();

    if (currentStepIndex === -1) {
      // If none are working, start the first one (Jessica)
      if (steps[0] && steps[0].state === 'WAITING') {
        batch.update(adminDb.collection('job_steps').doc(steps[0].id), { 
          state: 'WORKING', 
          updatedAt: new Date() 
        });
      } else {
        return NextResponse.json({ message: 'All steps are already completed or non-startable.' });
      }
    } else {
      // 3. Create a realistic artifact for the finished step
      const finishedStep = steps[currentStepIndex];
      const artifactRef = adminDb.collection('artifacts').doc();
      let artifactData: any = {
        jobId,
        stepName: finishedStep.stepName,
        createdAt: new Date(),
      };

      // Agent-specific logic for mock data
      switch (finishedStep.stepName) {
        case 'jessica':
          artifactData.type = 'research';
          artifactData.contentJson = {
            keywords: ['Viral', 'AI Automation', 'Future of Work'],
            competitors: ['TechWithAli', 'PracticalAI'],
            targetAudience: 'Early adopters, Digital nomads',
            summary: 'The topic is currently trending on X and YouTube. High CTR potential detected.'
          };
          break;
        case 'sunny':
          artifactData.type = 'script';
          artifactData.contentJson = {
            title: 'The AI Revolution You Missed',
            hook: 'What if I told you that 5 hours of your work could be done in 10 minutes?',
            body: 'Today we are diving into the core tools that are changing the game...',
            cta: 'Click the link in the bio to get the full list.'
          };
          break;
        case 'rovert':
          artifactData.type = 'storyboard';
          artifactData.contentJson = {
            scenes: [
              { time: '0:00', visual: 'High energy intro with fast cuts', audio: 'Upbeat tech lo-fi' },
              { time: '0:15', visual: 'Screen share of the automation tool', audio: 'Clear narration' }
            ]
          };
          break;
        default:
          artifactData.type = 'report';
          artifactData.contentJson = { status: 'Process completed successfully by ' + finishedStep.stepName };
      }


      // Log the action of the step before committing
      await logActivity(jobId, finishedStep.stepName, 'THOUGHT', `Synchronizing state for ${finishedStep.stepName}...`);
      await logActivity(jobId, finishedStep.stepName, 'ACTION', `Generating real-time artifact: ${artifactData.type}`);

      batch.set(artifactRef, artifactData);

      // Finish current step
      batch.update(adminDb.collection('job_steps').doc(steps[currentStepIndex].id), { 
        state: 'DONE', 
        updatedAt: new Date() 
      });

      // Start next step if exists
      if (currentStepIndex < steps.length - 1) {
        const nextAgent = steps[currentStepIndex + 1].stepName;
        batch.update(adminDb.collection('job_steps').doc(steps[currentStepIndex + 1].id), { 
          state: 'WORKING', 
          updatedAt: new Date() 
        });
        
        // Add start-up log for the NEXT agent to make it feel alive immediately
        await logActivity(jobId, nextAgent, 'THOUGHT', `Received signal to start ${nextAgent} phase. Initializing...`);
      } else {
        // All steps done! Update the main job state
        batch.update(adminDb.collection('jobs').doc(jobId), { 
          state: 'DONE', 
          updatedAt: new Date() 
        });
      }

      // 4. Log the completion of the current step
      await logActivity(jobId, finishedStep.stepName, 'RESULT', `Execution finalized. Artifact "${artifactData.type}" published.`);
    }

    await batch.commit();

    return NextResponse.json({ success: true, message: 'Pipeline advanced to next step' });
  } catch (error: any) {
    console.error('Simulation error:', error);
    return new NextResponse(error?.message || 'Internal Server Error', { status: 500 });
  }
}
