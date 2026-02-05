
const admin = require('firebase-admin');
const fs = require('fs');

async function makeJobActive() {
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
  
  console.log(`--- Making "${topic}" ACTIVE ---`);
  
  const snapshot = await db.collection('jobs').where('topic', '==', topic).get();
  
  if (snapshot.empty) {
    console.log('Job not found.');
    return;
  }

  const doc = snapshot.docs[0];
  const jobId = doc.id;
  
  // Change job state to RUNNING
  await db.collection('jobs').doc(jobId).update({
    state: 'RUNNING',
    updatedAt: new Date()
  });
  
  console.log(`✅ Job "${topic}" (${jobId}) is now RUNNING.`);
  console.log(`\n직접 접속 링크: http://localhost:3000/jobs/${jobId}`);
  console.log(`\n이제 대시보드에 "Active Productions"에 나타날 겁니다!`);
}

makeJobActive().catch(console.error);
