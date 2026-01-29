const META_APP_ID = process.env.META_APP_ID;
const META_APP_SECRET = process.env.META_APP_SECRET;
const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL;

const REDIRECT_URI = `${NEXT_PUBLIC_APP_URL}/api/auth/callback/meta`;

export function getMetaAuthUrl(uid: string) {
  // Scopes for Facebook, Instagram Graph API, and Threads
  const scope = [
    'public_profile',
    'email',
    'instagram_basic',
    'instagram_content_publish',
    'pages_show_list',
    'pages_read_engagement',
    'pages_manage_posts',
    'threads_basic',
    'threads_content_publish'
  ].join(',');

  const url = new URL('https://www.facebook.com/v18.0/dialog/oauth');
  url.searchParams.append('client_id', META_APP_ID || '');
  url.searchParams.append('redirect_uri', REDIRECT_URI);
  url.searchParams.append('state', uid);
  url.searchParams.append('scope', scope);
  url.searchParams.append('response_type', 'code');

  return url.toString();
}

export async function exchangeMetaCode(code: string) {
  const url = new URL('https://graph.facebook.com/v18.0/oauth/access_token');
  url.searchParams.append('client_id', META_APP_ID || '');
  url.searchParams.append('redirect_uri', REDIRECT_URI);
  url.searchParams.append('client_secret', META_APP_SECRET || '');
  url.searchParams.append('code', code);

  const response = await fetch(url.toString());
  return response.json();
}

/**
 * Threads has its own specific OAuth flow for independent accounts
 */
export function getThreadsAuthUrl(uid: string) {
  const scope = 'threads_basic,threads_content_publish';
  const redirectUri = `${NEXT_PUBLIC_APP_URL}/api/auth/callback/threads`;
  
  const url = new URL('https://www.threads.net/oauth/authorize');
  url.searchParams.append('client_id', META_APP_ID || ''); // Often same as Meta App ID
  url.searchParams.append('redirect_uri', redirectUri);
  url.searchParams.append('scope', scope);
  url.searchParams.append('state', uid);
  url.searchParams.append('response_type', 'code');

  return url.toString();
}
