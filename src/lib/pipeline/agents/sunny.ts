import { AgentContext, AgentResult } from '@/types';

// Agent 2: Sunny (Long-form Script)
export async function sunny(context: AgentContext): Promise<AgentResult> {
  const research = context.previousArtifacts.find(a => a.type === 'research');
  if (!research) return { success: false, artifactType: 'script', content: {}, error: 'Missing research artifact' };

  const { topic, languageMode, preferredLanguage } = context.job;
  const lang = languageMode === 'manual' ? preferredLanguage : 'en';

  return {
    success: true,
    artifactType: 'script',
    content: {
      language: lang,
      title: `The Ultimate Guide to ${topic}`,
      hook: "Did you know that 90% of people fail at this? Today I'll show you how to fix it.",
      body: `Main script content related to ${topic}... [2000 words]...`,
      cta: "Don't forget to like and subscribe for more insights!",
      estimatedDurationSeconds: 600
    }
  };
}
