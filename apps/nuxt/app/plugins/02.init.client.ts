//@ts-ignore
import VueVirtualScroller from 'vue-virtual-scroller'
import { ENV } from '@typewords/core/config/env.ts'
import { withAppBaseURL } from '@typewords/core/utils/base-url'

export default defineNuxtPlugin(async nuxtApp => {
  // Remove dynamic external tracking script injection


  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register(withAppBaseURL('/service-worker.js'))
        .then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope)
        })
        .catch(error => {
          console.log('ServiceWorker registration failed: ', error)
        })
    })
  }

  console.json = function (v: any, space = 0) {
    const json = JSON.stringify(
      v,
      (key, value) => {
        if (Array.isArray(value) && key !== 'nameList') {
          return `__ARRAY__${JSON.stringify(value)}`
        }
        return value
      },
      space
    )
      .replace(/"__ARRAY__(\[.*?\])"/g, (_, arr) => arr)

      .replace(/"nameList": \[\s*([^\]]+)\s*\]/g, (match, content) => {

        const compressed = content.replace(/\s*\n\s*/g, ' ').trim()
        return `"nameList": [${compressed}]`
      })

    console.log(json)
    return json
  }
  console.parse = function (v: any) {
    console.log(JSON.parse(v))
  }

  nuxtApp.vueApp.use(VueVirtualScroller)
})