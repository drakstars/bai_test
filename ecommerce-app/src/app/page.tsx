"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { DICTIONARIES, Dictionary } from "@/data/vocabulary";

// Features data
const FEATURES = [
  {
    icon: "🧠",
    title: "Ôn tập thông minh FSRS",
    desc: "Tự động lập lịch ôn tập dựa trên thuật toán lặp lại ngắt quãng khoa học giúp tối đa hóa hiệu suất học."
  },
  {
    icon: "📚",
    title: "Kho từ vựng đa dạng",
    desc: "Tích hợp sẵn các bộ từ điển chuyên ngành IT, luyện thi IELTS, TOEIC đáp ứng mọi nhu cầu ôn luyện."
  },
  {
    icon: "⌨️",
    title: "7 chế độ luyện tập",
    desc: "Gõ theo, nghe viết, tự kiểm tra, đọc thuộc... kết hợp linh hoạt giúp rèn luyện phản xạ cơ tay (muscle memory)."
  },
  {
    icon: "🆓",
    title: "Hoàn toàn miễn phí",
    desc: "Giao diện sạch sẽ, 100% miễn phí sử dụng, tập trung tối đa vào trải nghiệm học tập của bạn."
  },
  {
    icon: "⚙️",
    title: "Tùy biến cao",
    desc: "Tự do cài đặt âm thanh gõ phím cơ, tốc độ phát âm, phím tắt và mục tiêu học tập hàng ngày của bạn."
  },
  {
    icon: "☁️",
    title: "Dữ liệu cục bộ ưu tiên",
    desc: "Dữ liệu mặc định lưu trữ an toàn trong trình duyệt của bạn. Hỗ trợ cấu hình đồng bộ đám mây qua Supabase."
  }
];

// Shortcuts data
const SHORTCUTS = [
  { key: "Tab", desc: "Bỏ qua từ hiện tại" },
  { key: "Esc", desc: "Hiển thị từ hiện tại" },
  { key: "Ctrl + R", desc: "Đọc thuộc lòng ngẫu nhiên" },
  { key: "Shift + →", desc: "Bỏ qua giai đoạn luyện tập" },
  { key: "`", desc: "Đánh dấu / Hủy đã thuộc" },
  { key: "Ctrl + P", desc: "Phát âm từ vựng" }
];

// FAQ data
const FAQS = [
  {
    q: "TypeWords lưu trữ dữ liệu của tôi như thế nào?",
    a: "Tất cả dữ liệu học tập và cấu hình của bạn được ưu tiên lưu trữ an toàn ngay trên trình duyệt cục bộ của bạn thông qua IndexedDB và LocalStorage. Ứng dụng hoạt động hoàn toàn offline."
  },
  {
    q: "Làm thế nào để đồng bộ dữ liệu giữa các thiết bị?",
    a: "Bạn có thể dễ dàng xuất dữ liệu sao lưu dưới dạng tệp ZIP trong phần Cài đặt và nhập lại trên thiết bị mới, hoặc tự cấu hình tài khoản Supabase cá nhân để đồng bộ đám mây tự động."
  },
  {
    q: "Tính năng phản xạ cơ tay (Muscle Memory) giúp ích gì?",
    a: "Thay vì chỉ nhìn và chọn đáp án một cách thụ động, việc trực tiếp gõ phím từng chữ cái của từ vựng giúp liên kết chuyển động cơ tay với trí nhớ, giúp bạn nhớ cách viết từ vựng sâu sắc hơn."
  },
  {
    q: "Có mất phí khi sử dụng các bộ từ điển không?",
    a: "Hoàn toàn không. Tất cả các bộ từ điển từ IT chuyên ngành đến IELTS, TOEIC đều được cung cấp miễn phí vĩnh viễn cho mọi người học."
  }
];

// Words list for typing simulator animation
const SIMULATOR_WORDS = [
  { word: "persevere", translation: "kiên trì, bền bỉ, không bỏ cuộc" },
  { word: "diligent", translation: "cần cù, siêng năng, cần mẫn" },
  { word: "profound", translation: "sâu sắc, thâm thúy, uyên thâm" }
];

export default function LandingPage() {
  const [selectedDict, setSelectedDict] = useState<Dictionary | null>(DICTIONARIES[0]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Typing simulator state
  const [simWordIdx, setSimWordIdx] = useState(0);
  const [simTyped, setSimTyped] = useState("");
  const [simIsDone, setSimIsDone] = useState(false);
  const currentSim = SIMULATOR_WORDS[simWordIdx];

  // Typing simulator loop effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (simIsDone) {
      timer = setTimeout(() => {
        setSimIsDone(false);
        setSimTyped("");
        setSimWordIdx((prev) => (prev + 1) % SIMULATOR_WORDS.length);
      }, 2500);
    } else {
      const targetWord = currentSim.word;
      if (simTyped.length < targetWord.length) {
        timer = setTimeout(() => {
          setSimTyped((prev) => prev + targetWord[prev.length]);
        }, 200 + Math.random() * 150); // simulated human typing speed
      } else {
        setSimIsDone(true);
      }
    }
    return () => clearTimeout(timer);
  }, [simTyped, simIsDone, simWordIdx]);

  return (
    <div className="min-h-screen bg-[#070707] text-[#FAFAFA] overflow-hidden selection:bg-[#DC2626]/30 selection:text-white">
      {/* Background glow effects */}
      <div className="absolute top-[10%] left-[10%] w-[40rem] h-[40rem] bg-radial from-[#DC2626]/5 to-transparent rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[5%] w-[35rem] h-[35rem] bg-radial from-red-900/5 to-transparent rounded-full blur-[100px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6 text-center lg:text-left"
          >
            {/* Tag Badges */}
            <div className="inline-flex flex-wrap justify-center lg:justify-start gap-2.5">
              <span className="text-[10px] uppercase font-extrabold tracking-widest px-3.5 py-1.5 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] text-neutral-400">
                🚀 Phiên bản VN Premium
              </span>
              <span className="text-[10px] uppercase font-extrabold tracking-widest px-3.5 py-1.5 rounded-full bg-[#DC2626]/10 border border-[#DC2626]/30 text-[#DC2626]">
                🔒 Dữ liệu bảo mật cục bộ
              </span>
            </div>

            {/* Slogan Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
              Luyện Gõ Phím<br />
              <span className="bg-gradient-to-r from-[#DC2626] via-[#EF4444] to-[#FCA5A5] bg-clip-text text-transparent">
                Ghi Nhớ Từ Vựng
              </span>
            </h1>

            {/* Slogan Description */}
            <p className="text-sm sm:text-base text-neutral-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Gõ phím học tiếng Anh theo phương pháp muscle memory (phản xạ cơ tay). Ôn tập ngắt quãng khoa học giúp bạn nhớ từ vựng lâu dài và tự nhiên nhất.
            </p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <a
                href="#dictionaries-list"
                className="w-full sm:w-auto btn-primary py-3.5 px-8 text-center font-bold rounded-xl no-underline text-xs flex items-center justify-center gap-2 group"
              >
                Bắt đầu học ngay
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </a>
              <a
                href="https://github.com/zyronon/TypeWords"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto btn-outline py-3.5 px-8 text-center font-bold rounded-xl no-underline text-xs"
              >
                Xem mã nguồn GitHub
              </a>
            </div>

            {/* Key benefits bullets */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-6 border-t border-neutral-900 max-w-lg mx-auto lg:mx-0 text-left">
              {[
                "💯 Miễn phí vĩnh viễn",
                "🔌 Không cần đăng ký",
                "🧠 Thuật toán FSRS Ebbinghaus",
                "⚡ Thiết kế tối ưu bàn phím"
              ].map((bullet, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-semibold text-neutral-400">
                  {bullet}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Hero Right Typing Widget */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 w-full max-w-[460px] mx-auto"
          >
            <div className="bg-[#0E0E0E] border border-[#1F1F1F] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
              {/* Window Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1F1F1F] bg-[#0A0A0A]">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                </div>
                <span className="text-[10px] font-mono tracking-wider text-neutral-500 font-bold uppercase">
                  TypeWords Widget
                </span>
              </div>

              {/* Window Content */}
              <div className="p-8 space-y-6 text-center">
                <div className="space-y-1">
                  <span className="text-xs font-mono text-neutral-500 tracking-wider">
                    {simIsDone ? "/pərsəˈvir/" : "/daɪˈnamɪk/"}
                  </span>
                </div>

                {/* Simulated word input target */}
                <div className="text-4xl font-extrabold tracking-widest font-mono py-2 min-h-[50px] flex items-center justify-center">
                  <span className="text-[#10B981]">{simTyped}</span>
                  <span className="text-neutral-700">
                    {currentSim.word.slice(simTyped.length)}
                  </span>
                  <span className="w-1.5 h-8 bg-[#DC2626] ml-1 animate-pulse" />
                </div>

                {/* Meaning */}
                <div className="text-xs text-neutral-400 font-semibold px-4 py-2 rounded-xl bg-white/5 inline-block">
                  {currentSim.translation}
                </div>

                {/* Animated typing keyboard layout highlight (small preview) */}
                <div className="pt-4 border-t border-[#1F1F1F] space-y-1.5 max-w-[280px] mx-auto select-none">
                  {[
                    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
                    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
                    ["z", "x", "c", "v", "b", "n", "m"]
                  ].map((row, rIdx) => (
                    <div key={rIdx} className="flex justify-center gap-1">
                      {row.map((char) => {
                        const isCharNext =
                          !simIsDone &&
                          currentSim.word[simTyped.length]?.toLowerCase() === char;
                        return (
                          <span
                            key={char}
                            className={`w-6 h-6 rounded flex items-center justify-center text-[9px] font-bold font-mono transition-all uppercase ${
                              isCharNext
                                ? "bg-[#DC2626] text-white shadow-[0_0_10px_rgba(220,38,38,0.5)] scale-110"
                                : "bg-neutral-900 border border-neutral-800 text-neutral-600"
                            }`}
                          >
                            {char}
                          </span>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Instruction tips */}
                <p className="text-[10px] text-neutral-500 font-semibold italic mt-2">
                  {simIsDone ? "Từ vựng tiếp theo tự động..." : "Gõ từng ký tự bằng bàn phím để luyện tập"}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats row */}
      <section className="border-y border-[#1F1F1F] bg-[#0E0E0E]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "7", label: "Chế độ học", suffix: "" },
              { value: "50", label: "Từ điển tích hợp", suffix: "+" },
              { value: "100", label: "Miễn phí mã nguồn", suffix: "%" },
              { value: "24/7", label: "Học offline tiện lợi", suffix: "" }
            ].map((stat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="text-3xl md:text-4xl font-black text-white bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
                  {stat.value}
                  <span className="text-[#DC2626]">{stat.suffix}</span>
                </div>
                <div className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recommended Dictionaries / Product Cards Section */}
      <section id="dictionaries-list" className="py-20 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-[#DC2626]">
              📚 Danh sách từ điển
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1.5">
              Từ điển đề xuất cho bạn
            </h2>
            <p className="text-xs text-neutral-400 mt-1 max-w-md">
              Chọn một bộ từ điển tiếng Anh phù hợp với mục tiêu của bạn để bước vào luyện gõ phản xạ.
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex gap-2.5">
            {DICTIONARIES.map((dict) => (
              <button
                key={dict.id}
                onClick={() => setSelectedDict(dict)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  selectedDict?.id === dict.id
                    ? "bg-[#DC2626]/10 border-[#DC2626] text-[#DC2626] shadow-[0_0_15px_rgba(220,38,38,0.1)]"
                    : "bg-neutral-900 border-[#1F1F1F] text-neutral-400 hover:text-white"
                }`}
              >
                {dict.name}
              </button>
            ))}
          </div>
        </div>

        {/* Dictionary cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DICTIONARIES.map((dict) => {
            const isSelected = selectedDict?.id === dict.id;
            return (
              <motion.div
                key={dict.id}
                whileHover={{ y: -6 }}
                className={`p-6 rounded-2xl border transition-all flex flex-col justify-between aspect-[4/3] bg-[#0E0E0E] relative overflow-hidden group ${
                  isSelected ? "border-[#DC2626] shadow-[0_0_30px_rgba(220,38,38,0.1)]" : "border-[#1F1F1F] hover:border-neutral-800"
                }`}
              >
                {/* Visual Glass Glow inside card */}
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-[#DC2626]/10 to-transparent rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-all duration-500" />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl p-3 bg-neutral-900 border border-neutral-800 rounded-xl group-hover:bg-[#DC2626]/10 group-hover:border-[#DC2626]/30 transition-all">
                      {dict.icon}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-neutral-500 tracking-wider">
                      {dict.level}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-[#DC2626] transition-colors line-clamp-1">
                    {dict.name}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-2 line-clamp-2 leading-relaxed">
                    {dict.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#1F1F1F] mt-6">
                  <span className="text-[10px] text-neutral-500 font-extrabold tracking-widest uppercase">
                    {dict.words.length} Từ vựng
                  </span>
                  <Link
                    href={`/practice/${dict.id}`}
                    className="px-4 py-2 bg-[#DC2626] hover:bg-[#EF4444] text-white text-[10px] font-bold rounded-lg no-underline transition-all shadow-[0_0_15px_rgba(220,38,38,0.2)]"
                  >
                    Luyện tập ngay
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-20 bg-[#0E0E0E] border-y border-[#1F1F1F] relative">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
            <span className="text-[10px] uppercase font-black tracking-widest text-[#DC2626]">
              ⚡ Tính năng nổi bật
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Tất cả giúp bạn học sâu hơn
            </h2>
            <p className="text-xs text-neutral-400">
              TypeWords không chỉ là phần mềm gõ phím thông thường mà tích hợp các giải pháp khoa học tối ưu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="p-6 rounded-2xl bg-[#070707] border border-[#1F1F1F] hover:border-neutral-800 transition-all space-y-3"
              >
                <div className="text-2xl p-2.5 bg-neutral-900/50 border border-neutral-900 rounded-xl inline-block">
                  {feature.icon}
                </div>
                <h4 className="text-sm font-bold text-white">{feature.title}</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Shortcuts keyboard layout */}
      <section className="py-20 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
          <span className="text-[10px] uppercase font-black tracking-widest text-[#DC2626]">
            ⌨️ Tối ưu bàn phím
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Điều khiển hoàn toàn bằng phím tắt
          </h2>
          <p className="text-xs text-neutral-400">
            Học tập liền mạch, không cần chạm tới chuột. Tập trung tối đa năng lượng cho đôi tay bạn.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {SHORTCUTS.map((item, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-[#0E0E0E] border border-[#1F1F1F] flex flex-col gap-3.5 hover:border-neutral-800 transition-all"
            >
              <div>
                <kbd className="inline-block px-3 py-1.5 rounded-lg border border-[#2B2B2B] bg-[#1A1A1A] font-mono text-xs font-bold text-white shadow-inner">
                  {item.key}
                </kbd>
              </div>
              <p className="text-xs text-neutral-400 font-semibold">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-20 bg-[#0E0E0E] border-t border-[#1F1F1F]">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 space-y-2">
            <span className="text-[10px] uppercase font-black tracking-widest text-[#DC2626]">
              ❓ Hỏi đáp nhanh
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Giải đáp thắc mắc thường gặp
            </h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-[#1F1F1F] bg-[#070707] overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left bg-transparent border-none cursor-pointer text-xs font-bold text-white hover:text-[#DC2626] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <span className="text-lg text-neutral-500 font-light ml-4">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="px-5 pb-5 pt-1 text-xs text-neutral-400 leading-relaxed border-t border-neutral-900">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
