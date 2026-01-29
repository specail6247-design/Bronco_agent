'use client';

import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button, GlassCard } from '@/components/ui';
import ClientOnly from '@/components/ClientOnly';

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <ClientOnly>
      <main className="min-h-screen p-6 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <Button 
            variant="ghost" 
            size="sm" 
            icon={<ChevronLeft size={18} />}
            onClick={() => router.back()}
            className="mb-6"
          >
            <span>Back</span>
          </Button>

          <GlassCard className="p-8 md:p-12">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">Privacy Policy</h1>
            
            <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
              <section>
                <h2 className="text-xl font-semibold text-slate-800 mb-3">1. Data Collection</h2>
                <p>We collect information necessary to provide our automation services, including your TikTok account ID and OAuth tokens when you choose to connect your account.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800 mb-3">2. How We Use Data</h2>
                <p>Your authentication tokens are used exclusively to upload and publish videos you approve within the Bronco Agent dashboard. We do not access your private messages or personal feed data.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800 mb-3">3. Data Sharing</h2>
                <p>We do not sell your personal data to third parties. Data is only shared with platform providers (like TikTok) to perform the requested automated actions.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800 mb-3">4. Security</h2>
                <p>We implement industry-standard security measures to protect your access tokens and account information from unauthorized access.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800 mb-3">5. Data Retention</h2>
                <p>You can revoke access to your TikTok account at any time through our dashboard or TikTok settings, which will immediately delete all stored tokens from our server.</p>
              </section>

              <p className="text-sm text-slate-400 mt-12">Last Updated: January 29, 2026</p>
            </div>
          </GlassCard>
        </div>
      </main>
    </ClientOnly>
  );
}
