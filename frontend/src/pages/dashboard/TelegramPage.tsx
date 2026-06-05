import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Bot, CheckCircle, AlertCircle, Loader, ExternalLink } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function TelegramPage() {
  const qc = useQueryClient();
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => api.get('/auth/me').then(r => r.data) });
  const [form, setForm] = useState({ botToken: '', chatId: '' });
  const [testing, setTesting] = useState(false);

  const saveMut = useMutation({
    mutationFn: (d: any) => api.post('/telegram/config', d),
    onSuccess: () => { toast.success('Config saved'); qc.invalidateQueries({ queryKey: ['me'] }); },
    onError: () => toast.error('Failed to save'),
  });

  const handleTest = async () => {
    setTesting(true);
    try {
      const { data } = await api.post('/telegram/test');
      if (data.success) toast.success('Test message sent!');
      else toast.error('Connection failed');
    } catch { toast.error('Test failed'); }
    finally { setTesting(false); }
  };

  const toggleMut = useMutation({
    mutationFn: (enabled: boolean) => api.patch('/telegram/toggle', { enabled }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Telegram Integration</h1>
        <p className="text-white/50">Connect your Telegram bot to receive product extractions automatically.</p>
      </div>

      {/* Status */}
      <div className={`glass p-4 flex items-center justify-between rounded-2xl border ${user?.telegramEnabled ? 'border-emerald-400/20' : 'border-white/10'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${user?.telegramEnabled ? 'bg-emerald-400/10' : 'bg-white/5'}`}>
            <Bot size={20} className={user?.telegramEnabled ? 'text-emerald-400' : 'text-white/30'} />
          </div>
          <div>
            <p className="font-medium">Telegram Bot</p>
            <p className={`text-sm ${user?.telegramEnabled ? 'text-emerald-400' : 'text-white/40'}`}>
              {user?.telegramEnabled ? 'Active – deliveries enabled' : 'Not connected'}
            </p>
          </div>
        </div>
        {user?.telegramEnabled && (
          <button onClick={() => toggleMut.mutate(false)} className="btn-ghost text-sm text-red-400">Disable</button>
        )}
      </div>

      {/* Setup Guide */}
      <div className="glass p-5 space-y-3">
        <h2 className="font-semibold">Setup Guide</h2>
        <ol className="space-y-2 text-sm text-white/60 list-decimal list-inside">
          <li>Open Telegram and search for <span className="text-primary">@BotFather</span></li>
          <li>Send <code className="bg-white/10 px-1 rounded">/newbot</code> and follow instructions</li>
          <li>Copy your Bot Token from BotFather</li>
          <li>Start a chat with your bot or add it to a group</li>
          <li>Get your Chat ID using <span className="text-primary">@userinfobot</span></li>
          <li>Paste both below and save</li>
        </ol>
        <a href="https://core.telegram.org/bots" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-primary hover:underline">
          Telegram Bot Documentation <ExternalLink size={12} />
        </a>
      </div>

      {/* Config Form */}
      <div className="glass p-6 space-y-4">
        <h2 className="font-semibold">Bot Configuration</h2>
        <div>
          <label className="text-sm text-white/50 mb-2 block">Bot Token</label>
          <input
            className="input"
            placeholder="1234567890:ABCdef..."
            value={form.botToken || user?.telegramBotToken?.replace(/.(?=.{4})/g, '*') || ''}
            onChange={e => setForm(p => ({ ...p, botToken: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-sm text-white/50 mb-2 block">Chat ID</label>
          <input
            className="input"
            placeholder="-100123456789 or 123456789"
            value={form.chatId || user?.telegramChatId || ''}
            onChange={e => setForm(p => ({ ...p, chatId: e.target.value }))}
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => saveMut.mutate(form)}
            disabled={saveMut.isPending || (!form.botToken && !form.chatId)}
            className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
          >
            {saveMut.isPending ? <><Loader size={16} className="animate-spin" /> Saving...</> : 'Save Configuration'}
          </button>
          <button
            onClick={handleTest}
            disabled={testing || !user?.telegramBotToken}
            className="btn-secondary py-3 px-6 flex items-center gap-2"
          >
            {testing ? <Loader size={16} className="animate-spin" /> : <CheckCircle size={16} />}
            Test
          </button>
        </div>
      </div>

      {/* Delivery Format Preview */}
      <div className="glass p-5">
        <h2 className="font-semibold mb-4">Delivery Format Preview</h2>
        <div className="bg-black/40 rounded-xl p-4 font-mono text-xs text-white/70 space-y-1 leading-relaxed">
          <p>🛒 <span className="text-white">Product Extracted Successfully</span></p>
          <p></p>
          <p>📦 Product Name: <span className="text-accent">Samsung Galaxy S25 Ultra</span></p>
          <p>🏢 Brand: <span className="text-accent">Samsung</span></p>
          <p>💰 Price: <span className="text-accent">₹99,999</span></p>
          <p>⭐ Rating: <span className="text-accent">4.8</span></p>
          <p>📊 Reviews: <span className="text-accent">12,456</span></p>
          <p>🎯 Confidence: <span className="text-emerald-400">98%</span></p>
          <p>🛍 Platform: <span className="text-accent">Amazon</span></p>
          <p>🔗 Product Link: <span className="text-primary">https://amazon.in/...</span></p>
          <p>🕒 Extracted: <span className="text-accent">{new Date().toLocaleDateString()}</span></p>
        </div>
        <p className="text-xs text-white/30 mt-3">+ Product image and JSON file attachment</p>
      </div>
    </div>
  );
}
