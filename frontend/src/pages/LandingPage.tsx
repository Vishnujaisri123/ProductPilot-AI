import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Zap, Shield, BarChart3, Bot, ArrowRight, Star, Upload, Brain, ChevronDown
} from 'lucide-react';

const PLATFORMS = ['Amazon', 'Flipkart', 'Meesho', 'Alibaba', 'Myntra', 'Ajio', 'Shopify'];
const STATS = [
  { label: 'Products Extracted', value: '2.4M+' },
  { label: 'Accuracy Rate', value: '98.7%' },
  { label: 'Active Users', value: '12K+' },
  { label: 'Platforms Supported', value: '8+' }
];

const FEATURES = [
  { icon: Brain, title: 'AI Vision + OCR', desc: 'GPT-4o Vision analyzes screenshots with cutting-edge OCR for flawless precision.' },
  { icon: Shield, title: 'RAG Validation', desc: 'Retrieval-Augmented Generation automatically corrects errors and enriches data.' },
  { icon: Bot, title: 'Telegram Automation', desc: 'Instantly deliver extracted products, images, and JSON directly to your Telegram.' },
  { icon: BarChart3, title: 'Confidence Scoring', desc: 'Every field is mathematically scored 0–100 with color-coded confidence indicators.' },
  { icon: Zap, title: 'Batch Processing', desc: 'Upload and process hundreds of product screenshots simultaneously.' },
  { icon: Upload, title: 'Multi-format Export', desc: 'Export your structured data to JSON, CSV, or Excel with a single click.' },
];

const STEPS = [
  { n: '01', title: 'Upload Screenshot', desc: 'Drag & drop any product screenshot from any platform.' },
  { n: '02', title: 'AI Extraction', desc: 'OCR + GPT-4o Vision + RAG extracts all product fields.' },
  { n: '03', title: 'Get Structured Data', desc: 'Receive validated JSON with confidence scores for every field.' },
  { n: '04', title: 'Telegram Delivery', desc: 'Product image, details, and JSON file sent to your Telegram.' },
];

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } } };

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg text-white overflow-hidden selection:bg-primary/30 selection:text-white">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] rounded-full bg-secondary/20 blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] rounded-full bg-accent/10 blur-[120px] animate-blob animation-delay-4000" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-border bg-surface/50 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary p-[1px]">
              <div className="w-full h-full bg-bg rounded-[11px] flex items-center justify-center">
                <Zap size={20} className="text-primary" />
              </div>
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-white">ProductVision AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
            {['Features', 'Platforms', 'FAQ'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-white transition-colors">{item}</a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="btn-ghost">Sign In</Link>
            <Link to="/register" className="btn-primary shadow-glow-primary">Start Free</Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-32 pb-20">
        {/* Hero */}
        <section className="px-6 min-h-[85vh] flex flex-col justify-center">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2 glass border border-primary/30 rounded-full px-5 py-2 text-sm font-medium text-primary mb-8 shadow-[inset_0_0_20px_rgba(255,69,0,0.1)]">
              <Zap size={14} className="animate-pulse" /> AI-Powered Product Extraction Platform
            </motion.div>
            
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="font-display text-6xl md:text-8xl font-extrabold leading-[1.1] tracking-tight mb-8">
              Transform <span className="gradient-text">Screenshots</span><br />
              Into Structured Data
            </motion.h1>
            
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.7 }} className="text-xl md:text-2xl text-white/50 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              AI Vision + OCR + RAG-powered product extraction with automatic Telegram delivery. Extract any product from any platform instantly.
            </motion.p>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="btn-primary text-lg px-8 py-4 w-full sm:w-auto flex justify-center shadow-glow-primary">
                Start Extracting for Free <ArrowRight size={20} className="ml-2" />
              </Link>
              <a href="#how-it-works" className="btn-secondary text-lg px-8 py-4 w-full sm:w-auto flex justify-center">
                See How It Works
              </a>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="px-6 mb-32 relative z-20">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s) => (
              <div key={s.label} className="glass p-8 text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="font-display text-4xl md:text-5xl font-bold gradient-text mb-2 relative z-10">{s.value}</div>
                <div className="text-sm font-medium text-white/50 relative z-10">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </section>

        {/* Platforms Marquee */}
        <section id="platforms" className="py-10 border-y border-border bg-surface/30 backdrop-blur-sm overflow-hidden">
          <div className="max-w-7xl mx-auto flex flex-col items-center">
            <p className="text-white/40 text-sm font-semibold uppercase tracking-[0.2em] mb-8">Seamlessly extracts from</p>
            <div className="flex flex-wrap justify-center gap-6 md:gap-12 opacity-70">
              {PLATFORMS.map((p) => (
                <span key={p} className="font-display text-2xl md:text-3xl font-bold text-white/50 hover:text-white transition-colors duration-300">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="text-center mb-20">
              <h2 className="font-display text-5xl md:text-6xl font-bold mb-6 tracking-tight">Everything You Need</h2>
              <p className="text-white/50 text-xl max-w-2xl mx-auto font-light">Enterprise-grade AI extraction pipeline with full automation, built for scale.</p>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-6">
              {FEATURES.map((f, i) => (
                <motion.div key={f.title} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} variants={fadeUp} transition={{ delay: i * 0.1 }} className="glass-hover p-8 group relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
                  <div className="w-14 h-14 rounded-2xl bg-surface border border-border flex items-center justify-center mb-6 group-hover:border-primary/30 transition-colors shadow-inner-light">
                    <f.icon size={26} className="text-primary group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <h3 className="font-display text-2xl font-semibold mb-3 tracking-tight">{f.title}</h3>
                  <p className="text-white/50 text-base leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-32 px-6 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-center mb-20">
              <h2 className="font-display text-5xl font-bold mb-6 tracking-tight">How It Works</h2>
              <p className="text-white/50 text-xl font-light">From screenshot to structured data in under 5 seconds.</p>
            </motion.div>
            <div className="grid md:grid-cols-4 gap-6">
              {STEPS.map((s, i) => (
                <motion.div key={s.n} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.15 }} className="glass p-8 relative">
                  <div className="font-display text-6xl font-black text-white/5 mb-6">{s.n}</div>
                  <h3 className="font-display text-xl font-semibold mb-3 tracking-tight text-white">{s.title}</h3>
                  <p className="text-white/50 text-base leading-relaxed">{s.desc}</p>
                  {i < STEPS.length - 1 && (
                    <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                      <div className="w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center">
                        <ArrowRight size={12} className="text-primary" />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-32 px-6">
          <div className="max-w-3xl mx-auto">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
              <h2 className="font-display text-5xl font-bold tracking-tight">Frequently Asked Questions</h2>
            </motion.div>
            <div className="space-y-4">
              {[
                ['Which platforms are supported?', 'Amazon, Flipkart, Meesho, Alibaba, Myntra, Ajio, Shopify, and literally any other e-commerce platform.'],
                ['How accurate is the extraction?', 'Our advanced AI pipeline achieves an unprecedented 98%+ accuracy using a combination of GPT-4o Vision, OCR, and custom RAG validation.'],
                ['How does Telegram delivery work?', 'Connect your Telegram bot once. Every extraction automatically sends the cropped image, structured product details, and the raw JSON file to your chat.'],
                ['Do you offer an API?', 'Yes. Developers can generate API keys from the dashboard to programmatically extract products.'],
              ].map(([q, a], i) => (
                <motion.div key={q} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1 }} className="glass p-6 md:p-8 group hover:bg-surface/80 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                      <Star size={12} className="text-primary" />
                    </div>
                    <div>
                      <h4 className="font-display text-xl font-medium mb-2">{q}</h4>
                      <p className="text-white/50 leading-relaxed font-light">{a}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-32 px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="max-w-5xl mx-auto text-center glass p-12 md:p-24 relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-hero-gradient opacity-50 mix-blend-screen pointer-events-none" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20" />
            
            <h2 className="font-display text-5xl md:text-7xl font-bold mb-6 relative z-10 tracking-tight">Ready to Automate?</h2>
            <p className="text-xl text-white/50 mb-10 relative z-10 font-light max-w-2xl mx-auto">Join thousands of businesses extracting perfect product data instantly. No credit card required.</p>
            <Link to="/register" className="btn-primary inline-flex items-center gap-3 text-lg px-12 py-5 relative z-10 shadow-glow-primary hover:scale-105 transition-transform duration-300">
              Start Extracting Now <ArrowRight size={20} />
            </Link>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6 text-center text-white/40 text-sm relative z-10 bg-surface/50">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Zap size={16} className="text-primary" />
          <span className="font-display font-bold text-lg text-white tracking-tight">ProductVision AI</span>
        </div>
        <p className="font-light">© {new Date().getFullYear()} ProductVision AI. Crafted for scale.</p>
      </footer>
    </div>
  );
}
