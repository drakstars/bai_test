// https://nuxt.com/docs/api/configuration/nuxt-config
//@ts-ignore
import { resolve } from 'pathe'
import Icons from 'unplugin-icons/vite'
import Components from 'unplugin-vue-components/vite'
import IconsResolver from 'unplugin-icons/resolver'
import { execSync } from 'child_process'
import { defineNuxtConfig } from 'nuxt/config'

let latestCommitHash = ''
let latestCommitTime = ''
try {
  latestCommitHash = execSync('git rev-parse --short HEAD').toString().trim()
  latestCommitTime = execSync('git log -1 --format=%ci').toString().trim()
} catch (e) {
  latestCommitHash = 'unknown'
  latestCommitTime = 'unknown'
}

const siteOrigin = (process.env.ORIGIN || 'https://typewords.cc').replace(/\/$/, '')

function normalizeBaseURL(baseURL: string = '/') {
  if (!baseURL) return '/'

  let normalizedBaseURL = baseURL.trim()

  if (!normalizedBaseURL.startsWith('/')) {
    normalizedBaseURL = `/${normalizedBaseURL}`
  }
  if (!normalizedBaseURL.endsWith('/')) {
    normalizedBaseURL = `${normalizedBaseURL}/`
  }

  return normalizedBaseURL.replace(/\/{2,}/g, '/')
}

function withBaseURL(path: string, baseURL: string) {
  if (!path.startsWith('/')) return path
  if (baseURL === '/') return path
  if (path === '/') return baseURL
  return `${baseURL.slice(0, -1)}${path}`
}

function toSiteURL(path: string, baseURL: string) {
  return new URL(withBaseURL(path, baseURL), siteOrigin).toString()
}

const appBaseURL = normalizeBaseURL(process.env.NUXT_APP_BASE_URL || '/')

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  app: {
    baseURL: appBaseURL,
    // keepalive: true,
    head: {
      title: 'Quiz Words - Luyện gõ từ vựng · Luyện gõ bài viết · Học từ vựng tiếng Anh', // default fallback title
      htmlAttrs: {
        lang: 'vi-VN',
      },
      meta: [
        { charset: 'UTF-8' },

        {
          name: 'description',
          content:
            'Quiz Words - Nền tảng luyện tiếng Anh trực tuyến, hỗ trợ luyện gõ từ vựng, bài viết, nâng cao hiệu quả học tiếng Anh. Practice English, one strike, one step forward',
        },

        {
          name: 'keywords',
          content:
            'Quiz Words, Quiz Words, vocabulary quiz, English typing practice, vocabulary training, keyboard practice, English learning, typing practice software, vocabulary memory tool, English learning software, English muscle memory, free English learning, pronunciation practice, dictation practice, online English learning, CET-4, CET-6, TOEFL, IELTS, GRE, GMAT, SAT, JavaScript API, Node.js API, Java API, programming vocabulary, VSCode plugin, open source project, GitHub Trending, Gitee GVP, English typing training, WPM statistics, accuracy analysis, business English, BEC, IELTS listening, language learning, vocabulary spelling training',
        },
        { name: 'author', content: 'zyronon' },
        { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },


        { property: 'og:title', content: 'Quiz Words - Nền tảng luyện gõ tiếng Anh' },
        {
          property: 'og:description',
          content:
            'Quiz Words - Nền tảng luyện tiếng Anh trực tuyến, hỗ trợ luyện gõ từ vựng, bài viết, nâng cao hiệu quả học tiếng Anh. Practice English, one strike, one step forward',
        },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://typewords.cc/' },
        { property: 'og:image', content: 'https://typewords.cc/favicon.ico' },


        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Quiz Words - Nền tảng luyện gõ tiếng Anh' },
        {
          name: 'twitter:description',
          content:
            'Quiz Words - Nền tảng luyện tiếng Anh trực tuyến, hỗ trợ luyện gõ từ vựng, bài viết, nâng cao hiệu quả học tiếng Anh. Practice English, one strike, one step forward',
        },
        { name: 'twitter:image', content: 'https://typewords.cc/favicon.ico' },


        { name: 'theme-color', content: '#818CF8' },


        { name: 'format-detection', content: 'telephone=no' },
        { name: 'HandheldFriendly', content: 'True' },
        { name: 'MobileOptimized', content: '320' },

        { name: 'referrer', content: 'origin-when-cross-origin' },

        { name: 'color-scheme', content: 'light dark' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'canonical', href: 'https://typewords.cc/' },

        { rel: 'apple-touch-icon', sizes: '180x180', href: '/favicon.ico' },
        { rel: 'manifest', href: '/manifest.json' },
      ],
    },
  },
  // ssr: false,
  routeRules: {
    '/words': { ssr: false },
    '/articles': { ssr: false },
    '/setting': { ssr: false },
    '/rrweb': { ssr: false },
    '/book/nce1': { prerender: true },
    '/book/nce2': { prerender: true },
    '/book/nce3': { prerender: true },
    '/book/nce4': { prerender: true },
  },
  vite: {
    plugins: [
      Components({
        resolvers: [
          IconsResolver({
            prefix: 'Icon',
          }),
        ],
      }),
      Icons({
        autoInstall: true,
      }),
    ],
  },

  modules: ['@pinia/nuxt', '@unocss/nuxt', 'unplugin-icons/nuxt', '@vue-macros/nuxt', '@nuxtjs/i18n', '@nuxt/image'],

  i18n: {
    locales: [
      { code: 'en', language: 'en-US', file: 'en.json', name: 'English' },
      { code: 'zh', language: 'zh-CN', file: 'zh.json', name: '中文' },
      { code: 'es', language: 'es-ES', file: 'es.json', name: 'Español' },
      { code: 'fr', language: 'fr-FR', file: 'fr.json', name: 'Français' },
      { code: 'pt', language: 'pt-BR', file: 'pt.json', name: 'Português' },
      { code: 'de', language: 'de-DE', file: 'de.json', name: 'Deutsch' },
      { code: 'ru', language: 'ru-RU', file: 'ru.json', name: 'Русский' },
      { code: 'uk', language: 'uk-UA', file: 'uk.json', name: 'Українська' },
      { code: 'ja', language: 'ja-JP', file: 'ja.json', name: '日本語' },
      { code: 'ko', language: 'ko-KR', file: 'ko.json', name: '한국어' },
      { code: 'th', language: 'th-TH', file: 'th.json', name: 'ไทย' },
      { code: 'vi', language: 'vi-VN', file: 'vi.json', name: 'Tiếng Việt' },
      { code: 'id', language: 'id-ID', file: 'id.json', name: 'Bahasa Indonesia' },
      { code: 'tw', language: 'zh-TW', file: 'tw.json', name: '繁體中文' },
    ],
    defaultLocale: 'vi',
    // langDir:'app/i18n/',
    strategy: 'no_prefix',
  },
  // CSS
  css: ['~/assets/css/main.scss'],

  alias: {
    '@': resolve(__dirname, 'app'),
  },

  imports: {
    dirs: ['app/composables/**', 'app/utils/**'],
  },

  components: [
    { path: 'components', pathPrefix: false },
    { path: 'app/components', pathPrefix: false },
  ],

  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE || 'http://localhost/',
      origin: process.env.ORIGIN || 'https://typewords.cc',
      host: process.env.HOST || 'typewords.cc',
      latestCommitHash: latestCommitHash + (process.env.NODE_ENV === 'production' ? '' : ' (dev)'),
      latestCommitTime: latestCommitTime,
    },
  },

  build: {
    transpile: ['vue-virtual-scroller', 'vxe-table'],
  },

  experimental: {
    payloadExtraction: false,
  },

  typescript: {
    strict: false,
    typeCheck: false,
    tsConfig: {
      compilerOptions: {
        types: ['vue-macros/macros-global'],
        allowImportingTsExtensions: true,
      },
    },
  },
  devServer: {
    port: 5567,
  },
  nitro: {
    prerender: {
      ignore: appBaseURL === '/' ? [] : [withBaseURL('/manifest.json', appBaseURL)],
    },
    devProxy: {
      '/baidu': {
        target: 'https://api.fanyi.baidu.com/api/trans/vip/translate',
        changeOrigin: true,
      },
    },
  },
})