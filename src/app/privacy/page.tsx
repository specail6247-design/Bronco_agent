'use client';

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

        <h1 className="text-4xl font-black text-slate-900 mb-8">Privacy Policy</h1>
        
        <div className="space-y-8 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">1. Data We Collect</h2>
            <p>We collect information necessary to provide our automation services, including social media account identifiers (via OAuth), email addresses, and agent-generated content metadata.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">2. Integration with Third-Parties</h2>
            <p>Our service integrates with TikTok, YouTube, and Meta APIs. When you connect these accounts, we process authorized data to fulfill your requests (e.g., uploading videos, fetching channel statistics).</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">3. Data Security</h2>
            <p>All sensitive credentials (like OAuth tokens) are stored securely using Firebase encryption and high-level security protocols. We do not sell your personal data to third parties.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">4. Your Rights</h2>
            <p>You can revoke access to your social media accounts at any time through the Bronco dashboard or directly via the third-party platform's security settings.</p>
          </section>

          <footer className="pt-12 border-t border-slate-100 text-sm text-slate-400">
            Last Updated: January 30, 2026
          </footer>
        </div>
      </div>
    </main>
  );
}
