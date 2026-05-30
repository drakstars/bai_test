<script setup lang="ts">
import { APP_NAME, GITHUB, Origin } from '@typewords/core/config/env.ts'
import { BaseIcon } from '@typewords/base'
import { getSystemTheme, listenToSystemThemeChange, setTheme, swapTheme } from '@typewords/core/hooks/theme.ts'
import ChannelIcons from '@typewords/core/components/channel-icons/ChannelIcons.vue'
import { usePlayBeep, usePlayCorrect, usePlayKeyboardAudio } from '@typewords/core/hooks/sound.ts'

definePageMeta({ layout: 'empty' })

let theme = $ref('light')

onMounted(() => {
  listenToSystemThemeChange(val => {
    if (theme === val) return
    theme = val
    setTheme(theme)
  })
  theme = getSystemTheme()
  setTheme(theme)
  startTypingAnimation()
  startCounterAnimation()
})

function toggleTheme() {
  theme = swapTheme((theme === 'auto' ? getSystemTheme() : theme) as any)
  setTheme(theme)
}

const { locales, setLocale, locale } = useI18n()

const typingWords = ['abandon', 'persevere', 'eloquent', 'diligent', 'profound', 'innovation']
let typingDisplay = $ref('')
let typingCursor = $ref(true)

function startTypingAnimation() {
  let wordIdx = 0
  let charIdx = 0
  let deleting = false
  function tick() {
    const word = typingWords[wordIdx]
    if (!deleting) {
      charIdx++
      typingDisplay = word.slice(0, charIdx)
      if (charIdx === word.length) {
        deleting = true
        setTimeout(tick, 1600)
        return
      }
    } else {
      charIdx--
      typingDisplay = word.slice(0, charIdx)
      if (charIdx === 0) {
        deleting = false
        wordIdx = (wordIdx + 1) % typingWords.length
      }
    }
    setTimeout(tick, deleting ? 60 : 100)
  }
  setInterval(() => {
    typingCursor = !typingCursor
  }, 530)
  tick()
}


const demoWords = [
  {
    word: 'persevere',
    phonetic: '/ˌpɜːrsɪˈvɪər/',
    trans: 'v. kiên trì, bền bỉ, không bỏ cuộc',
    examples: [
      { en: 'You must persevere if you want to succeed.', zh: 'Nếu muốn thành công, bạn phải kiên trì.' },
      { en: 'She persevered through years of hardship.', zh: 'Cô ấy đã kiên trì vượt qua nhiều năm gian khổ.' },
    ],
  },
  {
    word: 'eloquent',
    phonetic: '/ˈeləkwənt/',
    trans: 'adj. hùng biện, đầy thuyết phục',
    examples: [
      { en: 'He gave an eloquent speech at the ceremony.', zh: 'Anh ấy đã có một bài phát biểu đầy thuyết phục tại buổi lễ.' },
      { en: 'Her eloquent writing moved the audience deeply.', zh: 'Những câu chữ đầy thuyết phục của cô ấy đã chạm vào trái tim khán giả.' },
    ],
  },
  {
    word: 'diligent',
    phonetic: '/ˈdɪlɪdʒənt/',
    trans: 'adj. cần cù, siêng năng, cần mẫn',
    examples: [
      { en: 'A diligent student always finishes homework on time.', zh: 'Một học sinh siêng năng luôn hoàn thành bài tập đúng hạn.' },
      { en: 'He was diligent in his research and rarely took breaks.', zh: 'Anh ấy rất cần mẫn trong nghiên cứu và hiếm khi nghỉ ngơi.' },
    ],
  },
  {
    word: 'profound',
    phonetic: '/prəˈfaʊnd/',
    trans: 'adj. sâu sắc, thâm thúy, uyên thâm',
    examples: [
      { en: 'Reading widely has a profound effect on vocabulary.', zh: 'Đọc rộng rãi có tác động sâu sắc đến vốn từ vựng.' },
      { en: 'The discovery had a profound impact on modern science.', zh: 'Khám phá này có tác động sâu sắc đến khoa học hiện đại.' },
    ],
  },
]
let demoIdx = $ref(0)
let demoInput = $ref('')
let demoWrong = $ref('')
let demoDone = $ref(false)
let demoShake = $ref(false)

const demoWord = $computed(() => demoWords[demoIdx])
const demoTyped = $computed(() => demoInput)
const demoRemain = $computed(() => demoWord.word.slice(demoInput.length + demoWrong.length))

function demoNextWord() {
  demoDone = false
  demoInput = ''
  demoWrong = ''
  demoIdx = (demoIdx + 1) % demoWords.length
}

function onDemoKey(e: KeyboardEvent) {
  if (demoDone) {
    if (e.code === 'Space') {
      e.preventDefault()
      demoNextWord()
    }
    return
  }
  if (e.key.length !== 1) return
  e.preventDefault()
  const target = demoWord.word
  const pos = demoInput.length
  if (demoWrong) {

    return
  }
  if (e.key.toLowerCase() === target[pos].toLowerCase()) {
    demoInput += e.key
    demoWrong = ''
    playDemoKeyboard()
    if (demoInput.length === target.length) {
      demoDone = true
      playDemoCorrect()
    }
  } else {
    demoWrong = e.key
    demoShake = true
    playDemoBeep()
    setTimeout(() => {
      demoWrong = ''
      demoShake = false
    }, 500)
  }
}

function onDemoBackspace(e: KeyboardEvent) {
  if (e.code === 'Backspace') {
    e.preventDefault()
    if (demoWrong) {
      demoWrong = ''
      return
    }
    demoInput = demoInput.slice(0, -1)
  }
}

let demoFocused = $ref(false)

const playDemoKeyboard = usePlayKeyboardAudio()
const playDemoBeep = usePlayBeep()
const playDemoCorrect = usePlayCorrect()

let statValues = $ref([0, 0, 0, 0])
const statTargets = [7, 50, 3, 100]
function startCounterAnimation() {
  const duration = 1800
  const startTime = performance.now()
  function step(now: number) {
    const p = Math.min((now - startTime) / duration, 1)
    const e = 1 - Math.pow(1 - p, 3)
    statValues = statTargets.map(t => Math.round(e * t))
    if (p < 1) requestAnimationFrame(step)
  }
  const observer = new IntersectionObserver(
    entries => {
      if (entries[0].isIntersecting) {
        requestAnimationFrame(step)
        observer.disconnect()
      }
    },
    { threshold: 0.3 }
  )
  const el = document.querySelector('.js-stats-bar')
  if (el) observer.observe(el)
}

let faqOpen = $ref<number | null>(null)
const faqs = [
  {
    q: 'Dữ liệu được lưu trữ ở đâu?',
    a: 'Tất cả dữ liệu được ưu tiên lưu tại trình duyệt cục bộ (IndexedDB / localStorage), hoạt động hoàn toàn ngoại tuyến. Nếu muốn đồng bộ giữa nhiều thiết bị, bạn có thể tự cấu hình Supabase để đồng bộ hai chiều.',
  },
  {
    q: 'Hỗ trợ những nền tảng nào?',
    a: 'Hỗ trợ tất cả trình duyệt hiện đại (Web), đồng thời cung cấp extension trên VSCode để bạn luyện gõ từ vựng ngay khi viết code mà không cần chuyển cửa sổ.',
  },
  {
    q: 'Có điểm gì khác so với các ứng dụng học từ vựng khác?',
    a: 'Sự khác biệt cốt lõi là sự kết hợp giữa "gõ phím" và "thuật toán ôn tập ngắt quãng FSRS". Không chỉ đơn giản là nhấp chọn, bạn trực tiếp gõ từ vựng với 7 chế độ luyện tập giúp tăng phản xạ cơ tay và khả năng chính tả.',
  },
  {
    q: 'Làm thế nào để thêm từ điển hoặc bài viết tùy chỉnh?',
    a: 'Tại mục "Từ vựng", bạn có thể tạo từ điển tự chọn; tại mục "Bài viết", bạn có thể thêm sách và bài viết tùy chỉnh (hỗ trợ cả âm thanh). Hoàn toàn tự do, không phụ thuộc nền tảng nào.',
  },
]
function toggleFaq(i: number) {
  faqOpen = faqOpen === i ? null : i
}

const honors = [
  { icon: '⭐', num: '7k+', label: 'GitHub Stars', sub: 'Nhận được sự công nhận từ các nhà phát triển toàn cầu' },
  { icon: '🔥', num: '10w+', label: 'Lượt người dùng', sub: 'Lựa chọn QuizWords để nâng cao tiếng Anh' },
  { icon: '💬', num: '100+', label: 'Người đóng góp', sub: 'Cùng chung tay hoàn thiện kho từ vựng' },
  { icon: '📦', num: '50+', label: 'Từ điển tích hợp', sub: 'Bao phủ mọi cấp độ từ tiểu học đến GRE' },
]
const stats = [
  { suffix: '', label: 'Chế độ luyện tập' },
  { suffix: '+', label: 'Từ điển tích hợp' },
  { suffix: '', label: 'Nền tảng hỗ trợ (Web/VSCode)' },
  { suffix: '%', label: 'Miễn phí & Mở nguồn' },
]

let mobileMenuOpen = $ref(false)
</script>

<template>
  <div class="hw min-h-screen overflow-x-hidden font-sans" :class="theme" id="wrapper">
    <!-- NAV -->
    <header class="sticky top-0 z-100 backdrop-blur-md border-b border-[var(--hw-border)] bg-[var(--hw-bg-nav)]">
      <div class="max-w-[1200px] mx-auto px-4 sm:px-8 h-15 flex items-center gap-8">
        <!-- Logo -->
        <div
          class="flex items-center gap-2 shrink-0"
        >
          <NuxtImg src="/imgs/quizwords_logo.png" alt="QuizWords Logo" class="w-8 h-8 rounded-lg" />
          <span class="text-[1.1rem] font-semibold bg-gradient-to-r from-[#bd34fe] to-[#41d1ff] bg-clip-text text-transparent [-webkit-background-clip:text] [-webkit-text-fill-color:transparent] logo-title">
            {{ APP_NAME }}
          </span>
        </div>
        <!-- Actions -->
        <div class="ml-auto flex items-center gap-2 text-[var(--hw-text-2)]">
          <!-- Lang -->
          <div class="relative group">
            <div class="more w-10 rounded-r-lg h-full center box-border transition-all duration-300">
              <IconPhTranslate />
            </div>
            <div
              class="space-y-2 absolute z-200 right-0 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 pointer-events-none group-hover:pointer-events-auto"
            >
              <div
                class="bg-[var(--hw-bg-card)] border border-[var(--hw-border)] rounded-lg shadow-[var(--hw-shadow-md)] p-3 space-y-1"
              >
                <div
                  v-for="loc in locales"
                  :key="loc.code"
                  @click="setLocale(loc.code)"
                  class="px-3 py-1.5 rounded text-[.88rem] text-[var(--hw-text-2)] cursor-pointer whitespace-nowrap hover:bg-[var(--hw-bg)] hover:text-[var(--hw-text)] transition-colors duration-100"
                >
                  {{ loc.name }}
                </div>
              </div>
            </div>
          </div>
          <!-- Theme toggle -->
          <BaseIcon :title="$t('toggle_theme')" @click="toggleTheme">
            <IconFluentWeatherMoon16Regular v-if="theme === 'light'" />
            <IconFluentWeatherSunny16Regular v-else />
          </BaseIcon>
          <!-- Login -->
          <NuxtLink
            to="/login"
            class="text-[.88rem] font-medium text-[var(--hw-text)] no-underline border border-[var(--hw-border)] px-4 py-1.5 rounded-lg hover:bg-[var(--hw-bg-card)] transition-all duration-200"
          >
            {{ $t('login') }}
          </NuxtLink>
          <!-- Mobile menu button -->
          <button
            class="flex md:hidden items-center justify-center w-8 h-8 rounded-lg bg-transparent text-[var(--hw-text-2)] cursor-pointer"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <span class="text-[1.2rem] leading-none">☰</span>
          </button>
        </div>
      </div>
      <!-- Mobile dropdown menu -->
      <div
        v-show="mobileMenuOpen"
        class="md:hidden border-t border-[var(--hw-border)] bg-[var(--hw-bg-card)] px-4 py-3 flex flex-col gap-3"
      >
        <NuxtLink
          to="/login"
          class="text-[.95rem] font-medium text-[var(--hw-text)] no-underline py-1"
          @click="mobileMenuOpen = false"
          >{{ $t('login') }}</NuxtLink
        >
      </div>
    </header>

    <main>
      <!-- HERO -->
      <section class="relative overflow-hidden px-4 sm:px-8 py-16 sm:py-20 min-h-[80vh] flex items-center">
        <!-- Glow decorations -->
        <div
          class="absolute top-[-8rem] left-1/2 -translate-x-[70%] w-[42rem] h-[42rem] rounded-full pointer-events-none"
          style="background: radial-gradient(circle, rgba(124, 58, 237, 0.18) 0%, transparent 70%)"
        ></div>
        <div
          class="absolute top-[-4rem] right-0 translate-x-[30%] w-[36rem] h-[36rem] rounded-full pointer-events-none"
          style="background: radial-gradient(circle, rgba(37, 99, 235, 0.14) 0%, transparent 70%)"
        ></div>
        
        <div class="relative z-1 max-w-[1200px] mx-auto w-full flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          
          <div class="flex-1 text-center lg:text-left">
            <!-- Title -->
            <h1
              class="hero-title text-[clamp(2.5rem,8vw,5rem)] mt-0 leading-[1.1] mb-16 bg-gradient-to-r from-[#bd34fe] via-[#7c3aed] to-[#41d1ff] bg-clip-text text-transparent [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]"
            >
              {{ APP_NAME }}
            </h1>
            <!-- Sub -->
            <p class="text-[clamp(.95rem,2.5vw,1.2rem)] text-[var(--hw-text-2)] mb-8 leading-[1.65]">
              Gõ phím học từ vựng, ôn tập ngắt quãng khoa học, mỗi lần gõ là một bước tiến.
            </p>
            
            <div class="block sm:hidden mb-4">
              <div
                class="flex text-align-start items-center gap-2.5 bg-[rgba(234,179,8,.1)] border border-[rgba(234,179,8,.4)] text-[#92400e] rounded-xl px-4 py-3 leading-[1.6]"
              >
                <span>⚠️ Trang web được thiết kế riêng cho <strong>bàn phím</strong>, trải nghiệm trên điện thoại không tốt. Khuyên dùng máy tính hoặc kết nối bàn phím rời để sử dụng đầy đủ tính năng.</span>
              </div>
            </div>
            <!-- CTA buttons -->
            <div
              class="flex gap-3 justify-center lg:justify-start flex-col sm:flex-row items-stretch sm:items-center flex-wrap"
            >
              <NuxtLink
                to="/login"
                class="inline-flex items-center justify-center px-7 h-11 rounded-lg font-semibold text-[.95rem] text-white bg-gradient-to-r from-[#7c3aed] to-[#2563eb] border-none shadow-[0_4px_16px_rgba(124,58,237,.28)] no-underline hover:-translate-y-px hover:opacity-90 transition-all duration-150 sm:w-auto"
              >
                Đăng nhập
              </NuxtLink>
              <NuxtLink
                to="/login?register=true"
                class="inline-flex items-center justify-center px-7 h-11 rounded-lg font-semibold text-[.95rem] text-[var(--hw-text)] bg-transparent border border-solid border-[var(--hw-border)] no-underline hover:bg-[rgba(124,58,237,.06)] hover:border-[#7c3aed] hover:text-[#7c3aed] transition-all duration-150 sm:w-auto"
              >
                Đăng ký
              </NuxtLink>
            </div>
          </div>
          
          <div class="hidden lg:flex flex-col w-[440px] shrink-0">
            <div
              class="bg-[var(--hw-bg-card)] border border-[var(--hw-border)] rounded-2xl shadow-[var(--hw-shadow-lg)] overflow-hidden outline-none"
              tabindex="0"
              @focus="demoFocused = true"
              @blur="demoFocused = false"
              @keydown="onDemoKey"
              @keydown.backspace="onDemoBackspace"
            >
              
              <div class="flex items-center gap-1.5 px-4 py-3 border-b border-[var(--hw-border)] bg-[var(--hw-bg)]">
                <span class="w-3 h-3 rounded-full bg-[#ff5f57]"></span>
                <span class="w-3 h-3 rounded-full bg-[#febc2e]"></span>
                <span class="w-3 h-3 rounded-full bg-[#28c840]"></span>
                <span class="ml-3 text-[.78rem] text-[var(--hw-text-3)] font-mono">QuizWords</span>
              </div>
              <!-- Card content -->
              <div
                class="px-8 py-4 flex flex-col items-center gap-1 cursor-text"
                @click="($el as HTMLElement)?.closest<HTMLElement>('[tabindex]')?.focus()"
              >
                
                <div class="text-[1rem] text-[var(--hw-text-3)] tracking-widest">{{ demoWord.phonetic }}</div>
                
                <div
                  class="text-[2.8rem] leading-none tracking-widest min-h-[3.5rem] flex items-center en-article-family"
                  :class="{ 'demo-shake': demoShake }"
                >
                  <span class="text-[#16a34a]">{{ demoInput }}</span>
                  <span class="text-[rgba(239,68,68,.85)]">{{ demoWrong }}</span>
                  <span class="text-[var(--hw-text-3)]">{{ demoRemain }}</span>
                </div>
                
                <div class="text-[.9rem] text-[var(--hw-text-2)] mt-1">{{ demoWord.trans }}</div>
                
                <div class="w-full mt-3 border-t border-[var(--hw-border)] pt-3 flex flex-col gap-1.5">
                  <div class="text-[.72rem] font-bold tracking-[.06em] uppercase text-[var(--hw-text-3)]">Ví dụ</div>
                  <div
                    v-for="(ex, ei) in demoWord.examples"
                    :key="ei"
                    class="text-[.82rem] leading-[1.6] flex flex-col gap-0.5"
                  >
                    <div class="italic text-[var(--hw-text-2)]">
                      <span class="text-[#7c3aed] font-bold not-italic mr-1">{{ ei + 1 }}.</span>{{ ex.en }}
                    </div>
                    <div class="text-[.78rem] text-[var(--hw-text-3)] not-italic pl-3.5">{{ ex.zh }}</div>
                  </div>
                </div>
                
                <div class="h-14 flex justify-end flex-col">
                  <div v-if="demoDone" class="mt-3 flex flex-col items-center gap-1">
                    <div class="text-[1.2rem] text-[#16a34a] font-bold">✓ Hoàn thành!</div>
                    <div class="text-sm text-blue-5">
                      Nhấn
                      <kbd
                        class="inline-flex items-center justify-center px-1.5 h-5 bg-[var(--hw-bg)] border border-[var(--hw-border)] rounded text-[.72rem] font-mono"
                        >Space</kbd
                      >
                      chuyển từ tiếp theo
                    </div>
                  </div>
                  <div v-else-if="!demoFocused" class="mt-3 text-sm text-blue-5 flex items-center gap-1">
                    <span>Nhấp vào đây hoặc nhấn phím bất kỳ để gõ</span>
                  </div>
                  <div v-else class="mt-3 text-sm text-blue-5">Gõ từng chữ của từ vựng, gõ sai sẽ hiển thị màu đỏ</div>
                </div>
                
                <div class="flex gap-1.5 mt-auto pt-2">
                  <span
                    v-for="(_, i) in demoWords"
                    :key="i"
                    class="w-1.5 h-1.5 rounded-full transition-colors duration-200"
                    :class="i === demoIdx ? 'bg-[#7c3aed]' : 'bg-[var(--hw-border)]'"
                  ></span>
                </div>
              </div>
            </div>
            <p class="text-center text-sm text-blue-5 mt-3">↑ Nhấp và gõ bằng bàn phím để trải nghiệm tính năng gõ phím cốt lõi</p>
          </div>
        </div>
      </section>

      <!-- SHOWCASE -->
      <section class="py-20 sm:py-24 px-4 sm:px-8 bg-[var(--hw-bg-card)] border-t border-b border-[var(--hw-border)]">
        <div class="max-w-[1100px] mx-auto flex flex-col gap-20 sm:gap-24">
          <!-- Words practice -->
          <div class="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-10 md:gap-16 items-center">
            <div>
              <div class="section-label mb-4">Luyện từ vựng</div>
              <h2 class="text-[clamp(1.4rem,3vw,1.8rem)] font-bold mb-3 text-[var(--hw-text)]">
                Phân bậc khoa học, ghi nhớ lâu bền
              </h2>
              <p class="text-[var(--hw-text-2)] text-[1rem] leading-[1.75] mb-6">
                Gõ theo → Nghe viết → Đọc thuộc, ba giai đoạn luyện tập tăng dần. Thuật toán FSRS tự động sắp xếp lịch ôn tập mà không cần học vẹt.
              </p>
              <ul class="list-none p-0 m-0 mb-7 flex flex-col gap-2.5">
                <li class="flex items-start gap-2 text-[.95rem] text-[var(--hw-text-2)] leading-[1.6]">
                  <span class="text-[#7c3aed] font-bold shrink-0 mt-[.05rem]">✓</span> 7 chế độ luyện tập: Gõ theo / Nghe viết / Tự kiểm tra / Đọc thuộc / Ôn tập ngẫu nhiên...
                </li>
                <li class="flex items-start gap-2 text-[.95rem] text-[var(--hw-text-2)] leading-[1.6]">
                  <span class="text-[#7c3aed] font-bold shrink-0 mt-[.05rem]">✓</span> Thuật toán FSRS thông minh tự động gợi ý từ cần ôn tập
                </li>
                <li class="flex items-start gap-2 text-[.95rem] text-[var(--hw-text-2)] leading-[1.6]">
                  <span class="text-[#7c3aed] font-bold shrink-0 mt-[.05rem]">✓</span> Từ viết sai tự động đưa vào chu kỳ ôn tập để gõ lại
                </li>
                <li class="flex items-start gap-2 text-[.95rem] text-[var(--hw-text-2)] leading-[1.6]">
                  <span class="text-[#7c3aed] font-bold shrink-0 mt-[.05rem]">✓</span> Nhấn Tab để bỏ qua / Phím ` để đánh dấu đã thành thạo / Ctrl+R để ngẫu nhiên đọc thuộc
                </li>
              </ul>
              <button
                class="inline-flex items-center justify-center px-5 h-10 rounded-lg font-semibold text-[.9rem] text-[var(--hw-text)] bg-transparent border border-solid border-[var(--hw-border)] cursor-pointer hover:border-[#7c3aed] hover:text-[#7c3aed] hover:bg-[rgba(124,58,237,.06)] transition-all duration-150"
                @click="navigateTo('/words')"
              >
                Luyện từ vựng ngay →
              </button>
            </div>
            <div
              class="rounded-2xl overflow-hidden shadow-[var(--hw-shadow-lg)] border border-[var(--hw-border)] md:order-last order-first"
            >
              <NuxtImg src="/imgs/words.png" class="w-full block" alt="Ảnh chụp luyện từ vựng" />
            </div>
          </div>
          <!-- Article practice -->
          <div class="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-10 md:gap-16 items-center">
            <div class="rounded-2xl overflow-hidden shadow-[var(--hw-shadow-lg)] border border-[var(--hw-border)]">
              <NuxtImg src="/imgs/articles.png" class="w-full block" alt="Ảnh chụp luyện bài viết" />
            </div>
            <div>
              <div class="section-label mb-4">Luyện bài viết</div>
              <h2 class="text-[clamp(1.4rem,3vw,1.8rem)] font-bold mb-3 text-[var(--hw-text)]">Đọc hiểu đắm chìm, nâng cao ngữ cảm</h2>
              <p class="text-[var(--hw-text-2)] text-[1rem] leading-[1.75] mb-6">
                Tích hợp nhiều tựa sách phổ biến, tự do thêm bài viết mới. Chế độ kép: Gõ theo + Đọc thuộc kết hợp nghe âm thanh để tăng khả năng ghi nhớ.
              </p>
              <ul class="list-none p-0 m-0 mb-7 flex flex-col gap-2.5">
                <li class="flex items-start gap-2 text-[.95rem] text-[var(--hw-text-2)] leading-[1.6]">
                  <span class="text-[#7c3aed] font-bold shrink-0 mt-[.05rem]">✓</span> Tích hợp sẵn sách NCE, tác phẩm văn học nổi tiếng
                </li>
                <li class="flex items-start gap-2 text-[.95rem] text-[var(--hw-text-2)] leading-[1.6]">
                  <span class="text-[#7c3aed] font-bold shrink-0 mt-[.05rem]">✓</span> Chế độ gõ theo & đọc thuộc kép
                </li>
                <li class="flex items-start gap-2 text-[.95rem] text-[var(--hw-text-2)] leading-[1.6]">
                  <span class="text-[#7c3aed] font-bold shrink-0 mt-[.05rem]">✓</span> Hỗ trợ vừa nghe âm thanh vừa đọc thuộc lòng
                </li>
                <li class="flex items-start gap-2 text-[.95rem] text-[var(--hw-text-2)] leading-[1.6]">
                  <span class="text-[#7c3aed] font-bold shrink-0 mt-[.05rem]">✓</span> Có thể thêm bài viết tùy chỉnh của riêng bạn
                </li>
              </ul>
              <button
                class="inline-flex items-center justify-center px-5 h-10 rounded-lg font-semibold text-[.9rem] text-[var(--hw-text)] bg-transparent border border-solid border-[var(--hw-border)] cursor-pointer hover:border-[#7c3aed] hover:text-[#7c3aed] hover:bg-[rgba(124,58,237,.06)] transition-all duration-150"
                @click="navigateTo('/articles')"
              >
                Luyện bài viết ngay →
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- STATS BAR -->
      <section
        class="js-stats-bar py-14 px-4 sm:px-8 bg-[var(--hw-bg-card)] border-t border-b border-[var(--hw-border)]"
      >
        <div class="max-w-[900px] mx-auto flex items-center justify-center flex-wrap gap-0">
          <div v-for="(item, i) in stats" :key="i" class="flex-1 min-w-40 text-center px-6 py-4">
            <div
              class="text-[clamp(2rem,4vw,3rem)] font-black leading-[1.1] mb-1.5 bg-gradient-to-r from-[#bd34fe] to-[#41d1ff] bg-clip-text text-transparent [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]"
            >
              {{ statValues[i] }}{{ item.suffix }}
            </div>
            <div class="text-[.88rem] text-[var(--hw-text-3)] leading-[1.4]">{{ item.label }}</div>
          </div>
        </div>
      </section>

      <!-- FEATURE GRID -->
      <section class="py-20 px-4 sm:px-8">
        <div class="max-w-[1100px] mx-auto">
          <!-- Section header -->
          <div class="text-center mb-12">
            <div class="section-label">Tính năng cốt lõi</div>
            <h2 class="section-h2">Tất cả giúp bạn thực sự ghi nhớ</h2>
            <p class="section-desc">QuizWords không chỉ là ứng dụng học từ thông thường, mà là một hệ thống ghi nhớ tiếng Anh cốt lõi bằng cách gõ phím.</p>
          </div>
          <!-- Feature cards grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div class="feature-card">
              <span class="text-[2rem] mb-3.5 block">🧠</span>
              <div class="text-[1rem] font-bold text-[var(--hw-text)] mb-2">Ôn tập thông minh FSRS</div>
              <div class="text-[.9rem] text-[var(--hw-text-2)] leading-[1.7]">
                Tự động lập lịch ôn tập dựa trên thuật toán lặp lại ngắt quãng khoa học giúp tối đa hóa hiệu suất học.
              </div>
            </div>
            <div class="feature-card">
              <span class="text-[2rem] mb-3.5 block">📚</span>
              <div class="text-[1rem] font-bold text-[var(--hw-text)] mb-2">Kho từ vựng khổng lồ</div>
              <div class="text-[.9rem] text-[var(--hw-text-2)] leading-[1.7]">
                Tích hợp hàng chục bộ từ điển từ cơ bản đến nâng cao (IELTS, TOEIC, IT...), chuyển đổi dễ dàng.
              </div>
            </div>
            <div class="feature-card">
              <span class="text-[2rem] mb-3.5 block">⌨️</span>
              <div class="text-[1rem] font-bold text-[var(--hw-text)] mb-2">7 chế độ luyện tập</div>
              <div class="text-[.9rem] text-[var(--hw-text-2)] leading-[1.7]">
                Kết hợp linh hoạt các chế độ giúp rèn luyện phản xạ cơ tay (muscle memory).
              </div>
            </div>
            <div class="feature-card">
              <span class="text-[2rem] mb-3.5 block">🆓</span>
              <div class="text-[1rem] font-bold text-[var(--hw-text)] mb-2">Hoàn toàn miễn phí & Mở nguồn</div>
              <div class="text-[.9rem] text-[var(--hw-text-2)] leading-[1.7]">
                100% mã nguồn mở công khai, miễn phí hoàn toàn và hỗ trợ tự triển khai.
              </div>
            </div>
            <div class="feature-card">
              <span class="text-[2rem] mb-3.5 block">⚙️</span>
              <div class="text-[1rem] font-bold text-[var(--hw-text)] mb-2">Tùy biến cao</div>
              <div class="text-[.9rem] text-[var(--hw-text-2)] leading-[1.7]">
                Tự do thiết lập từ điển, phím tắt, âm thanh gõ và mục tiêu học tập hàng ngày.
              </div>
            </div>
            <div class="feature-card">
              <span class="text-[2rem] mb-3.5 block">☁️</span>
              <div class="text-[1rem] font-bold text-[var(--hw-text)] mb-2">Dữ liệu lưu trữ cục bộ</div>
              <div class="text-[.9rem] text-[var(--hw-text-2)] leading-[1.7]">
                Dữ liệu mặc định lưu trong trình duyệt, bảo mật và an toàn. Hỗ trợ đồng bộ thông qua Supabase.
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- SHORTCUTS -->
      <section class="py-20 px-4 sm:px-8 bg-[var(--hw-bg-card)] border-t border-b border-[var(--hw-border)]">
        <div class="max-w-[900px] mx-auto">
          <!-- Section header -->
          <div class="text-center mb-12">
            <div class="section-label">Phím tắt</div>
            <h2 class="section-h2">Thiết kế cho tín đồ gõ phím</h2>
            <p class="section-desc">Hoàn toàn điều khiển bằng bàn phím, giúp tập trung tối đa không bị xao nhãng.</p>
          </div>
          <!-- Shortcuts grid -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <div class="shortcut-item">
              <div class="flex items-center gap-1.5 flex-wrap">
                <kbd class="kbd-key">Tab</kbd>
              </div>
              <div class="text-[.88rem] text-[var(--hw-text-2)]">Bỏ qua từ hiện tại</div>
            </div>
            <div class="shortcut-item">
              <div class="flex items-center gap-1.5 flex-wrap">
                <kbd class="kbd-key">Esc</kbd>
              </div>
              <div class="text-[.88rem] text-[var(--hw-text-2)]">Hiển thị từ hiện tại</div>
            </div>
            <div class="shortcut-item">
              <div class="flex items-center gap-1.5 flex-wrap">
                <kbd class="kbd-key">Ctrl</kbd>
                <span class="text-[.75rem] text-[var(--hw-text-3)]">+</span>
                <kbd class="kbd-key">R</kbd>
              </div>
              <div class="text-[.88rem] text-[var(--hw-text-2)]">Đọc thuộc lòng ngẫu nhiên</div>
            </div>
            <div class="shortcut-item">
              <div class="flex items-center gap-1.5 flex-wrap">
                <kbd class="kbd-key">Shift</kbd>
                <span class="text-[.75rem] text-[var(--hw-text-3)]">+</span>
                <kbd class="kbd-key">→</kbd>
              </div>
              <div class="text-[.88rem] text-[var(--hw-text-2)]">Bỏ qua giai đoạn luyện tập</div>
            </div>
            <div class="shortcut-item">
              <div class="flex items-center gap-1.5 flex-wrap">
                <kbd class="kbd-key">`</kbd>
              </div>
              <div class="text-[.88rem] text-[var(--hw-text-2)]">Đánh dấu / Bỏ qua từ đã thuộc</div>
            </div>
            <div class="shortcut-item">
              <div class="flex items-center gap-1.5 flex-wrap">
                <kbd class="kbd-key">Ctrl</kbd>
                <span class="text-[.75rem] text-[var(--hw-text-3)]">+</span>
                <kbd class="kbd-key">P</kbd>
              </div>
              <div class="text-[.88rem] text-[var(--hw-text-2)]">Phát âm từ vựng</div>
            </div>
          </div>
          <p class="text-center text-[.85rem] text-[var(--hw-text-3)] m-0">Tất cả các phím tắt đều có thể tùy chỉnh trong phần cài đặt.</p>
        </div>
      </section>

      <!-- HONORS -->
      <section class="py-20 px-4 sm:px-8">
        <div class="max-w-[1100px] mx-auto">
          <!-- Section header -->
          <div class="text-center mb-12">
            <div class="section-label">Được tin dùng</div>
            <h2 class="section-h2">Sự lựa chọn của cộng đồng mã nguồn mở</h2>
            <p class="section-desc">Nhận được sự quan tâm lớn từ cộng đồng và là công cụ học tập ưu tiên của nhiều người.</p>
          </div>
          <!-- Honor cards -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
            <div
              v-for="item in honors"
              :key="item.label"
              class="bg-[var(--hw-bg-card)] border border-[var(--hw-border)] rounded-2xl p-7 text-center hover:-translate-y-1 hover:shadow-[var(--hw-shadow-md)] transition-all duration-200 cursor-default"
            >
              <div class="text-[2rem] mb-3">{{ item.icon }}</div>
              <div
                class="text-[2rem] font-black leading-[1.1] mb-1 bg-gradient-to-r from-[#bd34fe] to-[#41d1ff] bg-clip-text text-transparent [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]"
              >
                {{ item.num }}
              </div>
              <div class="text-[.95rem] font-bold text-[var(--hw-text)] mb-1">{{ item.label }}</div>
              <div class="text-[.82rem] text-[var(--hw-text-3)] leading-[1.5]">{{ item.sub }}</div>
            </div>
          </div>
          <!-- Media badges -->
          <div class="text-center">
            <div class="text-[.78rem] font-semibold tracking-[.06em] uppercase text-[var(--hw-text-3)] mb-4">
              Từng được khuyên dùng & Xếp hạng
            </div>
            <div class="flex gap-3 justify-center flex-wrap">
              <span
                class="inline-flex items-center gap-1.5 text-[.85rem] font-semibold text-[var(--hw-text-2)] px-4 py-2 rounded-full border border-[var(--hw-border)] bg-[var(--hw-bg-card)] hover:border-[#7c3aed] hover:text-[#7c3aed] transition-colors duration-150 cursor-default"
                ><span>🐙</span> GitHub Trending</span
              >
              <span
                class="inline-flex items-center gap-1.5 text-[.85rem] font-semibold text-[var(--hw-text-2)] px-4 py-2 rounded-full border border-[var(--hw-border)] bg-[var(--hw-bg-card)] hover:border-[#7c3aed] hover:text-[#7c3aed] transition-colors duration-150 cursor-default"
                ><span>🏆</span> Gitee GVP</span
              >
              <span
                class="inline-flex items-center gap-1.5 text-[.85rem] font-semibold text-[var(--hw-text-2)] px-4 py-2 rounded-full border border-[var(--hw-border)] bg-[var(--hw-bg-card)] hover:border-[#7c3aed] hover:text-[#7c3aed] transition-colors duration-150 cursor-default"
                ><span>⭐</span> GitCode G-Star</span
              >
            </div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="py-20 px-4 sm:px-8 text-center bg-[var(--hw-bg-card)] border-t border-[var(--hw-border)]">
        <div class="max-w-[600px] mx-auto">
          <h2 class="text-[clamp(1.6rem,4vw,2.2rem)] font-black text-[var(--hw-text)] mb-3">
            Bắt đầu gõ phím, bứt phá tiếng Anh
          </h2>
          <p class="text-[var(--hw-text-2)] text-[1rem] mb-8">Miễn phí, mã nguồn mở, không cần đăng ký.</p>
          <div class="flex gap-3 justify-center flex-wrap flex-col sm:flex-row items-stretch sm:items-center">
            <button
              class="inline-flex items-center justify-center px-8 h-12 rounded-lg font-semibold text-[1rem] text-white bg-gradient-to-r from-[#7c3aed] to-[#2563eb] border-none shadow-[0_4px_16px_rgba(124,58,237,.28)] cursor-pointer hover:-translate-y-px hover:opacity-90 transition-all duration-150 sm:w-auto"
              @click="navigateTo('/words')"
            >
              Luyện từ vựng ngay
            </button>
            <a
              class="inline-flex items-center justify-center px-8 h-12 rounded-lg font-semibold text-[1rem] text-[var(--hw-text)] bg-transparent border border-solid border-[var(--hw-border)] no-underline hover:bg-[rgba(124,58,237,.06)] hover:border-[#7c3aed] hover:text-[#7c3aed] transition-all duration-150 sm:w-auto"
              :href="GITHUB"
              target="_blank"
              >Xem mã nguồn →</a
            >
          </div>
        </div>
      </section>

      <!-- FAQ -->
      <section class="py-20 px-4 sm:px-8">
        <div class="max-w-[720px] mx-auto">
          <!-- Section header -->
          <div class="text-center mb-12">
            <div class="section-label">Câu hỏi thường gặp</div>
            <h2 class="section-h2">Giải đáp thắc mắc</h2>
          </div>
          <!-- FAQ list -->
          <div class="flex flex-col gap-3">
            <div
              v-for="(item, i) in faqs"
              :key="i"
              class="bg-[var(--hw-bg-card)] border border-[var(--hw-border)] rounded-lg overflow-hidden transition-colors duration-150 faq-item"
              :class="{ 'border-[#7c3aed]': faqOpen === i }"
            >
              <button
                class="w-full flex items-center justify-between px-5 py-4 bg-transparent border-none cursor-pointer text-[.97rem] font-semibold text-[var(--hw-text)] text-left gap-4 hover:bg-[rgba(124,58,237,.1)] hover:text-[#7c3aed] transition-colors duration-100"
                @click="toggleFaq(i)"
              >
                <span>{{ item.q }}</span>
                <span class="text-[1.1rem] font-light text-[var(--hw-text-3)] shrink-0 leading-none">{{
                  faqOpen === i ? '−' : '+'
                }}</span>
              </button>
              <div
                class="faq-answer px-5 text-[.92rem] text-[var(--hw-text-2)] leading-[1.75]"
                :class="{ 'faq-open': faqOpen === i }"
              >
                {{ item.a }}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- FOOTER -->
    <footer class="border-t border-[var(--hw-border)] pt-14 px-4 sm:px-8 pb-0">
      <div
        class="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-[1fr_auto] gap-12 pb-12 border-b border-[var(--hw-border)]"
      >
        <!-- Brand -->
        <div class="max-w-[280px]">
          <div class="flex items-center gap-2 mb-2">
            <NuxtImg src="/imgs/quizwords_logo.png" alt="QuizWords Logo" class="w-7 h-7 rounded-lg" />
            <span
              class="text-[1.1rem] font-semibold bg-gradient-to-r from-[#bd34fe] to-[#41d1ff] bg-clip-text text-transparent [-webkit-background-clip:text] [-webkit-text-fill-color:transparent] logo-title"
            >{{ APP_NAME }}</span>
          </div>
          <p class="text-[.88rem] text-[var(--hw-text-3)] mb-5 leading-[1.6]">Luyện gõ tiếng Anh, mỗi lần nhấn phím là một bước tiến.</p>
          <ChannelIcons type="horizontal" :share="false" />
        </div>
        <!-- Nav columns -->
        <div class="flex gap-12 flex-wrap">
          <div class="flex flex-col gap-2.5">
            <div class="text-[.8rem] font-bold tracking-[.06em] uppercase text-[var(--hw-text-3)] mb-1">Tính năng</div>
            <NuxtLink to="/words" class="footer-link">Luyện từ vựng</NuxtLink>
            <NuxtLink to="/articles" class="footer-link">Luyện viết bài</NuxtLink>
            <NuxtLink to="/fsrs" class="footer-link">Dữ liệu FSRS</NuxtLink>
          </div>
          <div class="flex flex-col gap-2.5">
            <div class="text-[.8rem] font-bold tracking-[.06em] uppercase text-[var(--hw-text-3)] mb-1">Hỗ trợ</div>
            <NuxtLink to="/help" class="footer-link">Tài liệu hướng dẫn</NuxtLink>
            <NuxtLink to="/doc" class="footer-link">Tài liệu học tập</NuxtLink>
          </div>
          <div class="flex flex-col gap-2.5">
            <div class="text-[.8rem] font-bold tracking-[.06em] uppercase text-[var(--hw-text-3)] mb-1">Dự án</div>
            <a :href="GITHUB" target="_blank" class="footer-link">GitHub</a>
            <NuxtLink to="/setting" class="footer-link">Cài đặt</NuxtLink>
          </div>
        </div>
      </div>
      <!-- Footer bottom -->
      <div class="max-w-[1100px] mx-auto py-5 flex items-center gap-4 flex-wrap">

        <span class="text-[.8rem] text-[var(--hw-text-3)] ml-auto">© 2026 {{ APP_NAME }}. All rights reserved.</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>

.hw {
  --hw-bg: #f4f5f7;
  --hw-bg-card: #ffffff;
  --hw-bg-nav: rgba(244, 245, 247, 0.88);
  //--hw-bg-nav: white;
  --hw-border: #e2e4e8;
  --hw-text: #0d0d0d;
  --hw-text-2: #555e6e;
  --hw-text-3: #585d66;
  --hw-shadow-sm: 0 1px 4px rgba(0, 0, 0, 0.06);
  --hw-shadow-md: 0 4px 20px rgba(0, 0, 0, 0.09);
  --hw-shadow-lg: 0 12px 48px rgba(0, 0, 0, 0.11);
  background: var(--hw-bg);
  color: var(--hw-text);
}
.hw.dark {
  --hw-bg: #0e1217;
  --hw-bg-card: #171d26;
  --hw-bg-nav: rgba(14, 18, 23, 0.92);
  --hw-border: #2a3140;
  --hw-text: #e8eaf0;
  --hw-text-2: #8a93a8;
  --hw-text-3: #72839f;
  --hw-shadow-sm: 0 1px 4px rgba(0, 0, 0, 0.35);
  --hw-shadow-md: 0 4px 20px rgba(0, 0, 0, 0.45);
  --hw-shadow-lg: 0 12px 48px rgba(0, 0, 0, 0.55);
}



.hero-title {
  font-family: Garamond, Georgia, 'Times New Roman', serif;
  font-style: italic;
  letter-spacing: 0.1em;
}


.logo-title {
  font-family: Garamond, Georgia, 'Times New Roman', serif;
  font-style: italic;
}


.section-label {
  @apply inline-block text-[.72rem] font-bold tracking-[.07em] uppercase px-3 py-1 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#2563eb] text-white mb-3;
}


.section-h2 {
  @apply text-[clamp(1.5rem,3vw,2rem)] font-bold mb-2.5 text-[var(--hw-text)];
}


.section-desc {
  @apply text-[var(--hw-text-2)] text-[1rem] mx-auto max-w-[520px] leading-[1.75];
}


.feature-card {
  @apply bg-[var(--hw-bg-card)] border border-[var(--hw-border)] rounded-2xl p-7 hover:-translate-y-1 hover:shadow-[var(--hw-shadow-md)] transition-all duration-200 cursor-default;
}


.shortcut-item {
  @apply bg-[var(--hw-bg)] border border-[var(--hw-border)] rounded-lg px-6 py-5 flex flex-col gap-2.5;
}


.kbd-key {
  @apply inline-flex items-center justify-center min-w-8 h-7 px-2 bg-[var(--hw-bg-card)] border border-[var(--hw-border)] border-b-2 rounded text-[.78rem] font-mono font-semibold text-[var(--hw-text)] shadow-[0_1px_2px_rgba(0,0,0,.08)];
}


.footer-link {
  @apply text-[.88rem] text-[var(--hw-text-2)] no-underline hover:text-[var(--hw-text)] transition-colors duration-150;
}


.typing-cursor {
  opacity: 1;
  transition: opacity 0.1s;
}
.typing-cursor.blink {
  opacity: 0;
}


.demo-shake {
  animation: demo-shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}
@keyframes demo-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-5px);
  }
  40% {
    transform: translateX(5px);
  }
  60% {
    transform: translateX(-4px);
  }
  80% {
    transform: translateX(4px);
  }
}


.faq-answer {
  max-height: 0;
  overflow: hidden;
  padding-top: 0;
  padding-bottom: 0;
  opacity: 0;
  transition:
    max-height 0.3s ease,
    padding 0.3s ease,
    opacity 0.25s;
}
.faq-answer.faq-open {
  max-height: 14rem;
  padding-bottom: 1.25rem;
  opacity: 1;
}
</style>