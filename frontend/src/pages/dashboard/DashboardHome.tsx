import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Upload, CheckCircle, Zap, Bot, ArrowRight, TrendingUp } from 'lucide-react';
import api from '../../lib/api';
import { getConfidenceColor, formatDate } from '../../lib/utils';

export default function DashboardHome() {
  const { data: analytics } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => api.get('/analytics').then(r => r.data),
  });
  const { data: history } = useQuery({
    queryKey: ['history', 1],
    queryFn: () => api.get('/extract/history?limit=5').then(r => r.data),
  });

  const stats = analytics?.totals;

  const CARDS = [
    { label: 'Total Uploads', value: stats?.uploads ?? '—', icon: Upload, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Completed', value: stats?.completed ?? '—', icon: CheckCircle, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Avg Confidence', value: stats?.avgConfidence ? `${stats.avgConfidence}%` : '—', icon: Zap, color: 'text-secondary', bg: 'bg-secondary/10' },
    { label: 'Telegram Sent', value: stats?.telegramDeliveries ?? '—', icon: Bot, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-white/50">Welcome back. Here's your activity overview.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {CARDS.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass p-5">
            <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
              <c.icon size={20} className={c.color} />
            </div>
            <div className="text-2xl font-bold">{c.value}</div>
            <div className="text-white/50 text-sm mt-1">{c.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass p-5 rounded-2xl border-l-2 border-primary">
          <div className="text-sm text-white/50 mb-1">Total Products</div>
          <div className="text-2xl font-bold">{analytics?.products?.total ?? '—'}</div>
        </div>
        <div className="glass p-5 rounded-2xl border-l-2 border-blue-400">
          <div className="text-sm text-white/50 mb-1">With Affiliate Links</div>
          <div className="text-2xl font-bold">{analytics?.products?.withAffiliate ?? '—'}</div>
        </div>
        <div className="glass p-5 rounded-2xl border-l-2 border-amber-400">
          <div className="text-sm text-white/50 mb-1">Pending Telegram</div>
          <div className="text-2xl font-bold">{analytics?.products?.pending ?? '—'}</div>
        </div>
        <div className="glass p-5 rounded-2xl border-l-2 border-emerald-400">
          <div className="text-sm text-white/50 mb-1">Sent to Telegram</div>
          <div className="text-2xl font-bold">{analytics?.products?.sent ?? '—'}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link to="/admin/upload" className="glass-hover p-6 flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:shadow-glow-primary transition-shadow">
            <Upload size={22} className="text-primary" />
          </div>
          <div className="flex-1">
            <div className="font-semibold">Upload Product Screenshot</div>
            <div className="text-white/50 text-sm">Extract data from any e-commerce screenshot</div>
          </div>
          <ArrowRight size={18} className="text-white/30 group-hover:text-primary transition-colors" />
        </Link>
        <Link to="/admin/batch" className="glass-hover p-6 flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center group-hover:shadow-glow-secondary transition-shadow">
            <TrendingUp size={22} className="text-secondary" />
          </div>
          <div className="flex-1">
            <div className="font-semibold">Batch Processing</div>
            <div className="text-white/50 text-sm">Upload and process multiple screenshots at once</div>
          </div>
          <ArrowRight size={18} className="text-white/30 group-hover:text-secondary transition-colors" />
        </Link>
      </div>

      {/* Recent Extractions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Recent Extractions</h2>
          <Link to="/admin/history" className="text-sm text-primary/70 hover:text-primary flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="glass rounded-2xl overflow-hidden">
          {history?.extractions?.length ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-3 text-white/40 font-medium">Product</th>
                  <th className="text-left px-6 py-3 text-white/40 font-medium">Platform</th>
                  <th className="text-left px-6 py-3 text-white/40 font-medium">Confidence</th>
                  <th className="text-left px-6 py-3 text-white/40 font-medium">Status</th>
                  <th className="text-left px-6 py-3 text-white/40 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.extractions.map((e: any) => (
                  <tr key={e._id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium truncate max-w-xs">{e.extracted?.product_name?.value || e.sourceImageName}</div>
                    </td>
                    <td className="px-6 py-4 capitalize text-white/60">{e.platform || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${getConfidenceColor(e.confidenceScore)}`}>{e.confidenceScore ?? 0}%</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        e.status === 'completed' ? 'bg-emerald-400/10 text-emerald-400' :
                        e.status === 'failed' ? 'bg-red-400/10 text-red-400' :
                        'bg-amber-400/10 text-amber-400'
                      }`}>{e.status}</span>
                    </td>
                    <td className="px-6 py-4 text-white/50">{formatDate(e.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-16 text-white/30">
              <Upload size={32} className="mx-auto mb-3 opacity-40" />
              <p>No extractions yet. Upload your first screenshot!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
