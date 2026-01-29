import { NextRequest, NextResponse } from 'next/server';
import { updateJob } from '@/lib/firebase/firestore';
import { runPipeline } from '@/lib/pipeline/engine';
import { updateMessageButtons } from '@/lib/telegram/bot';
// Note: We need to import adminDb to fetch job by ID if we use direct firestore calls, 
// but updateJob uses client SDK which isn't ideal for API routes.
// Let's use adminDb directly for correctness in API routes.
import { adminDb } from '@/lib/firebase/admin';

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();

    // Handle Callback Query (Button Clicks)
    if (update.callback_query) {
      const { id, data, message, from } = update.callback_query;
      const [action, jobId] = data.split(':');
      const chatId = message.chat.id;
      const messageId = message.message_id;

      console.log(`[Telegram] Action: ${action} for Job: ${jobId} from User: ${from.username}`);

      // 1. Update Job State
      let newState = '';
      if (action === 'approve') newState = 'PUBLISHING'; // Proceed to David
      else if (action === 'hold') newState = 'PAUSED';
      else if (action === 'edit') newState = 'Schedule_Edit'; // Custom state logic needed

      if (newState) {
        if (newState === 'PUBLISHING') {
             // Resume Pipeline!
             // We need to fetch the job first to pass to runPipeline
             const jobDoc = await adminDb.collection('jobs').doc(jobId).get();
             if (jobDoc.exists) {
                 const jobData = { id: jobDoc.id, ...jobDoc.data() } as any;
                 // Update DB first
                 await adminDb.collection('jobs').doc(jobId).update({ state: 'RUNNING' }); // Set to running for pipeline
                 
                 // Trigger pipeline async
                 // Note: In serverless, this might be cut off. Ideally use a queue.
                 // For MVP, we just await it or fire-and-forget if Vercel allows (it often doesn't).
                 // We will await it for reliability in MVP demo.
                 await runPipeline(jobData);
             }
        } else {
            await adminDb.collection('jobs').doc(jobId).update({ state: newState });
        }
      }

      // 2. Update Telegram UI
      await updateMessageButtons(chatId, messageId, action);

      return NextResponse.json({ status: 'ok' });
    }

    return NextResponse.json({ status: 'ignored' });
  } catch (error) {
    console.error('Telegram Webhook Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
