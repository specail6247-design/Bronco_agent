import { AgentContext, AgentResult } from '@/types';
import { getAdapter } from '@/lib/adapters';
import { logActivity } from '@/lib/pipeline/logger';

// Agent 6: John (Performance Report)
export async function john(context: AgentContext): Promise<AgentResult> {
  const qaArtifact = context.previousArtifacts.find(a => a.type === 'qa');
  if (!qaArtifact) return { success: false, artifactType: 'report', content: {}, error: 'Missing QA artifact' };

  const { id: jobId } = context.job;
  const qaData = qaArtifact.contentJson as any;
  const publishedPosts = qaData.results?.filter((r: any) => r.status === 'published' || r.status === 'success' || r.status === 'DONE') || [];
  
  const metrics = [];

  try {
    await logActivity(jobId, 'john', 'THOUGHT', `Establishing data streams for performance analytics.`);

    for (const post of publishedPosts) {
      try {
        await logActivity(jobId, 'john', 'ACTION', `Fetching initial metrics for ${post.platform}...`);
        
        // Defensive: Check adapter and fetchMetrics method exist
        const adapter = getAdapter(post.platform);
        if (!adapter || typeof adapter.fetchMetrics !== 'function') {
          console.warn(`[John] fetchMetrics not available for ${post.platform}`);
          metrics.push({
            platform: post.platform,
            postId: post.postId,
            metrics: { note: 'Metrics collection not yet implemented for this platform' }
          });
          continue;
        }
        
        const m = await adapter.fetchMetrics(post.postId);
        metrics.push({
          platform: post.platform,
          postId: post.postId,
          metrics: m || { note: 'No metrics returned' }
        });
      } catch (e: any) {
        console.error(`Failed to fetch metrics for ${post.platform}`, e);
        // Don't fail entire report for one platform's metrics failure
        metrics.push({
          platform: post.platform,
          postId: post.postId,
          metrics: { error: e?.message || 'Unknown error' }
        });
      }
    }

    await logActivity(jobId, 'john', 'RESULT', `Initial performance report ready. Analyzing audience signals.`);

    return {
      success: true,
      artifactType: 'report',
      content: {
        metrics,
        analysis: [
          "Initial upload successful.",
          "Waiting for 24h data for deeper insights."
        ],
        recommendations: [
          "Monitor comments for the first hour.",
          "Prepare a follow-up short for tomorrow."
        ]
      }
    };
  } catch (err: any) {
    await logActivity(jobId, 'john', 'ERROR', `John analytical error: ${err.message}`);
    return { success: false, artifactType: 'report', content: {}, error: err.message };
  }
}
