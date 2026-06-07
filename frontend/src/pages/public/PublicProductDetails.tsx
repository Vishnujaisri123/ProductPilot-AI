import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import {
  ShoppingCart,
  Star,
  ShieldCheck,
  Truck,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";
import api, { API_BASE_URL } from "../../lib/api";

export default function PublicProductDetails() {
  const { id } = useParams();

  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["public-product", id],
    queryFn: () => api.get(`/public/products/${id}`).then((r) => r.data),
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-[#ff9900] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <ShoppingCart size={64} className="text-white/10 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">
          Product Not Found
        </h2>
        <p className="text-white/40 mb-6">
          This product might have been removed or is currently unavailable.
        </p>
        <Link to="/" className="btn-primary">
          Browse All Products
        </Link>
      </div>
    );
  }

  // Use raw extraction data if available to show rich features
  const extraction = product.extractionId?.extracted || {};
  const val = (field: string) => extraction[field]?.value;

  const features = val("features") || [];
  const description = product.description || val("description");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8 text-sm font-medium"
      >
        <ArrowLeft size={16} /> Back to Store
      </Link>

      <div className="bg-[#1a1c23] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Image Section */}
          <div className="bg-white/5 p-8 flex items-center justify-center relative min-h-[400px]">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.productName}
                className="max-w-full max-h-[500px] object-contain mix-blend-normal drop-shadow-2xl"
              />
            ) : (
              <div className="text-white/20 flex flex-col items-center">
                <ShoppingCart size={64} className="mb-4" />
                <p>No image available</p>
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-6 left-6 flex flex-col gap-2">
              <span className="bg-[#ff9900] text-black text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                Verified Deal
              </span>
              {product.platform && (
                <span className="bg-white/10 text-white backdrop-blur-md border border-white/10 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                  {product.platform}
                </span>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="p-8 lg:p-12 flex flex-col">
            <div className="flex items-center gap-4 mb-4">
              {product.brand && (
                <span className="text-[#ff9900] font-semibold tracking-wider uppercase text-sm">
                  {product.brand}
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
              {product.productName}
            </h1>

            <div className="flex flex-wrap items-end gap-4 mb-8 pb-8 border-b border-white/10">
              <div>
                <div className="text-sm text-white/40 mb-1">Current Price</div>
                <div className="text-4xl font-black text-white">
                  {product.price || "Check Details"}
                </div>
              </div>

              {product.rating && (
                <div className="ml-auto flex flex-col items-end">
                  <div className="text-sm text-white/40 mb-1">User Rating</div>
                  <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                    <Star
                      size={18}
                      className="text-[#ff9900]"
                      fill="currentColor"
                    />
                    <span className="font-bold text-lg">{product.rating}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Buy Action */}
            <a
              href={`${API_BASE_URL}/public/redirect/${product._id}`}
              target="_blank"
              rel="noreferrer"
              className="bg-[#ff9900] hover:bg-[#e68a00] text-black text-lg font-bold py-5 px-8 rounded-2xl transition-all shadow-xl shadow-[#ff9900]/20 flex items-center justify-center gap-3 w-full mb-8 hover:scale-[1.02] active:scale-[0.98]"
            >
              Get This Deal <ExternalLink size={20} />
            </a>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 text-white/60 bg-white/5 p-4 rounded-xl">
                <ShieldCheck className="text-[#ff9900]" size={24} />
                <span className="text-sm font-medium">Verified Link</span>
              </div>
              <div className="flex items-center gap-3 text-white/60 bg-white/5 p-4 rounded-xl">
                <Truck className="text-[#ff9900]" size={24} />
                <span className="text-sm font-medium">Original Retailer</span>
              </div>
            </div>

            {/* Description & Features */}
            <div className="space-y-8 flex-1">
              {description && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">
                    About this item
                  </h3>
                  <p className="text-white/60 leading-relaxed text-sm">
                    {description}
                  </p>
                </div>
              )}

              {features.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Key Features
                  </h3>
                  <ul className="space-y-2">
                    {features.map((f: string, i: number) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-white/60"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-[#ff9900] mt-1.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
