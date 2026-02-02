/**
 * X (Twitter) API Helpers (2026 Compatible)
 * Uses OAuth 2.0 with PKCE.
 */

export async function exchangeXCode(code: string, codeVerifier: string) {
  const client_id = process.env.X_CLIENT_ID?.trim();
  const client_secret = process.env.X_CLIENT_SECRET?.trim();
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, "");
  const redirect_uri = `${appUrl}/api/auth/x/callback`;

  const tokenUrl = 'https://api.x.com/2/oauth2/token';
  
  const auth = Buffer.from(`${client_id}:${client_secret}`).toString('base64');

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri,
    code_verifier: codeVerifier,
  });

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded' 
    },
    body: params.toString(),
  });

  return await res.json();
}

/**
 * Fetch X User Profile
 */
export async function getXProfile(accessToken: string) {
  const profileUrl = 'https://api.x.com/2/users/me?user.fields=profile_image_url,description';
  
  const res = await fetch(profileUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  return await res.json();
}
