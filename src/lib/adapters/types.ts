import { Platform, PlatformMetadata, MetricsSnapshot } from '@/types';

export interface PlatformAdapter {
  platform: Platform;
  
  /**
   * Publish content to the platform
   * Returns the post ID and URL
   */
  publish(metadata: PlatformMetadata, videoUrl: string, thumbnailUrl?: string): Promise<{
    postId: string;
    url: string;
    status: 'published' | 'pending' | 'failed';
  }>;

  /**
   * Verify if a post is live and correct
   */
  verify(postId: string): Promise<{
    status: 'verified' | 'failed' | 'pending';
    details?: string;
  }>;

  /**
   * Fetch current metrics for a post
   */
  fetchMetrics(postId: string): Promise<MetricsSnapshot['metricsJson']>;
}
