import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Send, Zap, ShieldCheck, FileJson, History } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { getConfidenceColor, formatDate } from '../../lib/utils';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [affiliateLink, setAffiliateLink] = useState('');
  const [activeTab, setActiveTab] = useState('data');

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.get(`/products/${id}`).then(r => {
      setAffiliateLink(r.data.affiliateLink || '');
      return r.data;
    })
  });

  const updateMutation = useMutation({
    mutationFn: (link: string) => api.patch(`/products/${id}`, { affiliateLink: link }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      toast.success('Affiliate link updated!');
    }
  });

  const sendTelegramMutation = useMutation({
    mutationFn: () => api.post('/products/telegram/bulk', { productIds: [id] }).then(r => r.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      if (data.failCount === 0) toast.success('Sent to Telegram successfully!');
      else toast.error(data.errors[0]?.error || 'Failed to send');
    }
  });

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!product) {
    return <div className="text-center py-20">Product not found.</div>;
  }

  const ext = product.extractionId || {};
  const eData = ext.extracted || {};

  return (
    <div className="space-y-6 pb-20">
      <Link to="/admin/products" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-medium">
        <ArrowLeft size={16} /> Back to Products
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Image & Actions */}
        <div className="space-y-6">
          <div className="glass p-4 rounded-2xl">
            <div className="aspect-square bg-white/5 rounded-xl overflow-hidden mb-4 relative">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.productName} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/20">No Image</div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3">
                <label className="block text-sm font-medium text-white/70">Affiliate Link</label>
                <input 
                  type="url" 
                  value={affiliateLink}
                  onChange={(e) => setAffiliateLink(e.target.value)}
                  className="input w-full text-sm"
                  placeholder="https://amzn.to/..."
                />
                <button 
                  onClick={() => updateMutation.mutate(affiliateLink)}
                  disabled={updateMutation.isPending || affiliateLink === product.affiliateLink}
                  className="btn btn-primary w-full shadow-glow-primary"
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Link'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => sendTelegramMutation.mutate()}
                  disabled={!product.affiliateLink || sendTelegramMutation.isPending}
                  className="btn glass-hover text-blue-400 flex items-center justify-center gap-2"
                >
                  <Send size={16} /> Send TG
                </button>
                {product.affiliateLink && (
                  <a href={product.affiliateLink} target="_blank" rel="noreferrer" className="btn glass-hover flex items-center justify-center gap-2">
                    <ExternalLink size={16} /> Visit
                  </a>
                )}
              </div>
            </div>
          </div>
          
          <div className="glass p-6 rounded-2xl space-y-4">
            <h3 className="font-semibold flex items-center gap-2"><History size={18} className="text-white/50" /> Meta Status</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-white/50">Status</span>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  product.status === 'Sent' ? 'bg-emerald-400/20 text-emerald-400' :
                  product.status === 'Ready' ? 'bg-blue-400/20 text-blue-400' : 'bg-amber-400/20 text-amber-400'
                }`}>{product.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Created</span>
                <span className="text-white/80">{formatDate(product.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Telegram</span>
                <span className="text-white/80">{product.telegramSent ? 'Sent' : 'Pending'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Data & Tabs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-6 rounded-2xl">
            <h1 className="text-2xl font-bold mb-2">{product.productName}</h1>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider text-white/80">
                {product.platform || 'Unknown'}
              </span>
              <span className={`px-3 py-1 bg-white/10 rounded-full text-xs font-bold ${getConfidenceColor(product.confidenceScore)}`}>
                {product.confidenceScore}% Confidence
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="text-white/40 text-xs mb-1">Price</div>
                <div className="font-semibold text-lg">{product.price || 'N/A'}</div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="text-white/40 text-xs mb-1">Rating</div>
                <div className="font-semibold text-lg">{product.rating || 'N/A'}</div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="text-white/40 text-xs mb-1">Brand</div>
                <div className="font-semibold text-lg line-clamp-1">{product.brand || 'N/A'}</div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="text-white/40 text-xs mb-1">Category</div>
                <div className="font-semibold text-lg line-clamp-1">{product.category || 'N/A'}</div>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl overflow-hidden">
            <div className="flex border-b border-white/5">
              <button 
                onClick={() => setActiveTab('data')} 
                className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'data' ? 'border-b-2 border-primary text-primary' : 'text-white/50 hover:text-white'}`}
              >
                Extracted Data
              </button>
              <button 
                onClick={() => setActiveTab('rag')} 
                className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'rag' ? 'border-b-2 border-primary text-primary' : 'text-white/50 hover:text-white'}`}
              >
                RAG Context
              </button>
              <button 
                onClick={() => setActiveTab('json')} 
                className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'json' ? 'border-b-2 border-primary text-primary' : 'text-white/50 hover:text-white'}`}
              >
                JSON Raw
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'data' && (
                <div className="space-y-4">
                  {Object.entries(eData).map(([key, item]: any) => (
                    item?.value && key !== 'features' && (
                      <div key={key} className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-white/5 last:border-0">
                        <span className="sm:w-1/3 text-white/50 text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className="sm:w-2/3 font-medium text-sm break-words">{String(item.value)}</span>
                      </div>
                    )
                  ))}
                  {eData.features?.value && eData.features.value.length > 0 && (
                    <div className="py-3">
                      <span className="text-white/50 text-sm capitalize block mb-2">Features</span>
                      <ul className="list-disc pl-5 space-y-1 text-sm font-medium text-white/80">
                        {eData.features.value.map((f: string, i: number) => <li key={i}>{f}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'rag' && (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-primary/10 rounded-xl border border-primary/20 text-primary">
                    <ShieldCheck className="shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold mb-1">RAG Validation Applied</h4>
                      <p className="text-sm opacity-80">The system cross-referenced this extraction with external knowledge to ensure accuracy and infer missing data points.</p>
                    </div>
                  </div>
                  {ext.ragContext?.length ? (
                    <div className="space-y-2 mt-4">
                      {ext.ragContext.map((ctx: string, i: number) => (
                        <div key={i} className="p-3 bg-white/5 rounded-lg text-sm text-white/70 font-mono border border-white/5">{ctx}</div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-white/40 text-sm italic py-4">No specific RAG context was required for this extraction.</div>
                  )}
                </div>
              )}

              {activeTab === 'json' && (
                <div className="relative group">
                  <div className="absolute top-4 right-4 text-white/30"><FileJson size={20} /></div>
                  <pre className="p-4 bg-black/40 rounded-xl text-xs text-white/70 overflow-x-auto border border-white/5">
                    {JSON.stringify(eData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
