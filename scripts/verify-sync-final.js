
const admin = require('firebase-admin');
const fs = require('fs');

async function verifySync() {
  console.log('--- Social Sync Status Verification ---');
  
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
  
  if (!projectId || !clientEmail || !privateKey) {
    console.error('Missing Firebase Admin credentials in .env.local');
    return;
  }

  // Fix the private key newlines if they are escaped as \n
  privateKey = privateKey.replace(/\\n/g, '\n');

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      })
    });
  }

  const db = admin.firestore();
  const userEmail = 'specail6247@gmail.com';
  
  console.log('Checking Firestore for user:', userEmail);
  const snapshot = await db.collection('users').where('email', '==', userEmail).get();
  
  if (snapshot.empty) {
    console.log('User document not found.');
    return;
  }

  const userData = snapshot.docs[0].data();
  console.log('User document found.');
  
  if (userData.socialAccounts) {
    const tiktok = userData.socialAccounts.tiktok;
    if (tiktok) {
      console.log('✅ TikTok is SYNCED!');
      console.log('Username:', tiktok.username || 'Unknown');
      console.log('Connected At:', tiktok.connectedAt || 'Unknown');
      console.log('Token Expiry:', tiktok.expiresAt || 'Unknown');
    } else {
      console.log('❌ TikTok NOT found in socialAccounts.');
    }
    
    // Check other platforms too while we are at it
    const platforms = Object.keys(userData.socialAccounts);
    console.log('Connected platforms:', platforms.join(', '));
  } else {
    console.log('❌ No socialAccounts field found in user document.');
  }
}

verifySync().catch(console.error);
