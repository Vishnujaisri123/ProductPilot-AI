import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Star, ExternalLink, Filter, TrendingUp, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import api, { API_BASE_URL } from "../../lib/api";
import ThreeDProductCard from "../../components/ui/ThreeDProductCard";

export default function StorefrontHome() {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "latest";
  const category = searchParams.get("category") || "All";

  const [searchInput, setSearchInput] = useState(search);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Sync input with external URL parameter changes (e.g. clicking Home link)
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Debounced search input sync to URL search params
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchParams((prev) => {
        if (searchInput) prev.set("search", searchInput);
        else prev.delete("search");
        return prev;
      });
    }, 300);

    return () => clearTimeout(handler);
  }, [searchInput, setSearchParams]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["public-products", search, sort, category],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (sort) params.append("sort", sort);
      if (category !== "All") params.append("category", category);
      return api
        .get(`/public/products?${params.toString()}`)
        .then((r) => r.data);
    },
  });

  useEffect(() => {
    if (!products || products.length === 0) return;
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % Math.min(3, products.length));
    }, 4500);
    return () => clearInterval(interval);
  }, [products]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setSearchParams((prev) => {
      if (searchInput) prev.set("search", searchInput);
      else prev.delete("search");
      return prev;
    });
  };

  const CATEGORIES = ["All", "Electronics", "Fashion", "Home", "Beauty", "Sports"];

  return (
    <div className="min-h-screen bg-bg text-white selection:bg-primary/30 selection:text-white pb-20">
      {/* Animated Cyber Grid Hero Background */}
      <div className="absolute top-0 inset-x-0 h-[700px] overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,229,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,229,255,0.025)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_80%,transparent_100%)]" />
        <div className="absolute top-[-35%] left-1/2 -translate-x-1/2 w-[90%] h-[90%] rounded-full bg-primary/10 blur-[150px] animate-pulse" />
        <div className="absolute top-[15%] right-[-10%] w-[45%] h-[45%] rounded-full bg-accent/8 blur-[120px] animate-blob" />
        <div className="absolute top-[25%] left-[-10%] w-[45%] h-[45%] rounded-full bg-secondary/6 blur-[110px]" />
      </div>

      {/* Hero Section */}
      <div className="relative z-10 pt-32 pb-20 border-b border-white/5 bg-surface/30 backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 text-left space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 glass border border-accent/20 rounded-full px-4 py-1.5 text-xs font-semibold text-accent mb-2 tracking-widest uppercase">
              <Sparkles size={14} className="animate-spin text-accent" /> JARVIS // PROTOCOL ACTIVE
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl md:text-6xl font-extrabold tracking-tight uppercase"
            >
              Discover Curated <br />
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(0,229,255,0.2)]">MARK-85 DEALS</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base md:text-lg text-white/50 max-w-xl font-medium tracking-wide"
            >
              WE DEPLOY INTELLIGENT SUIT SYSTEMS TO SCAN, TELEMETER, AND RETRIEVE THE OPTIMAL MARKET OFFERS IN REAL TIME.
            </motion.p>

            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onSubmit={handleSearch}
              className="relative flex items-center group max-w-xl"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-25 group-hover:opacity-45 transition duration-500" />
              <div className="relative w-full flex items-center bg-surface border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <Search className="absolute left-5 text-accent animate-pulse" size={20} />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="EXECUTE SEARCH PROTOCOL..."
                  className="w-full bg-transparent py-4 pl-14 pr-32 text-base focus:outline-none placeholder:text-white/20 text-white font-semibold uppercase tracking-wider"
                />
                <button
                  type="submit"
                  className="absolute right-2 btn-primary py-2 px-6 text-xs uppercase tracking-wider font-bold"
                >
                  Execute
                </button>
              </div>
            </motion.form>
          </div>

          {/* 3D Showcase Stage */}
          <div className="lg:col-span-5 hidden lg:flex flex-col items-center justify-center relative select-none">
            <div className="absolute inset-0 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
            {products.length > 0 ? (
              <div className="relative h-[320px] w-full flex items-center justify-center" style={{ perspective: "1000px" }}>
                <div 
                  className="relative w-[240px] h-[300px] transition-transform duration-1000"
                  style={{ 
                    transformStyle: "preserve-3d",
                    transform: `rotateY(${-carouselIndex * 120}deg)`
                  }}
                >
                  {products.slice(0, 3).map((p: any, idx: number) => {
                    const angle = idx * 120;
                    const ext = p.extractionId?.extracted || {};
                    const dealPrice = p.discountPrice || ext.discount_price?.value || p.price;
                    
                    return (
                      <div
                        key={p._id}
                        className="absolute inset-0 transition-all duration-500"
                        style={{
                          transform: `rotateY(${angle}deg) translateZ(190px)`,
                          backfaceVisibility: "hidden",
                          transformStyle: "preserve-3d"
                        }}
                      >
                        <Link to={`/products/${p._id}`} className="block h-full w-full">
                          <div className="glass p-5 rounded-2xl border border-white/10 flex flex-col justify-between h-full hover:border-primary/50 transition-colors shadow-2xl bg-surface/50 backdrop-blur-md">
                            <div className="aspect-[4/3] bg-white/5 rounded-xl p-3 flex items-center justify-center overflow-hidden">
                              <img src={p.imageUrl} alt={p.productName} className="h-full object-contain mix-blend-screen" />
                            </div>
                            <div className="mt-4 space-y-1">
                              <span className="text-[9px] uppercase tracking-widest font-extrabold text-primary">{p.platform || 'Featured'}</span>
                              <h4 className="text-sm font-bold text-white line-clamp-1">{p.productName}</h4>
                              <p className="text-sm font-extrabold text-emerald-400 mt-1">{dealPrice}</p>
                            </div>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="glass w-[240px] h-[300px] rounded-2xl border border-white/10 flex items-center justify-center text-white/20 text-xs">
                No featured deals
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        {/* Filters & Sorting */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-16 relative">
          <div className="flex flex-wrap gap-2.5 justify-center z-10">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSearchParams((prev) => {
                    if (cat !== "All") prev.set("category", cat);
                    else prev.delete("category");
                    return prev;
                  });
                }}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden ${
                  category === cat
                    ? "bg-gradient-to-r from-primary to-secondary text-white shadow-glow-primary scale-105 border border-primary/20"
                    : "glass text-white/50 hover:text-white hover:bg-white/10 border border-white/5"
                }`}
              >
                {category === cat && (
                  <span className="absolute inset-0 bg-white/10 animate-ping opacity-20 rounded-xl" />
                )}
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 glass rounded-xl px-4 py-2.5 border-white/5 hover:border-white/15 transition-all shadow-lg z-10">
            <Filter size={15} className="text-primary" />
            <span className="text-xs text-white/40 font-bold uppercase tracking-wider">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => {
                const val = e.target.value;
                setSearchParams((prev) => {
                  prev.set("sort", val);
                  return prev;
                });
              }}
              className="bg-transparent border-none text-sm text-white font-semibold focus:ring-0 outline-none cursor-pointer pr-8 py-0"
            >
              <option value="latest" className="bg-[#0c0c0c] text-white">Latest Added</option>
              <option value="price_asc" className="bg-[#0c0c0c] text-white">Price: Low to High</option>
              <option value="price_desc" className="bg-[#0c0c0c] text-white">Price: High to Low</option>
              <option value="popular" className="bg-[#0c0c0c] text-white">Popular / Top Rated</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-32">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !Array.isArray(products) || products.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-32 text-center glass border-dashed">
            <Search size={48} className="text-white/10 mb-6" />
            <h3 className="font-display text-2xl font-bold text-white mb-2">No products found</h3>
            <p className="text-white/40 font-light">Try adjusting your filters or searching for something else.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((p: any, i: number) => {
              const ext = p.extractionId?.extracted || {};
              const dealPrice = p.discountPrice || ext.discount_price?.value;
              const mrp = p.price || ext.price?.value;
              const displayDealPrice = dealPrice || mrp || "Check Price";

              return (
                <ThreeDProductCard key={p._id}>
                  <div
                    className="group flex flex-col h-full glass overflow-hidden hover:bg-surface/80 transition-all duration-500 border-white/5 hover:border-accent/40 hud-corner"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    {/* Image Container */}
                    <div 
                      className="relative aspect-[4/3] bg-white/5 p-6 overflow-hidden flex items-center justify-center"
                      style={{ transform: "translateZ(40px)", transformStyle: "preserve-3d" }}
                    >
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.productName}
                          className="w-full h-full object-contain mix-blend-screen group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                      ) : (
                        <div className="text-white/20 font-medium">No Image</div>
                      )}
                      
                      {/* Platform Badge */}
                      <div className="absolute top-4 left-4 bg-bg/80 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest text-primary px-3 py-1.5 rounded-lg border border-primary/20 shadow-lg">
                        {p.platform || "Unknown"}
                      </div>

                      {/* Quick View Overlay */}
                      <div className="absolute inset-0 bg-bg/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                        <a
                          href={`${API_BASE_URL}/public/redirect/${p._id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-primary flex items-center gap-2 transform translate-y-8 group-hover:translate-y-0 transition-all duration-500"
                        >
                          Buy Now <ExternalLink size={16} />
                        </a>
                      </div>
                    </div>

                    {/* Details Container */}
                    <div className="p-6 flex-1 flex flex-col justify-between" style={{ transform: "translateZ(20px)" }}>
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          {p.rating && (
                            <div className="flex items-center gap-1.5 text-accent text-sm font-bold bg-accent/10 px-2 py-1 rounded-md border border-accent/20">
                              <Star size={12} fill="currentColor" /> {p.rating}
                            </div>
                          )}
                          {dealPrice && mrp && dealPrice !== mrp && (
                            <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                              <TrendingUp size={12} /> Deal
                            </div>
                          )}
                        </div>

                        <Link to={`/products/${p._id}`} className="block mb-3">
                          <h3 className="font-display font-medium text-base text-white/90 group-hover:text-accent transition-colors line-clamp-2 leading-snug">
                            {p.productName}
                          </h3>
                        </Link>
                        
                        {/* High-Tech Extraction Validation progress bar */}
                        <div className="mb-4 p-2 bg-white/3 rounded-xl border border-white/5">
                          <div className="flex justify-between items-center text-[10px] text-white/40 font-bold uppercase tracking-wide mb-1">
                            <span>JARVIS CONFIDENCE</span>
                            <span className={(p.confidenceScore || 0) >= 85 ? 'text-accent' : (p.confidenceScore || 0) >= 60 ? 'text-secondary' : 'text-primary'}>
                              {p.confidenceScore || 0}%
                            </span>
                          </div>
                          <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                (p.confidenceScore || 0) >= 85 ? 'bg-accent shadow-[0_0_8px_rgba(0,229,255,0.5)]' :
                                (p.confidenceScore || 0) >= 60 ? 'bg-secondary shadow-[0_0_8px_rgba(255,179,0,0.5)]' : 'bg-primary shadow-[0_0_8px_rgba(213,0,0,0.5)]'
                              }`}
                              style={{ width: `${p.confidenceScore || 0}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/5 flex items-end justify-between">
                        <div className="flex flex-col">
                          <span className="font-display text-2xl font-bold text-accent leading-none">
                            {displayDealPrice}
                          </span>
                          {dealPrice && mrp && dealPrice !== mrp && (
                            <span className="text-white/40 line-through text-xs mt-1.5 font-medium">
                              {mrp}
                            </span>
                          )}
                        </div>

                        <Link
                          to={`/products/${p._id}`}
                          className="text-xs font-bold uppercase tracking-wider text-secondary hover:text-accent transition-colors"
                        >
                          Telemetry →
                        </Link>
                      </div>
                    </div>
                  </div>
                </ThreeDProductCard>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
