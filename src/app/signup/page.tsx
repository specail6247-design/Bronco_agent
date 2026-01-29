'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Key, Zap } from 'lucide-react';
import { GlassCard, Button, Input } from '@/components/ui';
import { signUp } from '@/lib/firebase/auth';
import ClientOnly from '@/components/ClientOnly';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteKey, setInviteKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const didNavigateRef = useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      // First validate invite key via API
      const keyResponse = await fetch('/api/auth/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteKey }),
      });

      const keyData = await keyResponse.json();

      if (!keyResponse.ok) {
        setError(keyData.error || 'Invalid invite key');
        setLoading(false);
        return;
      }

      // Create Firebase auth user
      const user = await signUp(email, password);

      // Register user in our system
      const registerResponse = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          email,
          name,
          inviteKey,
        }),
      });

      if (!registerResponse.ok) {
        const regData = await registerResponse.json();
        setError(regData.error || 'Failed to complete registration');
        return;
      }

      didNavigateRef.current = true;
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === 'auth/email-already-in-use') {
        setError('This email is already registered');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak');
      } else {
        setError(error.message || 'An error occurred. Please try again.');
      }
    } finally {
      if (!didNavigateRef.current) {
        setLoading(false);
      }
    }
  };

  return (
    <ClientOnly>
      <main 
        className="min-h-screen flex items-center justify-center p-6 py-12 notranslate"
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
              Join Bronco
            </h1>
            <p className="text-slate-600">
              Create your account with an invite key
            </p>
          </div>

          {/* Signup Form */}
          <GlassCard className="p-8" disableMotion>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Invite Key"
                type="text"
                placeholder="ABCD1234XY"
                value={inviteKey}
                onChange={(e) => setInviteKey(e.target.value.toUpperCase())}
                icon={<Key size={18} />}
                required
                maxLength={10}
                hint="10-character key from your admin"
                disableMotion
              />

              <Input
                label="Full Name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={<User size={18} />}
                required
                autoComplete="name"
                disableMotion
              />

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
                autoComplete="new-password"
                hint="At least 8 characters"
                disableMotion
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                icon={<Lock size={18} />}
                required
                autoComplete="new-password"
                disableMotion
              />

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full mt-2" disableMotion>
              Create Account
            </Button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="text-amber-600 font-medium hover:text-amber-700 transition-colors"
              >
                Sign in
              </Link>
            </div>
          </GlassCard>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-slate-500">
            Need an invite key? Contact your team admin.
          </p>
        </div>
      </main>
    </ClientOnly>
  );
}
