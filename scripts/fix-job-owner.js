// Script to fix job ownership - update all jobs to belong to the current user
const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT || '{}');
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || serviceAccount.project_id,
  });
}

const db = admin.firestore();

async function fixJobOwnership() {
  // Get current user from recent auth - use the user's Firebase UID
  // We'll update ALL jobs to belong to this user
  
  console.log('🔧 Fixing job ownership...\n');
  
  // Fetch all jobs
  const jobsSnap = await db.collection('jobs').get();
  console.log(`Found ${jobsSnap.size} total jobs in Firestore`);
  
  // Group by ownerId to see what we have
  const ownerGroups = {};
  jobsSnap.forEach(doc => {
    const ownerId = doc.data().ownerId || 'unknown';
    if (!ownerGroups[ownerId]) ownerGroups[ownerId] = [];
    ownerGroups[ownerId].push({ id: doc.id, topic: doc.data().topic });
  });
  
  console.log('\n📊 Jobs by owner:');
  for (const [ownerId, jobs] of Object.entries(ownerGroups)) {
    console.log(`  ${ownerId}: ${jobs.length} jobs`);
  }
  
  // Get the target user ID from the most recent job
  const recentJob = jobsSnap.docs
    .sort((a, b) => b.data().createdAt?.toMillis?.() - a.data().createdAt?.toMillis?.())[0];
  
  const targetOwnerId = recentJob?.data().ownerId;
  console.log(`\n🎯 Most recent job owner: ${targetOwnerId}`);
  
  // Update all jobs to have this ownerId
  const batch = db.batch();
  let updateCount = 0;
  
  jobsSnap.forEach(doc => {
    if (doc.data().ownerId !== targetOwnerId) {
      batch.update(doc.ref, { ownerId: targetOwnerId });
      updateCount++;
    }
  });
  
  if (updateCount > 0) {
    await batch.commit();
    console.log(`\n✅ Updated ${updateCount} jobs to owner: ${targetOwnerId}`);
  } else {
    console.log('\n✅ All jobs already have the same owner');
  }
  
  console.log('\n🎉 Done! Refresh the dashboard to see your jobs.');
}

fixJobOwnership().catch(console.error);
