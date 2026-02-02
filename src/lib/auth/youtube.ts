import { google } from 'googleapis';
import { getStandardRedirectUri } from './utils';

const YOUTUBE_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;

export function getYouTubeOAuthClient(baseUrl?: string) {
  const REDIRECT_URI = getStandardRedirectUri('youtube', baseUrl);
  
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
