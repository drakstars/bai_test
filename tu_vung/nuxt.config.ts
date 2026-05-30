import { resolve } from 'path'
import Icons from 'unplugin-icons/vite'
import Components from 'unplugin-vue-components/vite'
import IconsResolver from 'unplugin-icons/resolver'
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: false,
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
      { code: 'vi', language: 'vi-VN', file: 'vi.json', name: 'Tiếng Việt' },
    ],
    defaultLocale: 'vi',
    langDir: 'locales/',
    strategy: 'no_prefix',
  },
  css: ['~/assets/css/main.scss'],
  alias: {
    '@typewords/core': resolve(__dirname, './core'),
    '@typewords/base': resolve(__dirname, './base'),
    '@typewords/libs': resolve(__dirname, './libs'),
  },
  imports: {
    dirs: ['core/composables/**', 'core/utils/**'],
  },
  components: [
    { path: 'components', pathPrefix: false },
  ],
  devServer: {
    port: 5567,
  },
})
