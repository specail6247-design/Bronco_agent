import { AgentContext, AgentResult, Platform } from '@/types';
import { renderVideo, pollRenderStatus } from '@/lib/video/shotstack';
import { logActivity } from '@/lib/pipeline/logger';

// Agent 4: Tim (The Video Producer & Editor)
export async function tim(context: AgentContext): Promise<AgentResult> {
  const scriptArtifact = context.previousArtifacts.find(a => a.type === 'script');
  const storyboardArtifact = context.previousArtifacts.find(a => a.type === 'storyboard');
  
  if (!scriptArtifact || !storyboardArtifact) {
    return { success: false, artifactType: 'upload_package', content: {}, error: 'Missing script or storyboard' };
  }

  const { id: jobId, platforms } = context.job;
  const script = scriptArtifact.contentJson as any;
  const storyboard = storyboardArtifact.contentJson as any;

  try {
    await logActivity(jobId, 'tim', 'THOUGHT', `Constructing video timeline for ${script.title}`);
    await logActivity(jobId, 'tim', 'ACTION', `Assembling ${storyboard.scenes?.length || 0} scenes into Shotstack timeline`);

    const timeline = {
      tracks: [
        {
          clips: storyboard.scenes.map((scene: any, index: number) => ({
            asset: {
              type: 'title',
              text: scene.description.substring(0, 30) + '...',
              style: 'minimal'
            },
            start: index * 5,
            length: scene.duration || 5
          }))
        }
      ]
    };

    const output = {
      format: 'mp4',
      resolution: 'hd'
    };

    await logActivity(jobId, 'tim', 'ACTION', `Sending render request to Shotstack cloud API...`);
    const renderId = await renderVideo({ timeline, output });

    await logActivity(jobId, 'tim', 'THOUGHT', `Render processing (ID: ${renderId}). Monitoring status...`);
    const videoUrl = await pollRenderStatus(renderId);

    await logActivity(jobId, 'tim', 'RESULT', `Video successfully rendered! URL: ${videoUrl}`);

    const thumbnailUrl = 'https://example.com/default-thumbnail.jpg';

    const metadata = platforms.map((platform: Platform) => ({
      platform,
      title: script.title,
      description: `${script.hook}\n\n${script.cta}\n\n#${context.job.topic.replace(/\s/g, '')}`,
      hashtags: ['bronco', 'ai', context.job.topic.replace(/\s/g, '')],
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
        platforms: metadata,
        renderId
      }
    };

  } catch (error: any) {
    console.error('[Tim] Agent Error:', error);
    await logActivity(jobId, 'tim', 'ERROR', `Production failed: ${error.message}`);
    return { 
      success: false, 
      artifactType: 'upload_package', 
      content: {}, 
      error: `Tim failed during rendering: ${error.message}` 
    };
  }
}
