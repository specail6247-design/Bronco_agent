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

  // Defensive: Extract data safely
  const scriptTitle = script?.title || 'Untitled Video';
  const scriptHook = script?.hook || '';
  const scriptCta = script?.cta || '';
  const scenes = Array.isArray(storyboard?.scenes) ? storyboard.scenes : [];

  try {
    await logActivity(jobId, 'tim', 'THOUGHT', `Constructing video timeline for ${scriptTitle}`);
    await logActivity(jobId, 'tim', 'ACTION', `Assembling ${scenes.length} scenes into Shotstack timeline`);

    // Defensive: Handle empty scenes array
    if (scenes.length === 0) {
      await logActivity(jobId, 'tim', 'THOUGHT', `No scenes found in storyboard. Creating placeholder timeline.`);
    }

    const timeline = {
      tracks: [
        {
          clips: scenes.map((scene: any, index: number) => ({
            asset: {
              type: 'title',
              text: (scene?.description || scene?.text || 'Scene').substring(0, 30) + '...',
              style: 'minimal'
            },
            start: index * 5,
            length: scene?.duration || 5
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
      title: scriptTitle,
      description: `${scriptHook}\n\n${scriptCta}\n\n#${context.job.topic?.replace(/\s/g, '') || 'bronco'}`,
      hashtags: ['bronco', 'ai', context.job.topic?.replace(/\s/g, '') || 'video'],
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
