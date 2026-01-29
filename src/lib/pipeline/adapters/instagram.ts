import { PlatformPost } from '@/types';

/**
 * Instagram Reels API Adapter
 * Requires: Instagram Professional Account linked to a Facebook Page
 */
export async function postToInstagram(
  userId: string,
  accessToken: string,
  post: PlatformPost
): Promise<{ success: boolean; postId?: string; error?: string }> {
  try {
    // 1. Get the Instagram Business Account ID
    const accountsRes = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`
    );
    const accountsData = await accountsRes.json();
    
    // Find the page and its linked IG account
    // This part is simplified; in reality, we'd iterate to find the IG ID
    const pageId = accountsData.data?.[0]?.id;
    if (!pageId) throw new Error('No Facebook Page found linked to this account');

    const igAccountRes = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account&access_token=${accessToken}`
    );
    const igData = await igAccountRes.json();
    const igId = igData.instagram_business_account?.id;

    if (!igId) throw new Error('No Instagram Business Account linked to the Facebook Page');

    // 2. Initialize Reel Upload (Container)
    const containerRes = await fetch(
      `https://graph.facebook.com/v18.0/${igId}/media?video_url=${encodeURIComponent(post.videoUrl)}&caption=${encodeURIComponent(post.caption)}&media_type=REELS&access_token=${accessToken}`,
      { method: 'POST' }
    );
    const containerData = await containerRes.json();
    const containerId = containerData.id;

    if (!containerId) throw new Error(containerData.error?.message || 'Failed to create media container');

    // 3. Wait for processing (Simplified: In production, we should poll status)
    // Instagram needs time to download and process the video
    await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30s

    // 4. Publish the Reel
    const publishRes = await fetch(
      `https://graph.facebook.com/v18.0/${igId}/media_publish?creation_id=${containerId}&access_token=${accessToken}`,
      { method: 'POST' }
    );
    const publishData = await publishRes.json();

    if (publishData.id) {
      return { success: true, postId: publishData.id };
    } else {
      return { success: false, error: publishData.error?.message || 'Failed to publish Reel' };
    }
  } catch (error: any) {
    console.error('Instagram Post Error:', error);
    return { success: false, error: error.message };
  }
}
