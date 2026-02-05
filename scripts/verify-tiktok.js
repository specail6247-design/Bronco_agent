
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

async function checkTikTokSync() {
  console.log('--- TikTok Sync Verification ---');
  
  // 1. Manually parse .env.local
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('.env.local not found');
    return;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      let value = match[2].trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      }
      env[match[1]] = value;
    }
  });

  const serviceAccountRaw = env['FIREBASE_ADMIN_SERVICE_ACCOUNT'];
  if (!serviceAccountRaw) {
    console.error('FIREBASE_ADMIN_SERVICE_ACCOUNT missing');
    return;
  }

  // Handle the string properly: it's a JSON string inside a string, with escaped newlines
  const serviceAccount = JSON.parse(serviceAccountRaw.replace(/\\n/g, '\n').replace(/\\"/g, '"'));

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }

  const db = admin.firestore();
  const email = 'specail6247@gmail.com';
  
  const snapshot = await db.collection('users').where('email', '==', email).limit(1).get();
  
  if (snapshot.empty) {
    console.log('No user found');
    return;
  }

  const userDoc = snapshot.docs[0];
  const userData = userDoc.data();
  
  console.log('User Found:', email);
  if (userData.socialAccounts && userData.socialAccounts.tiktok) {
    console.log('✅ TikTok SYNCED!');
    console.log('TikTok Account Info:', JSON.stringify(userData.socialAccounts.tiktok, null, 2));
  } else {
    console.log('❌ TikTok NOT SYNCED in Firestore.');
    console.log('Current Social Accounts:', JSON.stringify(userData.socialAccounts || {}, null, 2));
  }
}

checkTikTokSync().catch(console.error);
