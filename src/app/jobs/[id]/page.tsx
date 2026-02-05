'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, FileText, Search, PenTool, Layout, X, Trash2, Zap } from 'lucide-react';
import { Button, StatusBadge, AgentBanner, GlassCard, ActivityLog } from '@/components/ui';
import type { AgentName } from '@/types';
import ClientOnly from '@/components/ClientOnly';

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id ? (params.id as string) : '';
  
  const [job, setJob] = useState<any>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [artifacts, setArtifacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);
  const [resuming, setResuming] = useState(false);
  const [selectedArtifact, setSelectedArtifact] = useState<any>(null);
  const [activeAgentLog, setActiveAgentLog] = useState<AgentName | null>(null);

  const fetchData = async () => {
    if (!id || id === '[id]') return;
    try {
      const res = await fetch(`/api/jobs/${id}`);
      if (!res.ok) throw new Error('API down');
      const data = await res.json();
      if (data.job) setJob(data.job);
      if (data.steps) setSteps(data.steps);
      if (data.artifacts) setArtifacts(data.artifacts);
    } catch (e) {
      console.error('Fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAdvance = async () => {
    if (!id) return;
    setAdvancing(true);
    try {
      const res = await fetch(`/api/jobs/${id}/simulate`, { method: 'POST' });
      if (res.ok) await fetchData(); // Reload data without full page refresh
    } catch (e) {
      console.error(e);
      alert('Advance Step failed. Check console for details.');
    } finally {
      setAdvancing(false);
    }
  };

  const handleResume = async () => {
    if (!id) return;
    setResuming(true);
    try {
      const res = await fetch(`/api/jobs/${id}/resume`, { method: 'POST' });
      if (res.ok) {
        alert('Agents have been waken up! They will resume from the last point.');
        await fetchData();
      } else {
        alert('Failed to resume job.');
      }
    } catch (e) {
      console.error(e);
      alert('Error during resume process.');
    } finally {
      setResuming(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('정말 이 프로젝트를 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/jobs/${id}/delete`, { method: 'DELETE' });
      if (res.ok) router.push('/dashboard');
      else alert('삭제 실패');
    } catch (e) {
      console.error(e);
      alert('삭제 중 오류 발생');
    }
  };

  const agents = ['jessica', 'sunny', 'rovert', 'tim', 'david', 'john'];

  // Beautiful artifact content renderer
  const renderArtifactContent = (artifact: any) => {
    const content = artifact.contentJson;
    const type = artifact.type;

    // Helper for section headers
    const SectionHeader = ({ children }: { children: React.ReactNode }) => (
      <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-100 pb-2">{children}</h4>
    );

    // Upload Package (Tim's output)
    if (type === 'upload_package' || content?.readyToPublish !== undefined) {
      return (
        <div className="space-y-6">
          {/* Video Preview */}
          {content?.videoUrl && (
            <div className="rounded-2xl overflow-hidden bg-slate-900 shadow-xl">
              <video 
                src={content.videoUrl} 
                controls 
                className="w-full aspect-video"
                poster={content.thumbnailUrl !== 'https://example.com/default-thumbnail.jpg' ? content.thumbnailUrl : undefined}
              />
            </div>
          )}
          
          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest ${content?.readyToPublish ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {content?.readyToPublish ? '✅ 게시 준비 완료' : '⏳ 처리 중'}
            </span>
            {content?.renderId && (
              <span className="text-[10px] font-mono text-slate-400">
                Render ID: {content.renderId}
              </span>
            )}
          </div>

          {/* Platforms */}
          {content?.platforms && content.platforms.length > 0 && (
            <div>
              <SectionHeader>📱 게시 플랫폼 ({content.platforms.length})</SectionHeader>
              <div className="space-y-4">
                {content.platforms.map((p: any, idx: number) => (
                  <div key={idx} className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
                        {p.platform}
                      </span>
                    </div>
                    <h5 className="font-bold text-slate-900 mb-2">{p.title}</h5>
                    <p className="text-sm text-slate-600 mb-3 line-clamp-3">{p.description}</p>
                    {p.hashtags && (
                      <div className="flex flex-wrap gap-2">
                        {p.hashtags.map((tag: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    // Research (Jessica's output)
    if (type === 'research' || content?.keywords !== undefined) {
      return (
        <div className="space-y-6">
          {content?.summary && (
            <div>
              <SectionHeader>📝 요약</SectionHeader>
              <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl">{content.summary}</p>
            </div>
          )}
          
          {content?.keywords && content.keywords.length > 0 && (
            <div>
              <SectionHeader>🔑 키워드</SectionHeader>
              <div className="flex flex-wrap gap-2">
                {content.keywords.map((kw: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-sm font-semibold">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {content?.trendingScore !== undefined && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">트렌드 점수:</span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg font-black">{content.trendingScore}/100</span>
            </div>
          )}

          {content?.competitorAngles && content.competitorAngles.length > 0 && (
            <div>
              <SectionHeader>🎯 경쟁사 분석</SectionHeader>
              <ul className="space-y-2">
                {content.competitorAngles.map((angle: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="text-amber-500">•</span>
                    {angle}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }

    // Script (Sunny's output)
    if (type === 'script' || content?.title !== undefined) {
      return (
        <div className="space-y-6">
          {content?.title && (
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-5 rounded-2xl">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">영상 제목</span>
              <h3 className="text-lg font-black mt-1">{content.title}</h3>
            </div>
          )}

          {content?.hook && (
            <div>
              <SectionHeader>🎣 후킹 (오프닝)</SectionHeader>
              <p className="text-slate-700 leading-relaxed bg-yellow-50 p-4 rounded-xl border-l-4 border-yellow-400">{content.hook}</p>
            </div>
          )}

          {content?.body && (
            <div>
              <SectionHeader>📋 본문</SectionHeader>
              <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl whitespace-pre-wrap">{content.body}</p>
            </div>
          )}

          {content?.cta && (
            <div>
              <SectionHeader>📢 CTA (Call To Action)</SectionHeader>
              <p className="text-slate-700 leading-relaxed bg-emerald-50 p-4 rounded-xl border-l-4 border-emerald-400">{content.cta}</p>
            </div>
          )}

          {content?.estimatedDurationSeconds && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">예상 길이:</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg font-black">
                {Math.floor(content.estimatedDurationSeconds / 60)}분 {content.estimatedDurationSeconds % 60}초
              </span>
            </div>
          )}
        </div>
      );
    }

    // Storyboard (Rovert's output)
    if (type === 'storyboard' || content?.scenes !== undefined) {
      return (
        <div className="space-y-4">
          <SectionHeader>🎬 씬 구성 ({content?.scenes?.length || 0}개)</SectionHeader>
          {content?.scenes?.map((scene: any, idx: number) => (
            <div key={idx} className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-black">
                  Scene {idx + 1}
                </span>
                {scene.duration && (
                  <span className="text-xs font-semibold text-slate-500">{scene.duration}초</span>
                )}
              </div>
              <p className="text-sm text-slate-700 mb-2">{scene.description || scene.text}</p>
              {scene.visualNotes && (
                <p className="text-xs text-purple-600 italic">🎨 {scene.visualNotes}</p>
              )}
              {scene.assetSuggestions && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {scene.assetSuggestions.map((asset: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-[10px] font-semibold">
                      {asset}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    // Default: Pretty JSON fallback
    return (
      <pre className="text-sm text-slate-600 bg-slate-50 p-6 rounded-2xl overflow-x-auto whitespace-pre-wrap font-mono">
        {JSON.stringify(content, null, 2)}
      </pre>
    );
  };

  // Helper to generate short preview text for artifact cards
  const getArtifactPreview = (artifact: any): string => {
    const content = artifact.contentJson;
    const type = artifact.type;

    if (type === 'research' || content?.keywords !== undefined) {
      const keywordCount = content?.keywords?.length || 0;
      const score = content?.trendingScore;
      return `🔑 ${keywordCount}개 키워드 추출 • 트렌드 점수: ${score || '-'}/100`;
    }

    if (type === 'script' || content?.title !== undefined) {
      const duration = content?.estimatedDurationSeconds;
      const mins = duration ? Math.floor(duration / 60) : 0;
      return `📝 "${content?.title?.substring(0, 40) || 'Untitled'}..." • ${mins}분`;
    }

    if (type === 'storyboard' || content?.scenes !== undefined) {
      const sceneCount = content?.scenes?.length || 0;
      return `🎬 ${sceneCount}개 씬 구성 완료`;
    }

    if (type === 'upload_package' || content?.readyToPublish !== undefined) {
      const platformCount = content?.platforms?.length || 0;
      const status = content?.readyToPublish ? '✅ 게시 준비 완료' : '⏳ 처리 중';
      return `📹 ${platformCount}개 플랫폼 • ${status}`;
    }

    if (type === 'publish_report' || content?.results !== undefined) {
      const successCount = content?.results?.filter((r: any) => r.success)?.length || 0;
      return `📊 ${successCount}개 채널 게시 완료`;
    }

    if (type === 'performance_report') {
      return `📈 성과 리포트`;
    }

    return '클릭하여 상세 보기';
  };

  const getArtifactIcon = (type: string) => {
    switch (type) {
      case 'research': return <Search className="text-blue-500" size={18} />;
      case 'script': return <PenTool className="text-purple-500" size={18} />;
      case 'storyboard': return <Layout className="text-amber-500" size={18} />;
      default: return <FileText className="text-slate-500" size={18} />;
    }
  };

  if (loading) return <div className="p-20 text-center text-slate-400 font-medium animate-pulse">Initializing Agent Environment...</div>;

  const currentJob = job || { topic: 'Loading topic...', state: 'WAITING' };

  return (
    <ClientOnly>
      <main className="max-w-5xl mx-auto p-4 md:p-10 space-y-8">
        {/* Header Section */}
        <div className="bg-white shadow-xl rounded-2xl border border-slate-100 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')} className="p-2">
              <ChevronLeft size={24} />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-2xl font-black text-slate-900 leading-tight truncate px-1" title={currentJob.topic}>
                {currentJob.topic}
              </h1>
              <div className="flex items-center gap-3 mt-2 px-1">
                <StatusBadge status={currentJob.state} />
                <span className="hidden sm:inline text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  ID: {id}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={handleDelete}
              className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-3"
            >
              <Trash2 size={24} />
            </Button>
            
            {/* Advance / Resume Buttons */}
            {currentJob.state !== 'DONE' && (
              <div className="flex items-center gap-2">
                {(currentJob.state === 'RUNNING' || currentJob.state === 'FAILED' || currentJob.state === 'SCHEDULED' || currentJob.state === 'PAUSED') && (
                  <Button 
                    variant="secondary"
                    onClick={handleResume}
                    disabled={resuming || !id}
                    className="h-12 px-4 text-xs font-bold uppercase tracking-widest border-2 border-slate-200"
                    icon={<Zap size={14} className="text-amber-500 fill-amber-500" />}
                  >
                    {resuming ? "깨우는 중..." : "깨우기"}
                  </Button>
                )}
                <Button 
                  onClick={handleAdvance}
                  disabled={advancing || !id}
                  className={`
                    h-12 px-6 font-black text-sm uppercase tracking-widest shadow-lg active:scale-95
                    ${advancing ? 'bg-slate-100 text-slate-400' : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200'}
                  `}
                >
                  {advancing ? "WAIT..." : "단계 강제 실행"}
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Agent Roadmap */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Workforce Roadmap</h3>
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-3">
              {agents.map((a) => {
                const s = steps.find((st: any) => st.stepName === a);
                return (
                  <AgentBanner 
                    key={a} 
                    agent={a as any} 
                    status={s?.state || 'WAITING'} 
                    compact 
                    onClick={() => setActiveAgentLog(a as any)}
                  />
                );
              })}
            </div>
          </div>

          {/* Right Column: Artifacts / Outputs */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Agent Artifacts</h3>
            {artifacts.length === 0 ? (
              <GlassCard className="text-center py-20 bg-white/50 border-dashed border-2">
                <FileText size={48} className="mx-auto text-slate-200 mb-4 opacity-50" />
                <p className="text-slate-400 font-medium">No outputs generated yet.</p>
                <p className="text-xs text-slate-300 mt-1 italic">Click 'Advance Step' to wake up the agents.</p>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {artifacts.map((art) => (
                  <GlassCard 
                    key={art.id} 
                    className="p-5 cursor-pointer hover:border-orange-200 transition-all bg-white group"
                    onClick={() => setSelectedArtifact(art)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-orange-50 transition-colors">
                        {getArtifactIcon(art.type)}
                      </div>
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                        {new Date(art.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 capitalize">{art.stepName}'s {art.type}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {getArtifactPreview(art)}
                    </p>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Artifact Detail Modal */}
        {selectedArtifact && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg">{getArtifactIcon(selectedArtifact.type)}</div>
                  <h3 className="font-black text-slate-900 capitalize">{selectedArtifact.stepName}'s {selectedArtifact.type}</h3>
                </div>
                <button onClick={() => setSelectedArtifact(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <X size={20} className="text-slate-500" />
                </button>
              </div>
              <div className="p-8 max-h-[60vh] overflow-y-auto">
                 {renderArtifactContent(selectedArtifact)}
              </div>
              <div className="p-6 border-t border-slate-100 flex justify-end">
                <Button variant="secondary" onClick={() => setSelectedArtifact(null)}>Close Viewer</Button>
              </div>
            </div>
          </div>
        )}

        {activeAgentLog && (
          <ActivityLog 
            agentName={activeAgentLog}
            jobId={id}
            isOpen={!!activeAgentLog}
            onClose={() => setActiveAgentLog(null)}
            status={steps.find(s => s.stepName === activeAgentLog)?.state || 'WAITING'}
          />
        )}
      </main>
    </ClientOnly>
  );
}
