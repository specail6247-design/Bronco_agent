# Bronco Agent: Full Development Walkthrough

This document tracks the end-to-end development of the **Bronco Agent** platform, an AI-powered "Shadow Workforce" for short-form video production and multi-platform distribution.

---

## 1. Project Phase: Foundation & Authentication

- **Tech Stack**: Next.js 14 (App Router), Firebase (Firestore/Auth), Vanilla CSS (Custom Design System).
- **Security**: Implemented an **Invite-only System** where users must provide a pre-authorized email or invite key.
- **Role Management**: Standard `MEMBER` (Jessica/Sunny only) vs `OWNER` (Full access to all 6 agents).

## 2. Project Phase: The Agent Workforce

We built 6 specialized autonomous agents that operate in a sequential pipeline:

1.  **Jessica (Strategy)**: Real-time market research using Serper.dev and internet access.
2.  **Sunny (Creative)**: Content scripting optimized for high retention.
3.  **Rovert (Director)**: Visual storyboarding and scene-by-scene direction.
4.  **Tim (Producer)**: Automated video rendering via **Shotstack API**.
5.  **David (Distribution)**: Multi-platform publishing and QA verification.
6.  **John (Analysis)**: Post-launch metrics tracking and performance reporting.

## 3. Project Phase: Multi-Platform OAuth Integration

Implemented OAuth 2.0 flows for seamless platform connections:

- **YouTube**: Google OAuth with `youtube.upload` and `youtube.readonly` scopes.
- **TikTok**: TikTok for Business API integration.
- **LinkedIn**: OAuth 2.0 with `w_member_social` permissions.
- **X (Twitter)**: OAuth 2.0 PKCE flow for secure cross-platform posting.
- **Meta (FB/IG)**: Graph API for business-connected profiles.
- **Reddit**: Script-based OAuth for targeted community posting.

## 4. Project Phase: Real-time Activity Monitoring

- **Thinking Engine**: Integrated a live "Activity Log" where users can see agent's internal thoughts and actions.
- **Live Sync**: Implemented a polling system in the dashboard to reflect real-time progress (WAITING -> WORKING -> DONE).
- **Simulation Mode**: Added an "Advance Step" feature to dry-run the pipeline with mock artifacts while generating real logs.

---

## 5. Platform-Specific Challenges (애로사항 리스트)

During development, each platform presented unique technical hurdles:

### **YouTube (Google API)**

- **Quota Limits**: The default daily quota for video uploads is extremely low (approx. 6 videos/day). Upgrading requires a formal audit.
- **Verification Gate**: Without manual verification, the app is limited to 100 users and shows a "Danger" warning page.

### **TikTok**

- **Access Token Lifespan**: Tokens expire every 24 hours, requiring a robust `refresh_token` rotation system.
- **Video Processing delay**: Uploaded videos take 10-20 seconds to be "processed" before they are visible, requiring polling logic for QA (David).

### **LinkedIn**

- **Strict Redirect URLs**: LinkedIn OAuth is highly sensitive to trailing slashes and port numbers; any mismatch immediately kills the handshake.
- **Asset Registration**: You cannot simply upload; you must first register a "media asset," get a signed URL, upload, and then finalized the post.

### **Meta (Instagram/Facebook)**

- **Business Link Requirement**: Posting only works if the Instagram account is converted to a "Professional/Business" account and linked to a Facebook Page.
- **Review Process**: Most publishing permissions require a "Live App" status, which requires submitting a screencast to Meta reviewers.

### **X (Twitter)**

- **API Cost**: Basic write access is now locked behind the "Basic" tier ($100/mo), making free-tier testing for posting impossible without a paid developer account.
- **Media V2**: The transition from V1.1 to V2 media upload is inconsistent, requiring specific header handling for chunked uploads.

### **Reddit**

- **Rate Limits**: Reddit is notably aggressive with rate-limiting bot-like behavior. We had to implement "sleep" intervals between posts.
- **Karma Barriers**: Some communities (subreddits) block posts from new "bronco" profiles until they have sufficient karma.

---

## 6. Final Status & Backup

- **Production Server**: Deployed and operational on Vercel.
- **Codebase**: Fully backed up to GitHub `main` branch.
- **API Keys**: Managed via secure `.env` variables (Serper, Gemini, Firebase, Shotstack).

**Project Lead Agent**: Antigravity (Google Deepmind)
**Status**: Ready for Automated Scaling.
