import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "TypeWords VN - Luyện Gõ Từ Vựng Tiếng Anh | Muscle Memory",
  description:
    "TypeWords VN - Ứng dụng luyện gõ bàn phím học tiếng Anh đỉnh cao. Ghi nhớ từ vựng hiệu quả qua phương thức muscle memory phản xạ cơ tay.",
  keywords: "luyện gõ tiếng anh, học từ vựng, gõ mười ngón, typewords, ielts, toeic",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Header />
        <main className="min-h-screen pt-16 lg:pt-[72px]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
