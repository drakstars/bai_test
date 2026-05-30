"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundType, setSoundType] = useState("mechanical"); // 'mechanical' | 'laptop' | 'silent'

  useEffect(() => {
    // Sync with localStorage if available
    const savedSound = localStorage.getItem("tw-sound-enabled");
    if (savedSound !== null) {
      setSoundEnabled(savedSound === "true");
    }
    const savedType = localStorage.getItem("tw-sound-type");
    if (savedType) {
      setSoundType(savedType);
    }
  }, []);

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    localStorage.setItem("tw-sound-enabled", String(nextState));
  };

  const changeSoundType = (type: string) => {
    setSoundType(type);
    localStorage.setItem("tw-sound-type", type);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-[72px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 no-underline group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#DC2626] to-[#991B1B] flex items-center justify-center text-white font-black text-lg shadow-[0_0_20px_rgba(220,38,38,0.3)] group-hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] transition-shadow duration-300">
              TW
            </div>
            <span className="text-lg font-bold text-[var(--color-text)] tracking-tight">
              Type<span className="text-[var(--color-primary)]">Words</span>
              <span className="text-xs font-semibold text-[var(--color-text-muted)] ml-2">VN</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] no-underline hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/5"
            >
              Chọn từ điển
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Sound Toggler */}
            <div className="relative group/sound">
              <button
                onClick={toggleSound}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-[var(--color-text-secondary)] hover:text-white hover:bg-white/5 transition-all duration-200 bg-transparent border-none cursor-pointer"
                title={soundEnabled ? "Tắt âm thanh" : "Bật âm thanh"}
              >
                {soundEnabled ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                  </svg>
                )}
              </button>

              {/* Sound Options Popover */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-3 opacity-0 translate-y-2 pointer-events-none group-hover/sound:opacity-100 group-hover/sound:translate-y-0 group-hover/sound:pointer-events-auto transition-all duration-200 shadow-xl">
                <p className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)] mb-2 px-1">
                  Âm thanh gõ phím
                </p>
                <div className="space-y-1">
                  {[
                    { id: "mechanical", label: "⌨️ Cơ học (Mechanical)" },
                    { id: "laptop", label: "💻 Laptop Click" },
                    { id: "silent", label: "🔇 Tắt âm" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => changeSoundType(opt.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all border-none flex items-center justify-between ${
                        soundType === opt.id
                          ? "bg-[var(--color-primary)] text-white"
                          : "text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {opt.label}
                      {soundType === opt.id && <span className="text-[10px]">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Info / FAQ */}
            <a
              href="https://github.com/zyronon/TypeWords"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-lg flex items-center justify-center text-[var(--color-text-secondary)] hover:text-white hover:bg-white/5 transition-all duration-200 no-underline"
              title="Về dự án"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
