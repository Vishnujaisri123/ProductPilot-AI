import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Share2, Megaphone, FolderHeart, Calendar, BarChart3, 
  Send, Users, Eye, MousePointerClick, TrendingUp, AlertCircle, CheckCircle2, ChevronRight, Clock, Plus
} from 'lucide-react';
import api from '../../../lib/api';

export default function SocialHubPage() {
  // Query to get connected accounts
  const { data: accounts = [] } = useQuery({
    queryKey: ['social-accounts'],
    queryFn: () => api.get('/social/accounts').then(r => r.data)
  });

  // Query to get campaigns
  const { data: campaigns = [] } = useQuery({
    queryKey: ['social-campaigns'],
    queryFn: () => api.get('/social/campaigns').then(r => r.data)
  });

  // Query to get posts
  const { data: postsData } = useQuery({
    queryKey: ['social-posts'],
    queryFn: () => api.get('/social/posts').then(r => r.data)
  });

  const posts = postsData?.posts || [];

  // Platforms we support
  const PLATFORMS = [
    { id: 'telegram', name: 'Telegram', icon: Send, color: 'text-sky-400', bg: 'bg-sky-400/10' },
    { id: 'instagram', name: 'Instagram', icon: Share2, color: 'text-pink-400', bg: 'bg-pink-400/10' },
    { id: 'twitter', name: 'X (Twitter)', icon: Share2, color: 'text-neutral-400', bg: 'bg-neutral-400/10' },
    { id: 'pinterest', name: 'Pinterest', icon: Megaphone, color: 'text-red-400', bg: 'bg-red-400/10' },
    { id: 'youtube', name: 'YouTube', icon: FolderHeart, color: 'text-rose-500', bg: 'bg-rose-500/10' }
  ];

  // Aggregated analytics metrics (simulated/calculated from posts)
  const totalAnalytics = posts.reduce((acc, p) => {
    if (p.status === 'published' && p.analytics) {
      acc.impressions += p.analytics.impressions || 0;
      acc.clicks += p.analytics.clicks || 0;
      acc.affiliateClicks += p.analytics.affiliateClicks || 0;
      acc.conversions += p.analytics.conversions || 0;
    }
    return acc;
  }, { impressions: 12450, clicks: 1820, affiliateClicks: 1450, conversions: 89 }); // seed values for mockup context

  const activeCampaigns = campaigns.filter(c => c.status === 'active');
  const scheduledPosts = posts.filter(p => p.status === 'scheduled');
  const recentPosts = posts.filter(p => p.status === 'published').slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Sub-Header Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-outfit">Social Media Hub</h1>
          <p className="text-white/50 text-sm mt-1">Cross-platform affiliate marketing automation command center.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/social" className="px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-medium border border-white/10">Overview</Link>
          <Link to="/admin/social/accounts" className="px-4 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 text-sm font-medium transition-all">Accounts</Link>
          <Link to="/admin/social/campaigns" className="px-4 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 text-sm font-medium transition-all">Campaigns</Link>
          <Link to="/admin/social/library" className="px-4 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 text-sm font-medium transition-all">Library & History</Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-white/40 font-medium uppercase tracking-wider">Total Impressions</p>
            <h3 className="text-2xl font-bold text-white font-outfit">{(totalAnalytics.impressions).toLocaleString()}</h3>
            <p className="text-xs text-emerald-400 flex items-center gap-1"><TrendingUp size={12} /> +12.4% vs last week</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Eye size={22} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-white/40 font-medium uppercase tracking-wider">Total Link Clicks</p>
            <h3 className="text-2xl font-bold text-white font-outfit">{(totalAnalytics.clicks).toLocaleString()}</h3>
            <p className="text-xs text-emerald-400 flex items-center gap-1"><TrendingUp size={12} /> +18.9% vs last week</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
            <MousePointerClick size={22} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-white/40 font-medium uppercase tracking-wider">Affiliate Redirections</p>
            <h3 className="text-2xl font-bold text-white font-outfit">{(totalAnalytics.affiliateClicks).toLocaleString()}</h3>
            <p className="text-xs text-emerald-400 flex items-center gap-1"><TrendingUp size={12} /> +14.2% click-thru</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <Users size={22} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass p-5 rounded-2xl flex items-center justify-between text-glow">
          <div className="space-y-1">
            <p className="text-xs text-white/40 font-medium uppercase tracking-wider">Estimated Revenue</p>
            <h3 className="text-2xl font-bold text-emerald-400 font-outfit">₹{(totalAnalytics.conversions * 149).toLocaleString()}</h3>
            <p className="text-xs text-emerald-400 flex items-center gap-1"><TrendingUp size={12} /> +22.1% in payouts</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <BarChart3 size={22} />
          </div>
        </motion.div>
      </div>

      {/* Main Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Social Channels Status & Quick Campaigns */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Social Channels Health */}
          <div className="glass p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white font-outfit flex items-center gap-2">
                <Share2 size={18} className="text-primary animate-pulse" /> Connected Social Channels
              </h2>
              <Link to="/admin/social/accounts" className="text-xs text-primary hover:underline flex items-center gap-1">
                Manage Accounts <ChevronRight size={12} />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PLATFORMS.map(platform => {
                const connectedAcc = accounts.find(a => a.platform === platform.id);
                const isConnected = !!connectedAcc;
                const isError = connectedAcc?.healthStatus === 'error';
                
                return (
                  <div key={platform.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg ${platform.bg} flex items-center justify-center ${platform.color}`}>
                        <platform.icon size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{platform.name}</p>
                        <p className="text-xs text-white/40 truncate max-w-[120px]">
                          {isConnected ? connectedAcc.accountName : 'Not Connected'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isConnected ? (
                        isError ? (
                          <span className="flex items-center gap-1 text-xs text-rose-400 bg-rose-400/10 px-2 py-1 rounded-full">
                            <AlertCircle size={10} /> Expired
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
                            <CheckCircle2 size={10} /> Active
                          </span>
                        )
                      ) : (
                        <Link to="/admin/social/accounts" className="text-xs text-white/40 hover:text-white bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 transition-colors">
                          Connect
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Campaigns */}
          <div className="glass p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white font-outfit flex items-center gap-2">
                <Megaphone size={18} className="text-secondary" /> Marketing Campaigns
              </h2>
              <Link to="/admin/social/campaigns" className="text-xs text-primary hover:underline flex items-center gap-1">
                View All Campaigns <ChevronRight size={12} />
              </Link>
            </div>

            {activeCampaigns.length === 0 ? (
              <div className="text-center py-8 bg-white/5 rounded-xl border border-dashed border-white/10">
                <p className="text-sm text-white/40">No active campaigns currently.</p>
                <Link to="/admin/social/campaigns" className="btn-primary inline-flex items-center gap-1 px-3 py-1.5 text-xs mt-3">
                  <Plus size={12} /> Create Campaign
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeCampaigns.slice(0, 4).map(campaign => (
                  <Link to="/admin/social/campaigns" key={campaign._id} className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-white truncate max-w-[140px]">{campaign.name}</h3>
                        <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Active</span>
                      </div>
                      <p className="text-xs text-white/50 mt-1 line-clamp-2">{campaign.description || 'No description provided.'}</p>
                    </div>
                    <div className="text-[10px] text-white/30 mt-3 flex items-center gap-1">
                      <Calendar size={10} />
                      {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : 'N/A'} - {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : 'N/A'}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Scheduler / Upcoming Calendar & Recent Activity */}
        <div className="space-y-6">
          
          {/* Scheduling Calendar overview */}
          <div className="glass p-6 rounded-2xl space-y-4">
            <h2 className="text-lg font-bold text-white font-outfit flex items-center gap-2">
              <Calendar size={18} className="text-accent" /> Upcoming Schedule
            </h2>

            {scheduledPosts.length === 0 ? (
              <div className="text-center py-10 bg-white/5 rounded-xl border border-dashed border-white/10 text-white/40">
                <p className="text-sm">No posts scheduled.</p>
                <p className="text-xs mt-1 text-white/30">Upload a screenshot and use the Creator Studio to queue one!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {scheduledPosts.map(post => {
                  const platformObj = PLATFORMS.find(p => p.id === post.platform);
                  
                  return (
                    <div key={post._id} className="flex gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                      {post.content?.thumbnailUrl ? (
                        <img src={post.content.thumbnailUrl} className="w-12 h-12 rounded-lg object-cover bg-black/40 shrink-0" alt="Preview" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                          <Share2 size={16} className="text-white/30" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${platformObj?.color || 'text-white'}`}>
                            {platformObj && <platformObj.icon size={10} />}
                            {post.platform}
                          </span>
                          <span className="text-[10px] text-white/40 flex items-center gap-0.5">
                            <Clock size={10} />
                            {new Date(post.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-white truncate mt-1">
                          {post.productId?.productName || 'Post details'}
                        </p>
                        <p className="text-[10px] text-white/40 mt-0.5">
                          Date: {new Date(post.scheduledAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Activity Logs */}
          <div className="glass p-6 rounded-2xl space-y-4">
            <h2 className="text-lg font-bold text-white font-outfit flex items-center gap-2">
              <Clock size={18} className="text-primary" /> Recent Activity
            </h2>

            {recentPosts.length === 0 ? (
              <p className="text-sm text-white/40 text-center py-6">No recent publishing history.</p>
            ) : (
              <div className="space-y-3">
                {recentPosts.map(post => {
                  const platformObj = PLATFORMS.find(p => p.id === post.platform);
                  
                  return (
                    <div key={post._id} className="flex items-center justify-between text-xs p-2 rounded-lg hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-lg ${platformObj?.bg || 'bg-white/5'} flex items-center justify-center shrink-0 ${platformObj?.color || 'text-white'}`}>
                          {platformObj && <platformObj.icon size={14} />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate max-w-[130px]">{post.productId?.productName || 'Direct post'}</p>
                          <p className="text-[10px] text-white/30">Published successfully</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-white/30">
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
        </div>

      </div>
    </div>
  );
}
