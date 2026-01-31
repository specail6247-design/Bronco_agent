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
import { getFirebaseDb } from './config';
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

function getDbOrThrow() {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error('Firestore is not initialized. Check NEXT_PUBLIC_FIREBASE_* env vars.');
  }
  return db;
}

function getCollection<T>(name: string): CollectionReference<T> {
  return collection(getDbOrThrow(), name) as CollectionReference<T>;
}

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
  const usersCollection = getCollection<User>('users');
  const docRef = doc(usersCollection, userId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { ...docSnap.data(), id: docSnap.id } as User;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const usersCollection = getCollection<User>('users');
  const q = query(usersCollection, where('email', '==', email), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { ...doc.data(), id: doc.id } as User;
}

export async function createUser(userId: string, userData: Omit<User, 'id'>): Promise<void> {
  const usersCollection = getCollection<User>('users');
  const docRef = doc(usersCollection, userId);
  await setDoc(docRef, {
    ...userData,
    createdAt: Timestamp.now(),
  } as any);
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<void> {
  const usersCollection = getCollection<User>('users');
  const docRef = doc(usersCollection, userId);
  await updateDoc(docRef, updates as Record<string, unknown>);
}

export async function getUsersCount(): Promise<number> {
  const usersCollection = getCollection<User>('users');
  const snapshot = await getDocs(usersCollection);
  return snapshot.size;
}

export async function getAllUsers(): Promise<User[]> {
  const usersCollection = getCollection<User>('users');
  const q = query(usersCollection, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as User));
}

// InviteKey operations
export async function getInviteKeyByHash(keyHash: string): Promise<InviteKey | null> {
  const inviteKeysCollection = getCollection<InviteKey>('invite_keys');
  const q = query(inviteKeysCollection, where('keyHash', '==', keyHash), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { ...doc.data(), id: doc.id } as InviteKey;
}

export async function createInviteKey(keyData: Omit<InviteKey, 'id'>): Promise<string> {
  const inviteKeysCollection = getCollection<InviteKey>('invite_keys');
  const docRef = doc(inviteKeysCollection);
  await setDoc(docRef, {
    ...keyData,
    createdAt: Timestamp.now(),
  } as any);
  return docRef.id;
}

export async function updateInviteKey(keyId: string, updates: Partial<InviteKey>): Promise<void> {
  const inviteKeysCollection = getCollection<InviteKey>('invite_keys');
  const docRef = doc(inviteKeysCollection, keyId);
  await updateDoc(docRef, updates as Record<string, unknown>);
}

// Job operations
export async function getJobById(jobId: string): Promise<Job | null> {
  const jobsCollection = getCollection<Job>('jobs');
  const docRef = doc(jobsCollection, jobId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { ...docSnap.data(), id: docSnap.id } as Job;
}

export async function createJob(jobData: Omit<Job, 'id'>): Promise<string> {
  const jobsCollection = getCollection<Job>('jobs');
  const docRef = doc(jobsCollection);
  await setDoc(docRef, {
    ...jobData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  } as any);
  return docRef.id;
}

export async function updateJob(jobId: string, updates: Partial<Job>): Promise<void> {
  const jobsCollection = getCollection<Job>('jobs');
  const docRef = doc(jobsCollection, jobId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  } as Record<string, unknown>);
}

export async function getJobsByOwner(ownerId: string): Promise<Job[]> {
  const jobsCollection = getCollection<Job>('jobs');
  const q = query(jobsCollection, where('ownerId', '==', ownerId));
  const snapshot = await getDocs(q);
  const jobs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Job));
  return jobs.sort((a, b) => {
    const aDate = toDate(a.createdAt as any);
    const bDate = toDate(b.createdAt as any);
    const aTime = aDate ? aDate.getTime() : 0;
    const bTime = bDate ? bDate.getTime() : 0;
    return bTime - aTime;
  });
}

export async function getScheduledJobs(): Promise<Job[]> {
  const now = Timestamp.now();
  const jobsCollection = getCollection<Job>('jobs');
  const q = query(
    jobsCollection,
    where('state', '==', 'SCHEDULED'),
    where('scheduledAt', '<=', now),
    orderBy('scheduledAt', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Job));
}

// JobStep operations
export async function getJobSteps(jobId: string): Promise<JobStep[]> {
  const jobStepsCollection = getCollection<JobStep>('job_steps');
  const q = query(jobStepsCollection, where('jobId', '==', jobId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as JobStep));
}

export async function createJobStep(stepData: Omit<JobStep, 'id'>): Promise<string> {
  const jobStepsCollection = getCollection<JobStep>('job_steps');
  const docRef = doc(jobStepsCollection);
  await setDoc(docRef, stepData as any);
  return docRef.id;
}

export async function updateJobStep(stepId: string, updates: Partial<JobStep>): Promise<void> {
  const jobStepsCollection = getCollection<JobStep>('job_steps');
  const docRef = doc(jobStepsCollection, stepId);
  await updateDoc(docRef, updates as Record<string, unknown>);
}

// Artifact operations
export async function getArtifactsByJob(jobId: string): Promise<Artifact[]> {
  const artifactsCollection = getCollection<Artifact>('artifacts');
  const q = query(artifactsCollection, where('jobId', '==', jobId));
  const snapshot = await getDocs(q);
  const artifacts = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Artifact));
  return artifacts.sort((a, b) => {
    const aDate = toDate(a.createdAt as any);
    const bDate = toDate(b.createdAt as any);
    const aTime = aDate ? aDate.getTime() : 0;
    const bTime = bDate ? bDate.getTime() : 0;
    return aTime - bTime;
  });
}

export async function createArtifact(artifactData: Omit<Artifact, 'id'>): Promise<string> {
  const artifactsCollection = getCollection<Artifact>('artifacts');
  const docRef = doc(artifactsCollection);
  await setDoc(docRef, {
    ...artifactData,
    createdAt: Timestamp.now(),
  } as any);
  return docRef.id;
}

// Audit log
export async function logAuditEvent(event: Omit<AuditEvent, 'id' | 'createdAt'>): Promise<void> {
  const auditEventsCollection = getCollection<AuditEvent>('audit_events');
  const docRef = doc(auditEventsCollection);
  await setDoc(docRef, {
    ...event,
    createdAt: Timestamp.now(),
  } as any);
}
