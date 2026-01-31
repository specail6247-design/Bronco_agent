export async function exchangeMetaCode(code: string) {
  const client_id = process.env.META_APP_ID;
  const client_secret = process.env.META_APP_SECRET;
  const redirect_uri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/meta`;

  // 1. Exchange code for short-lived access token
  const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&client_secret=${client_secret}&code=${code}`;
  
  const tokenRes = await fetch(tokenUrl);
  const tokenData = await tokenRes.json();

  if (tokenData.error) {
    return { error: tokenData.error };
  }

  const shortToken = tokenData.access_token;

  // 2. Exchange for long-lived access token (60 days)
  const longLivedUrl = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${client_id}&client_secret=${client_secret}&fb_exchange_token=${shortToken}`;
  
  const longRes = await fetch(longLivedUrl);
  const longData = await longRes.json();

  return longData;
}

/**
 * Fetch Instagram Business Accounts linked to the user's Facebook Pages
 */
export async function getInstagramAccounts(accessToken: string) {
  try {
    // 1. Get the user's Facebook Pages
    const pagesUrl = `https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}`;
    const pagesRes = await fetch(pagesUrl);
    const pagesData = await pagesRes.json();

    if (!pagesData.data || pagesData.data.length === 0) {
      return [];
    }

    const accounts = [];

    // 2. For each page, check if there's a linked Instagram Business Account
    for (const page of pagesData.data) {
      const igUrl = `https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account&access_token=${accessToken}`;
      const igRes = await fetch(igUrl);
      const igData = await igRes.json();

      if (igData.instagram_business_account) {
        // 3. Get detailed info about the IG account
        const igInfoUrl = `https://graph.facebook.com/v19.0/${igData.instagram_business_account.id}?fields=id,username,name,profile_picture_url&access_token=${accessToken}`;
        const igInfoRes = await fetch(igInfoUrl);
        const igInfo = await igInfoRes.json();
        
        accounts.push({
          ...igInfo,
          pageId: page.id,
          pageName: page.name
        });
      }
    }

    return accounts;
  } catch (error) {
    console.error('Error fetching Instagram accounts:', error);
    return [];
  }
}

/**
 * Threads API Auth URL
 * Note: Threads uses the same account source as Instagram
 */
export function getThreadsAuthUrl(uid: string) {
  const client_id = process.env.META_APP_ID;
  const redirect_uri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/meta`;
  const scopes = ['public_profile', 'instagram_basic', 'pages_show_list'].join(',');

  return `https://www.facebook.com/v19.0/dialog/oauth?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&state=${uid}&scope=${encodeURIComponent(scopes)}&response_type=code`;
}
