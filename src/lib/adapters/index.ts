import { YouTubeAdapter } from './youtube';
import { TikTokAdapter } from './tiktok';
import { PlatformAdapter } from './types';
import { Platform } from '@/types';

const adapters: Record<string, PlatformAdapter> = {
  youtube: new YouTubeAdapter(),
  tiktok: new TikTokAdapter(),
  // Add other stubs here or reuse generic ones for MVP
};

export function getAdapter(platform: Platform): PlatformAdapter {
  // Return stub for implemented ones, or a generic fallback
  return adapters[platform] || new YouTubeAdapter(); // Fallback to YouTube stub for others in MVP
}
