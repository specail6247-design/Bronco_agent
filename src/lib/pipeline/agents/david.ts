import { AgentContext, AgentResult } from '@/types';
import { getAdapter } from '@/lib/adapters';

// Agent 5: David (Post-publish QA Checks & Publishing)
// NOTE: In our pipeline logic, David runs AFTER approval. 
// So David is responsible for actually PUBLISHING to platforms using the adapters.
export async function david(context: AgentContext): Promise<AgentResult> {
  const uploadPackage = context.previousArtifacts.find(a => a.type === 'upload_package');
  if (!uploadPackage) return { success: false, artifactType: 'qa', content: {}, error: 'Missing upload package' };

  const pkg = uploadPackage.contentJson as any;
  const platformMetadata = pkg.platforms || [];
  
  const results = [];

  for (const meta of platformMetadata) {
    try {
      const adapter = getAdapter(meta.platform);
      
      // Publish
      const pubResult = await adapter.publish(meta, pkg.videoUrl, pkg.thumbnailUrl);
      
      // Verify
      const verifyResult = await adapter.verify(pubResult.postId);

      results.push({
        platform: meta.platform,
        postId: pubResult.postId,
        url: pubResult.url,
        status: pubResult.status,
        verification: verifyResult.status
      });

    } catch (e: any) {
      console.error(`Failed to publish to ${meta.platform}`, e);
      results.push({
        platform: meta.platform,
        status: 'failed',
        error: e.message
      });
    }
  }

  // Check if at least one succeeded
  const successCount = results.filter(r => r.status === 'published').length;

  return {
    success: successCount > 0,
    artifactType: 'qa',
    content: {
      results,
      summary: `Published to ${successCount} platforms.`,
      qaPassed: true
    }
  };
}
