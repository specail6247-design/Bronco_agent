const SHOTSTACK_ENDPOINT = 'https://api.shotstack.io/stage'; // Use stage for testing
const SHOTSTACK_API_KEY = process.env.SHOTSTACK_API_KEY;

export async function renderVideo(data: any) {
  if (!SHOTSTACK_API_KEY) throw new Error('SHOTSTACK_API_KEY is missing');

  const response = await fetch(`${SHOTSTACK_ENDPOINT}/render`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': SHOTSTACK_API_KEY,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result?.message || 'Shotstack render request failed');
  }

  // Defensive: Validate response structure before accessing
  if (!result?.response?.id) {
    console.error('[Shotstack] Unexpected API response:', JSON.stringify(result));
    throw new Error('Shotstack API returned unexpected response format (missing response.id)');
  }

  return result.response.id;
}

export async function getRenderStatus(id: string) {
  if (!SHOTSTACK_API_KEY) throw new Error('SHOTSTACK_API_KEY is missing');

  const response = await fetch(`${SHOTSTACK_ENDPOINT}/render/${id}`, {
    headers: {
      'x-api-key': SHOTSTACK_API_KEY,
    },
  });

  const result = await response.json();
  
  // Defensive: Check if response exists
  if (!result?.response) {
    console.error('[Shotstack] Status check returned invalid response:', JSON.stringify(result));
    throw new Error('Shotstack status API returned unexpected format');
  }
  
  return result.response;
}

/**
 * Polls for render completion.
 * @param id Render ID
 * @param timeoutMs Max time to wait (default 5 mins)
 */
export async function pollRenderStatus(id: string, timeoutMs = 300000) {
  const start = Date.now();
  
  while (Date.now() - start < timeoutMs) {
    const status = await getRenderStatus(id);
    
    if (status.status === 'done') {
      return status.url;
    }
    
    if (status.status === 'failed') {
      throw new Error(`Shotstack render failed: ${status.error || 'Unknown error'}`);
    }
    
    console.log(`[Shotstack] Rendering... (${status.status})`);
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s between polls
  }
  
  throw new Error('Shotstack render timed out');
}
