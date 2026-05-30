"use client";

import { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getDictionaryById, Word } from "@/data/vocabulary";

// Pronunciation API
const speakWord = (word: string) => {
  const audio = new Audio(`https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word)}`);
  audio.play().catch((err) => console.log("Audio play blocked/failed: ", err));
};

// Keyboard Rows layout for visual keyboard
const KEYBOARD_ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"]
];

export default function PracticePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const dictionary = getDictionaryById(id);

  // Core State
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedInput, setTypedInput] = useState("");
  const [wrongKeys, setWrongKeys] = useState<Record<number, boolean>>({}); // tracking errors by character index
  const [activeKey, setActiveKey] = useState<string | null>(null);

  // Statistics
  const [totalKeypresses, setTotalKeypresses] = useState(0);
  const [correctKeypresses, setCorrectKeypresses] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);

  // Options
  const [showTranslate, setShowTranslate] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Audio sounds
  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {}
  };

  const playWrongSound = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {}
  };

  useEffect(() => {
    if (dictionary) {
      setWords(dictionary.words);
      // Play first word pronunciation
      if (dictionary.words.length > 0) {
        setTimeout(() => speakWord(dictionary.words[0].word), 500);
      }
    }
  }, [dictionary]);

  // Handle global key events
  useEffect(() => {
    if (isFinished || words.length === 0) return;

    const currentWordData = words[currentIndex];
    const currentWord = currentWordData.word.toLowerCase();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore functional keys or key combinations
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.key === "Tab") {
        e.preventDefault();
        // Skip word
        handleNextWord();
        return;
      }
      if (e.key === "Escape") {
        router.push("/");
        return;
      }

      const key = e.key.toLowerCase();
      setActiveKey(key);

      // Start timer on first typing keypress
      if (startTime === null) {
        setStartTime(Date.now());
      }

      // We only care about standard alphabet keys, space, hyphen
      if (key.length === 1) {
        setTotalKeypresses((prev) => prev + 1);

        const currentTargetChar = currentWord[typedInput.length];

        if (key === currentTargetChar) {
          // Correct keypress
          setCorrectKeypresses((prev) => prev + 1);
          playClickSound();
          const nextInput = typedInput + key;
          setTypedInput(nextInput);

          // Word completed
          if (nextInput === currentWord) {
            // Speak pronunciation
            speakWord(currentWordData.word);
            // Small delay to let user see completed word, then move to next or finish
            setTimeout(() => {
              if (currentIndex + 1 < words.length) {
                setCurrentIndex((prev) => prev + 1);
                setTypedInput("");
                setWrongKeys({});
                // Speak next word automatically
                speakWord(words[currentIndex + 1].word);
              } else {
                handleFinish();
              }
            }, 300);
          }
        } else {
          // Wrong keypress
          playWrongSound();
          setWrongKeys((prev) => ({ ...prev, [typedInput.length]: true }));
        }
      } else if (e.key === "Backspace") {
        // Allow deleting back
        if (typedInput.length > 0) {
          setTypedInput((prev) => prev.slice(0, -1));
          setWrongKeys((prev) => {
            const copy = { ...prev };
            delete copy[typedInput.length - 1];
            return copy;
          });
        }
      }
    };

    const handleKeyUp = () => {
      setActiveKey(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [typedInput, currentIndex, words, startTime, isFinished, soundEnabled]);

  // Recalculate real-time stats
  useEffect(() => {
    if (startTime && !isFinished) {
      const minutes = (Date.now() - startTime) / 60000;
      if (minutes > 0) {
        // Calculate WPM (5 keystrokes = 1 word)
        setWpm(Math.round(correctKeypresses / 5 / minutes));
      }
    }
    if (totalKeypresses > 0) {
      setAccuracy(Math.round((correctKeypresses / totalKeypresses) * 100));
    }
  }, [correctKeypresses, totalKeypresses, startTime, isFinished]);

  const handleNextWord = () => {
    if (currentIndex + 1 < words.length) {
      setCurrentIndex((prev) => prev + 1);
      setTypedInput("");
      setWrongKeys({});
      speakWord(words[currentIndex + 1].word);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    setIsFinished(true);
    // Final statistics freeze
    if (startTime) {
      const minutes = (Date.now() - startTime) / 60000;
      setWpm(Math.round(correctKeypresses / 5 / (minutes || 0.1)));
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setTypedInput("");
    setWrongKeys({});
    setTotalKeypresses(0);
    setCorrectKeypresses(0);
    setStartTime(null);
    setIsFinished(false);
    setWpm(0);
    setAccuracy(100);
    if (words.length > 0) {
      speakWord(words[0].word);
    }
  };

  if (!dictionary) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold text-red-500">Từ điển không tồn tại</h2>
        <Link href="/" className="mt-4 btn-primary no-underline">Quay lại trang chủ</Link>
      </div>
    );
  }

  const currentWordData = words[currentIndex];

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#0A0A0A] text-white flex flex-col justify-between py-8 px-4 sm:px-6">
      {/* Upper Status Bar */}
      <div className="max-w-[800px] w-full mx-auto flex items-center justify-between border-b border-[var(--color-border)] pb-4 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-9 h-9 rounded-lg border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-secondary)] hover:text-white transition-all bg-transparent no-underline">
            ←
          </Link>
          <div>
            <h1 className="text-sm font-bold text-[var(--color-text)] truncate max-w-[200px] sm:max-w-none">
              {dictionary.name}
            </h1>
            <p className="text-[10px] text-[var(--color-text-muted)] font-semibold mt-0.5">
              Từ vựng {currentIndex + 1} / {words.length}
            </p>
          </div>
        </div>

        {/* Live Stats */}
        <div className="flex gap-6 text-center">
          <div>
            <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">Tốc độ (WPM)</div>
            <div className="text-lg font-bold text-white mt-0.5">{wpm}</div>
          </div>
          <div>
            <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">Chính xác</div>
            <div className="text-lg font-bold text-[var(--color-primary)] mt-0.5">{accuracy}%</div>
          </div>
        </div>
      </div>

      {/* Main Practice Interface */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-[800px] w-full mx-auto relative py-8">
        <AnimatePresence mode="wait">
          {!isFinished && currentWordData ? (
            <motion.div
              key={currentWordData.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="w-full text-center space-y-8"
            >
              {/* IPA Pronunciation & Play Button */}
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm font-mono text-[var(--color-text-secondary)] tracking-wider">
                  {currentWordData.phonetic}
                </span>
                <button
                  onClick={() => speakWord(currentWordData.word)}
                  className="w-8 h-8 rounded-full border border-neutral-800 bg-neutral-900 flex items-center justify-center text-xs hover:border-[var(--color-primary)] hover:bg-neutral-800 transition-all cursor-pointer"
                  title="Phát âm"
                >
                  🔊
                </button>
              </div>

              {/* Large Word Typing Target */}
              <div className="relative inline-block select-none">
                <div className="text-5xl sm:text-7xl font-black font-mono tracking-[0.1em] flex justify-center py-4">
                  {currentWordData.word.split("").map((char, index) => {
                    let charClass = "text-neutral-700"; // pending
                    let isCurrent = index === typedInput.length;

                    if (index < typedInput.length) {
                      charClass = wrongKeys[index] ? "text-[var(--color-primary)]" : "text-white";
                    }

                    return (
                      <span key={index} className={`relative transition-colors duration-150 ${charClass}`}>
                        {char}
                        {isCurrent && (
                          <motion.span
                            layoutId="cursor"
                            className="absolute left-0 bottom-[-4px] right-[0.1em] h-1.5 bg-[var(--color-primary)] rounded-full"
                            transition={{ duration: 0.15 }}
                          />
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Word Translation / definition */}
              {showTranslate && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] max-w-md mx-auto"
                >
                  <p className="text-sm font-semibold text-[var(--color-primary)] mb-1">Định nghĩa:</p>
                  <p className="text-sm text-[var(--color-text)] font-medium leading-relaxed">
                    {currentWordData.definition}
                  </p>
                </motion.div>
              )}

              {/* Example sentence */}
              <div className="space-y-1.5 text-center max-w-xl mx-auto px-4">
                <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-bold">Ví dụ:</p>
                <p className="text-sm sm:text-base font-serif italic text-white/90">
                  "{currentWordData.example}"
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {currentWordData.exampleTranslation}
                </p>
              </div>
            </motion.div>
          ) : (
            /* Practice Completion Screen */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center p-8 rounded-3xl bg-[var(--color-bg-card)] border border-[var(--color-border)] max-w-md w-full shadow-2xl relative"
            >
              {/* Confetti effect background */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-b from-[rgba(220,38,38,0.2)] to-transparent rounded-full blur-2xl pointer-events-none" />

              <div className="text-5xl mb-4">🏆</div>
              <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">Hoàn thành bài luyện tập!</h2>
              <p className="text-xs text-[var(--color-text-secondary)] mb-6">Bạn đã gõ toàn bộ từ vựng trong danh mục này.</p>

              {/* Results stats */}
              <div className="grid grid-cols-2 gap-4 mb-8 bg-[var(--color-bg)] p-4 rounded-xl border border-[var(--color-border)]">
                <div>
                  <div className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider">Tốc độ gõ</div>
                  <div className="text-2xl font-black text-white mt-1">{wpm} <span className="text-xs font-normal">WPM</span></div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider">Độ chính xác</div>
                  <div className="text-2xl font-black text-[var(--color-primary)] mt-1">{accuracy}%</div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button onClick={handleReset} className="btn-primary py-3 cursor-pointer border-none text-sm font-bold flex items-center justify-center gap-2">
                  Luyện tập lại
                </button>
                <Link href="/" className="btn-outline py-3 no-underline text-sm font-bold text-center block">
                  Chọn từ điển khác
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Visual Keyboard (Desktop only) */}
      {!isFinished && (
        <div className="hidden lg:flex flex-col gap-2 max-w-[650px] w-full mx-auto bg-neutral-950 p-4 rounded-2xl border border-[var(--color-border)] shadow-inner mb-4 select-none">
          {KEYBOARD_ROWS.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-1.5">
              {row.map((key) => {
                const isKeyActive = activeKey === key;
                return (
                  <div
                    key={key}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold font-mono transition-all uppercase ${
                      isKeyActive
                        ? "bg-[var(--color-primary)] text-white shadow-[0_0_15px_rgba(220,38,38,0.6)] translate-y-0.5 scale-95"
                        : "bg-neutral-900 border border-neutral-800 text-neutral-400"
                    }`}
                  >
                    {key}
                  </div>
                );
              })}
            </div>
          ))}
          <div className="flex justify-center gap-1.5 mt-0.5">
            {/* Space key */}
            <div
              className={`h-9 w-64 rounded-lg flex items-center justify-center transition-all ${
                activeKey === " "
                  ? "bg-[var(--color-primary)] shadow-[0_0_15px_rgba(220,38,38,0.6)] translate-y-0.5 scale-95"
                  : "bg-neutral-900 border border-neutral-800"
              }`}
            />
          </div>
        </div>
      )}

      {/* Control panel controls */}
      {!isFinished && (
        <div className="max-w-[800px] w-full mx-auto flex items-center justify-between border-t border-[var(--color-border)] pt-4 text-xs text-[var(--color-text-secondary)]">
          <div className="flex gap-4">
            <button
              onClick={() => setShowTranslate(!showTranslate)}
              className="bg-transparent border-none text-[var(--color-text-secondary)] hover:text-white cursor-pointer transition-colors"
            >
              {showTranslate ? "👁️ Ẩn nghĩa Việt" : "👁️ Hiện nghĩa Việt"}
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="bg-transparent border-none text-[var(--color-text-secondary)] hover:text-white cursor-pointer transition-colors"
            >
              {soundEnabled ? "🔊 Bật âm click" : "🔇 Tắt âm click"}
            </button>
          </div>
          <div className="flex gap-3">
            <span>Bỏ qua từ: <kbd className="bg-neutral-800 px-1 rounded text-white font-mono text-[10px]">Tab</kbd></span>
            <span>Thoát: <kbd className="bg-neutral-800 px-1 rounded text-white font-mono text-[10px]">ESC</kbd></span>
          </div>
        </div>
      )}
    </div>
  );
}
