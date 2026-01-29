'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import ClientOnly from '@/components/ClientOnly';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in, redirect accordingly
    const timer = setTimeout(() => {
      router.push('/login');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <ClientOnly>
      <main 
        className="min-h-screen flex items-center justify-center p-6 notranslate"
        translate="no"
        suppressHydrationWarning={true}
      >
        <div className="text-center">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 mb-6">
            <Zap size={40} className="text-white" />
          </div>

          <h1 className="heading-display text-4xl md:text-5xl text-slate-800 mb-4">
            <span>Bronco</span>
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            <span>Digital Nomad Agent Team</span>
          </p>

          {/* Loading indicator */}
          <div className="flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </main>
    </ClientOnly>
  );
}
