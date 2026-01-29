'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Key, 
  Users, 
  Trash2, 
  RotateCw, 
  Copy, 
  Check, 
  AlertTriangle,
  ChevronLeft,
  Zap
} from 'lucide-react';
import { GlassCard, Button, Input, Select, StatusBadge } from '@/components/ui';
import { onAuthChange } from '@/lib/firebase/auth';
import type { User, InviteKey, AgentName } from '@/types';
import ClientOnly from '@/components/ClientOnly';

export default function AdminPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Invite Key State
  const [generatedKey, setGeneratedKey] = useState<{ key: string; expiry: string } | null>(null);
  const [keyConfig, setKeyConfig] = useState({
    expiryDays: 7,
    allowedAgentCount: 2 as number,
    maxUses: 1,
  });
  const [keyLoading, setKeyLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Users State
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (!firebaseUser) {
        router.push('/login');
        return;
      }

      try {
        // Fetch user doc directly from Firestore for the most reliable role check
        const res = await fetch(`/api/auth/me?uid=${firebaseUser.uid}`);
        if (!res.ok) {
           router.push('/dashboard');
           return;
        }
        const userData = await res.json();
        
        const isOwner = userData.user?.role === 'OWNER' || userData.user?.email === 'specail6247@gmail.com';

        if (!isOwner) {
          router.push('/dashboard');
          return;
        }

        setCurrentUser(userData.user);
        setLoading(false);
        fetchUsers();
      } catch (error) {
        console.error('Failed to verify admin status:', error);
        router.push('/dashboard');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchUsers = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/admin/users?adminUid=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleGenerateKey = async () => {
    if (!currentUser) return;
    setKeyLoading(true);
    try {
      const res = await fetch('/api/admin/invite-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...keyConfig, adminUid: currentUser.id }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setGeneratedKey({ key: data.rawKey, expiry: data.expiryAt });
      } else {
        const errorText = await res.text();
        alert(`Failed to generate key: ${res.status} ${errorText}`);
      }
    } catch (error) {
      console.error('Failed to generate key', error);
      alert('Failed to generate key. Please check console.');
    } finally {
      setKeyLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRevokeUser = async (userId: string) => {
    if (!confirm('Are you sure you want to revoke access for this user?')) return;
    if (!currentUser) return;
    
    try {
      await fetch(`/api/admin/users?id=${userId}&adminUid=${currentUser.id}`, { method: 'DELETE' });
      fetchUsers();
    } catch (error) {
      console.error('Failed to revoke user', error);
    }
  };

  return (
    <ClientOnly>
      <main 
        className="min-h-screen p-6 pb-12 notranslate" 
        translate="no" 
        suppressHydrationWarning={true}
      >
        <div className="max-w-5xl mx-auto">
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
              <span>Admin Console</span>
            </h1>
          </div>

          <div className="grid gap-8">
            {/* Section 1: Generate Invite Key */}
            <section>
              <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <Key size={20} className="text-amber-500" />
                <span>Generate Invite Key</span>
              </h2>
              
              <GlassCard className="p-6" disableMotion>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Select
                      label="Allowed Agents"
                      options={[
                        { value: '2', label: '2 Agents (Jessica, Sunny)' },
                        { value: '3', label: '3 Agents (Jessica, Sunny, Rovert)' },
                        { value: '4', label: '4 Agents (+ Tim)' },
                        { value: '5', label: '5 Agents (+ David)' },
                        { value: '6', label: 'Full Team (6 Agents)' },
                      ]}
                      value={keyConfig.allowedAgentCount}
                      onChange={(e) => setKeyConfig({ ...keyConfig, allowedAgentCount: Number(e.target.value) })}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Expiry (Days)"
                        type="number"
                        min="1"
                        value={keyConfig.expiryDays}
                        onChange={(e) => setKeyConfig({ ...keyConfig, expiryDays: Number(e.target.value) })}
                        disableMotion
                      />
                      <Input
                        label="Max Uses"
                        type="number"
                        min="1"
                        value={keyConfig.maxUses}
                        onChange={(e) => setKeyConfig({ ...keyConfig, maxUses: Number(e.target.value) })}
                        disableMotion
                      />
                    </div>

                    <Button 
                      onClick={handleGenerateKey} 
                      loading={keyLoading}
                      className="w-full"
                      icon={<Zap size={18} />}
                      disableMotion
                    >
                      <span>Generate Key</span>
                    </Button>
                  </div>

                  <div className="flex items-center justify-center">
                    {generatedKey ? (
                      <div className="w-full bg-amber-50 border-2 border-amber-200 rounded-xl p-6 text-center">
                        <p className="text-sm text-amber-800 mb-2 font-medium">
                          <span>✨ New Invite Key Created</span>
                        </p>
                        <div className="text-3xl font-mono font-bold text-slate-800 tracking-wider mb-2">
                          <span>{generatedKey.key}</span>
                        </div>
                        <p className="text-xs text-slate-500 mb-4">
                          <span>Expires: {new Date(generatedKey.expiry).toLocaleDateString()}</span>
                        </p>
                        
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={copyToClipboard}
                          icon={copied ? <Check size={16} /> : <Copy size={16} />}
                          disableMotion
                        >
                          <span>{copied ? 'Copied!' : 'Copy Key'}</span>
                        </Button>
                        
                        <p className="mt-3 text-xs text-red-500 flex items-center justify-center gap-1">
                          <AlertTriangle size={12} />
                          <span>Copy now. Key will not be shown again.</span>
                        </p>
                      </div>
                    ) : (
                      <div className="text-center text-slate-400 p-8 border-2 border-dashed border-slate-200 rounded-xl w-full h-full flex flex-col items-center justify-center">
                        <Key size={32} className="mb-2 opacity-50" />
                        <p><span>Key will appear here</span></p>
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>
            </section>

            {/* Section 2: Managed Users */}
            <section>
              <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <Users size={20} className="text-blue-500" />
                <span>Managed Users</span>
              </h2>

              <GlassCard className="overflow-hidden p-0" disableMotion>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4 font-semibold text-slate-600">User</th>
                        <th className="px-6 py-4 font-semibold text-slate-600">Role</th>
                        <th className="px-6 py-4 font-semibold text-slate-600">Agents</th>
                        <th className="px-6 py-4 font-semibold text-slate-600">Joined</th>
                        <th className="px-6 py-4 font-semibold text-slate-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {usersLoading ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                            <span>Loading users...</span>
                          </td>
                        </tr>
                      ) : users.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                            <span>No users found.</span>
                          </td>
                        </tr>
                      ) : (
                        users.map((user) => (
                          <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-medium text-slate-800">
                                <span>{user.name || 'Unknown'}</span>
                              </div>
                              <div className="text-xs text-slate-500">
                                <span>{user.email}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                user.role === 'OWNER' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                <span>{user.role}</span>
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex -space-x-2">
                                {user.allowedAgents.slice(0, 3).map((agent) => (
                                  <div 
                                    key={agent}
                                    className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white bg-slate-400 agent-${agent}-bg`}
                                    title={agent}
                                  >
                                    <span>{agent[0].toUpperCase()}</span>
                                  </div>
                                ))}
                                {user.allowedAgents.length > 3 && (
                                  <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] text-slate-600 font-medium">
                                    <span>+{user.allowedAgents.length - 3}</span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-slate-500">
                              <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                            </td>
                            <td className="px-6 py-4">
                              {user.role !== 'OWNER' && (
                                <div className="flex items-center gap-2">
                                  <button 
                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    onClick={() => handleRevokeUser(user.id!)}
                                    title="Revoke Access"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </section>
          </div>
        </div>
      </main>
    </ClientOnly>
  );
}
