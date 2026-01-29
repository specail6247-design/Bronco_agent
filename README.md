# Bronco - Digital Nomad Agent Team 🐴

**Bronco** is a mobile-first scheduling web app that automates your content creation pipeline using a team of 6 specialized AI agents.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Firebase Project
- Telegram Bot Token (optional for approval gate)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-repo/bronco.git
   cd bronco
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Copy `.env.example` to `.env.local` and fill in your keys.

   ```bash
   cp .env.example .env.local
   ```

   _Tip: You don't need real API keys for YouTube/TikTok for the MVP demo (stubs are included)._

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

### First Login (Owner Bootstrap)

The first account you create will automatically be assigned the **OWNER** role.

1. Go to `/signup`
2. Enter any 10-char invite key (it won't be validated for the very first user, or generate one in console if implemented strict check).
   _Wait, the strict check is implemented._
   **Workaround:** For the FIRST user, you might need to manually set the `OWNER_EMAIL` in `.env.local` to bypass the key check, or use the database console to create a key manually if strict validation is on.
   _Actually, the code allows `OWNER_EMAIL` in env to bypass._

   Ensure `OWNER_EMAIL=your@email.com` is set in `.env.local`.

---

## 🤖 The Agent Team

1. **Jessica** 🕵️‍♀️ - Research & Keyword Trends
2. **Sunny** ✍️ - Long-form Script Writer
3. **Rovert** 🎬 - Storyboard & Shot List
4. **Tim** 📤 - Upload Package & Metadata
   _(Approval Gate happens here)_
5. **David** ✅ - Post-publish QA
6. **John** 📈 - Performance Report

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Database**: Firebase Firestore
- **Auth**: Firebase Auth + Invite Key System

## 📁 Project Structure

- `/src/lib/pipeline` - Core agent logic
- `/src/lib/agents` - Agent implementations
- `/src/lib/adapters` - Platform integrations (YouTube, TikTok, etc.)
- `/src/app/admin` - Invite key & user management

## 🧪 Testing

Run unit tests:

```bash
npm run test
```
