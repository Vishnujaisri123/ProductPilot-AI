import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Share2, Megaphone, FolderHeart, AlertTriangle, 
  CheckCircle, Loader, Key, RefreshCw, Trash2, ShieldCheck, HelpCircle, ExternalLink
} from 'lucide-react';
import api from '../../../lib/api';
import toast from 'react-hot-toast';

export default function SocialAccountsPage() {
  const qc = useQueryClient();
  const [testingId, setTestingId] = useState<string | null>(null);
  
  // Connect popup modal states
  const [activeConnectPlatform, setActiveConnectPlatform] = useState<string | null>(null);
  const [oauthStep, setOauthStep] = useState<number>(0);
  
  // Custom manual config states
  const [customForm, setCustomForm] = useState({
    accountName: '',
    accountId: '',
    botToken: '',
    chatId: '',
    boardId: '',
    pageId: '',
    channelId: '',
    accessToken: ''
  });

  // Query connected accounts
  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['social-accounts'],
    queryFn: () => api.get('/social/accounts').then(r => r.data)
  });

  // Mutation to connect account
  const connectMut = useMutation({
    mutationFn: (d: any) => api.post('/social/accounts/connect', d),
    onSuccess: () => {
      toast.success('Account connected successfully');
      setActiveConnectPlatform(null);
      setOauthStep(0);
      setCustomForm({ accountName: '', accountId: '', botToken: '', chatId: '', boardId: '', pageId: '', channelId: '', accessToken: '' });
      qc.invalidateQueries({ queryKey: ['social-accounts'] });
    },
    onError: () => toast.error('Connection failed')
  });

  // Mutation to delete account
  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/social/accounts/${id}`),
    onSuccess: () => {
      toast.success('Account disconnected');
      qc.invalidateQueries({ queryKey: ['social-accounts'] });
    }
  });

  const handleTest = async (id: string) => {
    setTestingId(id);
    try {
      const { data } = await api.post(`/social/accounts/${id}/test`);
      if (data.success) {
        toast.success(data.message || 'Connection active!');
        qc.invalidateQueries({ queryKey: ['social-accounts'] });
      } else {
        toast.error(data.message || 'Connection failed');
      }
    } catch {
      toast.error('Test failed');
    } finally {
      setTestingId(null);
    }
  };

  const startOauthSimulation = (platform: string) => {
    setActiveConnectPlatform(platform);
    setOauthStep(1); // 1 = authorization consent
    setCustomForm(p => ({
      ...p,
      accountName: `Official ${platform.toUpperCase()} Publisher`,
      accountId: `${platform}_user_` + Math.floor(Math.random() * 10000)
    }));
  };

  const handleOauthApprove = () => {
    setOauthStep(2); // 2 = loading callback
    setTimeout(() => {
      connectMut.mutate({
        platform: activeConnectPlatform,
        accountName: customForm.accountName,
        accountId: customForm.accountId,
        details: {
          pageId: customForm.pageId || 'mock_page_id',
          boardId: customForm.boardId || 'mock_board_id',
          channelId: customForm.channelId || 'mock_channel_id',
          accessToken: 'mock_token_abc123'
        }
      });
    }, 1500);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConnectPlatform) return;

    let details: any = {};
    if (activeConnectPlatform === 'telegram') {
      details = { botToken: customForm.botToken, chatId: customForm.chatId };
    } else if (activeConnectPlatform === 'instagram' || activeConnectPlatform === 'facebook') {
      details = { pageId: customForm.pageId, accessToken: customForm.accessToken };
    } else if (activeConnectPlatform === 'pinterest') {
      details = { boardId: customForm.boardId, accessToken: customForm.accessToken };
    } else if (activeConnectPlatform === 'youtube') {
      details = { channelId: customForm.channelId, accessToken: customForm.accessToken };
    }

    connectMut.mutate({
      platform: activeConnectPlatform,
      accountName: customForm.accountName || `My ${activeConnectPlatform.toUpperCase()}`,
      accountId: customForm.accountId || `acc_${Date.now()}`,
      details
    });
  };

  const PLATFORM_CARDS = [
    { id: 'telegram', name: 'Telegram Bot', icon: Send, color: 'text-sky-400', bg: 'bg-sky-400/10', desc: 'Deliver deal alerts instantly to channels/groups.' },
    { id: 'instagram', name: 'Instagram Professional', icon: Share2, color: 'text-pink-400', bg: 'bg-pink-400/10', desc: 'Publish visually premium product posts & Reels.' },
    { id: 'twitter', name: 'X (Twitter)', icon: Share2, color: 'text-neutral-200', bg: 'bg-neutral-200/5', desc: 'Share concise, high-conversion affiliate deal threads.' },
    { id: 'pinterest', name: 'Pinterest Pins', icon: Megaphone, color: 'text-red-400', bg: 'bg-red-400/10', desc: 'Post keyword-rich visual ideas & product pins.' },
    { id: 'youtube', name: 'YouTube Channels', icon: FolderHeart, color: 'text-rose-500', bg: 'bg-rose-500/10', desc: 'Share video clips as YouTube Shorts and Community updates.' }
  ];

  return (
    <div className="space-y-6">
      {/* Sub-Header Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-outfit">Social Accounts</h1>
          <p className="text-white/50 text-sm mt-1">Manage connected platforms and authorization API keys securely.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/social" className="px-4 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 text-sm font-medium transition-all">Overview</Link>
          <Link to="/admin/social/accounts" className="px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-medium border border-white/10">Accounts</Link>
          <Link to="/admin/social/campaigns" className="px-4 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 text-sm font-medium transition-all">Campaigns</Link>
          <Link to="/admin/social/library" className="px-4 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 text-sm font-medium transition-all">Library & History</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Connect New Platforms */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass p-6 rounded-2xl space-y-4">
            <h2 className="text-lg font-bold text-white font-outfit flex items-center gap-2">
              <Key size={18} className="text-primary" /> Supported Platforms
            </h2>
            <p className="text-sm text-white/40">Select a platform below to configure credentials or log in via OAuth simulation.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PLATFORM_CARDS.map(platform => {
                const isConnected = accounts.some(a => a.platform === platform.id);
                return (
                  <div key={platform.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between hover:bg-white/10 transition-all">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg ${platform.bg} flex items-center justify-center ${platform.color}`}>
                          <platform.icon size={18} />
                        </div>
                        <h3 className="font-semibold text-white">{platform.name}</h3>
                      </div>
                      <p className="text-xs text-white/50 mt-2 leading-relaxed">{platform.desc}</p>
                    </div>

                    <div className="flex gap-2 mt-4 pt-2 border-t border-white/5">
                      {platform.id === 'telegram' ? (
                        <button 
                          onClick={() => { setActiveConnectPlatform('telegram'); setOauthStep(0); }} 
                          className="w-full btn-secondary py-1.5 text-xs flex items-center justify-center gap-1"
                        >
                          Configure bot
                        </button>
                      ) : (
                        <>
                          <button 
                            onClick={() => startOauthSimulation(platform.id)}
                            className="flex-1 btn-primary py-1.5 text-xs"
                          >
                            OAuth Login
                          </button>
                          <button 
                            onClick={() => { setActiveConnectPlatform(platform.id); setOauthStep(0); }}
                            className="btn-ghost border border-white/10 py-1.5 text-[10px] text-white/60 hover:text-white"
                          >
                            Manual keys
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Connected Accounts list */}
        <div className="space-y-4">
          <div className="glass p-6 rounded-2xl space-y-4">
            <h2 className="text-lg font-bold text-white font-outfit flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-400" /> Active Connections
            </h2>

            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader className="animate-spin text-primary" size={24} />
              </div>
            ) : accounts.length === 0 ? (
              <div className="text-center py-10 bg-white/5 rounded-xl border border-dashed border-white/10 text-white/40 text-sm">
                No active connections. Configure a platform to enable publishing.
              </div>
            ) : (
              <div className="space-y-3">
                {accounts.map(acc => {
                  const card = PLATFORM_CARDS.find(p => p.id === acc.platform);
                  const isTesting = testingId === acc._id;
                  const isError = acc.healthStatus === 'error';
                  
                  return (
                    <div key={acc._id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-start justify-between">
                      <div className="flex gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-lg ${card?.bg || 'bg-white/5'} flex items-center justify-center shrink-0 ${card?.color || 'text-white'}`}>
                          {card && <card.icon size={18} />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate text-sm">{acc.accountName}</p>
                          <p className="text-[10px] text-white/40 truncate mt-0.5">ID: {acc.accountId}</p>
                          <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded mt-1.5 uppercase ${isError ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                            {isError ? 'Error / Expired' : 'Active'}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-1.5 shrink-0">
                        <button 
                          onClick={() => handleTest(acc._id)}
                          disabled={isTesting}
                          title="Test Connection"
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-white/60 hover:text-white transition-colors"
                        >
                          {isTesting ? <Loader className="animate-spin" size={14} /> : <RefreshCw size={14} />}
                        </button>
                        <button 
                          onClick={() => deleteMut.mutate(acc._id)}
                          title="Disconnect Account"
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/10 text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* POPUP MODALS FOR ACCOUNT CONNECTION */}
      <AnimatePresence>
        {activeConnectPlatform && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md glass rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            >
              
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-bg">
                <h3 className="text-lg font-bold text-white font-outfit">
                  Connect {activeConnectPlatform.toUpperCase()}
                </h3>
                <button 
                  onClick={() => setActiveConnectPlatform(null)} 
                  className="text-white/40 hover:text-white text-sm"
                >
                  Close
                </button>
              </div>

              {/* Step 1: Simulated OAuth Consent screen */}
              {oauthStep === 1 && (
                <div className="p-6 space-y-6 text-center">
                  <div className="flex justify-center items-center gap-4 py-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-bg font-bold">
                      PV
                    </div>
                    <span className="text-white/30 text-lg">⇄</span>
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-primary font-bold">
                      {activeConnectPlatform.toUpperCase().slice(0, 2)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-white text-md">Authorize ProductVision AI?</h4>
                    <p className="text-xs text-white/50 leading-relaxed px-4">
                      This will connect your {activeConnectPlatform.toUpperCase()} profile. ProductVision AI will request permission to read analytics data, manage public posts, and upload media content.
                    </p>
                  </div>

                  <div className="bg-white/5 p-3 rounded-xl text-left text-[11px] text-white/40 border border-white/5 space-y-1">
                    <p className="font-medium text-white/60">Permissions requested:</p>
                    <p>• Publish media assets and captions</p>
                    <p>• Retrieve audience impressions and view stats</p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button 
                      onClick={() => setActiveConnectPlatform(null)}
                      className="flex-1 btn-secondary py-2.5 text-xs"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleOauthApprove}
                      disabled={connectMut.isPending}
                      className="flex-1 btn-primary py-2.5 text-xs flex items-center justify-center gap-2"
                    >
                      {connectMut.isPending ? <Loader className="animate-spin" size={14} /> : 'Approve & Connect'}
                    </button>
                  </div>
                  
                  <div className="text-[10px] text-white/30 flex items-center justify-center gap-1">
                    <ShieldCheck size={12} className="text-emerald-400" />
                    Simulated secure sandbox connection
                  </div>
                </div>
              )}

              {/* Step 2: Loading Callback */}
              {oauthStep === 2 && (
                <div className="p-10 text-center space-y-4">
                  <Loader className="animate-spin text-primary mx-auto" size={36} />
                  <p className="text-sm font-semibold text-white">Callback processing...</p>
                  <p className="text-xs text-white/40">Storing credentials securely in the database</p>
                </div>
              )}

              {/* Step 0: Manual Keys Form */}
              {oauthStep === 0 && (
                <form onSubmit={handleManualSubmit} className="p-6 space-y-4">
                  <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-xl flex items-start gap-2.5 text-xs text-yellow-300">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Development Config:</span> Setup tokens/IDs manually. Enter mock details if you do not have active developer API keys.
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-white/50 mb-1.5 block">Account Name</label>
                    <input 
                      type="text" 
                      className="input py-2 text-sm" 
                      placeholder="e.g. My Telegram Channel"
                      value={customForm.accountName}
                      onChange={e => setCustomForm(p => ({ ...p, accountName: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs text-white/50 mb-1.5 block">Account ID (Optional)</label>
                    <input 
                      type="text" 
                      className="input py-2 text-sm" 
                      placeholder="e.g. chan_1234"
                      value={customForm.accountId}
                      onChange={e => setCustomForm(p => ({ ...p, accountId: e.target.value }))}
                    />
                  </div>

                  {activeConnectPlatform === 'telegram' && (
                    <>
                      <div>
                        <label className="text-xs text-white/50 mb-1.5 block">Bot Token</label>
                        <input 
                          type="text" 
                          className="input py-2 text-sm" 
                          placeholder="1234567890:ABCdef..."
                          value={customForm.botToken}
                          onChange={e => setCustomForm(p => ({ ...p, botToken: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs text-white/50 mb-1.5 block">Chat ID</label>
                        <input 
                          type="text" 
                          className="input py-2 text-sm" 
                          placeholder="-100123456789"
                          value={customForm.chatId}
                          onChange={e => setCustomForm(p => ({ ...p, chatId: e.target.value }))}
                          required
                        />
                      </div>
                    </>
                  )}

                  {activeConnectPlatform === 'instagram' && (
                    <>
                      <div>
                        <label className="text-xs text-white/50 mb-1.5 block">Facebook Page ID</label>
                        <input 
                          type="text" 
                          className="input py-2 text-sm" 
                          placeholder="Instagram professional profiles require a page ID link"
                          value={customForm.pageId}
                          onChange={e => setCustomForm(p => ({ ...p, pageId: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs text-white/50 mb-1.5 block">User Access Token</label>
                        <textarea 
                          className="input py-2 text-sm h-16 resize-none" 
                          placeholder="EAACEdEose..."
                          value={customForm.accessToken}
                          onChange={e => setCustomForm(p => ({ ...p, accessToken: e.target.value }))}
                          required
                        />
                      </div>
                    </>
                  )}

                  {activeConnectPlatform === 'pinterest' && (
                    <>
                      <div>
                        <label className="text-xs text-white/50 mb-1.5 block">Board ID (to publish to)</label>
                        <input 
                          type="text" 
                          className="input py-2 text-sm" 
                          placeholder="e.g. 1029384756"
                          value={customForm.boardId}
                          onChange={e => setCustomForm(p => ({ ...p, boardId: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs text-white/50 mb-1.5 block">Access Token</label>
                        <textarea 
                          className="input py-2 text-sm h-16 resize-none" 
                          placeholder="pina_..."
                          value={customForm.accessToken}
                          onChange={e => setCustomForm(p => ({ ...p, accessToken: e.target.value }))}
                          required
                        />
                      </div>
                    </>
                  )}

                  {activeConnectPlatform === 'youtube' && (
                    <>
                      <div>
                        <label className="text-xs text-white/50 mb-1.5 block">YouTube Channel ID</label>
                        <input 
                          type="text" 
                          className="input py-2 text-sm" 
                          placeholder="UC..."
                          value={customForm.channelId}
                          onChange={e => setCustomForm(p => ({ ...p, channelId: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs text-white/50 mb-1.5 block">Google Developer API Key</label>
                        <textarea 
                          className="input py-2 text-sm h-16 resize-none" 
                          placeholder="AIzaSy..."
                          value={customForm.accessToken}
                          onChange={e => setCustomForm(p => ({ ...p, accessToken: e.target.value }))}
                          required
                        />
                      </div>
                    </>
                  )}

                  {activeConnectPlatform === 'twitter' && (
                    <div>
                      <label className="text-xs text-white/50 mb-1.5 block">OAuth Access Token</label>
                      <textarea 
                        className="input py-2 text-sm h-16 resize-none" 
                        placeholder="12345678-..."
                        value={customForm.accessToken}
                        onChange={e => setCustomForm(p => ({ ...p, accessToken: e.target.value }))}
                        required
                      />
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button 
                      type="button"
                      onClick={() => setActiveConnectPlatform(null)}
                      className="flex-1 btn-secondary py-2.5 text-xs"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={connectMut.isPending}
                      className="flex-1 btn-primary py-2.5 text-xs flex items-center justify-center gap-2"
                    >
                      {connectMut.isPending ? <Loader className="animate-spin" size={14} /> : 'Save Configuration'}
                    </button>
                  </div>

                </form>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
