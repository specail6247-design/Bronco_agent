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
    
    const serperEnabled = process.env.SERPER_ENABLED === 'true';

    // 1. Get real search results (optional)
    let searchResults: any[] = [];
    if (serperEnabled) {
      await logActivity(jobId, 'jessica', 'ACTION', `Searching Google (SERPER) for latest trends on "${topic}"...`);
      searchResults = await searchGoogle(topic);
    } else {
      await logActivity(jobId, 'jessica', 'THOUGHT', 'SERPER disabled. Proceeding with internal knowledge base.');
    }
    
    if (!searchResults || searchResults.length === 0) {
      await logActivity(jobId, 'jessica', 'THOUGHT', `No direct search results found. Jessica will proceed using her internal knowledge base.`);
    } else {
      await logActivity(jobId, 'jessica', 'THOUGHT', `Found ${searchResults.length} relevant articles/videos. Synthesizing data...`);
    }
    
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

    await logActivity(jobId, 'jessica', 'ACTION', `Analyzing data with Gemini-1.5-Flash...`);
    const analysis = await askGemini(prompt, true);
    
    await logActivity(jobId, 'jessica', 'RESULT', `Research complete! Extracted ${analysis.keywords?.length || 0} viral keywords and CTR-optimized angles.`);

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
