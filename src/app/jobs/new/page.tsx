'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Globe, 
  Share2, 
  MessageSquare, 
  ChevronLeft,
  Sparkles
} from 'lucide-react';
import { GlassCard, Button, Input, Select, Textarea } from '@/components/ui';
import { Platform } from '@/types';
import ClientOnly from '@/components/ClientOnly';

import { getCurrentUser } from '@/lib/firebase/auth';

const availablePlatforms: { id: Platform; label: string }[] = [
  { id: 'youtube', label: 'YouTube' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'threads', label: 'Threads' },
  { id: 'reddit', label: 'Reddit' },
  { id: 'x', label: 'X' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'facebook', label: 'Facebook' },
];

const languages = [
  { value: 'en', label: 'English' },
  { value: 'ko', label: 'Korean' },
  { value: 'ja', label: 'Japanese' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
];

export default function NewJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState('');
  const [platforms, setPlatforms] = useState<Platform[]>(['youtube']); // default
  const [languageMode, setLanguageMode] = useState<'auto' | 'manual'>('auto');
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  const togglePlatform = (platform: Platform) => {
    setPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (platforms.length === 0) return;
    setLoading(true);

    try {
      const user = getCurrentUser();
      const [year, month, day] = scheduledDate.split('-').map(Number);
      const [hour, minute] = scheduledTime.split(':').map(Number);
      const dateObj = new Date(year, month - 1, day, hour, minute);
      
      const scheduledAt = isNaN(dateObj.getTime()) ? new Date().toISOString() : dateObj.toISOString();

      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          platforms,
          languageMode,
          preferredLanguage: languageMode === 'manual' ? preferredLanguage : undefined,
          scheduledAt,
          userId: user?.uid || 'user1',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/jobs/${data.id}`);
      } else {
        const errText = await res.text();
        console.error('Failed to create job:', errText);
        alert('Failed to schedule job. Please check your inputs.');
      }
    } catch (error) {
      console.error('Error during job creation:', error);
      alert('System error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ClientOnly>
      <main 
        className="min-h-screen p-6 pb-12 notranslate"
        translate="no"
        suppressHydrationWarning={true}
      >
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="ghost" 
              size="sm"
              icon={<ChevronLeft size={18} />}
              onClick={() => router.push('/dashboard')}
              disableMotion
            >
              <span>Back</span>
            </Button>
            <h1 className="heading-display text-2xl text-slate-800">
              <span>Schedule New Content</span>
            </h1>
          </div>

          <form onSubmit={handleSubmit}>
            <GlassCard className="p-8 space-y-8" disableMotion>
              {/* Topic Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                    <Sparkles size={20} />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-700">
                    <span>What's the topic?</span>
                  </h2>
                </div>
                <Input
                  placeholder="e.g. 5 AI tools every digital nomad needs in 2024"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                  className="text-lg"
                  disableMotion
                />
                <p className="mt-2 text-sm text-slate-500">
                  <span>Be specific. Step 1 (Jessica) will research trending angles based on this.</span>
                </p>
              </div>

              {/* Platforms Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <Share2 size={20} />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-700">
                    <span>Target Platforms</span>
                  </h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {availablePlatforms.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePlatform(p.id)}
                      className={`
                        px-4 py-2 rounded-xl text-sm font-medium transition-all
                        ${platforms.includes(p.id) 
                          ? 'bg-slate-800 text-white shadow-md' 
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}
                      `}
                    >
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
                {platforms.length === 0 && (
                  <p className="mt-2 text-sm text-red-500">
                    <span>Select at least one platform</span>
                  </p>
                )}
              </div>

              {/* Language Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                    <Globe size={20} />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-700">
                    <span>Language</span>
                  </h2>
                </div>
                <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="langMode" 
                      checked={languageMode === 'auto'}
                      onChange={() => setLanguageMode('auto')}
                      className="accent-amber-500"
                    />
                    <span className="text-slate-700">Auto (Best fit)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="langMode" 
                      checked={languageMode === 'manual'}
                      onChange={() => setLanguageMode('manual')}
                      className="accent-amber-500"
                    />
                    <span className="text-slate-700">Manual Selection</span>
                  </label>
                </div>
                
                {languageMode === 'manual' && (
                  <div>
                    <Select
                      options={languages}
                      value={preferredLanguage}
                      onChange={(e) => setPreferredLanguage(e.target.value)}
                      className="max-w-xs"
                    />
                  </div>
                )}
              </div>

              {/* Schedule Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                    <Calendar size={20} />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-700">
                    <span>Schedule Launch</span>
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-4 max-w-md">
                  <Input
                    type="date"
                    label="Date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    required
                    disableMotion
                  />
                  <Input
                    type="time"
                    label="Time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    required
                    disableMotion
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="pt-4 border-t border-slate-200 flex justify-end">
                <Button 
                  type="submit" 
                  loading={loading}
                  disabled={platforms.length === 0}
                  size="lg"
                  icon={<Sparkles size={18} />}
                  disableMotion
                >
                  <span>Schedule Job</span>
                </Button>
              </div>
            </GlassCard>
          </form>
        </div>
      </main>
    </ClientOnly>
  );
}
