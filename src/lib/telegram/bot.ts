import { Job } from '@/types';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_OWNER_CHAT_ID = process.env.TELEGRAM_OWNER_CHAT_ID;

/**
 * Send an approval request card to the owner via Telegram
 */
export async function sendApprovalRequest(job: Job, uploadPackage: any) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_OWNER_CHAT_ID) {
    console.warn('Telegram credentials missing, skipping notification');
    return;
  }

  const message = `
*🚀 Approval Required: ${job.topic}*

*Scheduled:* ${new Date(job.scheduledAt).toLocaleString()}
*Platforms:* ${job.platforms.join(', ')}

*Title:* ${uploadPackage.platforms[0]?.title}
*Description:* ${uploadPackage.platforms[0]?.description.substring(0, 50)}...

[View Video Asset](${uploadPackage.videoUrl})
  `;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '✅ Approve', callback_data: `approve:${job.id}` },
        { text: '⏸ Hold', callback_data: `hold:${job.id}` }
      ],
      [
        { text: '✍️ Request Edits', callback_data: `edit:${job.id}` }
      ]
    ]
  };

  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_OWNER_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
        reply_markup: keyboard,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error('Telegram API error:', err);
    }
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
  }
}

/**
 * Update the original message to show action taken
 */
export async function updateMessageButtons(chatId: number, messageId: number, action: string) {
  if (!TELEGRAM_BOT_TOKEN) return;

  let text = '';
  switch (action) {
    case 'approve': text = '✅ Approved for publishing'; break;
    case 'hold': text = '⏸ Job placed on hold'; break;
    case 'edit': text = '✍️ Edits requested'; break;
  }

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageReplyMarkup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        reply_markup: { inline_keyboard: [] } // Remove buttons
      }),
    });
    
    // Optionally send a follow-up confirmation
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
      }),
    });

  } catch (error) {
    console.error('Failed to update Telegram message:', error);
  }
}
