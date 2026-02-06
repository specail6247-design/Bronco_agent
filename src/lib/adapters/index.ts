import { YouTubeAdapter } from './youtube';
import { TikTokAdapter } from './tiktok';
import { ThreadsAdapter } from './threads';
import { PlatformAdapter } from './types';
import { Platform } from '@/types';

const adapters: Record<string, PlatformAdapter> = {
  youtube: new YouTubeAdapter(),
  tiktok: new TikTokAdapter(),
  threads: new ThreadsAdapter(),
};

// Stub adapter for unsupported platforms - prevents crashes but logs warnings
const stubAdapter: PlatformAdapter = {
  platform: 'youtube' as Platform, // Default placeholder
  publish: async (meta: any, videoUrl: string, thumbnailUrl: string) => {
    console.warn(`[Adapter] Stub adapter called for unsupported platform. Meta:`, meta?.platform);
    return { postId: 'stub-' + Date.now(), url: '', status: 'pending' as const };
  },
  verify: async (postId: string) => {
    return { status: 'pending' as const, details: 'Platform adapter not implemented' };
  },
  fetchMetrics: async (postId: string) => {
    return { views: 0, likes: 0, comments: 0, shares: 0 };
  }
};

export function getAdapter(platform: Platform): PlatformAdapter {
  const adapter = adapters[platform];
  
  if (!adapter) {
    console.warn(`[Adapter] No adapter found for platform: ${platform}. Using stub.`);
    return stubAdapter;
  }
  
  return adapter;
}
