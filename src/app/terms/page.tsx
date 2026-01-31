'use client';

import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';

export default function TermsPage() {
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

        <h1 className="text-4xl font-black text-slate-900 mb-8">Terms of Service</h1>
        
        <div className="space-y-8 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">1. Acceptance of Terms</h2>
            <p>By accessing and using Bronco Agent (the "Service"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">2. Description of Service</h2>
            <p>Bronco Agent provides AI-driven content automation tools for social media platforms including YouTube, TikTok, and Meta. We act as an intermediary agent to help you manage your digital presence.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">3. User Responsibilities</h2>
            <p>You are responsible for the content you generate and publish through our agents. You must comply with the community guidelines and terms of the respective third-party platforms (TikTok, YouTube, etc.).</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">4. Limitation of Liability</h2>
            <p>Bronco Agent is provided "as is". We are not liable for any actions taken by third-party platforms regarding your account or content.</p>
          </section>

          <footer className="pt-12 border-t border-slate-100 text-sm text-slate-400">
            Last Updated: January 30, 2026
          </footer>
        </div>
      </div>
    </main>
  );
}
