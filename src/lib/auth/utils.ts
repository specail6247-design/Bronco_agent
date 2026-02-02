import { CONFIG } from '@/lib/config';

/**
 * Standardized Redirect URI Generator
 * Prevents 'redirect_uri_mismatch' by ensuring:
 * 1. Consistent base URL (prioritizes CONFIG.APP_URL in prod)
 * 2. No trailing slash bugs
 * 3. Uniform path pattern: /api/auth/[platform]/callback
 */
export function getStandardRedirectUri(platform: string): string {
  // Use CONFIG.APP_URL as the rock-solid source of truth for production
  // Strip trailing slashes to ensure exact matches in platform consoles
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || CONFIG.APP_URL || '').replace(/\/$/, "");
  
  return `${baseUrl}/api/auth/${platform}/callback`;
}
