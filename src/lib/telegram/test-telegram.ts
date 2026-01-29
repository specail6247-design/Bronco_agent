import { sendApprovalRequest } from './bot';

async function testTelegram() {
  console.log('--- Telegram Notification Test ---');
  
  const mockJob: any = {
    id: 'test-job-123',
    topic: 'Bronco AI Marketing Strategy',
    scheduledAt: new Date(),
    platforms: ['youtube', 'tiktok', 'instagram'],
  };

  const mockPackage: any = {
    videoUrl: 'https://example.com/demo.mp4',
    platforms: [
      {
        title: 'How to automate your content with Bronco',
        description: 'Check out this amazing automated workflow using AI agents.',
      }
    ]
  };

  console.log('Sending test message to Telegram...');
  await sendApprovalRequest(mockJob, mockPackage);
  console.log('Done. Please check your Telegram app!');
}

testTelegram().catch(console.error);
