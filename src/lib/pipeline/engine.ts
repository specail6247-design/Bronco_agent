import { Job, JobStep, Artifact, AgentContext, AgentResult, AgentName } from '@/types';
import { getAdminDb } from '@/lib/firebase/admin';
import { jessica } from './agents/jessica';
import { sunny } from './agents/sunny';
import { rovert } from './agents/rovert';
import { tim } from './agents/tim';
import { david } from './agents/david';
import { john } from './agents/john';
import { logActivity } from './logger';

// Registry of all agents
const agents = {
  jessica,
  sunny,
  rovert,
  tim,
  david,
  john,
};

const PIPELINE_ORDER: AgentName[] = ['jessica', 'sunny', 'rovert', 'tim', 'david', 'john'];

/**
 * Execute the pipeline for a given job.
 * This should be idempotent and recover from failures.
 */
export async function runPipeline(job: Job) {
  console.log(`[Pipeline] Running for job ${job.id}`);
  
  // Ensure job is in RUNNING state
  if (job.state === 'SCHEDULED') {
    const adminDb = getAdminDb();
    await adminDb.collection('jobs').doc(job.id).update({ state: 'RUNNING', updatedAt: new Date() });
  }

  // Log immediate startup
  await logActivity(job.id, 'jessica', 'THOUGHT', `Pipeline engine engaged for job "${job.topic}". Jessica is beginning research.`);

  try {
    const adminDb = getAdminDb();

    // Fetch existing steps
    const stepsSnap = await adminDb.collection('job_steps').where('jobId', '==', job.id).get();
    const existingSteps = stepsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

    // Fetch existing artifacts
    const artifactsSnap = await adminDb.collection('artifacts').where('jobId', '==', job.id).get();
    const existingArtifacts = artifactsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

    // Initial context
    let context: AgentContext = {
      job,
      previousArtifacts: existingArtifacts,
    };

    // Iterate through pipeline steps
    for (const agentName of PIPELINE_ORDER) {
      // Placeholder for plan-based skipping logic

      // Check if step is already done
      const step = existingSteps.find(s => s.stepName === agentName);
      if (step?.state === 'DONE') {
        console.log(`[Pipeline] Step ${agentName} already done. Skipping.`);
        continue;
      }

      // Special Handling for Approval Gate (after Tim)
      if (agentName === 'david') { // Before David runs (Publication/QA), check Approval
        // Wait, 'david' is QA. 'tim' prepares upload. 
        // Logic: After Tim finishes, pause for approval.
        // We handle this check BEFORE running David.
        
        const timStep = existingSteps.find(s => s.stepName === 'tim');
        if (timStep?.state === 'DONE' && job.state !== 'PUBLISHING' && job.state !== 'QA' && job.state !== 'DONE') {
             // If Tim is done, but we aren't past approval, check state.
             if (job.state !== 'NEED_APPROVAL') {
                 // Set to NEED_APPROVAL
                 await adminDb.collection('jobs').doc(job.id).update({ state: 'NEED_APPROVAL', updatedAt: new Date() });
                 
                 // TODO: Send Telegram Notification Here
                 // await sendApprovalRequest(job, ...);
                 
                 console.log(`[Pipeline] Pausing for Owner Approval on job ${job.id}`);
                 return; // Stop pipeline execution here
             } else {
                 // Still waiting for approval
                 console.log(`[Pipeline] Waiting for Owner Approval on job ${job.id}`);
                 return;
             }
        }
      }

      // Create or update step to WORKING
      let stepId = step?.id;
      if (!stepId) {
        const stepRef = adminDb.collection('job_steps').doc();
        stepId = stepRef.id;
        await stepRef.set({
          jobId: job.id,
          stepName: agentName,
          state: 'WORKING',
          startedAt: new Date(),
          updatedAt: new Date(),
          createdAt: new Date(),
        });
      } else if (step?.state !== 'WORKING') {
        await adminDb.collection('job_steps').doc(stepId).update({ 
          state: 'WORKING', 
          startedAt: new Date(), 
          updatedAt: new Date(),
          errorLog: '' 
        });
      }

      // Update Dashboard Status (optional, but good for UI responsiveness)
      // await updateJob(job.id, { currentStep: agentName });

      // Run Agent
      console.log(`[Pipeline] Running Agent: ${agentName}`);
      let result: AgentResult;
      
      try {
        const agentFunc = agents[agentName];
        result = await agentFunc(context);
        
        if (!result.success) throw new Error(result.error);

        // Store Artifact
        await adminDb.collection('artifacts').add({
          jobId: job.id,
          stepName: agentName,
          type: result.artifactType,
          contentJson: result.content,
          createdAt: new Date(),
        });

        // Update Step to DONE
        await adminDb.collection('job_steps').doc(stepId!).update({ 
          state: 'DONE', 
          finishedAt: new Date(),
          updatedAt: new Date()
        });

        // Update Context with new artifact
        const newArtifact: Artifact = {
          id: 'temp-id', // We don't need real ID for context
          jobId: job.id,
          stepName: agentName,
          type: result.artifactType,
          contentJson: result.content,
          createdAt: new Date(),
        };
        context.previousArtifacts.push(newArtifact);

      } catch (error: any) {
        console.error(`[Pipeline] Agent ${agentName} failed:`, error);
        await adminDb.collection('job_steps').doc(stepId!).update({ 
          state: 'FAILED', 
          errorLog: error.message,
          updatedAt: new Date()
        });
        await adminDb.collection('jobs').doc(job.id).update({ 
          state: 'FAILED',
          updatedAt: new Date()
        }); // Mark job as failed
        return; // Stop pipeline
      }
    }

    // If we reached here, all steps are done
    await adminDb.collection('jobs').doc(job.id).update({ state: 'DONE', updatedAt: new Date() });
    console.log(`[Pipeline] Job ${job.id} completed successfully.`);

  } catch (error) {
    console.error(`[Pipeline] Critical error in job ${job.id}:`, error);
    const adminDb = getAdminDb();
    await adminDb.collection('jobs').doc(job.id).update({ state: 'FAILED', updatedAt: new Date() });
  }
}
