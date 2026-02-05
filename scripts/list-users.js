
const admin = require('firebase-admin');
const fs = require('fs');

async function listAllUsers() {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const env = {};
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      let value = parts.slice(1).join('=').trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      }
      env[key] = value;
    }
  });

  const projectId = env['FIREBASE_ADMIN_PROJECT_ID'];
  const clientEmail = env['FIREBASE_ADMIN_CLIENT_EMAIL'];
  let privateKey = env['FIREBASE_ADMIN_PRIVATE_KEY'];
  
  privateKey = privateKey.replace(/\\n/g, '\n');

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey })
    });
  }

  const db = admin.firestore();
  console.log('--- Listing All Users in Firestore ---');
  const snapshot = await db.collection('users').get();
  
  if (snapshot.empty) {
    console.log('No users found in collection.');
    return;
  }

  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`- Email: ${data.email} | TikTok: ${data.socialAccounts?.tiktok ? '✅' : '❌'} | UID: ${doc.id}`);
    if (data.socialAccounts?.tiktok) {
        console.log('  TikTok Info:', JSON.stringify(data.socialAccounts.tiktok, null, 2));
    }
  });
}

listAllUsers().catch(console.error);
