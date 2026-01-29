import { PlatformAdapter } from './types';
import { PlatformMetadata } from '@/types';

export class TikTokAdapter implements PlatformAdapter {
  platform = 'tiktok' as const;

  async publish(metadata: PlatformMetadata, videoUrl: string) {
    console.log('[TikTok] Publishing video:', {
      description: metadata.description, // TikTok mainly uses description/hashtags
      tags: metadata.hashtags,
      videoUrl
    });

    await new Promise(resolve => setTimeout(resolve, 1500));

    return {
      postId: `tt_${Date.now()}`,
      url: `https://tiktok.com/@user/video/${Date.now()}`,
      status: 'published' as const,
    };
  }

  async verify(postId: string) {
    console.log('[TikTok] Verifying post:', postId);
    return { status: 'verified' as const };
  }

  async fetchMetrics(postId: string) {
    return {
      views: Math.floor(Math.random() * 50000),
      likes: Math.floor(Math.random() * 5000),
      shares: Math.floor(Math.random() * 1000),
    };
  }
}
