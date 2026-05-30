"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProductDetailRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/");
  }, [router]);

  return <div className="min-h-screen bg-[#0A0A0A]" />;
}
