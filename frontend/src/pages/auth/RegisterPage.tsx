import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Github, Mail } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import api, { API_BASE_URL } from '../../lib/api';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      setAuth(data.user, data.token);
      toast.success('Account created! 50 free credits added.');
      navigate('/admin');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-8 w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Zap size={16} className="text-bg" />
            </div>
            <span className="font-bold gradient-text">ProductVision AI</span>
          </Link>
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-white/50 text-sm mt-1">Start with 50 free extractions</p>
        </div>

        <div className="flex gap-3 mb-6">
          <a href={`${API_BASE_URL}/auth/google`} className="flex-1 flex items-center justify-center gap-2 glass border border-white/10 py-3 rounded-xl text-sm hover:border-white/20 transition-colors">
            <Mail size={16} /> Google
          </a>
          <a href={`${API_BASE_URL}/auth/github`} className="flex-1 flex items-center justify-center gap-2 glass border border-white/10 py-3 rounded-xl text-sm hover:border-white/20 transition-colors">
            <Github size={16} /> GitHub
          </a>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/30 text-xs">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="input" placeholder="Full Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
          <input className="input" type="email" placeholder="Email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
          <input className="input" type="password" placeholder="Password (min 8 chars)" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} minLength={8} required />
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-white/40 text-sm mt-6">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
