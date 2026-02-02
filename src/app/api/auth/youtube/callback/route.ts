export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getYouTubeOAuthClient } from '@/lib/auth/youtube';
import { getAdminDb } from '@/lib/firebase/admin';
import { CONFIG } from '@/lib/config';

export async function GET(req: NextRequest) {
  try {
    const adminDb = getAdminDb();
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const uid = searchParams.get('state');

    if (!code || !uid) {
      return new NextResponse('Invalid callback parameters', { status: 400 });
    }

    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const isLocal = host?.includes('localhost') || host?.includes('127.0.0.1');
    const appUrl = isLocal 
      ? `http://${host}` 
      : (process.env.NEXT_PUBLIC_APP_URL || CONFIG.APP_URL);

    const client = getYouTubeOAuthClient(appUrl);
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    // 1. Get Google User Info
    const oauth2 = google.oauth2({ version: 'v2', auth: client });
    const userInfo = await oauth2.userinfo.get();
    const email = userInfo.data.email || '';

    // 2. Get Real YouTube Channel Info (Snippet & Stats)
    const youtube = google.youtube({ version: 'v3', auth: client });
    let channelInfo = {
      title: userInfo.data.name || 'YouTube Channel',
      thumbnail: userInfo.data.picture || '',
      subscriberCount: '0'
    };

    try {
      const channelRes = await youtube.channels.list({
        part: ['snippet', 'statistics'],
        mine: true
      });

      if (channelRes.data.items && channelRes.data.items.length > 0) {
        const channel = channelRes.data.items[0];
        channelInfo = {
          title: channel.snippet?.title || channelInfo.title,
          thumbnail: channel.snippet?.thumbnails?.default?.url || channelInfo.thumbnail,
          subscriberCount: channel.statistics?.subscriberCount || '0'
        };
      }
    } catch (ytError) {
      console.error('Error fetching YouTube channel specific digits:', ytError);
      // Fallback to basic Google info
    }

    // 3. Store in Firestore connections collection
    await adminDb
      .collection('users')
      .doc(uid)
      .collection('connections')
      .doc('youtube')
      .set({
        platform: 'youtube',
        connected: true,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: tokens.expiry_date,
        email: email,
        channelName: channelInfo.title,
        thumbnail: channelInfo.thumbnail,
        subscriberCount: channelInfo.subscriberCount,
        updatedAt: new Date(),
      }, { merge: true });

    // 4. Update core user object for fast access (Dashboard optimization)
    await adminDb.collection('users').doc(uid).set({
      connections: {
        youtube: {
          connected: true,
          channelName: channelInfo.title,
          thumbnail: channelInfo.thumbnail,
          subscriberCount: channelInfo.subscriberCount,
          updatedAt: new Date()
        }
      }
    }, { merge: true });

    const redirectHost = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const redirectProtocol = req.headers.get('x-forwarded-proto') || (redirectHost?.includes('localhost') ? 'http' : 'https');
    return NextResponse.redirect(`${redirectProtocol}://${redirectHost}/dashboard?youtube=success`);

  } catch (error) {
    console.error('YouTube Auth Callback Error:', error);
    return new NextResponse('Failed to connect YouTube', { status: 500 });
  }
}
