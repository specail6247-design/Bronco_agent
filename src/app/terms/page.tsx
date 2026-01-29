'use client';

import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button, GlassCard } from '@/components/ui';
import ClientOnly from '@/components/ClientOnly';

export default function TermsPage() {
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
            <h1 className="text-3xl font-bold text-slate-900 mb-8">Terms of Service</h1>
            
            <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
              <section>
                <h2 className="text-xl font-semibold text-slate-800 mb-3">1. Acceptance of Terms</h2>
                <p>Welcome to Bronco Agent. By accessing our website and using our automated content distribution services, you agree to be bound by these Terms of Service.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800 mb-3">2. Service Description</h2>
                <p>Bronco Agent provides AI-driven content creation and automated distribution tools for social media platforms including TikTok. We facilitate video uploads and publishing on behalf of the user via official APIs.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800 mb-3">3. User Responsibilities</h2>
                <p>You are responsible for the content uploaded through our service. You must comply with TikTok's Community Guidelines and ensure you have the necessary rights to the content you publish.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800 mb-3">4. Intellectual Property</h2>
                <p>You retain all ownership rights to your content. Bronco Agent retains all rights to its software, branding, and proprietary algorithms.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800 mb-3">5. Disclaimer</h2>
                <p>The service is provided "as is". We do not guarantee that the automated distribution will result in specific engagement metrics or that the service will be uninterrupted.</p>
              </section>

              <p className="text-sm text-slate-400 mt-12">Last Updated: January 29, 2026</p>
            </div>
          </GlassCard>
        </div>
      </main>
    </ClientOnly>
  );
}
