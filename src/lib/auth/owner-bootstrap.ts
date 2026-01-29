import { getUsersCount, createUser, getUserByEmail } from '@/lib/firebase/firestore';
import type { User, UserRole, AgentName } from '@/types';

const OWNER_EMAIL = process.env.OWNER_EMAIL;

/**
 * Determine if this is the first user (becomes OWNER automatically)
 */
export async function isFirstUser(): Promise<boolean> {
  const count = await getUsersCount();
  return count === 0;
}

/**
 * Determine the role for a new user
 */
export async function determineUserRole(email: string): Promise<UserRole> {
  // If OWNER_EMAIL is set in env, that email becomes owner
  if (OWNER_EMAIL && email.toLowerCase() === OWNER_EMAIL.toLowerCase()) {
    return 'OWNER';
  }
  
  // First user becomes owner
  if (await isFirstUser()) {
    return 'OWNER';
  }
  
  return 'MEMBER';
}

/**
 * Bootstrap a new user with appropriate role
 */
export async function bootstrapUser(
  userId: string,
  email: string,
  name?: string,
  inviteKeyId?: string,
  allowedAgents?: AgentName[],
  expiryAt?: Date
): Promise<User> {
  const role = await determineUserRole(email);
  
  // Owner gets all agents and no expiry
  const finalAllowedAgents: AgentName[] = role === 'OWNER' 
    ? ['jessica', 'sunny', 'rovert', 'tim', 'david', 'john']
    : (allowedAgents ?? ['jessica', 'sunny']);
  
  const finalExpiryAt = role === 'OWNER' ? null : expiryAt ?? null;

  const userData: Omit<User, 'id'> = {
    email,
    name,
    role,
    allowedAgents: finalAllowedAgents,
    expiryAt: finalExpiryAt,
    inviteKeyId,
    createdAt: new Date(),
  };

  await createUser(userId, userData);

  return {
    id: userId,
    ...userData,
  };
}

/**
 * Check if a user's access has expired
 */
export function isUserAccessExpired(user: User): boolean {
  if (user.role === 'OWNER') return false;
  if (!user.expiryAt) return false;
  
  const expiryDate = user.expiryAt instanceof Date 
    ? user.expiryAt 
    : (user.expiryAt as unknown as { toDate: () => Date }).toDate();
  
  return expiryDate < new Date();
}

/**
 * Check if an email is already registered
 */
export async function isEmailRegistered(email: string): Promise<boolean> {
  const user = await getUserByEmail(email);
  return user !== null;
}
