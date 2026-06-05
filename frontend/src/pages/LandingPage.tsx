import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Zap, Shield, BarChart3, Bot, ArrowRight, CheckCircle,
  Star, Upload, Brain, Send, ChevronDown
} from 'lucide-react';

const PLATFORMS = ['Amazon', 'Flipkart', 'Meesho', 'Alibaba', 'Myntra', 'Ajio', 'Shopify', 'More'];
const STATS = [{ label: 'Products Extracted', value: '2.4M+' }, { label: 'Accuracy Rate', value: '98.7%' }, { label: 'Active Users', value: '12K+' }, { label: 'Platforms Supported', value: '8+' }];

const FEATURES = [
  { icon: Brain, title: 'AI Vision + OCR', desc: 'GPT-4o Vision analyzes screenshots with OCR for maximum accuracy.' },
  { icon: Shield, title: 'RAG Validation', desc: 'Retrieval-Augmented Generation corrects OCR errors and validates data.' },
  { icon: Bot, title: 'Telegram Automation', desc: 'Instantly deliver extracted products, images, and JSON to Telegram.' },
  { icon: BarChart3, title: 'Confidence Scoring', desc: 'Every field scored 0–100 with color-coded confidence indicators.' },
  { icon: Zap, title: 'Batch Processing', desc: 'Upload and process hundreds of screenshots simultaneously.' },
  { icon: Upload, title: 'Multi-format Export', desc: 'Export to JSON, CSV, or Excel with one click.' },
];

const STEPS = [
  { n: '01', title: 'Upload Screenshot', desc: 'Drag & drop any product screenshot from any platform.' },
  { n: '02', title: 'AI Extraction', desc: 'OCR + GPT-4o Vision + RAG extracts all product fields.' },
  { n: '03', title: 'Get Structured Data', desc: 'Receive validated JSON with confidence scores for every field.' },
  { n: '04', title: 'Telegram Delivery', desc: 'Product image, details, and JSON file sent to your Telegram.' },
];

const PLANS = [
  { name: 'Free', price: '₹0', limit: '50 images/mo', features: ['AI Extraction', 'JSON Export', 'Basic Analytics'] },
  { name: 'Starter', price: '₹999', limit: '500 images/mo', features: ['Everything in Free', 'Telegram Delivery', 'CSV/Excel Export', 'RAG Validation'], popular: true },
  { name: 'Pro', price: '₹2,999', limit: '5,000 images/mo', features: ['Everything in Starter', 'Batch Processing', 'API Access', 'Knowledge Base', 'Priority Support'] },
  { name: 'Enterprise', price: 'Custom', limit: 'Unlimited', features: ['Everything in Pro', 'Custom Integrations', 'Dedicated Support', 'SLA'] },
];

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } };

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg text-white overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-bg/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Zap size={16} className="text-bg" />
            </div>
            <span className="font-bold text-lg gradient-text">ProductVision AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
            {['Features', 'Platforms', 'Pricing', 'FAQ'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-white transition-colors">{item}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
            <Link to="/register" className="btn-primary text-sm">Start Free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 bg-hero-gradient">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-40 right-1/4 w-80 h-80 rounded-full bg-secondary/8 blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 glass border border-primary/20 rounded-full px-4 py-2 text-sm text-primary mb-8">
            <Zap size={14} /> AI-Powered Product Extraction Platform
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            Transform Product<br /><span className="gradient-text">Screenshots</span> into<br />Structured Data
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-xl text-white/60 mb-10 max-w-2xl mx-auto">
            AI Vision + OCR + RAG-powered product extraction with automatic Telegram delivery. Extract any product from any platform instantly.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/register" className="btn-primary flex items-center gap-2 text-base px-8 py-4">
              Start Free <ArrowRight size={18} />
            </Link>
            <a href="#how-it-works" className="btn-secondary flex items-center gap-2 text-base px-8 py-4">
              How It Works <ChevronDown size={18} />
            </a>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="max-w-4xl mx-auto mt-20 grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="glass text-center p-6 rounded-2xl">
              <div className="text-3xl font-bold gradient-text">{s.value}</div>
              <div className="text-sm text-white/50 mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Platforms */}
      <section id="platforms" className="py-16 px-6 border-y border-white/5">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-white/40 text-sm uppercase tracking-widest mb-8">Supported Platforms</p>
          <div className="flex flex-wrap justify-center gap-4">
            {PLATFORMS.map((p) => (
              <div key={p} className="glass px-6 py-3 rounded-full text-white/70 text-sm font-medium hover:text-primary hover:border-primary/30 transition-all cursor-default border border-white/10">
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">Enterprise-grade AI extraction pipeline with full automation.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1 }} className="glass-hover p-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                  <f.icon size={22} className="text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-gradient-to-b from-transparent via-secondary/5 to-transparent">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-white/50 text-lg">From screenshot to structured data in seconds.</p>
          </motion.div>
          <div className="grid md:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <motion.div key={s.n} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.15 }} className="glass p-6 relative">
                <div className="text-4xl font-black text-primary/20 mb-3">{s.n}</div>
                <h3 className="font-semibold mb-2">{s.title}</h3>
                <p className="text-white/50 text-sm">{s.desc}</p>
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight size={16} className="text-primary/40" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple Pricing</h2>
            <p className="text-white/50 text-lg">Start free, scale as you grow.</p>
          </motion.div>
          <div className="grid md:grid-cols-4 gap-6">
            {PLANS.map((plan, i) => (
              <motion.div key={plan.name} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1 }} className={`glass p-6 relative ${plan.popular ? 'border-primary/40 shadow-glow-primary' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-bg text-xs font-bold px-3 py-1 rounded-full">POPULAR</div>
                )}
                <h3 className="font-bold text-lg mb-1">{plan.name}</h3>
                <div className="text-3xl font-black gradient-text mb-1">{plan.price}</div>
                <p className="text-white/40 text-sm mb-6">{plan.limit}</p>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                      <CheckCircle size={14} className="text-accent shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className={`block text-center py-3 rounded-xl text-sm font-semibold transition-all ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}>
                  Get Started
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">FAQ</h2>
          </motion.div>
          {[
            ['Which platforms are supported?', 'Amazon, Flipkart, Meesho, Alibaba, Myntra, Ajio, Shopify, and any other e-commerce platform.'],
            ['How accurate is the extraction?', 'Our AI pipeline achieves 98%+ accuracy using GPT-4o Vision, OCR, and RAG validation combined.'],
            ['How does Telegram delivery work?', 'Connect your Telegram bot once. Every extraction automatically sends the image, structured data, and JSON file.'],
            ['Can I use the API?', 'Yes. Starter and above plans include API access with your own API key.'],
          ].map(([q, a]) => (
            <motion.div key={q} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="glass mb-4 p-6">
              <div className="flex items-start gap-3">
                <Star size={16} className="text-primary mt-1 shrink-0" />
                <div>
                  <p className="font-semibold mb-2">{q}</p>
                  <p className="text-white/50 text-sm">{a}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="max-w-3xl mx-auto text-center glass p-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 pointer-events-none" />
          <h2 className="text-4xl font-bold mb-4 relative z-10">Start Extracting Today</h2>
          <p className="text-white/50 mb-8 relative z-10">50 free extractions. No credit card required.</p>
          <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-base px-10 py-4 relative z-10">
            Start Free <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-white/30 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap size={14} className="text-primary" />
          <span className="gradient-text font-semibold">ProductVision AI</span>
        </div>
        <p>© {new Date().getFullYear()} ProductVision AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
