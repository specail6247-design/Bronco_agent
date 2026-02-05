
const admin = require('firebase-admin');
const fs = require('fs');

async function checkTikTokStatus() {
  console.log('--- Checking TikTok Sync Status ---');
  
  // Manually parse .env.local to avoid dependency
  const envFile = fs.readFileSync('.env.local', 'utf8');
  const serviceAccountLine = envFile.split('\n').find(line => line.startsWith('FIREBASE_ADMIN_SERVICE_ACCOUNT='));
  
  if (!serviceAccountLine) {
    console.error('FIREBASE_ADMIN_SERVICE_ACCOUNT not found in .env.local');
    return;
  }

  // Handle both quoted and unquoted values
  let serviceAccountRaw = serviceAccountLine.substring('FIREBASE_ADMIN_SERVICE_ACCOUNT='.length).trim();
  if (serviceAccountRaw.startsWith('"') && serviceAccountRaw.endsWith('"')) {
    serviceAccountRaw = serviceAccountRaw.substring(1, serviceAccountRaw.length - 1);
  }
  
  // Unescape newlines and quotes if they were escaped in the env file
  const serviceAccountJson = JSON.parse(serviceAccountRaw.replace(/\\n/g, '\n').replace(/\\"/g, '"'));

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountJson)
    });
  }

  const db = admin.firestore();
  const userEmail = 'specail6247@gmail.com';
  
  const snapshot = await db.collection('users').where('email', '==', userEmail).get();
  
  if (snapshot.empty) {
    console.log('No user found with email:', userEmail);
    return;
  }

  snapshot.forEach(doc => {
    const data = doc.data();
    console.log('User ID:', doc.id);
    console.log('User Email:', data.email);
    
    if (data.socialAccounts && data.socialAccounts.tiktok) {
      console.log('✅ TikTok is CONNECTED!');
      console.log('Account Data:', JSON.stringify(data.socialAccounts.tiktok, null, 2));
    } else {
      console.log('❌ TikTok is NOT connected yet.');
      console.log('Current socialAccounts:', JSON.stringify(data.socialAccounts || {}, null, 2));
    }
  });
}

checkTikTokStatus().catch(err => {
    console.error('Script Error:', err);
    process.exit(1);
});
