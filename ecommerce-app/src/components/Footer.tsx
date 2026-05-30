import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[var(--color-bg-card)] border-t border-[var(--color-border)]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#DC2626] to-[#991B1B] flex items-center justify-center text-white font-bold text-base shadow-[0_0_15px_rgba(220,38,38,0.2)]">
              TW
            </div>
            <span className="text-sm font-bold text-[var(--color-text)] tracking-tight">
              Type<span className="text-[var(--color-primary)]">Words</span>
              <span className="text-xs text-[var(--color-text-muted)] ml-2">VN</span>
            </span>
          </div>

          <p className="text-xs text-[var(--color-text-muted)] text-center sm:text-left">
            © 2026 TypeWords VN. Ứng dụng luyện gõ mười ngón ghi nhớ từ vựng tiếng Anh. Phát triển dựa trên ý tưởng từ dự án gốc TypeWords.
          </p>

          {/* Links */}
          <div className="flex gap-4">
            <a
              href="https://github.com/zyronon/TypeWords"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[var(--color-text-muted)] no-underline hover:text-[var(--color-text-secondary)] transition-colors duration-200"
            >
              GitHub Gốc
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
