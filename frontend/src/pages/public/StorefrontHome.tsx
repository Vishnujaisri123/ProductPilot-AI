import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Star, ExternalLink, Filter, TrendingUp, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import api, { API_BASE_URL } from "../../lib/api";
import ThreeDProductCard from "../../components/ui/ThreeDProductCard";

export default function StorefrontHome() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialSort = searchParams.get("sort") || "latest";
  const initialCategory = searchParams.get("category") || "All";

  const [search, setSearch] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [sort, setSort] = useState(initialSort);
  const [category, setCategory] = useState(initialCategory);

  const [carouselIndex, setCarouselIndex] = useState(0);

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
      {/* Animated Hero Background */}
      <div className="absolute top-0 inset-x-0 h-[600px] overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80%] h-[80%] rounded-full bg-primary/10 blur-[150px] animate-pulse" />
        <div className="absolute top-[10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[120px] animate-blob" />
      </div>

      {/* Hero Section */}
      <div className="relative z-10 pt-32 pb-20 border-b border-border bg-surface/30 backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 text-left space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 glass border border-primary/20 rounded-full px-4 py-1.5 text-xs font-semibold text-primary mb-2 tracking-wider uppercase">
              <Sparkles size={14} /> Curated Daily
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl md:text-6xl font-extrabold tracking-tight"
            >
              Discover Exceptional <br />
              <span className="gradient-text">Product Deals</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base md:text-lg text-white/50 font-light max-w-xl"
            >
              We deploy AI to track, verify, and curate the absolute best products across Amazon, Flipkart, and global marketplaces.
            </motion.p>

            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onSubmit={handleSearch}
              className="relative flex items-center group max-w-xl"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
              <div className="relative w-full flex items-center bg-surface border border-border rounded-2xl overflow-hidden shadow-2xl">
                <Search className="absolute left-5 text-primary" size={20} />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search laptops, sneakers, smart home..."
                  className="w-full bg-transparent py-4 pl-14 pr-32 text-base focus:outline-none placeholder:text-white/30 text-white font-light"
                />
                <button
                  type="submit"
                  className="absolute right-2 btn-primary py-2 px-6 text-xs uppercase tracking-wider font-bold"
                >
                  Search
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
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <div className="flex flex-wrap gap-2 justify-center">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  category === cat
                    ? "bg-primary text-white shadow-glow-primary scale-105"
                    : "glass text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 glass rounded-xl px-4 py-2 border-border/50">
            <Filter size={16} className="text-primary" />
            <span className="text-sm text-white/40 font-medium">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-transparent border-none text-sm text-white font-medium focus:ring-0 outline-none cursor-pointer"
            >
              <option value="latest" className="bg-bg text-white">Latest Added</option>
              <option value="price_asc" className="bg-bg text-white">Price: Low to High</option>
              <option value="price_desc" className="bg-bg text-white">Price: High to Low</option>
              <option value="rating" className="bg-bg text-white">Top Rated</option>
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
                    className="group flex flex-col h-full glass overflow-hidden hover:bg-surface/80 transition-all duration-500 border-border hover:border-primary/30"
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
                    <div className="p-6 flex-1 flex flex-col" style={{ transform: "translateZ(20px)" }}>
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

                      <Link to={`/products/${p._id}`} className="block flex-1 mb-4">
                        <h3 className="font-display font-medium text-lg text-white/90 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                          {p.productName}
                        </h3>
                      </Link>

                      <div className="pt-4 border-t border-border flex items-end justify-between">
                        <div className="flex flex-col">
                          <span className="font-display text-2xl font-bold text-white leading-none">
                            {displayDealPrice}
                          </span>
                          {dealPrice && mrp && dealPrice !== mrp && (
                            <span className="text-white/40 line-through text-sm mt-1.5 font-medium">
                              {mrp}
                            </span>
                          )}
                        </div>

                        <Link
                          to={`/products/${p._id}`}
                          className="text-sm font-bold text-white/50 group-hover:text-white transition-colors"
                        >
                          Details →
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
