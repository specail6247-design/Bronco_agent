
const admin = require('firebase-admin');
const fs = require('fs');

async function resetJobReal() {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const env = {};
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      let value = parts.slice(1).join('=').trim();
      if (value.startsWith('"') && value.endsWith('"')) value = value.substring(1, value.length - 1);
      env[key] = value;
    }
  });

  const projectId = env['FIREBASE_ADMIN_PROJECT_ID'];
  const clientEmail = env['FIREBASE_ADMIN_CLIENT_EMAIL'];
  let privateKey = env['FIREBASE_ADMIN_PRIVATE_KEY'].replace(/\\n/g, '\n');

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey })
    });
  }

  const db = admin.firestore();
  const topic = '서울 먹방 여행';
  
  console.log(`--- HARD RESETTING Ghost Lock for: ${topic} ---`);
  
  const jobSnap = await db.collection('jobs').where('topic', '==', topic).get();
  
  if (jobSnap.empty) {
    console.log('Job not found.');
    return;
  }

  for (const jobDoc of jobSnap.docs) {
    const jobId = jobDoc.id;
    console.log(`Processing Job ID: ${jobId}`);

    // 1. Reset Job overall state
    await db.collection('jobs').doc(jobId).update({
        state: 'WAITING',
        updatedAt: new Date()
    });

    // 2. Clear ALL steps for this job in 'job_steps' collection
    const stepsSnap = await db.collection('job_steps').where('jobId', '==', jobId).get();
    
    for (const stepDoc of stepsSnap.docs) {
        const step = stepDoc.data();
        console.log(`  Resetting Step: ${step.stepName} (${stepDoc.id})`);
        
        await db.collection('job_steps').doc(stepDoc.id).update({
            state: 'WAITING',
            startedAt: null,
            finishedAt: null,
            errorLog: '',
            updatedAt: new Date()
        });
    }
    
    // 3. Delete any activities from today to clear the noise
    const activitiesSnap = await db.collection('activities')
        .where('jobId', '==', jobId)
        .get();
    
    console.log(`  Deleting ${activitiesSnap.size} stale activity logs...`);
    const batch = db.batch();
    activitiesSnap.forEach(doc => batch.delete(doc.ref));
    if (activitiesSnap.size > 0) await batch.commit();

    console.log(`✅ Job ${jobId} is now CLEAN and WAITING.`);
  }
}

resetJobReal().catch(console.error);
