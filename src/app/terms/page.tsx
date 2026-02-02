'use client';

import Link from 'next/link';
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

        <h1 className="text-4xl font-black text-slate-900 mb-2">Terms of Service</h1>
        <p className="text-slate-400 mb-8">Effective Date: February 2, 2026</p>
        
        <div className="space-y-8 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">1. Acceptance of Terms</h2>
            <p>By registering for or using Bronco Agent (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you are using the Service on behalf of an organization, you are agreeing to these Terms for that organization and representing that you have the authority to bind that organization.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">2. Description of Service</h2>
            <p>Bronco Agent provides AI-driven automation tools for social media management. The Service facilitates content creation and distribution through third-party platforms. You acknowledge that Bronco Agent is an independent entity and not affiliated with TikTok, YouTube, or Meta.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">3. Dependency on Third-Party APIs</h2>
            <p>Our Service interacts with TikTok, YouTube, and Meta via their official APIs. You agree to comply with the terms of these third-party platforms:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1 text-sm">
              <li><Link href="https://www.tiktok.com/legal/terms-of-service" className="text-amber-600 hover:underline">TikTok Terms of Service</Link></li>
              <li><Link href="https://www.youtube.com/t/terms" className="text-amber-600 hover:underline">YouTube Terms of Service</Link></li>
              <li><Link href="https://www.facebook.com/terms.php" className="text-amber-600 hover:underline">Meta Terms of Service</Link></li>
            </ul>
            <p className="mt-4">Any changes or restrictions imposed by these third parties may affect the functionality of our Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">4. Content Ownership & Responsibility</h2>
            <p>You retain ownership of the content you provide. However, you are solely responsible for ensuring that the content follows all applicable laws and the community guidelines of the platforms where it is published. We reserve the right to suspend accounts that engage in illegal or harmful activities.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">5. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Bronco Agent shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, resulting from your use of the Service or third-party platform actions.</p>
          </section>

          <footer className="pt-12 border-t border-slate-100 text-sm text-slate-400">
            Questions? Contact us at: specail6247@gmail.com
          </footer>
        </div>
      </div>
    </main>
  );
}
