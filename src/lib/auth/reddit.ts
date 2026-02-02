import { getStandardRedirectUri } from './utils';

const USER_AGENT = `platform:bronco-agent:v1.0.0 (by /u/${process.env.REDDIT_USERNAME || 'bronco_agent'})`;

export async function exchangeRedditCode(code: string) {
  const client_id = process.env.REDDIT_CLIENT_ID?.trim();
  const client_secret = process.env.REDDIT_CLIENT_SECRET?.trim();
  const redirect_uri = getStandardRedirectUri('reddit');

  const tokenUrl = 'https://www.reddit.com/api/v1/access_token';
  
  // Reddit uses Basic Auth for token exchange
  const auth = Buffer.from(`${client_id}:${client_secret}`).toString('base64');

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri,
  });

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': USER_AGENT
    },
    body: params.toString(),
  });

  return await res.json();
}

/**
 * Fetch Reddit Profile
 */
export async function getRedditProfile(accessToken: string) {
  const profileUrl = 'https://oauth.reddit.com/api/v1/me';
  
  const res = await fetch(profileUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'User-Agent': USER_AGENT
    },
  });

  return await res.json();
}
