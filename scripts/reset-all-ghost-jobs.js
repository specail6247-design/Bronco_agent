/**
 * Find and Reset All Ghost Jobs
 * This finds all jobs with WORKING steps and resets them
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

async function findAndResetGhostJobs() {
  try {
    console.log('🔍 Searching for ghost jobs...\n');
    
    // Find all WORKING steps
    const workingSteps = await db.collection('job_steps')
      .where('state', '==', 'WORKING')
      .get();
    
    if (workingSteps.empty) {
      console.log('✅ No ghost jobs found. All clear!');
      process.exit(0);
    }
    
    console.log(`Found ${workingSteps.size} WORKING steps. Analyzing...\n`);
    
    // Group by jobId
    const jobSteps = new Map();
    workingSteps.forEach(doc => {
      const data = doc.data();
      if (!jobSteps.has(data.jobId)) {
        jobSteps.set(data.jobId, []);
      }
      jobSteps.get(data.jobId).push({ id: doc.id, ...data });
    });
    
    console.log(`Affected jobs: ${jobSteps.size}\n`);
    
    // Reset each job
    for (const [jobId, steps] of jobSteps.entries()) {
      console.log(`📋 Job: ${jobId}`);
      
      // Get job details
      const jobDoc = await db.collection('jobs').doc(jobId).get();
      const jobData = jobDoc.data();
      
      console.log(`   Topic: ${jobData?.topic || 'Unknown'}`);
      console.log(`   State: ${jobData?.state || 'Unknown'}`);
      console.log(`   Stuck steps: ${steps.map(s => s.stepName).join(', ')}`);
      
      // Reset
      const batch = db.batch();
      
      steps.forEach(step => {
        const stepRef = db.collection('job_steps').doc(step.id);
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
      console.log(`   ✅ Reset complete!\n`);
    }
    
    console.log('🎉 All ghost jobs have been reset!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

findAndResetGhostJobs();
