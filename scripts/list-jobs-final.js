
const admin = require('firebase-admin');
const fs = require('fs');

async function listJobs() {
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
  console.log('--- Current Jobs Summary ---');
  const snapshot = await db.collection('jobs').get();
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`- Topic: ${data.topic} | ID: ${doc.id} | State: ${data.state}`);
  });
}

listJobs().catch(console.error);
