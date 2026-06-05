import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Upload, CheckCircle, Zap, Bot } from 'lucide-react';
import api from '../../lib/api';

const COLORS = ['#00E5FF', '#7B61FF', '#00FFC6', '#FF6B6B', '#FFD93D'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass px-3 py-2 text-sm">
      <p className="text-white/60">{label}</p>
      <p className="text-primary font-semibold">{payload[0].value} extractions</p>
    </div>
  );
};

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => api.get('/analytics').then(r => r.data),
  });

  const s = data?.totals;
  const STATS = [
    { label: 'Total Uploads', value: s?.uploads ?? 0, icon: Upload, color: 'text-primary' },
    { label: 'Success Rate', value: s?.successRate ? `${s.successRate}%` : '0%', icon: CheckCircle, color: 'text-accent' },
    { label: 'Avg Confidence', value: s?.avgConfidence ? `${s.avgConfidence}%` : '0%', icon: Zap, color: 'text-secondary' },
    { label: 'Telegram Sent', value: s?.telegramDeliveries ?? 0, icon: Bot, color: 'text-emerald-400' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Analytics</h1>
        <p className="text-white/50">Track your extraction performance.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div key={s.label} className="glass p-5">
            <s.icon size={20} className={`${s.color} mb-3`} />
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-white/40 text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Daily Activity */}
        <div className="glass p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-primary" /> Daily Activity (30 days)
          </h2>
          {isLoading ? (
            <div className="h-48 flex items-center justify-center text-white/30">Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data?.dailyActivity || []}>
                <XAxis dataKey="_id" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)' }} tickLine={false} axisLine={false} tickFormatter={d => d.slice(5)} />
                <YAxis tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)' }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#00E5FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Platform Distribution */}
        <div className="glass p-6">
          <h2 className="font-semibold mb-4">Platform Distribution</h2>
          {isLoading ? (
            <div className="h-48 flex items-center justify-center text-white/30">Loading...</div>
          ) : data?.platformDistribution?.length ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={data.platformDistribution} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                    {data.platformDistribution.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {data.platformDistribution.map((p: any, i: number) => (
                  <div key={p._id} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="capitalize text-white/70">{p._id || 'Unknown'}</span>
                    <span className="text-white/40 ml-auto">{p.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-white/30">No data yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
