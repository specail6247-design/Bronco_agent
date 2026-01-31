// User Roles
export type UserRole = 'OWNER' | 'MEMBER';

// Job States
export type JobState = 
  | 'SCHEDULED' 
  | 'RUNNING' 
  | 'NEED_APPROVAL' 
  | 'PUBLISHING' 
  | 'QA' 
  | 'REPORT' 
  | 'DONE'
  | 'PAUSED'
  | 'FAILED';

// Step States
export type StepState = 'WAITING' | 'WORKING' | 'DONE' | 'FAILED';

// Supported Platforms
export type Platform = 
  | 'youtube' 
  | 'tiktok' 
  | 'instagram' 
  | 'threads' 
  | 'reddit' 
  | 'x' 
  | 'linkedin' 
  | 'facebook';

// Agent Names
export type AgentName = 
  | 'jessica' 
  | 'sunny' 
  | 'rovert' 
  | 'tim' 
  | 'david' 
  | 'john';

// Artifact Types
export type ArtifactType = 
  | 'research' 
  | 'script' 
  | 'storyboard' 
  | 'upload_package' 
  | 'qa' 
  | 'report';

// Language Mode
export type LanguageMode = 'auto' | 'manual';

// Ikigai Axes
export type IkigaiAxis = 'LOVE' | 'SKILL' | 'NEED' | 'PAID';

// ============ Data Models ============

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  allowedAgents: AgentName[];
  expiryAt: Date | null;
  connections?: {
    [platform: string]: {
      connected: boolean;
      email?: string;
      channelName?: string;
      thumbnail?: string;
      subscriberCount?: string;
      updatedAt: any;
    }
  };
  inviteKeyId?: string;
  createdAt: Date;
  lastActiveAt?: Date;
}

export interface InviteKey {
  id: string;
  keyHash: string; // SHA-256 hash, never store raw
  expiryAt: Date;
  allowedAgentCount: number;
  allowedAgents?: AgentName[];
  maxUses: number;
  usedCount: number;
  createdAt: Date;
  revokedAt?: Date;
}

export interface Job {
  id: string;
  ownerId: string;
  topic: string;
  languageMode: LanguageMode;
  preferredLanguage?: string;
  platforms: Platform[];
  scheduledAt: Date;
  state: JobState;
  retryCount: number;
  ikigaiScores?: IkigaiScores;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobStep {
  id: string;
  jobId: string;
  stepName: AgentName;
  state: StepState;
  startedAt?: Date;
  finishedAt?: Date;
  errorLog?: string;
}

export interface Artifact {
  id: string;
  jobId: string;
  stepName: AgentName;
  type: ArtifactType;
  contentJson: Record<string, unknown>;
  createdAt: Date;
}

export interface PlatformPost {
  id: string;
  jobId: string;
  platform: Platform;
  postId?: string;
  url?: string;
  publishStatus: 'pending' | 'published' | 'failed';
  verifiedStatus?: 'pending' | 'verified' | 'failed';
  createdAt: Date;
}

export interface MetricsSnapshot {
  id: string;
  platformPostId: string;
  capturedAt: Date;
  metricsJson: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    watchTimeSeconds?: number;
    retentionPercent?: number;
  };
}

export interface AuditEvent {
  id: string;
  actorUserId: string;
  action: string;
  targetId?: string;
  metadataJson?: Record<string, unknown>;
  createdAt: Date;
}

export interface IkigaiScores {
  love: number;
  skill: number;
  need: number;
  paid: number;
  isBalanced: boolean;
}

// ============ API Request/Response Types ============

export interface SignupRequest {
  email: string;
  password: string;
  name?: string;
  inviteKey: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateJobRequest {
  topic: string;
  languageMode: LanguageMode;
  preferredLanguage?: string;
  platforms: Platform[];
  scheduledAt: string; // ISO date string
}

export interface CreateInviteKeyRequest {
  expiryDays: number;
  allowedAgentCount: number;
  allowedAgents?: AgentName[];
  maxUses?: number;
}

export interface CreateInviteKeyResponse {
  rawKey: string; // Shown only once
  expiryAt: string;
}

// ============ Upload Package ============

export interface UploadPackage {
  jobId: string;
  script: string;
  subtitles: SubtitleEntry[];
  platforms: PlatformMetadata[];
  thumbnailUrl?: string;
  videoAssetUrl?: string;
}

export interface SubtitleEntry {
  startTime: number;
  endTime: number;
  text: string;
}

export interface PlatformMetadata {
  platform: Platform;
  title: string;
  description: string;
  hashtags: string[];
  customFields?: Record<string, string>;
}

// ============ Agent Interfaces ============

export interface AgentResult {
  success: boolean;
  artifactType: ArtifactType;
  content: Record<string, unknown>;
  error?: string;
}

export interface AgentContext {
  job: Job;
  previousArtifacts: Artifact[];
}
