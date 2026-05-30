// src/plugins/i18n.ts
import { App, inject } from 'vue'
import { createI18n } from 'vue-i18n'


export function useI18n() {
  const i18n = inject('i18n')
  if (!i18n) {
    throw new Error('i18n instance is required')
  }

  const locale = i18n.global.locale
  const setLocale = (lang: string) => {
    locale.value = lang
  }

  return { locale, setLocale }
}


export default {
  install(app: App) {

    const modules = import.meta.glob('../../../nuxt/i18n/locales/*.json', {
      eager: true,
    })
    const messages: Record<string, any> = {}
    for (const path in modules) {
      const matched = path.match(/\/([^/]+)\.json$/)
      if (matched) {
        const locale = matched[1]
        messages[locale] = modules[path].default
      }
    }
    const i18n = createI18n({
      legacy: false,
      locale: 'zh',
      fallbackLocale: 'en',
      messages,
    })


    app.provide('i18n', i18n)
    app.use(i18n)
    ;(window as any).useI18n = useI18n
  },
}