import { google } from 'googleapis';

const YOUTUBE_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;
const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const REDIRECT_URI = `${NEXT_PUBLIC_APP_URL}/api/auth/callback/youtube`;

export function getYouTubeOAuthClient() {
  return new google.auth.OAuth2(
    YOUTUBE_CLIENT_ID,
    YOUTUBE_CLIENT_SECRET,
    REDIRECT_URI
  );
}

// 유튜브 업로드를 위해 필요한 권한(Scopes)
export const YOUTUBE_SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];
