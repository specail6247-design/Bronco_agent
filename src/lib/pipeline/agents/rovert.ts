import { AgentContext, AgentResult } from '@/types';

// Agent 3: Rovert (Storyboard + Image/Shot list)
export async function rovert(context: AgentContext): Promise<AgentResult> {
  const script = context.previousArtifacts.find(a => a.type === 'script');
  if (!script) return { success: false, artifactType: 'storyboard', content: {}, error: 'Missing script artifact' };

  return {
    success: true,
    artifactType: 'storyboard',
    content: {
      scenes: [
        { id: 1, type: 'b-roll', description: 'Busy city street timelapse', duration: 3 },
        { id: 2, type: 'talking-head', description: 'Host looking at camera', duration: 10 },
        { id: 3, type: 'screen-record', description: 'Software demo', duration: 15 },
      ],
      assetSuggestions: [
        'stock_money_falling.mp4',
        'chart_growth_green.png'
      ]
    }
  };
}
