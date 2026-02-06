import { AgentContext, AgentResult } from '@/types';
import { askGemini } from '@/lib/ai/gemini';
import { logActivity } from '@/lib/pipeline/logger';

// Agent 2: Sunny (Long-form Script & Hook Strategist)
export async function sunny(context: AgentContext): Promise<AgentResult> {
  const researchArtifact = context.previousArtifacts.find(a => a.type === 'research');
  if (!researchArtifact) {
    return { success: false, artifactType: 'script', content: {}, error: 'Missing research artifact' };
  }

  const { topic, languageMode, preferredLanguage, id: jobId } = context.job;
  const research = researchArtifact.contentJson as any;
  const lang = languageMode === 'manual' ? (preferredLanguage || 'ko') : 'en';

  // Defensive: Extract research data safely
  const researchSummary = research?.summary || 'No summary available from research phase.';
  const researchKeywords = Array.isArray(research?.keywords) ? research.keywords.join(', ') : '';
  const competitorAngles = Array.isArray(research?.competitorAngles) ? research.competitorAngles.join(', ') : '';

  try {
    await logActivity(jobId, 'sunny', 'THOUGHT', `Reading Jessica's research for "${topic}"`);
    await logActivity(jobId, 'sunny', 'ACTION', `Drafting a viral script structure in ${lang}`);

    const prompt = `
      You are Sunny, a world-class YouTube scriptwriter specializing in high-retention content.
      Based on the following research, write a viral video script in ${lang}.

      Topic: ${topic}
      Research Summary: ${researchSummary}
      Trending Keywords: ${researchKeywords}
      Competitor Angles: ${competitorAngles}

      Requirements:
      - Title: Catchy, high CTR title.
      - Hook: Strong opening to grab attention within 3 seconds.
      - Body: Engaging content divided into clear segments.
      - CTA: Natural call to action.
      - Total Length: Approximately 1000-1500 words.

      Output JSON format:
      {
        "title": "...",
        "hook": "...",
        "body": "...",
        "cta": "...",
        "estimatedDurationSeconds": 000
      }
    `;

    await logActivity(jobId, 'sunny', 'THOUGHT', `Optimizing the script for maximum audience retention...`);
    const script = await askGemini(prompt, true);
    
    await logActivity(jobId, 'sunny', 'RESULT', `Script finalized: "${script.title}"`);

    return {
      success: true,
      artifactType: 'script',
      content: {
        ...script,
        language: lang
      }
    };

  } catch (error: any) {
    console.error('[Sunny] Agent Error:', error);
    await logActivity(jobId, 'sunny', 'ERROR', `Scriptwriting failed: ${error.message}`);
    return { 
      success: false, 
      artifactType: 'script', 
      content: {}, 
      error: `Sunny failed: ${error.message}` 
    };
  }
}
