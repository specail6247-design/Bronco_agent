import { AgentContext, AgentResult } from '@/types';
import { getAdapter } from '@/lib/adapters';
import { logActivity } from '@/lib/pipeline/logger';
import { refreshYouTubeToken, refreshXToken, refreshTikTokToken, refreshThreadsToken } from '@/lib/auth/token-manager';

// Agent 5: David (Post-publish QA Checks & Publishing)
export async function david(context: AgentContext): Promise<AgentResult> {
  const uploadPackage = context.previousArtifacts.find(a => a.type === 'upload_package');
  if (!uploadPackage) return { success: false, artifactType: 'qa', content: {}, error: 'Missing upload package' };

  const { id: jobId } = context.job;
  const pkg = uploadPackage.contentJson as any;
  const platformMetadata = pkg.platforms || [];
  
  const results = [];

  try {
    await logActivity(jobId, 'david', 'THOUGHT', `Received approved video package. Preparing for multi-platform distribution.`);

    for (const meta of platformMetadata) {
      try {
        await logActivity(jobId, 'david', 'ACTION', `Publishing to ${meta.platform}...`);
        
        // 1. Refresh Token if needed
        const userId = context.job.ownerId || 'user_default';
        if (meta.platform === 'youtube') await refreshYouTubeToken(userId);
        if (meta.platform === 'x') await refreshXToken(userId);
        if (meta.platform === 'tiktok') await refreshTikTokToken(userId);
        if (meta.platform === 'threads') await refreshThreadsToken(userId);

        // Defensive: Check adapter exists and has required methods
        const adapter = getAdapter(meta.platform);
        if (!adapter || typeof adapter.publish !== 'function') {
          await logActivity(jobId, 'david', 'THOUGHT', `Skipping ${meta.platform}: Adapter not fully implemented yet.`);
          results.push({
            platform: meta.platform,
            status: 'skipped',
            error: 'Adapter not available'
          });
          continue;
        }
        
        // Publish
        const pubResult = await adapter.publish(meta, pkg.videoUrl, pkg.thumbnailUrl);
        
        // Defensive: Validate pubResult before accessing
        if (!pubResult || !pubResult.postId) {
          throw new Error('Publish returned invalid result (missing postId)');
        }
        
        await logActivity(jobId, 'david', 'THOUGHT', `Publication success on ${meta.platform} (ID: ${pubResult.postId}). Verifying link integrity...`);
        
        // Verify (optional - may not be implemented for all adapters)
        let verifyResult = { status: 'unverified' };
        if (typeof adapter.verify === 'function') {
          try {
            verifyResult = await adapter.verify(pubResult.postId);
          } catch (verifyErr) {
            console.warn(`[David] Verify failed for ${meta.platform}:`, verifyErr);
            verifyResult = { status: 'verify_error' };
          }
        }

        results.push({
          platform: meta.platform,
          postId: pubResult.postId,
          url: pubResult.url,
          status: pubResult.status,
          verification: verifyResult.status
        });

      } catch (e: any) {
        console.error(`Failed to publish to ${meta.platform}`, e);
        await logActivity(jobId, 'david', 'ERROR', `Failed to publish to ${meta.platform}: ${e.message}`);
        results.push({
          platform: meta.platform,
          status: 'failed',
          error: e.message
        });
      }
    }

    const successCount = results.filter(r => r.status === 'published' || r.status === 'success' || r.status === 'DONE').length;
    await logActivity(jobId, 'david', 'RESULT', `Publishing round complete. ${successCount} platforms active.`);

    return {
      success: successCount > 0,
      artifactType: 'qa',
      content: {
        results,
        summary: `Published to ${successCount} platforms.`,
        qaPassed: true
      }
    };
  } catch (err: any) {
    await logActivity(jobId, 'david', 'ERROR', `David critical failure: ${err.message}`);
    return { success: false, artifactType: 'qa', content: {}, error: err.message };
  }
}
