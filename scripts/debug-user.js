
const admin = require('firebase-admin');
const fs = require('fs');

async function debugUserDoc() {
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
  const uid = '04Xcg5CGVcOe5xAmpCYDjP5ZGpz1';
  console.log(`--- Debugging User Doc: ${uid} ---`);
  const doc = await db.collection('users').doc(uid).get();
  
  if (!doc.exists) {
    console.log('Document does not exist.');
    return;
  }

  console.log('Raw Data:', JSON.stringify(doc.data(), null, 2));
}

debugUserDoc().catch(console.error);
