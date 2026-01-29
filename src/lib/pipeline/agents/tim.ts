import { AgentContext, AgentResult, Platform } from '@/types';

// Agent 4: Tim (Upload Package + Metadata)
export async function tim(context: AgentContext): Promise<AgentResult> {
  const script = context.previousArtifacts.find(a => a.type === 'script');
  const storyboard = context.previousArtifacts.find(a => a.type === 'storyboard');
  
  if (!script) return { success: false, artifactType: 'upload_package', content: {}, error: 'Missing script' };

  const { platforms } = context.job;
  const scriptData = script.contentJson as any;

  // Mock video generation link (in real app, this might come from another step or external service)
  const videoUrl = 'https://example.com/generated-video.mp4';
  const thumbnailUrl = 'https://example.com/thumbnail.jpg';

  const metadata = platforms.map((platform: Platform) => ({
    platform,
    title: scriptData.title,
    description: `${scriptData.body.substring(0, 100)}... \n\n#${context.job.topic.replace(/\s/g, '')}`,
    hashtags: ['fyp', 'trending', context.job.topic.replace(/\s/g, '')],
    thumbnailUrl,
    videoUrl,
  }));

  return {
    success: true,
    artifactType: 'upload_package',
    content: {
      readyToPublish: true,
      videoUrl,
      thumbnailUrl,
      platforms: metadata
    }
  };
}
