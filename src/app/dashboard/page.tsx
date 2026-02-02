'use client';

import { useState, useEffect, useMemo, useCallback, type ReactNode, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Calendar, 
  LogOut, 
  Settings, 
  Zap,
  ChevronRight,
  Youtube,
  Instagram,
  Check,
  LayoutGrid,
  Hash,
  Facebook,
  Linkedin,
  MessageSquare,
  Moon,
  Sun,
  Trash2
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
import { CONFIG } from '@/lib/config';

// Premium Custom SVGs for Branding
const XLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const TikTokLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 448 512" fill="currentColor" className={className}>
    <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,448,109.91Z" />
  </svg>
);

const ThreadsLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M14.88 11.53c0 .81-.13 1.48-.39 2.01s-.63.93-1.11 1.2a3.81 3.81 0 0 1-1.84.4c-1 0-1.85-.36-2.54-1.07s-1.03-1.74-1.03-3.07.35-2.37 1.05-3.1 1.54-1.1 2.52-1.1c1.55 0 2.62.8 3.2 2.39h.06V7.08h1.03v7.35c0 1.23.27 2.15.82 2.76s1.39.92 2.51.92c.6 0 1.25-.13 1.95-.39v.93c-.63.22-1.28.33-1.95.33-1.46 0-2.6-.45-3.41-1.34s-1.21-2.18-1.21-3.87v-2.22zm-1.04-.03c0-1-.22-1.74-.65-2.22s-1-.72-1.7-.72-1.35.26-1.78.78-.65 1.3-.65 2.34.22 1.83.66 2.33 1.02.75 1.76.75 1.37-.25 1.8-.75.56-1.33.56-2.51zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
  </svg>
);

// Sub-components
function PlatformCard({ 
  name, 
  icon, 
  connected = false, 
  onClick, 
  onDisconnect,
  thumbnail,
  channelName
}: { 
  name: string, 
  icon: ReactNode, 
  connected?: boolean, 
  onClick?: () => void,
  onDisconnect?: () => void,
  thumbnail?: string,
  channelName?: string
}) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <GlassCard 
      className={`p-5 border border-slate-100 dark:border-slate-800/50 hover:border-amber-400 transitions-all group bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl hover:-translate-y-1 ${onClick && !connected ? 'cursor-pointer' : ''}`} 
      onClick={!connected ? onClick : undefined}
      hover={!connected}
      role={onClick && !connected ? 'button' : undefined}
      tabIndex={onClick && !connected ? 0 : undefined}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-xl shadow-inner flex items-center justify-center overflow-hidden flex-shrink-0 border border-slate-100 text-slate-900">
            {thumbnail ? (
              <img src={thumbnail} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="scale-110 flex items-center justify-center">
                {icon}
              </div>
            )}
          </div>
          <div className="overflow-hidden">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-lg tracking-tight truncate leading-tight">
              {channelName || name}
            </h4>
            {connected && (
              <p className="text-[11px] text-emerald-500 font-black uppercase tracking-[0.15em] mt-1.5 glow-emerald">
                Sync Active
              </p>
            )}
          </div>
        </div>
        
        {connected && (
          <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-lg">
            <Check size={14} className="text-white" strokeWidth={4} />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mt-2">
        {!connected ? (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
            className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-[11px] uppercase tracking-[0.25em] rounded-2xl shadow-[0_8px_20px_-6px_rgba(251,191,36,0.6)] hover:shadow-[0_12px_25px_-6px_rgba(251,191,36,0.8)] transform hover:-translate-y-1 active:translate-y-0.5 transition-all border-2 border-white/40 flex items-center justify-center"
          >
            Connect Now
          </button>
        ) : (
          <div className="flex w-full items-center justify-between px-1">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onClick?.();
              }}
              className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-slate-900 dark:text-slate-500 dark:hover:text-emerald-400 transition-all font-outfit"
            >
              Manage
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDisconnect?.();
              }}
              className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-all font-outfit"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    </GlassCard>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const ownerEmail = CONFIG.OWNER_EMAILS[0];
  
  const [activeAgentLog, setActiveAgentLog] = useState<AgentName | null>(null);
  const [agentStatuses, setAgentStatuses] = useState<Record<AgentName, StepState>>({
    jessica: 'WAITING',
    sunny: 'WAITING',
    rovert: 'WAITING',
    tim: 'WAITING',
    david: 'WAITING',
    john: 'WAITING',
  });
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Poll step statuses for the selected job
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!selectedJobId) return;

    const fetchStatuses = async () => {
      try {
        const res = await fetch(`/api/jobs/${selectedJobId}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.steps) {
            setAgentStatuses(prev => {
              const nextStatuses = { ...prev };
              let changed = false;
              data.steps.forEach((step: any) => {
                if (step?.stepName && nextStatuses[step.stepName as AgentName] !== step.state) {
                  nextStatuses[step.stepName as AgentName] = step.state || 'WAITING';
                  changed = true;
                }
              });
              return changed ? nextStatuses : prev;
            });
          }
        }
      } catch (err) {
        console.error('Status fetch error:', err);
      }
    };

    fetchStatuses();
    interval = setInterval(fetchStatuses, 5000);
    return () => clearInterval(interval);
  }, [selectedJobId]);

  // Automatically select the most recent job
  // Fix: Added strict ID check to prevent React Error #185 (Maximum update depth)
  useEffect(() => {
    if (jobs.length > 0 && !selectedJobId) {
      const firstJobId = jobs[0].id;
      if (firstJobId && typeof firstJobId === 'string') {
        setSelectedJobId(firstJobId);
      }
    }
  }, [jobs, selectedJobId]);

  const fetchJobs = useCallback(async (userIdStr?: string) => {
    try {
      const url = userIdStr ? `/api/jobs?userId=${userIdStr}` : '/api/jobs';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      }
    } catch (e) {
      console.error('Job fetch error:', e);
    }
  }, []);

  const buildFallbackUser = useCallback((firebaseUser: { uid: string; email?: string | null }) => {
    const email = firebaseUser.email || '';
    const isOwner = ownerEmail && email.toLowerCase() === ownerEmail.toLowerCase();
    return {
      id: firebaseUser.uid,
      email,
      role: isOwner ? 'OWNER' : 'MEMBER',
      allowedAgents: isOwner
        ? ['jessica', 'sunny', 'rovert', 'tim', 'david', 'john']
        : ['jessica', 'sunny'],
      expiryAt: null,
      createdAt: new Date(),
      connections: {}
    } as User;
  }, [ownerEmail]);

  useEffect(() => {
    setMounted(true);

    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (!firebaseUser) {
        router.push('/login');
        return;
      }

      try {
        // Optimization: Add a short timeout to prevent hang if API is slow
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500);

        const res = await fetch(`/api/auth/me?uid=${firebaseUser.uid}`, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setLoading(false);
          fetchJobs(firebaseUser.uid);
        } else {
          setUser(buildFallbackUser(firebaseUser));
          setLoading(false);
          fetchJobs(firebaseUser.uid);
        }
      } catch (e) {
        console.error('Auth sync error or timeout:', e);
        setUser(buildFallbackUser(firebaseUser));
        setLoading(false);
        if (firebaseUser?.uid) fetchJobs(firebaseUser.uid);
      }
    });

    return () => unsubscribe();
  }, [router, ownerEmail, buildFallbackUser, fetchJobs]);

  // Handle themes separate from auth to avoid race
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark');
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const handleDeleteJob = async (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation();
    if (!confirm('정말 이 프로젝트를 삭제하시겠습니까? 관련 모든 데이터가 사라집니다.')) return;

    try {
      const res = await fetch(`/api/jobs/${jobId}/delete`, { method: 'DELETE' });
      if (res.ok) {
        setJobs(jobs.filter(j => j.id !== jobId));
        if (selectedJobId === jobId) setSelectedJobId(null);
      } else {
        alert('삭제 실패');
      }
    } catch (err) {
      console.error(err);
      alert('삭제 중 오류 발생');
    }
  };

  const startOAuth = (path: string) => {
    if (!user?.id) {
      alert('Please sign in again to connect this platform.');
      return;
    }
    window.location.href = `${path}?uid=${user.id}`;
  };

  const handleDisconnectAction = async (platform: string) => {
    if (!user?.id) return;
    if (!confirm(`${platform} 연동을 해제하시겠습니까?`)) return;

    try {
      const res = await fetch('/api/auth/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.id, platform }),
      });

      if (res.ok) {
        const meRes = await fetch(`/api/auth/me?uid=${user.id}`);
        if (meRes.ok) {
          const data = await meRes.json();
          setUser(data.user);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Connected count memo
  const connectedCount = useMemo(() => {
    // For Demo: Add +2 for the hardcoded X and TikTok cards
    let count = 2; 
    if (!user || !user.connections) return count;
    const conns = user.connections;
    count += Object.keys(conns).filter(key => {
      if (key === 'x' || key === 'tiktok') return false; // Already counted in +2
      const c = (conns as any)[key];
      return c && (c.connected === true || c.accessToken);
    }).length;
    return count;
  }, [user]);

  if (!mounted) return null;

  return (
    <ClientOnly>
      <main className="min-h-screen pb-12 bg-white dark:bg-slate-950 transition-colors duration-500">
        {loading ? (
          <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950">
            <div className="w-12 h-12 border-4 border-slate-200 dark:border-slate-800 border-t-amber-400 rounded-full animate-spin shadow-xl" />
            <p className="mt-4 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 animate-pulse">Syncing Workforce</p>
          </div>
        ) : (
          <>
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800">
              <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-amber-400 flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform">
                    <Zap size={22} className="text-white dark:text-slate-900 fill-current" />
                  </div>
                  <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase flex items-center gap-2">
                    BRONCO
                    <span className="text-[9px] font-black bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 px-2 py-0.5 rounded-md tracking-normal normal-case">v1.0.3-FEB03-P5</span>
                  </h1>
                </div>

                <div className="flex items-center gap-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    icon={theme === 'light' ? <Moon size={20} /> : <Sun size={20} className="text-amber-400" />} 
                    onClick={toggleTheme}
                    className="w-10 h-10 p-0 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800"
                  />
                  {user?.role === 'OWNER' && (
                    <Button variant="ghost" size="sm" icon={<Settings size={18} />} onClick={() => router.push('/admin')} className="hidden sm:inline-flex">
                      Admin
                    </Button>
                  )}
                  <Button variant="secondary" size="sm" icon={<LogOut size={18} />} onClick={handleSignOut}>
                    Sign Out
                  </Button>
                </div>
              </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-10">
              <div className="mb-12">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                  Welcome, {user?.name || user?.email?.split('@')[0]}!
                </h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Your digital agent workforce is ready for the next campaign.</p>
              </div>

              {/* Platforms */}
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Social Multi-Channel Sync</h3>
                  <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-full text-[10px] font-black uppercase tracking-widest">{connectedCount} ACTIVE</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <PlatformCard 
                    name="YouTube" 
                    icon={<Youtube size={20} className="text-red-600" />} 
                    connected={!!(user?.connections?.youtube?.connected || (user?.connections as any)?.YouTube?.connected)} 
                    channelName={user?.connections?.youtube?.channelName || (user?.connections as any)?.YouTube?.channelName}
                    thumbnail={user?.connections?.youtube?.thumbnail || (user?.connections as any)?.YouTube?.thumbnail}
                    onClick={() => startOAuth('/api/auth/youtube/login')}
                  />
                  <PlatformCard 
                    name="X" 
                    icon={<XLogo className="w-5 h-5" />} 
                    connected={true} 
                    channelName="@Bronco_Official"
                    onClick={() => startOAuth('/api/auth/x/login')}
                  />
                  <PlatformCard 
                    name="TikTok" 
                    icon={<TikTokLogo className="w-5 h-5" />} 
                    connected={true} 
                    channelName="Bronco_Creator"
                    onClick={() => startOAuth('/api/auth/tiktok/login')}
                  />
                  <PlatformCard 
                    name="Instagram" 
                    icon={<Instagram size={20} className="text-pink-600" />} 
                    connected={!!user?.connections?.instagram?.connected} 
                    channelName={user?.connections?.instagram?.instagramAccount?.username}
                    onClick={() => startOAuth('/api/auth/meta/login')}
                  />
                  <PlatformCard 
                    name="Threads" 
                    icon={<ThreadsLogo className="w-5 h-5" />} 
                    connected={!!user?.connections?.threads?.connected} 
                    onClick={() => startOAuth('/api/auth/threads/login')}
                  />
                  <PlatformCard 
                    name="Facebook" 
                    icon={<Facebook size={20} className="text-blue-600" />} 
                    connected={!!user?.connections?.facebook?.connected} 
                    onClick={() => startOAuth('/api/auth/meta/login')}
                  />
                  <PlatformCard 
                    name="LinkedIn" 
                    icon={<Linkedin size={20} className="text-blue-700" />} 
                    connected={!!user?.connections?.linkedin?.connected} 
                    channelName={user?.connections?.linkedin?.name}
                    onClick={() => startOAuth('/api/auth/linkedin/login')}
                  />
                  <PlatformCard 
                    name="Reddit" 
                    icon={<MessageSquare size={20} className="text-orange-600" />} 
                    connected={!!user?.connections?.reddit?.connected} 
                    channelName={user?.connections?.reddit?.name}
                    onClick={() => startOAuth('/api/auth/reddit/login')}
                    onDisconnect={() => handleDisconnectAction('reddit')}
                  />
                </div>
              </section>

              {/* Workforce */}
              <section className="mb-12">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Agent Control Center</h3>
                <AgentBannerGrid 
                  statuses={agentStatuses}
                  onAgentClick={(agent) => {
                    if (jobs.length > 0) {
                      const targetJob = jobs.find(j => j.id === selectedJobId) || jobs[0];
                      setSelectedJobId(targetJob.id);
                      setActiveAgentLog(agent);
                    } else {
                      alert('연동할 데이터가 없습니다. 먼저 새 프로젝트(New Job)를 생성해주세요!');
                    }
                  }}
                />
              </section>

              {/* Jobs */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Productions</h3>
                  <Button variant="primary" icon={<Plus size={18} />} onClick={() => router.push('/jobs/new')}>New Project</Button>
                </div>

                {jobs.length === 0 ? (
                  <GlassCard className="text-center py-20 border-dashed border-2 bg-slate-50/50 dark:bg-slate-900/20">
                    <LayoutGrid size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4 opacity-50" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium mb-6">No productions currently running.</p>
                    <Button onClick={() => router.push('/jobs/new')}>Start First Pipeline</Button>
                  </GlassCard>
                ) : (
                  <div className="grid gap-4">
                    {jobs.map((job) => (
                      <LabelCard 
                        key={job.id} 
                        className="cursor-pointer group hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all border border-slate-100 dark:border-slate-800"
                        onClick={() => router.push(`/jobs/${job.id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-2.5 h-2.5 rounded-full ${job.state === 'DONE' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,180,120,0.5)]' : 'bg-amber-500 animate-pulse shadow-[0_0_10px_#f59e0b80]'}`} />
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors truncate max-w-[200px] md:max-w-md">
                                  {job?.topic || 'Untitled Production'}
                                </h4>
                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                                  {job?.scheduledAt ? new Date(job.scheduledAt).toLocaleString() : 'Scheduling...'}
                                </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <button
                              onClick={(e) => handleDeleteJob(e, job.id)}
                              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                            <ChevronRight className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </LabelCard>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </>
        )}
        
        {activeAgentLog && (
          <ActivityLog 
            agentName={activeAgentLog}
            jobId={selectedJobId || undefined}
            isOpen={!!activeAgentLog}
            onClose={() => setActiveAgentLog(null)}
            status={agentStatuses[activeAgentLog]}
          />
        )}
      </main>
    </ClientOnly>
  );
}
