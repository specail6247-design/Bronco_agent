'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-50 py-20 px-6 font-primary">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 p-10 md:p-16">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.back()} 
          className="mb-8 -ml-4"
        >
          <ChevronLeft size={20} className="mr-2" /> Back
        </Button>

        <h1 className="text-4xl font-black text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-slate-400 mb-8">Effective Date: February 2, 2026</p>
        
        <div className="space-y-8 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">1. Data Collection</h2>
            <p>At Bronco Agent, we collect information to provide a better experience to all our users. We collect:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>Account Information:</strong> Name, email address, and profile data when you register.</li>
              <li><strong>Connected Accounts:</strong> When you connect TikTok, YouTube, or Meta accounts, we collect authorized identifiers and tokens via OAuth.</li>
              <li><strong>Usage Data:</strong> Metadata related to the content you generate and publish through our agents.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">2. How We Use Data</h2>
            <p>We use the collected data to:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Enable the automation and scheduling features of our AI agents.</li>
              <li>Facilitate content uploading and management on your behalf via official APIs.</li>
              <li>Maintain and improve our service security and performance.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">3. Third-Party Integrations</h2>
            <p>Our service relies on integrations with Third-Party platforms:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>TikTok:</strong> We use TikTok for Developers API to publish videos. <Link href="https://www.tiktok.com/legal/privacy-policy" className="text-amber-600 hover:underline">TikTok Privacy Policy</Link>.</li>
              <li><strong>YouTube:</strong> We use YouTube API Services. <Link href="https://www.google.com/policies/privacy" className="text-amber-600 hover:underline">Google Privacy Policy</Link>.</li>
              <li><strong>Meta (Facebook/Instagram):</strong> We use Meta Graph API for scheduling. <Link href="https://www.facebook.com/policy.php" className="text-amber-600 hover:underline">Meta Privacy Policy</Link>.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">4. Data Security & Storage</h2>
            <p>We implement robust security measures to protect your data. OAuth tokens are encrypted and stored in secure Firebase environments. We do NOT share or sell your personal information or connected account data to third parties for marketing purposes.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">5. Data Deletion & Revocation</h2>
            <p>You can disconnect your social media accounts at any time through our dashboard. You may also request total account deletion by contacting us at support@bronco-agent.com. Additionally, you can revoke access via the respective platform&apos;s security settings (e.g., Google Security settings, TikTok app settings).</p>
          </section>

          <footer className="pt-12 border-t border-slate-100 text-sm text-slate-400">
            For any privacy-related inquiries, please contact: specail6247@gmail.com
          </footer>
        </div>
      </div>
    </main>
  );
}
