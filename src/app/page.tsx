'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthChange } from '@/lib/firebase/auth';

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Instant auth check for maximum speed
    const unsubscribe = onAuthChange((user) => {
      if (user) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (!mounted) return null;

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-6">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(251,191,36,0.2)]" />
        <div className="text-amber-400/40 font-black tracking-[0.3em] text-[10px] uppercase animate-pulse">
          Bronco Pipeline Initializing
        </div>
      </div>
    </main>
  );
}
