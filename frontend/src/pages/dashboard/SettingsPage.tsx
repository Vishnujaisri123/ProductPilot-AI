import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Shield, Bell, Link } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const qc = useQueryClient();
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => api.get('/auth/me').then(r => r.data) });
  const [form, setForm] = useState({ name: '', email: '', amazonAssociateTag: '' });

  const updateMut = useMutation({
    mutationFn: (d: any) => api.patch('/auth/me', d),
    onSuccess: () => { toast.success('Settings saved'); qc.invalidateQueries({ queryKey: ['me'] }); },
    onError: () => toast.error('Failed to save'),
  });

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const pwMut = useMutation({
    mutationFn: (d: any) => api.post('/auth/change-password', d),
    onSuccess: () => { toast.success('Password changed'); setPwForm({ currentPassword: '', newPassword: '' }); },
    onError: () => toast.error('Failed to change password'),
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Settings</h1>
        <p className="text-white/50">Manage your account preferences.</p>
      </div>

      {/* Profile */}
      <div className="glass p-6 space-y-4">
        <h2 className="font-semibold flex items-center gap-2"><User size={18} className="text-primary" /> Profile</h2>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user?.name}</h2>
            <p className="text-white/50">{user?.email}</p>
          </div>
        </div>
        <input className="input" placeholder="Full Name" defaultValue={user?.name || ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
        <input className="input" type="email" placeholder="Email" defaultValue={user?.email || ''} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
        <button onClick={() => updateMut.mutate(form)} disabled={updateMut.isPending} className="btn-primary py-2.5 px-6">
          {updateMut.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Affiliate */}
      <div className="glass p-6 space-y-4">
        <h2 className="font-semibold flex items-center gap-2"><Link size={18} className="text-secondary" /> Affiliate Tags</h2>
        <p className="text-sm text-white/50">Configure your associate tags for automatic link generation.</p>
        <div className="space-y-2">
          <label className="text-xs text-white/70">Amazon Associate Tag (e.g. duickdeals247-21)</label>
          <input className="input" placeholder="Amazon Tag" defaultValue={user?.amazonAssociateTag || ''} onChange={e => setForm(p => ({ ...p, amazonAssociateTag: e.target.value }))} />
        </div>
        <button onClick={() => updateMut.mutate({ amazonAssociateTag: form.amazonAssociateTag || user?.amazonAssociateTag })} disabled={updateMut.isPending} className="btn-primary py-2.5 px-6">
          Save Tag
        </button>
      </div>

      {/* Password */}
      <div className="glass p-6 space-y-4">
        <h2 className="font-semibold flex items-center gap-2"><Shield size={18} className="text-secondary" /> Change Password</h2>
        <input className="input" type="password" placeholder="Current Password" value={pwForm.currentPassword} onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} />
        <input className="input" type="password" placeholder="New Password" value={pwForm.newPassword} onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))} />
        <button onClick={() => pwMut.mutate(pwForm)} disabled={pwMut.isPending} className="btn-secondary py-2.5 px-6">
          {pwMut.isPending ? 'Changing...' : 'Change Password'}
        </button>
      </div>

      {/* Notifications */}
      <div className="glass p-6 space-y-4">
        <h2 className="font-semibold flex items-center gap-2"><Bell size={18} className="text-accent" /> Notifications</h2>
        {[
          ['Email on extraction complete', true],
          ['Telegram delivery confirmation', true],
          ['Weekly analytics report', false],
        ].map(([label, def]) => (
          <label key={label as string} className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-white/70">{label as string}</span>
            <div className="relative">
              <input type="checkbox" defaultChecked={def as boolean} className="sr-only peer" />
              <div className="w-10 h-5 bg-white/10 rounded-full peer peer-checked:bg-primary/50 transition-colors cursor-pointer" />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
            </div>
          </label>
        ))}
      </div>

      {/* Danger Zone */}
      <div className="glass p-6 border border-red-400/10">
        <h2 className="font-semibold text-red-400 mb-4">Danger Zone</h2>
        <p className="text-sm text-white/40 mb-4">Permanently delete your account and all data.</p>
        <button className="text-red-400 border border-red-400/30 px-4 py-2 rounded-xl text-sm hover:bg-red-400/10 transition-colors">
          Delete Account
        </button>
      </div>
    </div>
  );
}
