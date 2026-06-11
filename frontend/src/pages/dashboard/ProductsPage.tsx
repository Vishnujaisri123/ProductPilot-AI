import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search, Filter, Link as LinkIcon, Send, Eye, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { getConfidenceColor, formatDate } from '../../lib/utils';

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [affiliateLink, setAffiliateLink] = useState('');

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', platformFilter, statusFilter, search],
    queryFn: () => {
      const params = new URLSearchParams();
      if (platformFilter !== 'All') params.append('platform', platformFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (search) params.append('search', search);
      return api.get(`/products?${params.toString()}`).then(r => r.data);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, link }: { id: string, link: string }) => api.patch(`/products/${id}`, { affiliateLink: link }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Affiliate link saved!');
      setLinkModalOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted');
    }
  });

  const bulkTelegramMutation = useMutation({
    mutationFn: (ids: string[]) => api.post('/products/telegram/bulk', { productIds: ids }).then(r => r.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      if (data.failCount === 0) {
        toast.success(`Successfully sent ${data.successCount} products to Telegram!`);
      } else {
        toast.error(`Sent ${data.successCount}, failed ${data.failCount}. Check if they have affiliate links.`);
      }
      setSelectedIds([]);
    }
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === products.length) setSelectedIds([]);
    else setSelectedIds(products.map((p: any) => p._id));
  };

  const handleBulkSend = () => {
    if (selectedIds.length === 0) return;
    bulkTelegramMutation.mutate(selectedIds);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Products Library</h1>
          <p className="text-white/50">Manage your curated products and dispatch them to Telegram.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkSend}
              disabled={bulkTelegramMutation.isPending}
              className="btn btn-primary shadow-glow-primary flex items-center gap-2"
            >
              <Send size={16} /> 
              {bulkTelegramMutation.isPending ? 'Sending...' : `Send Selected (${selectedIds.length})`}
            </button>
          )}
        </div>
      </div>

      <div className="glass p-4 rounded-2xl flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-[300px]">
          <div className="relative flex-1 max-w-sm">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10 py-2 w-full text-sm bg-white/5"
              placeholder="Search products..."
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-white/40" />
            <select className="input py-2 text-sm bg-white/5 border-none" value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)}>
              <option value="All">All Platforms</option>
              <option value="amazon">Amazon</option>
              <option value="flipkart">Flipkart</option>
              <option value="meesho">Meesho</option>
            </select>
            <select className="input py-2 text-sm bg-white/5 border-none" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="Draft">Draft (No Link)</option>
              <option value="Ready">Ready (Has Link)</option>
              <option value="Sent">Sent to Telegram</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            className="w-4 h-4 rounded bg-white/5 border border-white/10"
            checked={products.length > 0 && selectedIds.length === products.length}
            onChange={toggleSelectAll}
          />
          <span className="text-sm text-white/50">Select All</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-white/40 glass rounded-2xl">
          <p>No products found in the library.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((p: any, i: number) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.05 }}
              key={p._id} 
              className="glass rounded-2xl overflow-hidden group flex flex-col relative"
            >
              <div className="absolute top-3 left-3 z-10">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded bg-black/50 border border-white/30 checked:bg-primary checked:border-primary cursor-pointer"
                  checked={selectedIds.includes(p._id)}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedIds([...selectedIds, p._id]);
                    else setSelectedIds(selectedIds.filter(id => id !== p._id));
                  }}
                />
              </div>

              <div className="absolute top-3 right-3 z-10 flex gap-2">
                <div className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 backdrop-blur-md ${
                  p.status === 'Sent' ? 'bg-emerald-500/80 text-white' : 
                  p.status === 'Ready' ? 'bg-blue-500/80 text-white' : 'bg-amber-500/80 text-white'
                }`}>
                  {p.status === 'Sent' && <CheckCircle2 size={12} />}
                  {p.status === 'Ready' && <CheckCircle2 size={12} />}
                  {p.status === 'Draft' && <AlertCircle size={12} />}
                  {p.status}
                </div>
              </div>

              <div className="aspect-square bg-white/5 relative overflow-hidden">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.productName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20">No Image</div>
                )}
                
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-bg to-transparent h-20" />
                <div className="absolute bottom-2 left-3 flex items-center gap-2">
                  <span className="px-2 py-1 bg-black/50 backdrop-blur-md rounded-lg text-[10px] uppercase font-bold text-white/80 border border-white/10">
                    {p.platform || 'Unknown'}
                  </span>
                  <span className={`px-2 py-1 bg-black/50 backdrop-blur-md rounded-lg text-[10px] font-bold border border-white/10 ${getConfidenceColor(p.confidenceScore)}`}>
                    {p.confidenceScore}% Valid
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-semibold line-clamp-2 text-sm mb-2" title={p.productName}>{p.productName}</h3>
                
                <div className="mt-auto">
                  <div className="flex items-center gap-3 text-sm mb-4">
                    <div className="flex flex-col">
                      {(() => {
                        const ext = p.extractionId?.extracted || {};
                        const dealPrice = p.discountPrice || ext.discount_price?.value;
                        const mrp = p.price || ext.price?.value;
                        const displayDealPrice = dealPrice || mrp || 'N/A';
                        
                        return (
                          <>
                            <span className="text-white font-bold text-lg">{displayDealPrice}</span>
                            {dealPrice && mrp && dealPrice !== mrp && (
                              <span className="text-white/40 line-through text-xs">{mrp}</span>
                            )}
                          </>
                        );
                      })()}
                    </div>
                    {p.rating && <span className="flex items-center gap-1 text-yellow-400 ml-auto">★ {p.rating}</span>}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <button 
                      onClick={() => { setEditingProduct(p); setAffiliateLink(p.affiliateLink || ''); setLinkModalOpen(true); }}
                      className={`btn btn-sm ${p.affiliateLink ? 'glass-hover text-white/80' : 'bg-primary/20 text-primary hover:bg-primary/30'} flex items-center justify-center gap-1.5`}
                    >
                      <LinkIcon size={14} /> {p.affiliateLink ? 'Edit Link' : 'Add Link'}
                    </button>
                    
                    <Link to={`/admin/products/${p._id}`} className="btn btn-sm glass-hover flex items-center justify-center gap-1.5">
                      <Eye size={14} /> View Details
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button 
                      onClick={() => bulkTelegramMutation.mutate([p._id])}
                      disabled={p.status === 'Draft' || bulkTelegramMutation.isPending}
                      className="btn btn-sm glass-hover flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed text-blue-400"
                    >
                      <Send size={14} /> Send TG
                    </button>
                    
                    <button 
                      onClick={() => {
                        if (confirm('Delete this product?')) deleteMutation.mutate(p._id);
                      }}
                      className="btn btn-sm glass-hover flex items-center justify-center gap-1.5 text-red-400 hover:bg-red-400/10"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Affiliate Link Modal */}
      {linkModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-bg/80 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass w-full max-w-md rounded-2xl p-6 border border-white/10 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Add Affiliate Link</h2>
            <div className="flex gap-4 mb-6 p-4 bg-white/5 rounded-xl border border-white/5">
              {editingProduct.imageUrl && (
                <img src={editingProduct.imageUrl} className="w-16 h-16 rounded-lg object-cover" />
              )}
              <div>
                <div className="font-semibold text-sm line-clamp-2">{editingProduct.productName}</div>
                <div className="text-white/40 text-xs mt-1 capitalize">{editingProduct.platform}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/50 mb-1">Affiliate URL</label>
                <input 
                  type="url" 
                  value={affiliateLink}
                  onChange={(e) => setAffiliateLink(e.target.value)}
                  className="input w-full"
                  placeholder="https://amzn.to/..."
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button className="btn btn-ghost" onClick={() => setLinkModalOpen(false)}>Cancel</button>
              <button 
                className="btn btn-primary"
                onClick={() => updateMutation.mutate({ id: editingProduct._id, link: affiliateLink })}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Link'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
