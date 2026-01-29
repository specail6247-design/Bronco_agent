import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  DocumentReference,
  CollectionReference
} from 'firebase/firestore';
import { db } from './config';
import type { 
  User, 
  InviteKey, 
  Job, 
  JobStep, 
  Artifact, 
  PlatformPost, 
  MetricsSnapshot, 
  AuditEvent 
} from '@/types';

// Collection references
export const usersCollection = collection(db, 'users') as CollectionReference<User>;
export const inviteKeysCollection = collection(db, 'invite_keys') as CollectionReference<InviteKey>;
export const jobsCollection = collection(db, 'jobs') as CollectionReference<Job>;
export const jobStepsCollection = collection(db, 'job_steps') as CollectionReference<JobStep>;
export const artifactsCollection = collection(db, 'artifacts') as CollectionReference<Artifact>;
export const platformPostsCollection = collection(db, 'platform_posts') as CollectionReference<PlatformPost>;
export const metricsSnapshotsCollection = collection(db, 'metrics_snapshots') as CollectionReference<MetricsSnapshot>;
export const auditEventsCollection = collection(db, 'audit_events') as CollectionReference<AuditEvent>;

// Helper to convert Firestore Timestamp to Date
export function toDate(timestamp: Timestamp | Date | null | undefined): Date | null {
  if (!timestamp) return null;
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return timestamp;
}

// Helper to convert Date to Firestore Timestamp
export function toTimestamp(date: Date | null | undefined): Timestamp | null {
  if (!date) return null;
  return Timestamp.fromDate(date);
}

// User operations
export async function getUserById(userId: string): Promise<User | null> {
  const docRef = doc(usersCollection, userId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as User;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const q = query(usersCollection, where('email', '==', email), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as User;
}

export async function createUser(userId: string, userData: Omit<User, 'id'>): Promise<void> {
  const docRef = doc(usersCollection, userId);
  await setDoc(docRef, {
    ...userData,
    createdAt: Timestamp.now(),
  });
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<void> {
  const docRef = doc(usersCollection, userId);
  await updateDoc(docRef, updates as Record<string, unknown>);
}

export async function getUsersCount(): Promise<number> {
  const snapshot = await getDocs(usersCollection);
  return snapshot.size;
}

export async function getAllUsers(): Promise<User[]> {
  const q = query(usersCollection, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
}

// InviteKey operations
export async function getInviteKeyByHash(keyHash: string): Promise<InviteKey | null> {
  const q = query(inviteKeysCollection, where('keyHash', '==', keyHash), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as InviteKey;
}

export async function createInviteKey(keyData: Omit<InviteKey, 'id'>): Promise<string> {
  const docRef = doc(inviteKeysCollection);
  await setDoc(docRef, {
    ...keyData,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateInviteKey(keyId: string, updates: Partial<InviteKey>): Promise<void> {
  const docRef = doc(inviteKeysCollection, keyId);
  await updateDoc(docRef, updates as Record<string, unknown>);
}

// Job operations
export async function getJobById(jobId: string): Promise<Job | null> {
  const docRef = doc(jobsCollection, jobId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Job;
}

export async function createJob(jobData: Omit<Job, 'id'>): Promise<string> {
  const docRef = doc(jobsCollection);
  await setDoc(docRef, {
    ...jobData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateJob(jobId: string, updates: Partial<Job>): Promise<void> {
  const docRef = doc(jobsCollection, jobId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  } as Record<string, unknown>);
}

export async function getJobsByOwner(ownerId: string): Promise<Job[]> {
  const q = query(jobsCollection, where('ownerId', '==', ownerId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
}

export async function getScheduledJobs(): Promise<Job[]> {
  const now = Timestamp.now();
  const q = query(
    jobsCollection, 
    where('state', '==', 'SCHEDULED'),
    where('scheduledAt', '<=', now),
    orderBy('scheduledAt', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
}

// JobStep operations
export async function getJobSteps(jobId: string): Promise<JobStep[]> {
  const q = query(jobStepsCollection, where('jobId', '==', jobId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JobStep));
}

export async function createJobStep(stepData: Omit<JobStep, 'id'>): Promise<string> {
  const docRef = doc(jobStepsCollection);
  await setDoc(docRef, stepData);
  return docRef.id;
}

export async function updateJobStep(stepId: string, updates: Partial<JobStep>): Promise<void> {
  const docRef = doc(jobStepsCollection, stepId);
  await updateDoc(docRef, updates as Record<string, unknown>);
}

// Artifact operations
export async function getArtifactsByJob(jobId: string): Promise<Artifact[]> {
  const q = query(artifactsCollection, where('jobId', '==', jobId), orderBy('createdAt', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Artifact));
}

export async function createArtifact(artifactData: Omit<Artifact, 'id'>): Promise<string> {
  const docRef = doc(artifactsCollection);
  await setDoc(docRef, {
    ...artifactData,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

// Audit log
export async function logAuditEvent(event: Omit<AuditEvent, 'id' | 'createdAt'>): Promise<void> {
  const docRef = doc(auditEventsCollection);
  await setDoc(docRef, {
    ...event,
    createdAt: Timestamp.now(),
  });
}
