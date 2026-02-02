import { getStandardRedirectUri } from './utils';

const LINKEDIN_VERSION = '202601'; // Default version for 2026 requests

export async function exchangeLinkedInCode(code: string) {
  const client_id = process.env.LINKEDIN_CLIENT_ID?.trim();
  const client_secret = process.env.LINKEDIN_CLIENT_SECRET?.trim();
  const redirect_uri = getStandardRedirectUri('linkedin');

  const tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
  
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: client_id!,
    client_secret: client_secret!,
    redirect_uri,
  });

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  return await res.json();
}

/**
 * Fetch LinkedIn Profile using OpenID Connect
 */
export async function getLinkedInProfile(accessToken: string) {
  const profileUrl = 'https://api.linkedin.com/v2/userinfo';
  
  const res = await fetch(profileUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  return await res.json();
}

/**
 * Fetch LinkedIn Company Pages where the user has administrative roles
 */
export async function getLinkedInOrganizations(accessToken: string) {
  // 1. Get member ID (urn)
  const profile = await getLinkedInProfile(accessToken);
  if (!profile.sub) return [];

  const memberUrn = `urn:li:person:${profile.sub}`;

  // 2. Query organization memberships
  const orgsUrl = `https://api.linkedin.com/rest/organizationAcls?q=roleContext&role=ADMINISTRATOR&state=APPROVED`;
  
  const res = await fetch(orgsUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Linkedin-Version': LINKEDIN_VERSION,
      'X-Restli-Protocol-Version': '2.0.0',
    },
  });

  const data = await res.json();
  if (!data.elements) return [];

  // 3. Get detailed info for each organization
  const organizations = [];
  for (const element of data.elements) {
    const orgUrn = element.organization;
    const orgId = orgUrn.split(':').pop();
    
    const detailsUrl = `https://api.linkedin.com/rest/organizations/${orgId}`;
    const detailsRes = await fetch(detailsUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Linkedin-Version': LINKEDIN_VERSION,
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });
    
    const details = await detailsRes.json();
    organizations.push({
      urn: orgUrn,
      id: orgId,
      name: details.localizedName || details.vanityName,
    });
  }

  return organizations;
}
