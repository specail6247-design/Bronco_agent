import { PlatformPost } from '@/types';

/**
 * Threads API Adapter
 * Note: Threads API is now separate from standard Instagram Graph API
 */
export async function postToThreads(
  userId: string,
  accessToken: string,
  post: PlatformPost
): Promise<{ success: boolean; postId?: string; error?: string }> {
  try {
    // 1. Get the Threads User ID
    const meRes = await fetch(`https://graph.threads.net/v1.0/me?fields=id&access_token=${accessToken}`);
    const meData = await meRes.json();
    const threadsUserId = meData.id;

    if (!threadsUserId) throw new Error('Failed to get Threads User ID');

    // 2. Create Media Container
    // Threads supports video_url for posting reels/videos
    const containerRes = await fetch(
      `https://graph.threads.net/v1.0/${threadsUserId}/threads?media_type=VIDEO&video_url=${encodeURIComponent(post.videoUrl)}&text=${encodeURIComponent(post.caption)}&access_token=${accessToken}`,
      { method: 'POST' }
    );
    const containerData = await containerRes.json();
    const containerId = containerData.id;

    if (!containerId) throw new Error(containerData.error?.message || 'Failed to create Threads container');

    // 3. Wait for processing
    await new Promise(resolve => setTimeout(resolve, 20000));

    // 4. Publish
    const publishRes = await fetch(
      `https://graph.threads.net/v1.0/${threadsUserId}/threads_publish?creation_id=${containerId}&access_token=${accessToken}`,
      { method: 'POST' }
    );
    const publishData = await publishRes.json();

    if (publishData.id) {
      return { success: true, postId: publishData.id };
    } else {
      return { success: false, error: publishData.error?.message || 'Failed to publish to Threads' };
    }
  } catch (error: any) {
    console.error('Threads Post Error:', error);
    return { success: false, error: error.message };
  }
}
