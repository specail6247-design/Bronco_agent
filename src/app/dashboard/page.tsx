'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Calendar, 
  Clock, 
  LogOut, 
  Settings, 
  Zap,
  ChevronRight
} from 'lucide-react';
import { 
  GlassCard, 
  LabelCard, 
  Button, 
  AgentBannerGrid,
} from '@/components/ui';
import { ActivityLog } from '@/components/ui/ActivityLog';
import { signOut, onAuthChange } from '@/lib/firebase/auth';
import type { Job, User, AgentName, StepState } from '@/types';
import ClientOnly from '@/components/ClientOnly';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Agent Activity Log State
  const [activeAgentLog, setActiveAgentLog] = useState<AgentName | null>(null);
  const [agentStatuses, setAgentStatuses] = useState<Record<AgentName, StepState>>({
    jessica: 'DONE',
    sunny: 'WORKING',
    rovert: 'WAITING',
    tim: 'WAITING',
    david: 'WAITING',
    john: 'WAITING',
  });

  useEffect(() => {
    // ... mock data logic ...
    const mockJobsData: Job[] = [
      {
        id: '1',
        ownerId: 'user1',
        topic: 'AI Productivity Tools for Digital Nomads',
        languageMode: 'auto',
        platforms: ['youtube', 'tiktok', 'instagram'],
        scheduledAt: new Date(Date.now() + 86400000),
        state: 'SCHEDULED',
        retryCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        ownerId: 'user1',
        topic: 'Remote Work Setup Guide 2024',
        languageMode: 'manual',
        preferredLanguage: 'ko',
        platforms: ['youtube', 'threads'],
        scheduledAt: new Date(Date.now() - 3600000),
        state: 'RUNNING',
        retryCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    setJobs(mockJobsData);

    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (!firebaseUser) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch(`/api/auth/me?uid=${firebaseUser.uid}`);
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          // Fallback if DB sync not ready
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            role: 'MEMBER',
            allowedAgents: ['jessica', 'sunny'],
            expiryAt: null,
            createdAt: new Date(),
          });
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const formatScheduleTime = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStateColor = (state: Job['state']) => {
    switch (state) {
      case 'SCHEDULED': return 'bg-slate-100 text-slate-700';
      case 'RUNNING': return 'bg-amber-100 text-amber-700';
      case 'NEED_APPROVAL': return 'bg-purple-100 text-purple-700';
      case 'DONE': return 'bg-emerald-100 text-emerald-700';
      case 'FAILED': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <ClientOnly>
      <main 
        className="min-h-screen pb-12 notranslate" 
        translate="no" 
        suppressHydrationWarning={true}
      >
        <div className="contents">
        {loading ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
              <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse delay-75" />
              <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse delay-150" />
            </div>
          </div>
        ) : (
          <>
            <header className="sticky top-0 z-50 bg-cream-50/80 backdrop-blur-lg border-b border-cream-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                      <Zap size={20} className="text-white" />
                    </div>
                    <div>
                      <h1 className="heading-display text-xl text-slate-800">
                        <span>Bronco</span>
                      </h1>
                      <p className="text-xs text-slate-500">
                        <span>Digital Nomad Agent Team</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {(user?.role === 'OWNER' || user?.email === 'specail6247@gmail.com') && (
                      <Button
                        variant="ghost"
                        icon={<Settings size={18} />}
                        onClick={() => router.push('/admin')}
                      >
                        <span className="hidden sm:inline">Admin</span>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      icon={<LogOut size={18} />}
                      onClick={handleSignOut}
                    >
                      <span className="hidden sm:inline">Sign Out</span>
                    </Button>
                  </div>
                </div>
              </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="mb-8">
                <h2 className="heading-display text-2xl sm:text-3xl text-slate-800 mb-2">
                  <span>Welcome back</span>
                  {user?.email && (
                    <span className="ml-1">
                      {`, ${user.email.split('@')[0]}`}
                    </span>
                  )}
                  <span>! 👋</span>
                </h2>
                <p className="text-slate-600">
                  <span>Your 6-agent team is ready to create amazing content.</span>
                </p>
              </div>

              <section className="mb-12">
                <h3 className="heading-display text-lg text-slate-700 mb-4">
                  <span>Agent Team Status</span>
                </h3>
                <AgentBannerGrid 
                  statuses={agentStatuses}
                  onAgentClick={(agent) => setActiveAgentLog(agent)}
                />
              </section>

              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="heading-display text-lg text-slate-700">
                    <span>Scheduled Jobs</span>
                  </h3>
                  <Button
                    icon={<Plus size={18} />}
                    onClick={() => router.push('/jobs/new')}
                  >
                    <span>New Job</span>
                  </Button>
                </div>

                {jobs.length === 0 ? (
                  <GlassCard className="text-center py-12">
                    <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
                    <h4 className="text-lg font-medium text-slate-700 mb-2">
                      <span>No jobs scheduled</span>
                    </h4>
                    <p className="text-slate-500 mb-6">
                      <span>Create your first content job to get started.</span>
                    </p>
                    <Button
                      icon={<Plus size={18} />}
                      onClick={() => router.push('/jobs/new')}
                    >
                      <span>Create Job</span>
                    </Button>
                  </GlassCard>
                ) : (
                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <div key={job.id}>
                        <LabelCard
                          className="cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() => router.push(`/jobs/${job.id}`)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStateColor(job.state)}`}>
                                  <span>{job.state.replace('_', ' ')}</span>
                                </span>
                                {job.languageMode === 'manual' && job.preferredLanguage && (
                                  <span className="px-2 py-0.5 rounded bg-slate-100 text-xs text-slate-600">
                                    <span>{job.preferredLanguage.toUpperCase()}</span>
                                  </span>
                                )}
                              </div>
                              <h4 className="font-medium text-slate-800 mb-1 truncate">
                                <span>{job.topic}</span>
                              </h4>
                              <div className="flex items-center gap-4 text-sm text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Clock size={14} />
                                  <span>{formatScheduleTime(job.scheduledAt)}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <span>{job.platforms.length}</span>
                                  <span> platforms</span>
                                </span>
                              </div>
                            </div>
                            <ChevronRight size={20} className="text-slate-400 flex-shrink-0" />
                          </div>
                        </LabelCard>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
            
            {/* Agent Activity Overlay */}
            {activeAgentLog && (
              <ActivityLog 
                agentName={activeAgentLog}
                isOpen={!!activeAgentLog}
                onClose={() => setActiveAgentLog(null)}
                status={agentStatuses[activeAgentLog]}
              />
            )}
          </>
        )}
        </div>
      </main>
    </ClientOnly>
  );
}
