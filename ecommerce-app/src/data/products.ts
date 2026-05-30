export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  category: string;
  rating: number;
  reviewCount: number;
  description: string;
  details: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  badge?: string;
  inStock: boolean;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Áo Khoác Da Premium",
    price: 2890000,
    originalPrice: 3590000,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=750&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=750&fit=crop",
      "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=600&h=750&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=750&fit=crop",
    ],
    category: "Áo khoác",
    rating: 4.8,
    reviewCount: 124,
    description: "Áo khoác da cao cấp với thiết kế tối giản, phong cách mạnh mẽ. Chất liệu da thật mềm mại, lớp lót satin cao cấp giữ ấm tốt.",
    details: [
      "Chất liệu: Da bò thật 100%",
      "Lớp lót: Satin cao cấp",
      "Khóa kéo YKK chất lượng cao",
      "Túi bên trong và bên ngoài",
      "Giặt khô chuyên dụng",
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Đen", hex: "#1a1a1a" },
      { name: "Nâu", hex: "#8B4513" },
    ],
    badge: "Bán chạy",
    inStock: true,
  },
  {
    id: "2",
    name: "Giày Sneaker Urban X",
    price: 1990000,
    originalPrice: 2490000,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=750&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=750&fit=crop",
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&h=750&fit=crop",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=750&fit=crop",
    ],
    category: "Giày dép",
    rating: 4.9,
    reviewCount: 256,
    description: "Giày sneaker phong cách đường phố với đế boost siêu nhẹ. Phần upper dệt thoáng khí, đệm lót memory foam êm ái suốt cả ngày.",
    details: [
      "Chất liệu upper: Vải dệt flyknit",
      "Đế: Boost foam siêu nhẹ",
      "Đệm lót: Memory foam",
      "Trọng lượng: 280g",
      "Phù hợp chạy bộ & casual",
    ],
    sizes: ["39", "40", "41", "42", "43", "44"],
    colors: [
      { name: "Đỏ", hex: "#DC2626" },
      { name: "Đen", hex: "#1a1a1a" },
      { name: "Trắng", hex: "#f5f5f5" },
    ],
    badge: "Hot",
    inStock: true,
  },
  {
    id: "3",
    name: "Đồng Hồ Chronograph Elite",
    price: 4590000,
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=750&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=750&fit=crop",
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&h=750&fit=crop",
      "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&h=750&fit=crop",
    ],
    category: "Phụ kiện",
    rating: 4.7,
    reviewCount: 89,
    description: "Đồng hồ chronograph cao cấp với bộ máy automatic. Mặt kính sapphire chống xước, dây thép không gỉ 316L sang trọng.",
    details: [
      "Bộ máy: Automatic Miyota",
      "Kính: Sapphire chống xước",
      "Chống nước: 10ATM",
      "Dây: Thép không gỉ 316L",
      "Đường kính mặt: 42mm",
    ],
    sizes: ["Một cỡ"],
    colors: [
      { name: "Bạc", hex: "#C0C0C0" },
      { name: "Đen", hex: "#1a1a1a" },
    ],
    inStock: true,
  },
  {
    id: "4",
    name: "Túi Xách Tote Minimalist",
    price: 1690000,
    originalPrice: 2190000,
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=750&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=750&fit=crop",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=750&fit=crop",
    ],
    category: "Phụ kiện",
    rating: 4.6,
    reviewCount: 67,
    description: "Túi xách tote thiết kế tối giản, chất liệu da PU cao cấp. Ngăn chứa laptop 14 inch, phù hợp đi làm và đi chơi.",
    details: [
      "Chất liệu: Da PU cao cấp",
      "Kích thước: 40x30x12cm",
      "Ngăn laptop 14 inch",
      "Khóa nam châm",
      "Dây đeo điều chỉnh",
    ],
    sizes: ["Một cỡ"],
    colors: [
      { name: "Đen", hex: "#1a1a1a" },
      { name: "Nâu bò", hex: "#A0522D" },
      { name: "Kem", hex: "#F5F5DC" },
    ],
    badge: "-23%",
    inStock: true,
  },
  {
    id: "5",
    name: "Áo Polo Classic Fit",
    price: 590000,
    image: "https://images.unsplash.com/photo-1625910513413-5fc5c57fbba0?w=600&h=750&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1625910513413-5fc5c57fbba0?w=600&h=750&fit=crop",
      "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&h=750&fit=crop",
    ],
    category: "Áo",
    rating: 4.5,
    reviewCount: 198,
    description: "Áo polo classic fit với chất liệu cotton pique cao cấp. Co giãn nhẹ, thoáng mát, phù hợp mọi dịp.",
    details: [
      "Chất liệu: 95% Cotton, 5% Spandex",
      "Kiểu dáng: Classic Fit",
      "Cổ dệt kim bền đẹp",
      "Logo thêu tinh tế",
      "Giặt máy được",
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Đen", hex: "#1a1a1a" },
      { name: "Trắng", hex: "#f5f5f5" },
      { name: "Đỏ", hex: "#DC2626" },
      { name: "Xanh navy", hex: "#1e3a5f" },
    ],
    inStock: true,
  },
  {
    id: "6",
    name: "Kính Mát Aviator Pro",
    price: 890000,
    originalPrice: 1190000,
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=750&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=750&fit=crop",
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=750&fit=crop",
    ],
    category: "Phụ kiện",
    rating: 4.4,
    reviewCount: 145,
    description: "Kính mát aviator với tròng polarized chống chói. Gọng kim loại siêu nhẹ, bảo vệ UV400 toàn diện.",
    details: [
      "Tròng: Polarized UV400",
      "Gọng: Hợp kim titan",
      "Trọng lượng: 28g",
      "Kèm hộp cứng & khăn lau",
      "Bảo hành 12 tháng",
    ],
    sizes: ["Một cỡ"],
    colors: [
      { name: "Đen", hex: "#1a1a1a" },
      { name: "Vàng", hex: "#DAA520" },
    ],
    badge: "Mới",
    inStock: true,
  },
  {
    id: "7",
    name: "Quần Jeans Slim Fit",
    price: 890000,
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=750&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=750&fit=crop",
      "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=600&h=750&fit=crop",
    ],
    category: "Quần",
    rating: 4.6,
    reviewCount: 312,
    description: "Quần jeans slim fit phom dáng chuẩn, chất vải denim Nhật co giãn thoải mái. Wash màu đậm sang trọng.",
    details: [
      "Chất liệu: 98% Cotton, 2% Elastane",
      "Kiểu dáng: Slim Fit",
      "Denim Nhật Kaihara",
      "Khóa YKK",
      "Giặt máy ở 30°C",
    ],
    sizes: ["28", "29", "30", "31", "32", "33", "34"],
    colors: [
      { name: "Xanh đậm", hex: "#1a237e" },
      { name: "Đen", hex: "#1a1a1a" },
    ],
    inStock: true,
  },
  {
    id: "8",
    name: "Áo Hoodie Oversized",
    price: 790000,
    originalPrice: 990000,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=750&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=750&fit=crop",
      "https://images.unsplash.com/photo-1578768079470-0a4536cc5820?w=600&h=750&fit=crop",
    ],
    category: "Áo",
    rating: 4.7,
    reviewCount: 178,
    description: "Áo hoodie oversized phong cách streetwear. Vải nỉ bông dày dặn 400gsm, mũ trùm 2 lớp, túi kangaroo rộng rãi.",
    details: [
      "Chất liệu: 80% Cotton, 20% Polyester",
      "Trọng lượng vải: 400gsm",
      "Kiểu dáng: Oversized",
      "Mũ trùm 2 lớp",
      "Giặt máy được",
    ],
    sizes: ["M", "L", "XL", "XXL"],
    colors: [
      { name: "Đen", hex: "#1a1a1a" },
      { name: "Xám", hex: "#6B7280" },
      { name: "Trắng kem", hex: "#FAF0E6" },
    ],
    badge: "-20%",
    inStock: true,
  },
  {
    id: "9",
    name: "Thắt Lưng Da Reversible",
    price: 490000,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=750&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=750&fit=crop",
    ],
    category: "Phụ kiện",
    rating: 4.3,
    reviewCount: 56,
    description: "Thắt lưng da bò thật hai mặt reversible. Mặt khóa kim loại brushed nickel sang trọng, có thể đảo ngược đen/nâu.",
    details: [
      "Chất liệu: Da bò thật",
      "Khóa: Kim loại brushed nickel",
      "Hai mặt: Đen / Nâu",
      "Chiều rộng: 3.5cm",
      "Cắt được theo size",
    ],
    sizes: ["S (80-90cm)", "M (90-100cm)", "L (100-110cm)"],
    colors: [
      { name: "Đen/Nâu", hex: "#1a1a1a" },
    ],
    inStock: true,
  },
  {
    id: "10",
    name: "Áo Sơ Mi Oxford",
    price: 690000,
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=750&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=750&fit=crop",
      "https://images.unsplash.com/photo-1598033129183-c4f50c736c10?w=600&h=750&fit=crop",
    ],
    category: "Áo",
    rating: 4.5,
    reviewCount: 143,
    description: "Áo sơ mi Oxford button-down phong cách smart casual. Vải Oxford dệt thoi mềm mại, phom regular fit thoải mái.",
    details: [
      "Chất liệu: 100% Cotton Oxford",
      "Kiểu dáng: Regular Fit",
      "Cổ: Button-down",
      "Cúc: Ngọc trai giả",
      "Là hơi nước",
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Trắng", hex: "#f5f5f5" },
      { name: "Xanh nhạt", hex: "#ADD8E6" },
      { name: "Hồng", hex: "#FFB6C1" },
    ],
    inStock: true,
  },
  {
    id: "11",
    name: "Balo Laptop Chống Nước",
    price: 1290000,
    originalPrice: 1590000,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=750&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=750&fit=crop",
    ],
    category: "Phụ kiện",
    rating: 4.8,
    reviewCount: 203,
    description: "Balo laptop chống nước với ngăn laptop 15.6 inch riêng biệt. Vải Oxford 900D siêu bền, đệm lưng ergonomic.",
    details: [
      "Chất liệu: Oxford 900D chống nước",
      "Ngăn laptop: 15.6 inch",
      "Dung tích: 25L",
      "Cổng sạc USB bên ngoài",
      "Đệm lưng thoáng khí",
    ],
    sizes: ["Một cỡ"],
    colors: [
      { name: "Đen", hex: "#1a1a1a" },
      { name: "Xám", hex: "#6B7280" },
    ],
    badge: "Bán chạy",
    inStock: true,
  },
  {
    id: "12",
    name: "Giày Boot Chelsea",
    price: 2290000,
    image: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600&h=750&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600&h=750&fit=crop",
      "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&h=750&fit=crop",
    ],
    category: "Giày dép",
    rating: 4.7,
    reviewCount: 98,
    description: "Giày boot Chelsea da bò Ý với đế Goodyear welt. Thiết kế thanh lịch, phù hợp cả casual lẫn semi-formal.",
    details: [
      "Chất liệu: Da bò Ý",
      "Đế: Goodyear welt",
      "Lót trong: Da cừu",
      "Đai co giãn hai bên",
      "Có thể thay đế",
    ],
    sizes: ["39", "40", "41", "42", "43", "44"],
    colors: [
      { name: "Đen", hex: "#1a1a1a" },
      { name: "Nâu sẫm", hex: "#3E2723" },
    ],
    inStock: true,
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.badge);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}
