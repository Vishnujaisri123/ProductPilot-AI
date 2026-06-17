import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Megaphone, Plus, Calendar, Trash2, Edit2, Loader, Eye, FolderHeart, CheckCircle, BarChart2
} from 'lucide-react';
import api from '../../../lib/api';
import toast from 'react-hot-toast';

export default function CampaignsPage() {
  const qc = useQueryClient();
  const [activeModal, setActiveModal] = useState<'create' | 'edit' | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'active'
  });

  // Query campaigns
  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['social-campaigns'],
    queryFn: () => api.get('/social/campaigns').then(r => r.data)
  });

  // Mutation to create campaign
  const createMut = useMutation({
    mutationFn: (d: any) => api.post('/social/campaigns', d),
    onSuccess: () => {
      toast.success('Campaign created successfully');
      setActiveModal(null);
      resetForm();
      qc.invalidateQueries({ queryKey: ['social-campaigns'] });
    },
    onError: () => toast.error('Failed to create campaign')
  });

  // Mutation to update campaign
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => api.patch(`/social/campaigns/${id}`, data),
    onSuccess: () => {
      toast.success('Campaign updated');
      setActiveModal(null);
      resetForm();
      qc.invalidateQueries({ queryKey: ['social-campaigns'] });
    },
    onError: () => toast.error('Failed to update')
  });

  // Mutation to delete campaign
  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/social/campaigns/${id}`),
    onSuccess: () => {
      toast.success('Campaign deleted');
      qc.invalidateQueries({ queryKey: ['social-campaigns'] });
    }
  });

  const resetForm = () => {
    setForm({ name: '', description: '', startDate: '', endDate: '', status: 'active' });
    setEditingCampaign(null);
  };

  const handleEditClick = (campaign: any) => {
    setEditingCampaign(campaign);
    setForm({
      name: campaign.name || '',
      description: campaign.description || '',
      startDate: campaign.startDate ? campaign.startDate.slice(0, 10) : '',
      endDate: campaign.endDate ? campaign.endDate.slice(0, 10) : '',
      status: campaign.status || 'active'
    });
    setActiveModal('edit');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeModal === 'create') {
      createMut.mutate(form);
    } else if (activeModal === 'edit' && editingCampaign) {
      updateMut.mutate({ id: editingCampaign._id, data: form });
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-Header Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-outfit">Campaigns Manager</h1>
          <p className="text-white/50 text-sm mt-1">Organize products into promotional groups and track cumulative metrics.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/social" className="px-4 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 text-sm font-medium transition-all">Overview</Link>
          <Link to="/admin/social/accounts" className="px-4 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 text-sm font-medium transition-all">Accounts</Link>
          <Link to="/admin/social/campaigns" className="px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-medium border border-white/10">Campaigns</Link>
          <Link to="/admin/social/library" className="px-4 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 text-sm font-medium transition-all">Library & History</Link>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-white font-outfit flex items-center gap-2">
          <FolderHeart size={18} className="text-primary" /> Active Folders
        </h2>
        <button 
          onClick={() => { resetForm(); setActiveModal('create'); }}
          className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm"
        >
          <Plus size={16} /> New Campaign
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader className="animate-spin text-primary" size={32} />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-20 glass rounded-3xl border border-dashed border-white/10 text-white/40">
          <Megaphone className="mx-auto text-white/20 mb-3" size={48} />
          <p className="font-semibold text-lg text-white/80">No Campaigns Found</p>
          <p className="text-xs mt-1">Create a campaign to start grouping your promotional efforts together.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((camp: any) => {
            const isActive = camp.status === 'active';
            const isCompleted = camp.status === 'completed';
            
            return (
              <motion.div 
                key={camp._id} 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }}
                className="glass p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-white font-outfit truncate max-w-[170px]" title={camp.name}>
                      {camp.name}
                    </h3>
                    <span className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded tracking-wide ${
                      isActive ? 'bg-emerald-500/10 text-emerald-400' :
                      isCompleted ? 'bg-blue-500/10 text-blue-400' : 'bg-white/10 text-white/40'
                    }`}>
                      {camp.status}
                    </span>
                  </div>
                  
                  <p className="text-xs text-white/50 mt-2 leading-relaxed min-h-[40px] line-clamp-3">
                    {camp.description || 'No description added yet.'}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 space-y-4">
                  <div className="flex justify-between items-center text-xs text-white/40">
                    <span className="flex items-center gap-1"><Calendar size={12} /> Schedule:</span>
                    <span className="font-semibold text-white/70">
                      {camp.startDate ? new Date(camp.startDate).toLocaleDateString() : 'Start'} - {camp.endDate ? new Date(camp.endDate).toLocaleDateString() : 'End'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs text-white/40">
                    <span className="flex items-center gap-1"><BarChart2 size={12} /> Products linked:</span>
                    <span className="font-bold text-primary">Connected</span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={() => handleEditClick(camp)}
                      className="flex-1 btn-secondary py-2 text-xs flex items-center justify-center gap-1.5"
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this campaign? Connected posts will be unlinked.')) {
                          deleteMut.mutate(camp._id);
                        }
                      }}
                      className="p-2 rounded-xl bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 text-red-400/80 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>
      )}

      {/* CREATE & EDIT MODAL OVERLAYS */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md glass rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            >
              
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-bg">
                <h3 className="text-lg font-bold text-white font-outfit">
                  {activeModal === 'create' ? 'Create New Campaign' : 'Edit Campaign'}
                </h3>
                <button 
                  onClick={() => setActiveModal(null)} 
                  className="text-white/40 hover:text-white text-sm"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">Campaign Name</label>
                  <input 
                    type="text" 
                    className="input py-2.5 text-sm" 
                    placeholder="e.g. Summer Electronics Deals"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">Description</label>
                  <textarea 
                    className="input py-2.5 text-sm h-20 resize-none" 
                    placeholder="Describe the campaign focus, target platforms, or affiliate goals..."
                    value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-white/50 mb-1.5 block">Start Date</label>
                    <input 
                      type="date" 
                      className="input py-2 text-sm" 
                      value={form.startDate}
                      onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/50 mb-1.5 block">End Date</label>
                    <input 
                      type="date" 
                      className="input py-2 text-sm" 
                      value={form.endDate}
                      onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                    />
                  </div>
                </div>

                {activeModal === 'edit' && (
                  <div>
                    <label className="text-xs text-white/50 mb-1.5 block">Status</label>
                    <select 
                      className="input py-2.5 text-sm bg-bg border-white/10"
                      value={form.status}
                      onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                    >
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                )}

                <div className="flex gap-3 pt-3 border-t border-white/5 mt-6">
                  <button 
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="flex-1 btn-secondary py-2.5 text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={createMut.isPending || updateMut.isPending}
                    className="flex-1 btn-primary py-2.5 text-sm flex items-center justify-center gap-1.5"
                  >
                    {(createMut.isPending || updateMut.isPending) ? (
                      <Loader className="animate-spin" size={16} />
                    ) : (
                      <CheckCircle size={16} />
                    )}
                    Save Campaign
                  </button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
