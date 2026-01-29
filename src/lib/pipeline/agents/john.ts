import { AgentContext, AgentResult } from '@/types';
import { getAdapter } from '@/lib/adapters';

// Agent 6: John (Performance Report)
export async function john(context: AgentContext): Promise<AgentResult> {
  const qaArtifact = context.previousArtifacts.find(a => a.type === 'qa');
  if (!qaArtifact) return { success: false, artifactType: 'report', content: {}, error: 'Missing QA artifact' };

  const qaData = qaArtifact.contentJson as any;
  const publishedPosts = qaData.results?.filter((r: any) => r.status === 'published') || [];
  
  const metrics = [];

  // In a real scenario, John might run hours/days later. 
  // For MVP immediate pipeline run, we just fetch initial metrics (often 0).
  for (const post of publishedPosts) {
    try {
      const adapter = getAdapter(post.platform);
      const m = await adapter.fetchMetrics(post.postId);
      metrics.push({
        platform: post.platform,
        postId: post.postId,
        metrics: m
      });
    } catch (e) {
      console.error(`Failed to fetch metrics for ${post.platform}`, e);
    }
  }

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
}
