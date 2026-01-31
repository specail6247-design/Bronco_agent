import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let app: App | null = null;

type ServiceAccountEnv = {
  project_id?: string;
  client_email?: string;
  private_key?: string;
};

function getServiceAccountFromEnv(): ServiceAccountEnv {
  let json = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT;
  
  if (json) {
    try {
      // Vercel sometimes double-escapes newlines in env variables
      const cleanJson = json.replace(/\\n/g, '\n');
      return JSON.parse(cleanJson) as ServiceAccountEnv;
    } catch (error) {
       // Deeply robust JSON parse fallback (in case it's actually not escaped but has literal newlines)
       try {
         return JSON.parse(json) as ServiceAccountEnv;
       } catch (innerError) {
         console.error('Firebase Admin JSON Parse Error:', innerError);
         // Don't throw yet, try individual env fallback below
       }
    }
  }

  return {
    project_id: process.env.FIREBASE_ADMIN_PROJECT_ID,
    client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };
}

function getServiceAccountCredentials() {
  const serviceAccount = getServiceAccountFromEnv();
  const projectId = serviceAccount.project_id;
  const clientEmail = serviceAccount.client_email;
  const privateKey = serviceAccount.private_key;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing Firebase Admin credentials. Please check FIREBASE_ADMIN_SERVICE_ACCOUNT.'
    );
  }

  return { projectId, clientEmail, privateKey };
}

export function getAdminApp(): App {
  if (app) return app;

  if (getApps().length === 0) {
    const credentials = getServiceAccountCredentials();
    app = initializeApp({
      credential: cert({
        projectId: credentials.projectId,
        clientEmail: credentials.clientEmail,
        privateKey: credentials.privateKey,
      }),
    });
  } else {
    app = getApps()[0];
  }

  return app;
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}
