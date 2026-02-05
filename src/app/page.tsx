'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthChange } from '@/lib/firebase/auth';
import { Button } from '@/components/ui';
import { Zap, ShieldCheck, Rocket, Globe } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const unsubscribe = onAuthChange((user) => {
      if (user) {
        router.replace('/dashboard');
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (!mounted) return null;

  if (loading) {
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

  return (
    <main className="min-h-screen bg-slate-950 text-white overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-amber-400/10 blur-[120px] rounded-full opacity-50 pointer-events-none" />
      
      {/* Header */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-400/20">
            <Zap size={22} className="text-slate-900 fill-current" />
          </div>
          <h1 className="text-xl font-black tracking-tighter uppercase italic">Bronco</h1>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/privacy" className="text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest">Privacy</Link>
          <Link href="/terms" className="text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest">Terms</Link>
          <Button variant="primary" size="sm" onClick={() => router.push('/login')}>Login</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-40 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 mb-8 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">Autonomous Video Agent v1.0</span>
        </div>
        
        <h2 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-[1.1]">
          Automate Your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600">Viral Content Engine</span>
        </h2>
        
        <p className="max-w-2xl text-slate-400 text-lg md:text-xl font-medium mb-12 leading-relaxed">
          Unlock the power of 6 specialized AI agents to research, script, storyboard, 
          render, and publish high-performance videos directly to TikTok, YouTube, and X.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Button 
            className="px-12 py-7 text-lg rounded-2xl shadow-[0_20px_40px_-10px_rgba(251,191,36,0.3)]"
            onClick={() => router.push('/login')}
          >
            Start Your Pipeline
          </Button>
          <Button 
            variant="secondary" 
            className="px-12 py-7 text-lg rounded-2xl"
            onClick={() => window.open('https://github.com/specail6247/Bronco_agent', '_blank')}
          >
            Explore Source
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-40 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: <Rocket className="text-amber-400" />, title: "Agentic Workflow", desc: "Jessica to John: A complete autonomous pipeline from research to analytics." },
          { icon: <Globe className="text-amber-400" />, title: "Multi-Platform", desc: "One-click deployment to TikTok, YouTube, LinkedIn, and more." },
          { icon: <ShieldCheck className="text-amber-400" />, title: "Enterprise Grade", desc: "Secure OAuth 2.0 PKCE flows and invite-only team management." }
        ].map((feat, i) => (
          <div key={i} className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-amber-400/50 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              {feat.icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
            <p className="text-slate-400 leading-relaxed text-sm font-medium">{feat.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">© 2026 BRONCO AGENT. ALL RIGHTS RESERVED.</p>
          <div className="flex items-center gap-8">
            <Link href="/privacy" className="text-xs font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-[0.2em]">Privacy Policy</Link>
            <Link href="/terms" className="text-xs font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-[0.2em]">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
