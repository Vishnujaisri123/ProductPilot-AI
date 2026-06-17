import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BarChart3, RefreshCw, Trash2, Loader, Eye, Send, Share2, 
  Megaphone, FolderHeart, ExternalLink, Calendar, Search, SlidersHorizontal, AlertCircle
} from 'lucide-react';
import api from '../../../lib/api';
import toast from 'react-hot-toast';

export default function ContentLibraryPage() {
  const qc = useQueryClient();
  const [platformFilter, setPlatformFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Query posts
  const { data: postsData, isLoading } = useQuery({
    queryKey: ['social-posts', platformFilter, statusFilter, page],
    queryFn: () => api.get('/social/posts', {
      params: { platform: platformFilter || undefined, status: statusFilter || undefined, page, limit: 10 }
    }).then(r => r.data),
    placeholderData: (prev) => prev
  });

  // Mutation to delete post
  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/social/posts/${id}`),
    onSuccess: () => {
      toast.success('Post removed from library');
      qc.invalidateQueries({ queryKey: ['social-posts'] });
    }
  });

  const posts = postsData?.posts || [];
  const totalPages = postsData?.pages || 1;

  const PLATFORMS = [
    { id: 'telegram', name: 'Telegram', icon: Send, color: 'text-sky-400', bg: 'bg-sky-400/10' },
    { id: 'instagram', name: 'Instagram', icon: Share2, color: 'text-pink-400', bg: 'bg-pink-400/10' },
    { id: 'twitter', name: 'X (Twitter)', icon: Share2, color: 'text-neutral-400', bg: 'bg-neutral-400/10' },
    { id: 'pinterest', name: 'Pinterest', icon: Megaphone, color: 'text-red-400', bg: 'bg-red-400/10' },
    { id: 'youtube', name: 'YouTube', icon: FolderHeart, color: 'text-rose-500', bg: 'bg-rose-500/10' }
  ];

  return (
    <div className="space-y-6">
      {/* Sub-Header Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-outfit">Content Library</h1>
          <p className="text-white/50 text-sm mt-1">Review historical metrics, manage scheduled drafts, and check analytics.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/social" className="px-4 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 text-sm font-medium transition-all">Overview</Link>
          <Link to="/admin/social/accounts" className="px-4 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 text-sm font-medium transition-all">Accounts</Link>
          <Link to="/admin/social/campaigns" className="px-4 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 text-sm font-medium transition-all">Campaigns</Link>
          <Link to="/admin/social/library" className="px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-medium border border-white/10">Library & History</Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-white/40 font-semibold uppercase shrink-0">
            <SlidersHorizontal size={14} /> Filter library
          </div>
          
          <select 
            className="bg-white/5 border border-white/10 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-primary transition-colors"
            value={platformFilter}
            onChange={e => { setPlatformFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Platforms</option>
            <option value="telegram">Telegram</option>
            <option value="instagram">Instagram</option>
            <option value="pinterest">Pinterest</option>
            <option value="twitter">X (Twitter)</option>
            <option value="youtube">YouTube</option>
          </select>

          <select 
            className="bg-white/5 border border-white/10 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-primary transition-colors"
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="publishing">Publishing</option>
            <option value="published">Published</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <button 
          onClick={() => qc.invalidateQueries({ queryKey: ['social-posts'] })}
          className="text-xs text-primary hover:underline flex items-center gap-1 shrink-0"
        >
          <RefreshCw size={12} /> Refresh Data
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader className="animate-spin text-primary" size={32} />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 bg-white/5 rounded-3xl border border-dashed border-white/10 text-white/40">
          <Calendar className="mx-auto text-white/20 mb-3" size={40} />
          <p className="font-semibold text-white/80">No posts found in library</p>
          <p className="text-xs mt-1">Change your filters or schedule a new product post from the Products page.</p>
        </div>
      ) : (
        <div className="glass rounded-3xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/5 text-xs font-semibold text-white/60 uppercase">
                  <th className="py-4 px-6">Product</th>
                  <th className="py-4 px-6">Platform</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Publish Time</th>
                  <th className="py-4 px-6 text-center">Reach / Views</th>
                  <th className="py-4 px-6 text-center">Aff. Clicks</th>
                  <th className="py-4 px-6 text-center">Payout Rev</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {posts.map((post: any) => {
                  const card = PLATFORMS.find(p => p.id === post.platform);
                  const isFailed = post.status === 'failed';
                  const isScheduled = post.status === 'scheduled';
                  const isPublished = post.status === 'published';
                  
                  // Calculate mock conversions revenue
                  const conversions = post.analytics?.conversions || 0;
                  const estimatedRev = conversions * 149; // ₹149 avg payout per commission

                  return (
                    <tr key={post._id} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6 max-w-[200px]">
                        <div className="flex items-center gap-3">
                          {post.content?.thumbnailUrl ? (
                            <img src={post.content.thumbnailUrl} className="w-10 h-10 rounded-lg object-cover bg-black/40 shrink-0" alt="" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                              <Search size={14} className="text-white/20" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-white truncate text-xs" title={post.productId?.productName}>
                              {post.productId?.productName || 'Unnamed Product'}
                            </p>
                            <p className="text-[10px] text-white/40 truncate">
                              {post.campaignId?.name || 'No Campaign'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${card?.color || 'text-white'}`}>
                          {card && <card.icon size={12} />}
                          {post.platform.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          isPublished ? 'bg-emerald-500/10 text-emerald-400' :
                          isScheduled ? 'bg-blue-500/10 text-blue-400' :
                          isFailed ? 'bg-rose-500/10 text-rose-400' : 'bg-white/10 text-white/50'
                        }`}>
                          {post.status}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-xs text-white/60">
                        {isPublished ? (
                          <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleString() : 'N/A'}</span>
                        ) : isScheduled ? (
                          <span className="text-blue-400 flex items-center gap-1"><Calendar size={12} /> {post.scheduledAt ? new Date(post.scheduledAt).toLocaleString() : 'N/A'}</span>
                        ) : (
                          <span className="text-white/30">Not Published</span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-center text-xs font-semibold text-white">
                        {isPublished ? (
                          <div>
                            <p>{(post.analytics?.impressions || 0).toLocaleString()}</p>
                            <p className="text-[10px] text-white/40 mt-0.5">{(post.analytics?.views || 0).toLocaleString()} views</p>
                          </div>
                        ) : (
                          <span className="text-white/20">—</span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-center text-xs font-bold text-secondary">
                        {isPublished ? (post.analytics?.affiliateClicks || 0).toLocaleString() : <span className="text-white/20">—</span>}
                      </td>

                      <td className="py-4 px-6 text-center text-xs font-bold text-emerald-400">
                        {isPublished ? `₹${estimatedRev.toLocaleString()}` : <span className="text-white/20">—</span>}
                      </td>

                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {isPublished && post.postExternalId && (
                            <a 
                              href={post.content.videoUrl || post.content.thumbnailUrl || '#'} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              title="View post link"
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-white/60 hover:text-white transition-colors"
                            >
                              <ExternalLink size={12} />
                            </a>
                          )}
                          <button 
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this post record? This will cancel any pending schedule.')) {
                                deleteMut.mutate(post._id);
                              }
                            }}
                            title="Delete"
                            className="p-1.5 rounded-lg bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 text-red-400/80 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-white/5 bg-white/5 flex items-center justify-between">
              <span className="text-xs text-white/40">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="btn-secondary px-3 py-1.5 text-xs"
                >
                  Previous
                </button>
                <button 
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="btn-secondary px-3 py-1.5 text-xs"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
