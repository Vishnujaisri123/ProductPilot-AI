import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  Star, ExternalLink, ArrowLeft, Info, ShieldCheck, 
  TrendingUp, CheckCircle2, ChevronRight, Zap, ArrowRight 
} from "lucide-react";
import { motion } from "framer-motion";
import api, { API_BASE_URL } from "../../lib/api";

export default function PublicProductDetails() {
  const { id } = useParams();

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["public-product", id],
    queryFn: () => api.get(`/public/products/${id}`).then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center text-center px-6">
        <div className="w-20 h-20 bg-surface rounded-3xl flex items-center justify-center mb-6 border border-border shadow-2xl">
          <Info size={32} className="text-white/40" />
        </div>
        <h2 className="font-display text-3xl font-bold text-white mb-3">Product Not Found</h2>
        <p className="text-white/50 mb-8 max-w-md font-light">The product you're looking for doesn't exist or has been removed.</p>
        <Link to="/products" className="btn-secondary">
          ← Back to Deals
        </Link>
      </div>
    );
  }

  const ext = product.extractionId?.extracted || {};
  const dealPrice = product.discountPrice || ext.discount_price?.value;
  const mrp = product.price || ext.price?.value;
  const displayDealPrice = dealPrice || mrp || "Check Price";

  return (
    <div className="min-h-screen bg-bg text-white pb-32">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[150px] animate-pulse" />
      </div>

      {/* Navigation Bar */}
      <div className="sticky top-0 z-50 bg-bg/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link
            to="/products"
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors font-medium text-sm group"
          >
            <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center group-hover:border-white/20 transition-colors">
              <ArrowLeft size={16} />
            </div>
            Back to Deals
          </Link>

          <a
            href={`${API_BASE_URL}/public/redirect/${product._id}`}
            target="_blank"
            rel="noreferrer"
            className="btn-primary py-2 px-6 shadow-glow-primary text-sm flex items-center gap-2"
          >
            Get Deal <ExternalLink size={16} />
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pt-12 relative z-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-white/40 mb-8 font-medium">
          <Link to="/products" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight size={14} />
          <span className="text-white/80 line-clamp-1">{product.productName}</span>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-12 items-start">
          
          {/* Left Column - Images */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="glass rounded-3xl p-12 flex items-center justify-center min-h-[500px] border border-border relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.productName}
                  className="max-w-full max-h-[500px] object-contain mix-blend-screen relative z-10 hover:scale-105 transition-transform duration-700 ease-out"
                />
              ) : (
                <div className="text-white/20 font-medium text-lg">No Image Available</div>
              )}
              <div className="absolute top-6 left-6 bg-surface/80 backdrop-blur-md text-xs font-bold uppercase tracking-widest text-primary px-4 py-2 rounded-xl border border-primary/20 shadow-lg z-20">
                {product.platform || "Unknown"}
              </div>
            </div>
          </motion.div>

          {/* Right Column - Details */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="flex flex-col">
            
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                {product.rating && (
                  <div className="flex items-center gap-1.5 text-accent text-sm font-bold bg-accent/10 px-3 py-1.5 rounded-lg border border-accent/20">
                    <Star size={14} fill="currentColor" /> {product.rating}
                  </div>
                )}
                {dealPrice && mrp && dealPrice !== mrp && (
                  <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-bold uppercase tracking-wider bg-emerald-400/10 px-3 py-1.5 rounded-lg border border-emerald-400/20">
                    <TrendingUp size={14} /> Hot Deal
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-primary text-sm font-bold bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
                  <ShieldCheck size={14} /> Verified
                </div>
              </div>

              <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight mb-6">
                {product.productName}
              </h1>

              <div className="glass p-8 rounded-3xl border border-border shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-secondary" />
                <div className="flex flex-col gap-2 mb-8">
                  <span className="text-white/40 text-sm font-medium uppercase tracking-wider">Current Price</span>
                  <div className="flex items-end gap-4">
                    <span className="font-display text-5xl font-black gradient-text tracking-tight">
                      {displayDealPrice}
                    </span>
                    {dealPrice && mrp && dealPrice !== mrp && (
                      <span className="text-xl text-white/30 line-through mb-1.5 font-medium">
                        {mrp}
                      </span>
                    )}
                  </div>
                </div>

                <a
                  href={`${API_BASE_URL}/public/redirect/${product._id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary w-full py-5 text-lg shadow-glow-primary flex items-center justify-center gap-3 group"
                >
                  View on {product.platform || "Store"}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </a>
                
                <p className="text-center text-white/30 text-xs mt-4 flex items-center justify-center gap-1.5">
                  <CheckCircle2 size={12} /> Secure redirect to official store
                </p>
              </div>
            </div>

            {/* AI Insights */}
            <div className="glass p-8 rounded-3xl border border-border">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Zap size={16} className="text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold">AI Extracted Insights</h3>
              </div>

              <div className="space-y-4">
                {[
                  { label: "Category", value: product.category || ext.category?.value },
                  { label: "Brand", value: ext.brand?.value },
                  { label: "Delivery", value: ext.delivery_info?.value },
                  { label: "Reviews", value: ext.review_count?.value },
                ].map((item, idx) => item.value && (
                  <div key={idx} className="flex flex-col pb-4 border-b border-border/50 last:border-0 last:pb-0">
                    <span className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1">{item.label}</span>
                    <span className="text-white/90 font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}
