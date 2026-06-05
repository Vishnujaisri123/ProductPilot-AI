import { useMutation, useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckCircle, Zap, CreditCard } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const PLANS = [
  { id: 'free', name: 'Free', price: '₹0/mo', limit: '50 images/month', features: ['AI Extraction', 'JSON Export', 'Basic Analytics'] },
  { id: 'starter', name: 'Starter', price: '₹999/mo', limit: '500 images/month', features: ['Everything in Free', 'Telegram Delivery', 'CSV/Excel Export', 'RAG Validation'], popular: true },
  { id: 'pro', name: 'Pro', price: '₹2,999/mo', limit: '5,000 images/month', features: ['Everything in Starter', 'Batch Processing', 'API Access', 'Knowledge Base'] },
  { id: 'enterprise', name: 'Enterprise', price: 'Custom', limit: 'Unlimited', features: ['Everything in Pro', 'Custom Integrations', 'Dedicated Support', 'SLA'] },
];

export default function BillingPage() {
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => api.get('/auth/me').then(r => r.data) });

  const checkoutMut = useMutation({
    mutationFn: (plan: string) => api.post('/billing/checkout', { plan }),
    onSuccess: (res) => { window.location.href = res.data.url; },
    onError: () => toast.error('Failed to start checkout'),
  });

  const portalMut = useMutation({
    mutationFn: () => api.get('/billing/portal'),
    onSuccess: (res) => { window.location.href = res.data.url; },
    onError: () => toast.error('Failed to open portal'),
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Billing</h1>
          <p className="text-white/50">Current plan: <span className="text-primary capitalize">{user?.plan}</span></p>
        </div>
        {user?.stripeSubscriptionId && (
          <button onClick={() => portalMut.mutate()} className="btn-secondary flex items-center gap-2 text-sm">
            <CreditCard size={16} /> Manage Billing
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-4 gap-5">
        {PLANS.map((plan, i) => {
          const isCurrent = user?.plan === plan.id;
          return (
            <motion.div key={plan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className={`glass p-6 relative flex flex-col ${plan.popular ? 'border-primary/40' : ''} ${isCurrent ? 'border-accent/40' : ''}`}>
              {plan.popular && !isCurrent && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-bg text-xs font-bold px-3 py-1 rounded-full">POPULAR</div>}
              {isCurrent && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-bg text-xs font-bold px-3 py-1 rounded-full">CURRENT</div>}
              <div className="mb-4">
                <h3 className="font-bold text-lg">{plan.name}</h3>
                <div className="text-2xl font-black gradient-text mt-1">{plan.price}</div>
                <p className="text-white/40 text-xs mt-1">{plan.limit}</p>
              </div>
              <ul className="space-y-2 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-white/60">
                    <CheckCircle size={12} className="text-accent shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
              {!isCurrent && plan.id !== 'free' && (
                <button
                  onClick={() => checkoutMut.mutate(plan.id)}
                  disabled={checkoutMut.isPending}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {checkoutMut.isPending ? 'Loading...' : 'Upgrade'}
                </button>
              )}
              {isCurrent && (
                <div className="flex items-center justify-center gap-2 text-accent text-sm py-2.5">
                  <Zap size={14} /> Active Plan
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
