import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Key, Copy, Plus, Eye, EyeOff } from 'lucide-react';
import api from '../../lib/api';
import { formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';

const ENDPOINTS = [
  { method: 'POST', path: '/api/extract/api/extract', desc: 'Extract product from single image' },
  { method: 'POST', path: '/api/extract/api/batch', desc: 'Batch extract from multiple images' },
  { method: 'GET', path: '/api/extract/history', desc: 'Get extraction history' },
  { method: 'GET', path: '/api/analytics', desc: 'Get analytics data' },
];

export default function ApiAccessPage() {
  const qc = useQueryClient();
  const [keyName, setKeyName] = useState('');
  const [newKey, setNewKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => api.get('/auth/me').then(r => r.data) });

  const genMut = useMutation({
    mutationFn: (name: string) => api.post('/auth/api-keys', { name }),
    onSuccess: (res) => { setNewKey(res.data.key); setKeyName(''); qc.invalidateQueries({ queryKey: ['me'] }); },
    onError: () => toast.error('Failed to generate key'),
  });

  const copy = (text: string) => { navigator.clipboard.writeText(text); toast.success('Copied!'); };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">API Access</h1>
        <p className="text-white/50">Integrate ProductVision AI into your applications.</p>
      </div>

      {/* Generate Key */}
      <div className="glass p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2"><Key size={18} className="text-primary" /> Generate API Key</h2>
        <div className="flex gap-3">
          <input className="input flex-1" placeholder="Key name (e.g. Production)" value={keyName} onChange={e => setKeyName(e.target.value)} />
          <button onClick={() => genMut.mutate(keyName)} disabled={genMut.isPending} className="btn-primary px-6 flex items-center gap-2">
            <Plus size={16} /> Generate
          </button>
        </div>
        {newKey && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 glass border border-accent/20 p-4 rounded-xl">
            <p className="text-sm text-accent mb-2">⚠ Copy this key now – it won't be shown again</p>
            <div className="flex items-center gap-3 bg-black/30 rounded-lg p-3">
              <code className="flex-1 text-sm font-mono text-white/80">{showKey ? newKey : newKey.replace(/./g, '•')}</code>
              <button onClick={() => setShowKey(s => !s)} className="text-white/40 hover:text-white">{showKey ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              <button onClick={() => copy(newKey)} className="text-primary hover:text-primary/80"><Copy size={16} /></button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Existing Keys */}
      {user?.apiKeys?.length > 0 && (
        <div className="glass p-6">
          <h2 className="font-semibold mb-4">Your API Keys</h2>
          <div className="space-y-3">
            {user.apiKeys.map((k: any, i: number) => (
              <div key={i} className="flex items-center justify-between glass p-3 rounded-xl">
                <div>
                  <p className="text-sm font-medium">{k.name}</p>
                  <p className="text-xs text-white/40">Created {formatDate(k.createdAt)} · Last used: {k.lastUsed ? formatDate(k.lastUsed) : 'Never'}</p>
                </div>
                <code className="text-xs text-white/40 font-mono">{k.key.slice(0, 12)}...</code>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Endpoints */}
      <div className="glass p-6">
        <h2 className="font-semibold mb-4">Available Endpoints</h2>
        <div className="space-y-3">
          {ENDPOINTS.map((e) => (
            <div key={e.path} className="flex items-center gap-4 glass p-3 rounded-xl">
              <span className={`text-xs font-bold px-2 py-1 rounded-md ${e.method === 'POST' ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent'}`}>{e.method}</span>
              <code className="text-sm font-mono text-white/70 flex-1">{e.path}</code>
              <span className="text-xs text-white/40 hidden md:block">{e.desc}</span>
              <button onClick={() => copy(e.path)} className="text-white/30 hover:text-white"><Copy size={14} /></button>
            </div>
          ))}
        </div>
        <div className="mt-4 bg-black/30 rounded-xl p-4">
          <p className="text-xs text-white/40 mb-2">Authentication header:</p>
          <code className="text-sm font-mono text-white/70">x-api-key: your_api_key_here</code>
        </div>
      </div>
    </div>
  );
}
