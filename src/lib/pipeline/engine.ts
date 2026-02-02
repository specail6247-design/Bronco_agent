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
  if (!job || !job.id) {
    console.error('[Pipeline] Aborting: Missing job ID');
    return;
  }

  console.log(`[Pipeline] Starting pipeline for job: ${job.id}`);
  const adminDb = getAdminDb();
  
  try {
    // 1. Get steps for this job
    const stepsSnap = await adminDb.collection('job_steps')
      .where('jobId', '==', job.id)
      .get();
    
    if (stepsSnap.empty) {
      console.error(`[Pipeline] No steps found for job ${job.id}. Attempting to initialize...`);
      // Initial recovery if steps are missing
      const agents: AgentName[] = ['jessica', 'sunny', 'rovert', 'tim', 'david', 'john'];
      const batch = adminDb.batch();
      agents.forEach((agent) => {
        const stepRef = adminDb.collection('job_steps').doc();
        batch.set(stepRef, {
          jobId: job.id,
          stepName: agent,
          state: agent === 'jessica' ? 'WORKING' : 'WAITING',
          updatedAt: new Date(),
          createdAt: new Date(),
        });
      });
      await batch.commit();
      // Re-fetch steps
      return runPipeline(job);
    }
  } catch (initialErr) {
    console.error('[Pipeline] Initial fetch failed:', initialErr);
    return;
  }
  
  // Ensure job is in RUNNING state
  if (job.state === 'SCHEDULED' || job.state === 'PAUSED') {
    await adminDb.collection('jobs').doc(job.id).update({ state: 'RUNNING', updatedAt: new Date() });
  }

  // Log immediate startup with attempt counter to distinguish re-runs
  const attemptId = Math.floor(Math.random() * 9000) + 1000;
  await logActivity(job.id, 'jessica', 'THOUGHT', `[#${attemptId}] Pipeline engine started. Validating workforce environment for "${job.topic || 'Unknown Topic'}"...`);

  if (!job.id || !job.topic) {
    await logActivity(job.id, 'jessica', 'ERROR', `[#${attemptId}] Critical: Mission parameters incomplete (Missing Job ID or Topic).`);
    await adminDb.collection('jobs').doc(job.id).update({ state: 'FAILED', updatedAt: new Date() });
    return;
  }

  try {
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
      if (step?.state === 'WORKING') {
        console.log(`[Pipeline] Step ${agentName} is already WORKING. Skipping to prevent double execution.`);
        await logActivity(job.id, agentName as any, 'THOUGHT', `[#${attemptId}] Concurrent execution detected. Skipping redundant activation to prevent double work.`);
        return; // Important: Don't just skip, exit this pipeline run to avoid overlapping
      }

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
      } else {
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
      console.log(`[Pipeline] Running Agent: ${agentName} (Attempt #${attemptId})`);
      await logActivity(job.id, agentName as any, 'THOUGHT', `[#${attemptId}] Activating ${agentName}. Initializing neural patterns...`);
      
      let result: AgentResult;
      
      try {
        const agentFunc = agents[agentName];
        if (typeof agentFunc !== 'function') {
           throw new Error(`Agent definition for "${agentName}" is missing or corrupted.`);
        }
        
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
