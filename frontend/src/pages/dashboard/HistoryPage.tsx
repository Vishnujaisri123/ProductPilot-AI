import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Download, RefreshCw, ExternalLink, Bot, Eye } from 'lucide-react';
import api from '../../lib/api';
import { getConfidenceColor, formatDate } from '../../lib/utils';

const PLATFORMS = ['', 'amazon', 'flipkart', 'meesho', 'alibaba', 'myntra', 'ajio', 'shopify'];

export default function HistoryPage() {
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['history', page, search, platform],
    queryFn: () => api.get(`/extract/history?page=${page}&search=${search}&platform=${platform}`).then(r => r.data),
    keepPreviousData: true,
  } as any);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">History</h1>
          <p className="text-white/50">All your extraction results.</p>
        </div>
        <div className="flex gap-3">
          <a href="/api/extract/export/csv" className="btn-secondary flex items-center gap-2 text-sm py-2">
            <Download size={16} /> CSV
          </a>
          <a href="/api/extract/export/excel" className="btn-secondary flex items-center gap-2 text-sm py-2">
            <Download size={16} /> Excel
          </a>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            className="input pl-9 py-2 w-64 text-sm"
            placeholder="Search products..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="input py-2 text-sm w-44"
          value={platform}
          onChange={e => { setPlatform(e.target.value); setPage(1); }}
        >
          {PLATFORMS.map(p => <option key={p} value={p}>{p || 'All Platforms'}</option>)}
        </select>
        <button onClick={() => refetch()} className="btn-ghost p-2">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="text-center py-16 text-white/30">Loading...</div>
        ) : data?.extractions?.length ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Image', 'Product', 'Brand', 'Price', 'Platform', 'Confidence', 'Telegram', 'Date', 'Actions', 'View'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-white/40 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.extractions.map((e: any, i: number) => (
                    <motion.tr key={e._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                      <td className="px-5 py-3">
                        {e.imageUrl && <img src={e.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                      </td>
                      <td className="px-5 py-3 max-w-xs">
                        <div className="truncate font-medium">{e.extracted?.product_name?.value || e.sourceImageName}</div>
                      </td>
                      <td className="px-5 py-3 text-white/60">{e.extracted?.brand?.value || '—'}</td>
                      <td className="px-5 py-3 text-accent">{e.extracted?.price?.value || '—'}</td>
                      <td className="px-5 py-3 capitalize text-white/60">{e.platform || '—'}</td>
                      <td className="px-5 py-3">
                        <span className={`font-semibold ${getConfidenceColor(e.confidenceScore)}`}>{e.confidenceScore}%</span>
                      </td>
                      <td className="px-5 py-3">
                        {e.telegramSent && <Bot size={16} className="text-primary" />}
                      </td>
                      <td className="px-5 py-3 text-white/40">{formatDate(e.createdAt)}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <a href={`/api/extract/${e._id}/export/json`} className="p-1.5 glass rounded-lg hover:bg-white/10 transition-colors" title="Download JSON">
                            <Download size={14} />
                          </a>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        {e.productId && (
                          <Link 
                            to={`/admin/products/${e.productId}`} 
                            className="p-1.5 glass rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center"
                          >
                            <Eye size={14} />
                          </Link>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-white/5">
              <span className="text-sm text-white/40">{data.total} total</span>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost text-sm px-3 py-1 disabled:opacity-30">Prev</button>
                <span className="text-sm text-white/50 px-3 py-1">Page {page} / {data.pages}</span>
                <button onClick={() => setPage(p => Math.min(data.pages, p + 1))} disabled={page === data.pages} className="btn-ghost text-sm px-3 py-1 disabled:opacity-30">Next</button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-16 text-white/30">No extractions found</div>
        )}
      </div>
    </div>
  );
}
