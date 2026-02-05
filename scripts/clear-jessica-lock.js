
const admin = require('firebase-admin');
const fs = require('fs');

async function resetJob() {
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
  
  console.log(`--- Resetting Ghost Lock for: ${topic} ---`);
  
  const snapshot = await db.collection('jobs').where('topic', '==', topic).get();
  
  if (snapshot.empty) {
    console.log('Job not found.');
    return;
  }

  for (const doc of snapshot.docs) {
    const job = doc.data();
    console.log(`Found Job: ${doc.id} | Current State: ${job.state}`);
    
    // 1. Reset job state to WAITING
    // 2. Reset Jessica step to PENDING (if it was stuck)
    const updatedSteps = job.steps || [];
    const jessicaIndex = updatedSteps.findIndex(s => s.stepName === 'jessica');
    if (jessicaIndex !== -1) {
        updatedSteps[jessicaIndex].state = 'PENDING';
        updatedSteps[jessicaIndex].startedAt = null;
    }

    await db.collection('jobs').doc(doc.id).update({
      state: 'WAITING',
      steps: updatedSteps,
      updatedAt: new Date()
    });

    console.log(`✅ Successfully reset Job ${doc.id} to WAITING state.`);
  }
}

resetJob().catch(console.error);
