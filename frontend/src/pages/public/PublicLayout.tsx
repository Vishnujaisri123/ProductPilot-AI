import { Outlet, Link } from 'react-router-dom';
import { ShoppingCart, Search, Menu } from 'lucide-react';
import { useState } from 'react';

export default function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0f1115] text-white flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-[#1a1c23] border-b border-white/5 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff9900] to-[#ffb84d] flex items-center justify-center shadow-lg group-hover:shadow-[#ff9900]/20 transition-all">
                  <ShoppingCart size={18} className="text-black" />
                </div>
                <span className="text-xl font-bold tracking-tight">Best<span className="text-[#ff9900]">Finds</span></span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm font-medium text-white/80 hover:text-white transition-colors">Home</Link>
              <Link to="/?sort=latest" className="text-sm font-medium text-white/80 hover:text-white transition-colors">Latest Drops</Link>
              <Link to="/?sort=popular" className="text-sm font-medium text-white/80 hover:text-white transition-colors">Popular</Link>
            </nav>

            {/* Admin Login Link */}
            <div className="hidden md:flex items-center">
              <Link to="/login" className="text-xs font-semibold text-white/30 hover:text-white/60 transition-colors uppercase tracking-wider">
                Admin
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden">
              <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-white/70 hover:text-white">
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#1a1c23] border-b border-white/5 px-4 pt-2 pb-4 space-y-3">
          <Link to="/" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-white/80 hover:bg-white/5 hover:text-white">Home</Link>
          <Link to="/?sort=latest" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-white/80 hover:bg-white/5 hover:text-white">Latest Drops</Link>
          <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-white/40 hover:bg-white/5 hover:text-white">Admin Login</Link>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#13151a] border-t border-white/5 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center items-center gap-2 mb-6 opacity-50">
            <ShoppingCart size={20} />
            <span className="text-lg font-bold">BestFinds</span>
          </div>
          <p className="text-white/40 text-sm max-w-md mx-auto mb-6">
            Curating the best products from around the web. Every product we feature has been verified and curated for quality.
          </p>
          <div className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} BestFinds Marketplace. All rights reserved. <br/> As an affiliate we earn from qualifying purchases.
          </div>
        </div>
      </footer>
    </div>
  );
}
