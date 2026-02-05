
const admin = require('firebase-admin');
const fs = require('fs');

async function kickstartPipeline() {
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
  
  console.log(`--- 🚀 KICKSTARTING Pipeline for "${topic}" ---`);
  
  const snapshot = await db.collection('jobs').where('topic', '==', topic).get();
  
  if (snapshot.empty) {
    console.log('Job not found.');
    return;
  }

  const doc = snapshot.docs[0];
  const jobId = doc.id;
  
  // Make sure job is RUNNING
  await db.collection('jobs').doc(jobId).update({
    state: 'RUNNING',
    updatedAt: new Date()
  });
  
  // Trigger the resume API programmatically via HTTP
  const VERCEL_URL = 'https://bronco-agent.vercel.app';
  
  try {
    console.log(`\nCalling resume API: ${VERCEL_URL}/api/jobs/${jobId}/resume`);
    
    const response = await fetch(`${VERCEL_URL}/api/jobs/${jobId}/resume`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Pipeline resumed successfully!');
      console.log('Response:', result);
    } else {
      const errorText = await response.text();
      console.log('❌ API Error:', response.status, errorText);
    }
  } catch (error) {
    console.error('❌ Failed to call resume API:', error.message);
  }
  
  console.log(`\n직접 확인: https://bronco-agent.vercel.app/jobs/${jobId}`);
}

kickstartPipeline().catch(console.error);
