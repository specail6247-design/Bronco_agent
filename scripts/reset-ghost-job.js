/**
 * Reset Ghost Job Script
 * This script resets a stuck job by clearing WORKING states
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

async function resetGhostJob(jobId) {
  try {
    console.log(`🔧 Resetting ghost job: ${jobId}`);
    
    // 1. Get all steps for this job
    const stepsSnap = await db.collection('job_steps')
      .where('jobId', '==', jobId)
      .get();
    
    console.log(`Found ${stepsSnap.size} steps`);
    
    // 2. Reset any WORKING steps to WAITING
    const batch = db.batch();
    let resetCount = 0;
    
    stepsSnap.forEach(doc => {
      const data = doc.data();
      if (data.state === 'WORKING') {
        console.log(`  Resetting step: ${data.stepName} (${data.state} -> WAITING)`);
        batch.update(doc.ref, {
          state: 'WAITING',
          updatedAt: new Date(),
          errorLog: 'Reset from ghost state'
        });
        resetCount++;
      }
    });
    
    // 3. Update job state to RUNNING
    const jobRef = db.collection('jobs').doc(jobId);
    batch.update(jobRef, {
      state: 'RUNNING',
      updatedAt: new Date()
    });
    
    await batch.commit();
    
    console.log(`✅ Reset complete! ${resetCount} steps reset to WAITING`);
    console.log(`Job ${jobId} is now ready to resume.`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Reset failed:', error);
    process.exit(1);
  }
}

// Get job ID from command line
const jobId = process.argv[2];

if (!jobId) {
  console.error('Usage: node reset-ghost-job.js <JOB_ID>');
  process.exit(1);
}

resetGhostJob(jobId);
