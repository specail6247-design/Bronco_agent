'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Zap } from 'lucide-react';
import { GlassCard, Button, Input } from '@/components/ui';
import { signIn } from '@/lib/firebase/auth';
import ClientOnly from '@/components/ClientOnly';
import Footer from '@/components/Footer';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else if (error.code === 'auth/invalid-credential') {
        setError('Invalid credentials. Please check your email and password.');
      } else {
        setError(error.message || 'An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ClientOnly>
      <main 
        className="min-h-screen flex items-center justify-center p-6 notranslate"
        translate="no"
        suppressHydrationWarning={true}
      >
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 mb-4">
              <Zap size={32} className="text-white" />
            </div>
            <h1 className="heading-display text-3xl text-slate-800 mb-2">
              Welcome back
            </h1>
            <p className="text-slate-600">
              Sign in to your Bronco account
            </p>
          </div>

          {/* Login Form */}
          <GlassCard className="p-8" disableMotion>
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail size={18} />}
                required
                autoComplete="email"
                disableMotion
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock size={18} />}
                required
                autoComplete="current-password"
                disableMotion
              />

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  {error}
                </div>
              )}

              <Button type="submit" loading={loading} className="w-full" disableMotion>
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-600">
              Don&apos;t have an account?{' '}
              <Link 
                href="/signup" 
                className="text-amber-600 font-medium hover:text-amber-700 transition-colors"
              >
                Sign up
              </Link>
            </div>
          </GlassCard>

          <Footer />
        </div>
      </main>
    </ClientOnly>
  );
}
