import { AgentContext, AgentResult } from '@/types';
import { askGemini } from '@/lib/ai/gemini';
import { logActivity } from '@/lib/pipeline/logger';

// Agent 3: Rovert (Director of Photography & Storyboard)
export async function rovert(context: AgentContext): Promise<AgentResult> {
  const scriptArtifact = context.previousArtifacts.find(a => a.type === 'script');
  if (!scriptArtifact) {
    return { success: false, artifactType: 'storyboard', content: {}, error: 'Missing script artifact' };
  }

  const { id: jobId } = context.job;
  const script = scriptArtifact.contentJson as any;

  try {
    await logActivity(jobId, 'rovert', 'THOUGHT', `Visualizing scenes for: "${script.title}"`);
    await logActivity(jobId, 'rovert', 'ACTION', `Generating technical shot lists and visual prompts...`);

    const prompt = `
      You are Rovert, an expert AI video director. 
      Analyze the following script and create a detailed storyboard/shot list for a high-quality video.

      Script Title: ${script.title}
      Script Hook: ${script.hook}
      Script Body Snippet: ${script.body.substring(0, 500)}...

      Tasks:
      1. Divide the script into logical scenes.
      2. For each scene, specify:
         - type: 'talking-head', 'b-roll', 'graphic', or 'stock-footage'.
         - description: Visual description for an AI video/image generator.
         - duration: Expected duration in seconds.
      3. Suggest asset tags (keywords) for searching stock footage.

      Output JSON format:
      {
        "scenes": [
          { "id": 1, "type": "...", "description": "...", "duration": 5 },
          ...
        ],
        "assetSuggestions": ["tag1", "tag2", ...]
      }
    `;

    const storyboard = await askGemini(prompt, true);
    
    await logActivity(jobId, 'rovert', 'RESULT', `Storyboard generated with ${storyboard.scenes?.length || 0} unique scenes.`);

    return {
      success: true,
      artifactType: 'storyboard',
      content: storyboard
    };

  } catch (error: any) {
    console.error('[Rovert] Agent Error:', error);
    await logActivity(jobId, 'rovert', 'ERROR', `Storyboard generation failed: ${error.message}`);
    return { 
      success: false, 
      artifactType: 'storyboard', 
      content: {}, 
      error: `Rovert failed: ${error.message}` 
    };
  }
}
