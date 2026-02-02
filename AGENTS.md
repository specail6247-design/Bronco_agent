# Bronco Agent Intelligence & Rules (AGENTS.md)

## 📋 Current Project Status

- **Phase**: 5 (Stabilized Deployment)
- **Primary Domain**: `https://bronco-agent.vercel.app`
- **Stable Version**: `v1.0.3-FEB03-P5`

## 🧠 Core Memory (DO NOT FORGET)

1.  **OAuth Redirect URI**: Use only `https://bronco-agent.vercel.app/api/auth/callback/youtube` for production. Do NOT use dynamic request host headers for the final URI as it mismatches with Google Cloud Console.
2.  **Dashboard Reactivity**: The Dashboard uses `useSearchParams` and a `cache-busting` timestamp (`t=${Date.now()}`) to fetch `/api/auth/me`. This ensures the 'Sync Active' status is always fresh.
3.  **Social Platforms**: YouTube, TikTok, and Meta use the _legacy_ path `/api/auth/callback/[platform]`. X, LinkedIn, and Reddit use the _standard_ path `/api/auth/[platform]/callback`.

## 🚫 Critical Rules (To Avoid Errors)

1.  **No Double Jobs**: Before creating any new automated tasks or agent processes, check the `jobs` collection in Firestore. DO NOT spawn duplicate pipelines for the same topic/timestamp.
2.  **No Identity Loss**: Always check `isOwner()` in `lib/config.ts` before restricting UI elements. The user (specail6247@gmail.com) is the OWNER and must have access to all 6 agents.
3.  **No Redundant Patching**: If a `redirect_uri_mismatch` occurs, check the Google Cloud Console first. The code is already optimized to send the correct URI registered there.

## 🛠️ Tech Stack Truths

- **Frontend**: Next.js (App Router), Tailwind CSS, Framer Motion.
- **Backend**: Next.js API Routes, Firebase Admin SDK.
- **Auth**: Firebase Auth + Custom OAuth Handlers (lib/auth).
- **Deployment**: Vercel.

---

**Last Updated**: 2026-02-03 02:45 AM
**Commit Hash**: See `git log -n 1`
