export default defineNuxtPlugin(nuxtApp => {

  window.onerror = function (msg, url, line, col, err) {
    reportError({ type: 'js', jsErr: err })
  }


  // window.addEventListener('unhandledrejection', e => {

  //   reportError({ type: 'promise', promiseErr: e.reason })
  // })


  window.addEventListener(
    'error',
    e => {
      if (e.target !== window) {
        reportError({ type: 'resource', resourceErr: e?.target?.src })
      }
    },
    true
  )


  nuxtApp.vueApp.config.errorHandler = (err, instance, info) => {
    console.log('Vue错误:', err, info)
    reportError({ type: 'vue', vueErr: err, vueInfo: info })
  }
})

function reportError(data) {
  console.log('统一上报:', data)
  try {
    window?.umami?.track('global-error', { data })
  } catch (e) {
    console.error('上报失败:', e)
  }
}