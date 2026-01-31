'use client';

import { useState, useEffect, type ReactNode, type KeyboardEvent } from 'react';
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
  Twitter,
  Music,
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

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const ownerEmail = CONFIG.OWNER_EMAILS[0]; // Get from config defense
  
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
    if (!selectedJobId) return;

    const fetchStatuses = async () => {
      try {
        const res = await fetch(`/api/jobs/${selectedJobId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.steps) {
            const newStatuses = { ...agentStatuses };
            data.steps.forEach((step: any) => {
              newStatuses[step.stepName as AgentName] = step.state;
            });
            setAgentStatuses(newStatuses);
          }
        }
      } catch (err) {
        console.error('Status fetch error:', err);
      }
    };

    fetchStatuses();
    const interval = setInterval(fetchStatuses, 5000);
    return () => clearInterval(interval);
  }, [selectedJobId]);

  // Automatically select the most recent job for the top Agent Banner
  useEffect(() => {
    if (jobs.length > 0 && !selectedJobId) {
      setSelectedJobId(jobs[0].id);
    }
  }, [jobs]);

  const handleDeleteJob = async (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation(); // Don't trigger the card click
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

  const handleDisconnect = async (platform: string) => {
    if (!user?.id) return;
    if (!confirm(`${platform} 연동을 해제하시겠습니까?`)) return;

    try {
      const res = await fetch('/api/auth/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.id, platform }),
      });

      if (res.ok) {
        // Refresh user data to update UI
        const meRes = await fetch(`/api/auth/me?uid=${user.id}`);
        if (meRes.ok) {
          const data = await meRes.json();
          setUser(data.user);
        }
      } else {
        alert('연동 해제 실패');
      }
    } catch (e) {
      console.error(e);
      alert('연동 해제 중 에러 발생');
    }
  };

  useEffect(() => {
    setMounted(true);

    const fetchJobs = async (userIdStr?: string) => {
      try {
        const url = userIdStr ? `/api/jobs?userId=${userIdStr}` : '/api/jobs';
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setJobs(data.jobs || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    const buildFallbackUser = (firebaseUser: { uid: string; email?: string | null }) => {
      const email = firebaseUser.email || '';
      const isOwner = ownerEmail && email.toLowerCase() === ownerEmail;
      return {
        id: firebaseUser.uid,
        email,
        role: isOwner ? 'OWNER' : 'MEMBER',
        allowedAgents: isOwner
          ? ['jessica', 'sunny', 'rovert', 'tim', 'david', 'john']
          : ['jessica', 'sunny'],
        expiryAt: null,
        createdAt: new Date(),
      } as User;
    };

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
          fetchJobs(firebaseUser.uid);
        } else {
          setUser(buildFallbackUser(firebaseUser));
          fetchJobs(firebaseUser.uid);
        }
      } catch (e) {
        setUser(buildFallbackUser(firebaseUser));
        setLoading(false);
      }
    });

    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }

    return () => unsubscribe();
  }, [router]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark');
  };

  if (!mounted) return null;

  const connectedCount = mounted ? Object.values(user?.connections || {}).filter(c => !!(c as any)?.connected).length : 0;

  async function handleSignOut() {
    await signOut();
    router.push('/login');
  }

  return (
    <ClientOnly>
      <main className="min-h-screen pb-12 bg-white dark:bg-slate-950 transition-colors duration-500">
        {loading ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800">
              <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-amber-400 flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform">
                    <Zap size={22} className="text-white dark:text-slate-900 fill-current" />
                  </div>
                  <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">BRONCO</h1>
                </div>

                <div className="flex items-center gap-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    icon={theme === 'light' ? <Moon size={20} /> : <Sun size={20} className="text-amber-400" />} 
                    onClick={toggleTheme}
                    className="w-10 h-10 p-0 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800"
                  />
                  {user?.role === 'OWNER' && (
                    <Button variant="ghost" size="sm" icon={<Settings size={18} />} onClick={() => router.push('/admin')}>
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
                <p className="text-slate-500 dark:text-slate-400 font-medium">Your agent workforce is operational.</p>
              </div>

              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Platform Connections</h3>
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-[10px] font-bold uppercase tracking-widest">{connectedCount} Connected</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <PlatformCard 
                    name="YouTube" 
                    icon={<Youtube className="text-red-600" />} 
                    connected={user?.connections?.youtube?.connected} 
                    onClick={() => {
                      if (user?.connections?.youtube?.connected) {
                        alert('YouTube is already connected. Re-linking will refresh access.');
                      }
                      startOAuth('/api/auth/youtube/login');
                    }}
                  />
                  <PlatformCard 
                    name="TikTok" 
                    icon={<Music className="text-black" />} 
                    connected={user?.connections?.tiktok?.connected} 
                    onClick={() => startOAuth('/api/auth/tiktok/login')}
                    onDisconnect={() => handleDisconnect('tiktok')}
                  />
                  <PlatformCard 
                    name="Instagram" 
                    icon={<Instagram className="text-pink-600" />} 
                    connected={user?.connections?.instagram?.connected} 
                    onClick={() => startOAuth('/api/auth/meta/login')}
                  />
                  <PlatformCard 
                    name="Threads" 
                    icon={<Hash className="text-slate-800" />} 
                    connected={user?.connections?.threads?.connected} 
                    onClick={() => startOAuth('/api/auth/threads/login')}
                  />
                  <PlatformCard 
                    name="X / Twitter" 
                    icon={<Twitter className="text-blue-400" />} 
                    connected={user?.connections?.x?.connected} 
                    onClick={() => startOAuth('/api/auth/x/login')}
                    onDisconnect={() => handleDisconnect('x')}
                  />
                  <PlatformCard 
                    name="Facebook" 
                    icon={<Facebook className="text-blue-600" />} 
                    connected={user?.connections?.facebook?.connected} 
                    onClick={() => startOAuth('/api/auth/meta/login')}
                  />
                  <PlatformCard 
                    name="LinkedIn" 
                    icon={<Linkedin className="text-blue-700" />} 
                    connected={user?.connections?.linkedin?.connected} 
                    onClick={() => startOAuth('/api/auth/linkedin/login')}
                    onDisconnect={() => handleDisconnect('linkedin')}
                  />
                  <PlatformCard 
                    name="Reddit" 
                    icon={<MessageSquare className="text-orange-500" />} 
                    connected={user?.connections?.reddit?.connected} 
                    onClick={() => startOAuth('/api/auth/reddit/login')}
                    onDisconnect={() => handleDisconnect('reddit')}
                  />
                </div>
              </section>

              <section className="mb-12">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Agent Workforce</h3>
                <AgentBannerGrid 
                  statuses={agentStatuses}
                  onAgentClick={(agent) => {
                    if (jobs.length > 0) {
                      // Use the selected job or most recent
                      const targetJob = jobs.find(j => j.id === selectedJobId) || jobs[0];
                      setSelectedJobId(targetJob.id);
                      setActiveAgentLog(agent);
                    } else {
                      alert('먼저 Job을 생성해주세요!');
                    }
                  }}
                />
              </section>

              <section>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Current Productions</h3>
                  <Button variant="primary" icon={<Plus size={18} />} onClick={() => router.push('/jobs/new')}>New Job</Button>
                </div>

                {jobs.length === 0 ? (
                  <GlassCard className="text-center py-20 border-dashed border-2 bg-slate-50/50">
                    <LayoutGrid size={48} className="mx-auto text-slate-300 mb-4 opacity-50" />
                    <p className="text-slate-500 font-medium mb-6">No productions found.</p>
                    <Button onClick={() => router.push('/jobs/new')}>Start First Stream</Button>
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
                            <div className={`w-2 h-2 rounded-full ${job.state === 'DONE' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                            <div>
                              <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">{job?.topic || 'Untitled'}</h4>
                              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter mt-1">{job?.scheduledAt ? new Date(job.scheduledAt).toLocaleString() : 'No Date'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
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

function PlatformCard({ 
  name, 
  icon, 
  connected, 
  onClick, 
  onDisconnect,
  thumbnail 
}: { 
  name: string, 
  icon: ReactNode, 
  connected?: boolean, 
  onClick?: () => void,
  onDisconnect?: () => void,
  thumbnail?: string
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
      className={`p-5 border border-slate-100 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-400 transition-all group bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:-translate-y-1 ${onClick ? 'cursor-pointer' : ''}`} 
      onClick={onClick}
      hover
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-amber-50 transition-transform overflow-hidden w-10 h-10 flex items-center justify-center">
            {thumbnail ? (
              <img src={thumbnail} alt={name} className="w-full h-full rounded-full object-cover shadow-sm" />
            ) : (
              icon
            )}
          </div>
          <div>
            <span className="font-bold text-slate-800 dark:text-slate-100 block">{name}</span>
            {connected && <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Sync Active</span>}
          </div>
        </div>
        {connected && (
          <div className="p-1 bg-emerald-50 rounded-full">
            <Check size={14} className="text-emerald-500" />
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button 
          variant={connected ? "ghost" : "secondary"} 
          size="sm" 
          className={`flex-1 text-[10px] font-black uppercase tracking-widest ${connected ? 'text-slate-400' : 'bg-slate-900 text-white shadow-lg'}`}
          onClick={(event) => {
            event.stopPropagation();
            onClick?.();
          }}
        >
          {connected ? "Manage" : "Connect Now"}
        </Button>
        {connected && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 hover:bg-red-50"
            onClick={(event) => {
              event.stopPropagation();
              onDisconnect?.();
            }}
          >
            Disconnect
          </Button>
        )}
      </div>
    </GlassCard>
  );
}
