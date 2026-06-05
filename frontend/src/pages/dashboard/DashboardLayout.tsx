import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Upload, Layers, History, Bot, BookOpen, Package,
  BarChart3, Key, CreditCard, Settings, Zap, LogOut,
  Bell, Search, ChevronDown
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const NAV = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/upload', icon: Upload, label: 'Upload' },
  { to: '/admin/batch', icon: Layers, label: 'Batch Processing' },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/history', icon: History, label: 'History' },
  { to: '/admin/telegram', icon: Bot, label: 'Telegram' },
  { to: '/admin/knowledge', icon: BookOpen, label: 'Knowledge Base' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/admin/api', icon: Key, label: 'API Access' },
  { to: '/admin/billing', icon: CreditCard, label: 'Billing' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

const PLAN_LIMITS: Record<string, number> = { free: 50, starter: 500, pro: 5000, enterprise: Infinity };

export default function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  const limit = PLAN_LIMITS[user?.plan || 'free'];
  const used = user?.usageThisMonth || 0;
  const usagePct = limit === Infinity ? 0 : Math.min((used / limit) * 100, 100);

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-white/5 flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Zap size={16} className="text-bg" />
            </div>
            <span className="font-bold gradient-text">ProductVision AI</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => isActive ? 'sidebar-item-active' : 'sidebar-item'}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Usage */}
        <div className="p-4 border-t border-white/5">
          <div className="glass p-3 rounded-xl mb-3">
            <div className="flex justify-between text-xs text-white/50 mb-2">
              <span>Usage this month</span>
              <span>{used}/{limit === Infinity ? '∞' : limit}</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${usagePct}%` }}
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
              />
            </div>
            <div className="mt-2 text-xs capitalize text-white/40">{user?.plan} plan</div>
          </div>
          <button onClick={handleLogout} className="sidebar-item w-full text-red-400/70 hover:text-red-400 hover:bg-red-400/5">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 sticky top-0 bg-bg/80 backdrop-blur-xl z-40">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input className="input pl-9 py-2 w-64 text-sm" placeholder="Search extractions..." />
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 glass rounded-xl hover:bg-white/10 transition-colors">
              <Bell size={18} className="text-white/60" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            </button>
            <div className="glass px-3 py-2 rounded-xl flex items-center gap-2 text-sm">
              <Zap size={14} className="text-primary" />
              <span className="text-white/70">{user?.credits ?? used} credits</span>
            </div>
            <div className="flex items-center gap-2 cursor-pointer glass px-3 py-2 rounded-xl hover:bg-white/10 transition-colors">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-bg text-xs font-bold">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
              )}
              <span className="text-sm text-white/80">{user?.name}</span>
              <ChevronDown size={14} className="text-white/40" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
