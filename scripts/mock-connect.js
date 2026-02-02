
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');

const serviceAccount = require(path.join(__dirname, '../bronco-agent-firebase-adminsdk-fbsvc-add1f36bba.json'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function run() {
  const snapshot = await db.collection('users').orderBy('createdAt', 'desc').limit(1).get();
  if (snapshot.empty) {
    console.log('No users found.');
    return;
  }

  const userDoc = snapshot.docs[0];
  const uid = userDoc.id;
  console.log(`Updating user: ${uid} (${userDoc.data().email})`);

  // Mock connections for X and TikTok
  await db.collection('users').doc(uid).set({
    connections: {
      x: {
        connected: true,
        name: 'Bronco_Test_Account',
        updatedAt: new Date()
      },
      tiktok: {
        connected: true,
        name: 'Bronco_Creator',
        updatedAt: new Date()
      }
    }
  }, { merge: true });

  console.log('Successfully mocked connections. Please refresh the dashboard!');
}

run().catch(console.error);
