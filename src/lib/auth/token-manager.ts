
import { getAdminDb } from '@/lib/firebase/admin';
import { getYouTubeOAuthClient } from './youtube';
import { getStandardRedirectUri } from './utils';

// NOTE: adminDb is now fetched inside each function to avoid module initialization issues

/**
 * Universal Token Refresher
 * Checks expiry and refreshes tokens for all platforms.
 */

// --- 1. YouTube Refresh ---
export async function refreshYouTubeToken(userId: string): Promise<string | null> {
  try {
    const adminDb = getAdminDb();
    const userRef = adminDb.collection('users').doc(userId);
    const connRef = userRef.collection('connections').doc('youtube');
    const doc = await connRef.get();

    if (!doc.exists) throw new Error('No YouTube connection found');

    const data = doc.data();
    if (!data?.refreshToken) throw new Error('No refresh token available');

    // Check if close to expiry (within 5 mins)
    const expiryDate = data.expiryDate || 0;
    if (Date.now() < expiryDate - 300000) {
      return data.accessToken; // Still valid
    }

    console.log('[TokenManager] Refreshing YouTube Token...');
    const client = getYouTubeOAuthClient();
    client.setCredentials({
      refresh_token: data.refreshToken
    });

    const { credentials } = await client.refreshAccessToken();

    // Update DB
    await connRef.update({
      accessToken: credentials.access_token,
      expiryDate: credentials.expiry_date,
      updatedAt: new Date()
    });

    return credentials.access_token || null;
  } catch (error) {
    console.error('[TokenManager] YouTube Refresh Failed:', error);
    return null;
  }
}

// --- 2. X (Twitter) Refresh ---
export async function refreshXToken(userId: string): Promise<string | null> {
  try {
    const adminDb = getAdminDb();
    const userRef = adminDb.collection('users').doc(userId);
    const connRef = userRef.collection('connections').doc('x');
    const doc = await connRef.get();

    if (!doc.exists) throw new Error('No X connection found');
    const data = doc.data();
    
    // Check expiry (X usually gives `expires_at` or `expires_in`)
    // If we only stored `expiresIn` (seconds), we need to rely on `updatedAt` + `expiresIn`
    // Assuming we stored `expiryDate` (timestamp)
    if (data?.expiryDate && Date.now() < data.expiryDate - 300000) {
      return data.accessToken;
    }

    if (!data?.refreshToken) throw new Error('No X refresh token');

    console.log('[TokenManager] Refreshing X Token...');
    
    const client_id = process.env.X_CLIENT_ID?.trim();
    const client_secret = process.env.X_CLIENT_SECRET?.trim();
    const auth = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
    
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: data.refreshToken,
    });

    const res = await fetch('https://api.x.com/2/oauth2/token', {
      method: 'POST',
      headers: { 
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded' 
      },
      body: params.toString(),
    });

    const newToken = await res.json();
    if (!newToken.access_token) throw new Error(JSON.stringify(newToken));

    const newExpiry = Date.now() + (newToken.expires_in * 1000);

    await connRef.update({
      accessToken: newToken.access_token,
      refreshToken: newToken.refresh_token || data.refreshToken, // X rotates refresh tokens!
      expiryDate: newExpiry,
      updatedAt: new Date()
    });

    return newToken.access_token;

  } catch (error) {
    console.error('[TokenManager] X Refresh Failed:', error);
    return null;
  }
}

// --- 3. TikTok Refresh ---
export async function refreshTikTokToken(userId: string): Promise<string | null> {
  try {
    const adminDb = getAdminDb();
    const userRef = adminDb.collection('users').doc(userId);
    const connRef = userRef.collection('connections').doc('tiktok');
    const doc = await connRef.get();

    if (!doc.exists) throw new Error('No TikTok connection found');
    const data = doc.data();

    // Check expiry
    if (data?.expiryDate && Date.now() < data.expiryDate - 300000) {
      return data.accessToken;
    }
    
    if (!data?.refreshToken) throw new Error('No TikTok refresh token');

    console.log('[TokenManager] Refreshing TikTok Token...');

    const params = new URLSearchParams();
    params.append('client_key', process.env.TIKTOK_CLIENT_KEY || '');
    params.append('client_secret', process.env.TIKTOK_CLIENT_SECRET || '');
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', data.refreshToken);

    const res = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const newToken = await res.json();
    if (!newToken.access_token) throw new Error(JSON.stringify(newToken));

    const newExpiry = Date.now() + (newToken.expires_in * 1000);

    await connRef.update({
      accessToken: newToken.access_token,
      refreshToken: newToken.refresh_token || data.refreshToken, 
      expiryDate: newExpiry,
      updatedAt: new Date()
    });

    return newToken.access_token;
  } catch (error) {
    console.error('[TokenManager] TikTok Refresh Failed:', error);
    return null;
  }
}

// --- 4. Threads Refresh ---
export async function refreshThreadsToken(userId: string): Promise<string | null> {
  try {
    const adminDb = getAdminDb();
    const userRef = adminDb.collection('users').doc(userId);
    const connRef = userRef.collection('connections').doc('threads');
    const doc = await connRef.get();

    if (!doc.exists) throw new Error('No Threads connection found');
    const data = doc.data();

    // Long-lived tokens for Threads/Meta usually last 60 days.
    // We check if it's expired.
    if (data?.expiryDate && Date.now() < data.expiryDate - 86400000) { // 1 day buffer
      return data.accessToken;
    }
    
    // Meta/Threads token refresh usually requires a specific endpoint
    // For now, if expired, we might need re-auth, but we can try to use long-lived token exchange
    console.log('[TokenManager] Checking Threads Token status...');
    
    return data?.accessToken || null;
  } catch (error) {
    console.error('[TokenManager] Threads Refresh Failed:', error);
    return null;
  }
}
