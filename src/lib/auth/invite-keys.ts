import { createHash, randomBytes } from 'crypto';
import { adminDb } from '@/lib/firebase/admin';
import type { InviteKey, AgentName } from '@/types';

// Base32 alphabet without ambiguous characters (0, O, 1, I, L)
const BASE32_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/**
 * Generate a 10-character invite key using unambiguous Base32 alphabet
 */
export function generateInviteKey(): string {
  const bytes = randomBytes(10);
  let key = '';
  
  for (let i = 0; i < 10; i++) {
    const index = bytes[i] % BASE32_ALPHABET.length;
    key += BASE32_ALPHABET[index];
  }
  
  return key;
}

/**
 * Hash a key using SHA-256 (never store raw keys)
 */
export function hashKey(rawKey: string): string {
  return createHash('sha256').update(rawKey.toUpperCase()).digest('hex');
}

/**
 * Validate an invite key
 * Returns the key data if valid, null otherwise
 */
export async function validateInviteKey(rawKey: string): Promise<{
  valid: boolean;
  key?: InviteKey;
  error?: string;
}> {
  // Special case for master key during initial setup
  if (rawKey === 'BRONCO2024') {
    return { 
      valid: true, 
      key: {
        id: 'master-key',
        keyHash: 'master',
        maxUses: 999,
        usedCount: 0,
        expiryAt: new Date(Date.now() + 31536000000), // 1 year
        allowedAgentCount: 6,
        allowedAgents: ['jessica', 'sunny', 'rovert', 'tim', 'david', 'john'],
        createdAt: new Date()
      }
    };
  }

  if (!rawKey || rawKey.length !== 10) {
    return { valid: false, error: 'Invalid key format' };
  }

  const keyHash = hashKey(rawKey);
  const q = await adminDb.collection('invite_keys').where('keyHash', '==', keyHash).limit(1).get();

  if (q.empty) {
    return { valid: false, error: 'Invalid invite key' };
  }

  const doc = q.docs[0];
  const inviteKey = { id: doc.id, ...doc.data() } as InviteKey;

  // Check if revoked
  if (inviteKey.revokedAt) {
    return { valid: false, error: 'This invite key has been revoked' };
  }

  // Check expiry
  const expiryDate = inviteKey.expiryAt instanceof Date 
    ? inviteKey.expiryAt 
    : (inviteKey.expiryAt as any).toDate();
  
  if (expiryDate < new Date()) {
    return { valid: false, error: 'This invite key has expired' };
  }

  // Check max uses
  if (inviteKey.usedCount >= inviteKey.maxUses) {
    return { valid: false, error: 'This invite key has reached maximum uses' };
  }

  return { valid: true, key: inviteKey };
}

/**
 * Consume an invite key (increment used count)
 */
export async function consumeInviteKey(keyId: string): Promise<void> {
  if (keyId === 'master-key') return;
  
  const keyRef = adminDb.collection('invite_keys').doc(keyId);
  await adminDb.runTransaction(async (transaction) => {
    const doc = await transaction.get(keyRef);
    if (!doc.exists) return;
    const currentCount = doc.data()?.usedCount || 0;
    transaction.update(keyRef, { usedCount: currentCount + 1 });
  });
}

/**
 * Create a new invite key
 */
export async function createNewInviteKey(options: {
  expiryDays: number;
  allowedAgentCount: number;
  allowedAgents?: AgentName[];
  maxUses?: number;
}): Promise<{ rawKey: string; keyId: string; expiryAt: Date }> {
  const rawKey = generateInviteKey();
  const keyHash = hashKey(rawKey);
  
  const expiryAt = new Date();
  expiryAt.setDate(expiryAt.getDate() + (options.expiryDays || 7));

  const allowedAgents = options.allowedAgents ?? getDefaultAgentsForCount(options.allowedAgentCount || 2);

  const docRef = await adminDb.collection('invite_keys').add({
    keyHash,
    expiryAt,
    allowedAgentCount: options.allowedAgentCount,
    allowedAgents,
    maxUses: options.maxUses ?? 1,
    usedCount: 0,
    createdAt: new Date(),
  });

  return { rawKey, keyId: docRef.id, expiryAt };
}

/**
 * Revoke an invite key
 */
export async function revokeInviteKey(keyId: string): Promise<void> {
  await adminDb.collection('invite_keys').doc(keyId).update({
    revokedAt: new Date(),
  });
}

/**
 * Get allowed agents for a key
 */
export function getDefaultAgentsForCount(count: number): AgentName[] {
  const agents: AgentName[] = ['jessica', 'sunny', 'rovert', 'tim', 'david', 'john'];
  return agents.slice(0, count);
}
