"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Product, formatPrice } from "@/data/products";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, product.sizes[0], product.colors[0].name);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
    >
      <Link href={`/products/${product.id}`} className="group block no-underline">
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl overflow-hidden hover:border-[var(--color-border-medium)] transition-all duration-300 hover:shadow-[0_8px_40px_rgba(0,0,0,0.3)]">
          {/* Image */}
          <div className="relative aspect-[3/4] product-image-wrapper bg-[var(--color-bg-elevated)]">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            {/* Badge */}
            {product.badge && (
              <div className="absolute top-3 left-3 px-3 py-1 bg-[var(--color-primary)] text-white text-xs font-bold rounded-full shadow-[0_0_15px_rgba(220,38,38,0.4)]">
                {product.badge}
              </div>
            )}
            {/* Quick add overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-end justify-center pb-4">
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                whileHover={{ scale: 1.05 }}
                onClick={handleQuickAdd}
                className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 btn-primary text-sm py-2.5 px-6"
              >
                + Thêm vào giỏ
              </motion.button>
            </div>
          </div>
          {/* Info */}
          <div className="p-4">
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
              {product.category}
            </p>
            <h3 className="text-sm font-semibold text-[var(--color-text)] mb-2 line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors duration-200">
              {product.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-[var(--color-primary)]">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-[var(--color-text-muted)] line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            {/* Rating */}
            <div className="flex items-center gap-1.5 mt-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill={i < Math.floor(product.rating) ? "#DC2626" : "none"}
                    stroke={i < Math.floor(product.rating) ? "#DC2626" : "#525252"}
                    strokeWidth="2"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <span className="text-xs text-[var(--color-text-muted)]">({product.reviewCount})</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
