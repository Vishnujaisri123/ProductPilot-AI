import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Star, ExternalLink, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import api, { API_BASE_URL } from "../../lib/api";

export default function StorefrontHome() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialSort = searchParams.get("sort") || "latest";
  const initialCategory = searchParams.get("category") || "All";

  const [search, setSearch] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [sort, setSort] = useState(initialSort);
  const [category, setCategory] = useState(initialCategory);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setSearchParams((prev) => {
      if (searchInput) prev.set("search", searchInput);
      else prev.delete("search");
      return prev;
    });
  };

  const CATEGORIES = [
    "All",
    "Electronics",
    "Fashion",
    "Home",
    "Beauty",
    "Sports",
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-[#1a1c23] to-[#0f1115] pt-20 pb-16 border-b border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#ff9900]/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6"
          >
            Discover Top Rated <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff9900] to-[#ffb84d]">
              Curated Products
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-white/50 max-w-2xl mx-auto mb-10"
          >
            We manually review and verify the best deals and products across
            Amazon, Flipkart, and more so you don't have to.
          </motion.p>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSearch}
            className="max-w-2xl mx-auto relative flex items-center"
          >
            <Search className="absolute left-4 text-white/40" size={20} />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search for laptops, shoes, headphones..."
              className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-12 pr-32 text-lg focus:outline-none focus:border-[#ff9900]/50 focus:bg-white/10 transition-all placeholder:text-white/30 text-white shadow-xl shadow-black/20"
            />
            <button
              type="submit"
              className="absolute right-2 bg-[#ff9900] hover:bg-[#e68a00] text-black font-bold py-2.5 px-6 rounded-full transition-colors"
            >
              Search
            </button>
          </motion.form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
          <div className="flex flex-wrap gap-2 justify-center">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  category === cat
                    ? "bg-white/15 text-white border-white/20"
                    : "bg-transparent text-white/50 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1 border border-white/5">
            <Filter size={16} className="text-white/40 ml-2" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-transparent border-none text-sm text-white/80 py-1.5 px-3 pr-8 focus:ring-0 outline-none cursor-pointer"
            >
              <option value="latest" className="bg-[#1a1c23]">
                Latest Added
              </option>
              <option value="price_asc" className="bg-[#1a1c23]">
                Price: Low to High
              </option>
              <option value="price_desc" className="bg-[#1a1c23]">
                Price: High to Low
              </option>
              <option value="rating" className="bg-[#1a1c23]">
                Top Rated
              </option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-[#ff9900] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !Array.isArray(products) || products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <Search size={48} className="text-white/10 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              No products found
            </h3>
            <p className="text-white/40">
              Try adjusting your filters or search term.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p: any, i: number) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={p._id}
                className="group flex flex-col bg-white/5 rounded-2xl border border-white/5 overflow-hidden hover:bg-white/10 transition-all hover:border-white/10 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#ff9900]/10"
              >
                {/* Clicking the image goes to redirect API */}
                <a
                  href={`${API_BASE_URL}/public/redirect/${p._id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block relative aspect-square bg-white/5 p-4 overflow-hidden"
                >
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.productName}
                      className="w-full h-full object-contain mix-blend-normal group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20 font-medium">
                      No Image
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

                  {/* View Deal Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-[#ff9900] text-black font-bold text-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all">
                      View Deal <ExternalLink size={14} />
                    </div>
                  </div>
                </a>

                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 bg-white/5 px-2 py-1 rounded-md">
                      {p.platform || "Unknown"}
                    </span>
                    {p.rating && (
                      <div className="flex items-center gap-1 text-[#ff9900] text-sm font-medium">
                        <Star size={14} fill="currentColor" /> {p.rating}
                      </div>
                    )}
                  </div>

                  <Link
                    to={`/products/${p._id}`}
                    className="block flex-1 group/title"
                  >
                    <h3 className="font-semibold text-white/90 group-hover/title:text-[#ff9900] transition-colors line-clamp-2 leading-tight mb-2">
                      {p.productName}
                    </h3>
                  </Link>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex flex-col">
                      {(() => {
                        const ext = p.extractionId?.extracted || {};
                        const dealPrice = p.discountPrice || ext.discount_price?.value;
                        const mrp = p.price || ext.price?.value;
                        const displayDealPrice = dealPrice || mrp || "Check Price";
                        
                        return (
                          <>
                            <span className="text-xl font-bold text-white leading-none">{displayDealPrice}</span>
                            {dealPrice && mrp && dealPrice !== mrp && (
                              <span className="text-white/40 line-through text-xs mt-1">{mrp}</span>
                            )}
                          </>
                        );
                      })()}
                    </div>

                    <Link
                      to={`/products/${p._id}`}
                      className="text-sm font-medium text-white/50 hover:text-white transition-colors"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
