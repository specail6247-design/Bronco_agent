import { CONFIG } from '@/lib/config';

/**
 * Standardized Redirect URI Generator
 * Prevents 'redirect_uri_mismatch' by ensuring:
 * 1. Consistent base URL (prioritizes CONFIG.APP_URL in prod)
 * 2. No trailing slash bugs
 * 3. Uniform path pattern: /api/auth/[platform]/callback
 */
export function getStandardRedirectUri(platform: string): string {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || CONFIG.APP_URL || '').replace(/\/$/, "");
  
  // YouTube, TikTok, and Meta were originally registered with the 'callback/platform' pattern.
  // We revert to this pattern specifically for these platforms to avoid Console Mismatch errors.
  const legacyPlatforms = ['youtube', 'tiktok', 'meta'];
  if (legacyPlatforms.includes(platform)) {
    return `${baseUrl}/api/auth/callback/${platform}`;
  }
  
  // X, LinkedIn, and Reddit use the unified 'platform/callback' pattern.
  return `${baseUrl}/api/auth/${platform}/callback`;
}
