export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  count: number;
}

export const categories: Category[] = [
  {
    id: "1",
    name: "Áo khoác",
    slug: "ao-khoac",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop",
    count: 24,
  },
  {
    id: "2",
    name: "Giày dép",
    slug: "giay-dep",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop",
    count: 36,
  },
  {
    id: "3",
    name: "Phụ kiện",
    slug: "phu-kien",
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=500&fit=crop",
    count: 48,
  },
  {
    id: "4",
    name: "Áo",
    slug: "ao",
    image: "https://images.unsplash.com/photo-1625910513413-5fc5c57fbba0?w=400&h=500&fit=crop",
    count: 52,
  },
  {
    id: "5",
    name: "Quần",
    slug: "quan",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop",
    count: 31,
  },
];
