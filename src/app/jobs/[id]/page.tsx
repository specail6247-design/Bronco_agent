'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  Calendar, 
  Clock, 
  Globe, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { GlassCard, LabelCard, Button, StatusBadge, AgentBanner } from '@/components/ui';
import type { Job, JobStep, Artifact, AgentName } from '@/types';
import ClientOnly from '@/components/ClientOnly';

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [job, setJob] = useState<Job | null>(null);
  const [steps, setSteps] = useState<JobStep[]>([]);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchJobData = async () => {
      try {
        const res = await fetch(`/api/jobs/${id}`);
        if (res.ok) {
          const data = await res.json();
          setJob(data.job);
          setSteps(data.steps);
          setArtifacts(data.artifacts);
        }
      } catch (error) {
        console.error('Failed to fetch job', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobData();
  }, [id]);

  const agents: AgentName[] = ['jessica', 'sunny', 'rovert', 'tim', 'david', 'john'];

  const getStepStatus = (agentName: AgentName) => {
    const step = steps.find(s => s.stepName === agentName);
    return step ? step.state : 'WAITING';
  };

  return (
    <ClientOnly>
      <main 
        className="min-h-screen p-6 pb-12 notranslate" 
        translate="no" 
        suppressHydrationWarning={true}
      >
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <span className="text-slate-500">Loading...</span>
          </div>
        ) : !job ? (
          <div className="p-12 text-center">
            <span className="text-slate-500">Job not found</span>
            <div className="mt-4">
              <Button onClick={() => router.push('/dashboard')}>
                <span>Back to Dashboard</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <Button 
                variant="ghost" 
                size="sm"
                icon={<ChevronLeft size={18} />}
                onClick={() => router.push('/dashboard')}
              >
                <span>Back</span>
              </Button>
              <div className="flex-1">
                <h1 className="heading-display text-2xl text-slate-800">
                  <span>{job.topic}</span>
                </h1>
                <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} /> 
                    <span>{new Date(job.scheduledAt).toLocaleDateString()}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe size={14} /> 
                    <span>{job.languageMode === 'auto' ? 'Auto Language' : job.preferredLanguage?.toUpperCase()}</span>
                  </span>
                  <div className="flex gap-1">
                    {job.platforms.map(p => (
                      <span key={p} className="px-1.5 py-0.5 bg-slate-100 rounded text-xs">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Status</span>
                <StatusBadge status={job.state === 'NEED_APPROVAL' ? 'WAITING' : job.state as any} />
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column: Timeline / Pipeline */}
              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-lg font-semibold text-slate-700">Production Pipeline</h2>
                
                <div className="space-y-4">
                  {agents.map((agent, index) => {
                    const status = getStepStatus(agent);
                    return (
                      <div key={agent} className="relative pl-8">
                        {/* Connecting Line */}
                        {index < agents.length - 1 && (
                          <div className={`
                            absolute left-[11px] top-8 bottom-[-16px] w-[2px]
                            ${status === 'DONE' ? 'bg-emerald-200' : 'bg-slate-200'}
                          `} />
                        )}
                        
                        {/* Status Dot */}
                        <div className={`
                          absolute left-0 top-3 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10
                          ${status === 'DONE' ? 'bg-emerald-500 border-emerald-500' : 
                            status === 'WORKING' ? 'bg-white border-amber-500' : 
                            'bg-white border-slate-300'}
                        `}>
                          {status === 'DONE' && <div className="w-2 h-2 bg-white rounded-full" />}
                          {status === 'WORKING' && <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />}
                        </div>

                        <AgentBanner 
                          agent={agent} 
                          status={status}
                          compact
                        />
                        
                        {/* Special case for Approval Gate after Tim */}
                        {agent === 'tim' && job.state === 'NEED_APPROVAL' && (
                          <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-xl flex items-center gap-3">
                            <AlertCircle className="text-purple-600" />
                            <div>
                              <p className="font-medium text-purple-900">Owner Approval Required</p>
                              <p className="text-sm text-purple-700">Check your Telegram to approve the upload package.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Artifacts */}
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-slate-700">Artifacts</h2>
                
                {artifacts.length === 0 ? (
                  <GlassCard className="text-center py-8 text-slate-500">
                    <FileText className="mx-auto mb-2 opacity-50" />
                    <p>No artifacts yet</p>
                  </GlassCard>
                ) : (
                  <div className="space-y-4">
                    {artifacts.map((artifact) => (
                      <GlassCard key={artifact.id} className="p-4" hover>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            <span>{artifact.type.replace('_', ' ')}</span>
                          </span>
                          <span className="text-xs text-slate-400">
                            <span>{new Date(artifact.createdAt).toLocaleTimeString()}</span>
                          </span>
                        </div>
                        <div className="text-sm text-slate-700 line-clamp-3">
                          <span>{JSON.stringify(artifact.contentJson)}</span>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                )}
                
                {/* Debug info */}
                <div className="mt-8 pt-8 border-t border-slate-200">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Debug Info</h3>
                  <pre className="text-[10px] bg-slate-50 p-2 rounded border border-slate-100 overflow-auto max-h-40">
                    {JSON.stringify({ id, state: job.state, retryCount: job.retryCount }, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </ClientOnly>
  );
}
