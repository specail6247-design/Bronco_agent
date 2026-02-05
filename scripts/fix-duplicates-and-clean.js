
const admin = require('firebase-admin');
const fs = require('fs');

async function fixDuplicateSteps() {
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
  console.log('--- Searching for Duplicate Job Steps ---');
  
  const stepsSnap = await db.collection('job_steps').get();
  const jobStepGroups = {};

  stepsSnap.forEach(doc => {
    const data = doc.data();
    const key = `${data.jobId}_${data.stepName}`;
    if (!jobStepGroups[key]) jobStepGroups[key] = [];
    jobStepGroups[key].push({ id: doc.id, ...data });
  });

  let duplicatesFound = 0;
  for (const key in jobStepGroups) {
    const group = jobStepGroups[key];
    if (group.length > 1) {
      console.log(`Duplicate found for ${key}: ${group.length} docs`);
      duplicatesFound++;
      
      // Keep only one, delete others
      // Prefer keeping the one that is DONE or was updated most recently
      group.sort((a, b) => {
          if (a.state === 'DONE' && b.state !== 'DONE') return -1;
          if (b.state === 'DONE' && a.state !== 'DONE') return 1;
          return b.updatedAt?.toMillis() - a.updatedAt?.toMillis();
      });

      const toKeep = group[0];
      const toDelete = group.slice(1);
      
      console.log(`  Keeping ID: ${toKeep.id} (State: ${toKeep.state})`);
      for (const d of toDelete) {
        console.log(`  Deleting ID: ${d.id} (State: ${d.state})`);
        await db.collection('job_steps').doc(d.id).delete();
      }
    }
  }

  if (duplicatesFound === 0) {
    console.log('No duplicate steps found.');
  } else {
    console.log(`✅ Fixed ${duplicatesFound} duplicate step sets.`);
  }

  // Also clear Jessica's specific lock for '서울 먹방 여행' and clear activity_logs
  console.log('Final polish for "서울 먹방 여행"...');
  const topic = '서울 먹방 여행';
  const jobQuery = await db.collection('jobs').where('topic', '==', topic).get();
  
  for (const jobDoc of jobQuery.docs) {
      const jobId = jobDoc.id;
      // Reset job to WAITING
      await db.collection('jobs').doc(jobId).update({ state: 'WAITING' });
      
      // Reset Jessica step
      const jsSnap = await db.collection('job_steps')
        .where('jobId', '==', jobId)
        .where('stepName', '==', 'jessica')
        .get();
      
      for (const s of jsSnap.docs) {
          await db.collection('job_steps').doc(s.id).update({ state: 'WAITING', startedAt: null });
      }

      // CLEAR ACTIVITY LOGS (the real ones)
      const logsSnap = await db.collection('activity_logs').where('jobId', '==', jobId).get();
      console.log(`  Deleting ${logsSnap.size} logs from activity_logs...`);
      const batch = db.batch();
      logsSnap.forEach(l => batch.delete(l.ref));
      if (logsSnap.size > 0) await batch.commit();
  }

  console.log('--- All Clean! ---');
}

fixDuplicateSteps().catch(console.error);
