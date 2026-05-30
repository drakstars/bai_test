import { useSettingStore } from '../stores/setting.ts'

type Theme = 'light' | 'dark'


export function getSystemTheme(): Theme {
  if (import.meta.server) return 'light'
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light'
  }
  return 'light'
}


export function swapTheme(theme: Theme): Theme {
  return theme === 'light' ? 'dark' : 'light'
}


export function listenToSystemThemeChange(call: (theme: Theme) => void) {
  if (import.meta.server) return
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (e.matches) {

      call('dark')
    }
  })
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
    if (e.matches) {

      call('light')
    }
  })
}

export function setTheme(val: string) {

  if (import.meta.client) {
    document.documentElement.className = val === 'auto' ? getSystemTheme() : val
  }
}

export default function useTheme() {
  const settingStore = useSettingStore()


  listenToSystemThemeChange((theme: Theme) => {
    return

    if (settingStore.theme === theme) {
      return
    }

    settingStore.theme = theme
    setTheme(theme)
  })

  function toggleTheme() {

    settingStore.theme = swapTheme(settingStore.theme === 'auto' ? getSystemTheme() : (settingStore.theme as Theme))
    setTheme(settingStore.theme)
  }


  function getTheme(): Theme {
    if (import.meta.client) {
      return settingStore.theme === 'auto' ? getSystemTheme() : (settingStore.theme as Theme)
    }

  }

  return {
    toggleTheme,
    setTheme,
    getTheme,
  }
}