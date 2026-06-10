import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Upload, Layers, History, Bot, BookOpen, Package,
  BarChart3, Key, Settings, Zap, LogOut,
  Bell, Search, ChevronDown, Menu, X, User
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
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

// Mock notifications for demonstration
const NOTIFICATIONS = [
  { id: 1, title: 'Extraction complete', time: '10m ago', unread: true },
  { id: 2, title: 'Telegram message sent', time: '1h ago', unread: false },
  { id: 3, title: 'Batch processing finished', time: '2h ago', unread: false },
];

export default function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen bg-bg flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-50 w-64 h-full border-r border-white/5 bg-bg flex flex-col transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Zap size={16} className="text-bg" />
            </div>
            <span className="font-bold gradient-text">ProductVision AI</span>
          </div>
          <button className="md:hidden text-white/50 hover:text-white" onClick={closeSidebar}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={closeSidebar}
              className={({ isActive }) => isActive ? 'sidebar-item-active' : 'sidebar-item'}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Removed billing limits block */}
        <div className="p-4 border-t border-white/5">
          <button onClick={handleLogout} className="sidebar-item w-full text-red-400/70 hover:text-red-400 hover:bg-red-400/5">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-6 bg-bg/80 backdrop-blur-xl z-30">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-white/50 hover:text-white" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="relative hidden md:block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input className="input pl-9 py-2 w-64 text-sm" placeholder="Search extractions..." />
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
                className="relative p-2 glass rounded-xl hover:bg-white/10 transition-colors"
              >
                <Bell size={18} className="text-white/60" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
              </button>
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-72 glass rounded-2xl shadow-xl border border-white/10 overflow-hidden"
                  >
                    <div className="p-4 border-b border-white/5 font-semibold text-sm">Notifications</div>
                    <div className="max-h-64 overflow-y-auto">
                      {NOTIFICATIONS.map(n => (
                        <div key={n.id} className="p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer flex items-start gap-3 transition-colors">
                          <div className={`w-2 h-2 mt-1.5 shrink-0 rounded-full ${n.unread ? 'bg-primary' : 'bg-transparent'}`} />
                          <div>
                            <p className="text-sm text-white/90">{n.title}</p>
                            <p className="text-xs text-white/40 mt-1">{n.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Credits (Tooltip/Indicator) */}
            <div className="glass px-2 md:px-3 py-1.5 md:py-2 rounded-xl flex items-center gap-2 text-xs md:text-sm cursor-help" title="Available API Credits">
              <Zap size={14} className="text-primary" />
              <span className="text-white/70">{user?.credits ?? 50} credits</span>
            </div>

            {/* User Profile */}
            <div className="relative">
              <div 
                className="flex items-center gap-2 cursor-pointer glass px-2 md:px-3 py-1.5 md:py-2 rounded-xl hover:bg-white/10 transition-colors"
                onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-6 h-6 md:w-7 md:h-7 rounded-full object-cover" />
                ) : (
                  <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-bg text-xs font-bold">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <span className="text-xs md:text-sm text-white/80 hidden sm:block">{user?.name}</span>
                <ChevronDown size={14} className="text-white/40" />
              </div>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 glass rounded-2xl shadow-xl border border-white/10 overflow-hidden"
                  >
                    <div className="p-3 border-b border-white/5">
                      <p className="text-sm font-semibold truncate">{user?.name}</p>
                      <p className="text-xs text-white/50 truncate">{user?.email}</p>
                    </div>
                    <div className="p-1">
                      <button 
                        onClick={() => { navigate('/admin/settings'); setShowProfileMenu(false); }}
                        className="w-full text-left px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg flex items-center gap-2"
                      >
                        <User size={14} /> Profile Settings
                      </button>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-sm text-red-400/80 hover:text-red-400 hover:bg-red-400/10 rounded-lg flex items-center gap-2 mt-1"
                      >
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6" onClick={() => { setShowNotifications(false); setShowProfileMenu(false); }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
