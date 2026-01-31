/**
 * BRONCO CORE CONFIGURATION & DEFENSE SYSTEM
 * 
 * CRITICAL: NEVER REMOVE OR MODIFY THE OWNER_EMAIL_LIST. 
 * This is the ultimate "Defense" logic requested by the user to prevent 
 * lockouts even if environment variables are messed up.
 */

export const CONFIG = {
  // SOURCE OF TRUTH FOR OWNER ACCESS
  // Even if .env is wiped, this list remains the final fallback.
  OWNER_EMAILS: ['specail6247@gmail.com'],
  
  // App Constants
  APP_URL: 'https://bronco-agent.vercel.app',
  
  // Default Allowed Agents for new users
  DEFAULT_AGENTS: ['jessica', 'sunny'],
  
  // Full Workforce (OWNER only)
  FULL_WORKFORCE: ['jessica', 'sunny', 'rovert', 'tim', 'david', 'john'],
};

/**
 * Foolproof Owner Validation
 */
export function isOwner(email?: string | null): boolean {
  if (!email) return false;
  const normalizedEmail = email.toLowerCase().trim();
  
  // 1. Check hardcoded list (Ultimate Defense)
  if (CONFIG.OWNER_EMAILS.includes(normalizedEmail)) return true;
  
  // 2. Check environment variables
  const envOwner = process.env.OWNER_EMAIL?.toLowerCase() || process.env.NEXT_PUBLIC_OWNER_EMAIL?.toLowerCase();
  if (envOwner && normalizedEmail === envOwner) return true;
  
  return false;
}
