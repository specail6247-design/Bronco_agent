import { AgentContext, AgentResult } from '@/types';
import { searchGoogle } from '@/lib/ai/search';
import { askGemini } from '@/lib/ai/gemini';
import { logActivity } from '@/lib/pipeline/logger';

// Agent 1: Jessica (Research & Trending Keywords)
export async function jessica(context: AgentContext): Promise<AgentResult> {
  const { topic, id: jobId } = context.job;

  try {
    // START LOGGING
    await logActivity(jobId, 'jessica', 'THOUGHT', `Analyzing trending topics for "${topic}"`);
    
    // 1. Get real search results
    await logActivity(jobId, 'jessica', 'ACTION', `Searching Google for real-world data on ${topic}`);
    const searchResults = await searchGoogle(topic);
    
    const searchSnippet = searchResults
      .slice(0, 5)
      .map((r: any) => `${r.title}: ${r.snippet}`)
      .join('\n');

    await logActivity(jobId, 'jessica', 'THOUGHT', `Processing ${searchResults.length} search results...`);

    // 2. Use Gemini to analyze and extract insights
    const prompt = `
      You are Jessica, a professional viral content strategist and market researcher.
      Your task is to analyze the following search results for the topic: "${topic}" 
      and provide trending keywords, competitor angles, and a summary.

      Search Results:
      ${searchSnippet}

      Please provide the output in JSON format with the following keys:
      - summary: A brief summary of current trends for this topic.
      - keywords: An array of 5-8 trending keywords.
      - trendingScore: A number from 1-100 indicating how viral this topic currently is.
      - competitorAngles: An array of 3 unique angles competitors are taking.
    `;

    const analysis = await askGemini(prompt, true);
    
    await logActivity(jobId, 'jessica', 'RESULT', `Research finalized. Found ${analysis.keywords?.length || 0} trending keywords.`);

    return {
      success: true,
      artifactType: 'research',
      content: {
        ...analysis,
        rawSearchCount: searchResults.length,
        searchedAt: new Date().toISOString()
      }
    };

  } catch (error: any) {
    console.error('[Jessica] Agent Error:', error);
    await logActivity(jobId, 'jessica', 'ERROR', `Research failed: ${error.message}`);
    return { 
      success: false, 
      artifactType: 'research', 
      content: {}, 
      error: `Jessica failed: ${error.message}` 
    };
  }
}
