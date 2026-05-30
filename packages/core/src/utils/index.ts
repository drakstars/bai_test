import type { BaseState, SettingState } from '../stores'
import { getDefaultBaseState, getDefaultSettingState, useBaseStore, useRuntimeStore } from '../stores'
import {
  CompareResult,
  Dict,
  DictResource,
  DictType,
  getDefaultDict,
  getDefaultWord,
  IdentifyMethod,
  SaveData,
  ShortcutKey,
} from '../types'
import { useRouter } from 'vue-router'
//@ts-ignore
import dayjs from 'dayjs'
//@ts-ignore
import duration from 'dayjs/plugin/duration'
import {
  APP_VERSION,
  AppEnv,
  BACKUP_INDEX_KEY,
  DefaultShortcutKeyMap,
  DictId,
  ENV,
  RESOURCE_PATH,
  SAVE_DICT_KEY,
} from '../config/env'
import { nextTick } from 'vue'
import { Toast } from '@typewords/base'
import { get } from 'idb-keyval'
import { saveHashSnapshot } from '../composables/useDataSyncPersistence'
import { withAppBaseURL } from './base-url'

dayjs.extend(duration)

export function no() {
  Toast.warning('Chưa được hỗ trợ')
}


function checkRiskKey(origin: object, target: object) {
  for (const [key, value] of Object.entries(origin)) {
    // @ts-ignore
    if (target[key] !== undefined) origin[key] = target[key]
  }
  return origin
}

export async function checkAndUpgradeSaveDict(val: any) {
  // console.log(configStr)
  // console.log('s', new Blob([val]).size)
  // val = ''
  let defaultState = getDefaultBaseState()
  if (val) {
    try {
      let data: any
      if (typeof val === 'string') {
        data = JSON.parse(val)
      } else {
        data = val
      }
      if (!data.version) {
        let currentHash = '词典数据缺少版本号-自动备份'
        window?.umami?.track('error', currentHash)
        console.warn(currentHash)
        await saveHashSnapshot(currentHash, '')
        return defaultState
      }
      let state: any = data.val
      if (typeof state !== 'object') {
        let currentHash1 = '词典数据格式无效-自动备份'
        console.warn(currentHash1)
        window?.umami?.track('error', currentHash1)
        await saveHashSnapshot(currentHash1, '')
        return defaultState
      }
      state.load = false
      let version = Number(data.version)
      // console.log('state', state)
      if (version === SAVE_DICT_KEY.version) {
        checkRiskKey(defaultState, state)
        defaultState.article.bookList = defaultState.article.bookList.map(v => {
          return getDefaultDict(checkRiskKey(getDefaultDict(), v))
        })
        defaultState.word.bookList = defaultState.word.bookList.map(v => {
          return getDefaultDict(checkRiskKey(getDefaultDict(), v))
        })
        return defaultState
      } else {

        console.warn(`数据版本不匹配: 当前版本 ${version}, 期望版本 ${SAVE_DICT_KEY.version}，尝试保留数据`)
        try {
          checkRiskKey(defaultState, state)

          if (state.word && state.word.bookList && Array.isArray(state.word.bookList)) {
            defaultState.word.bookList = state.word.bookList.map((v: any) => {
              return getDefaultDict(checkRiskKey(getDefaultDict(), v))
            })
          }
          if (state.article && state.article.bookList && Array.isArray(state.article.bookList)) {
            defaultState.article.bookList = state.article.bookList.map((v: any) => {
              return getDefaultDict(checkRiskKey(getDefaultDict(), v))
            })
          }
          return defaultState
        } catch (upgradeError) {
          let currentHash2 = '词典数据升级失败-自动备份'
          console.error(currentHash2, upgradeError)
          window?.umami?.track('error', currentHash2 + upgradeError)
          await saveHashSnapshot(currentHash2, '')
          return defaultState
        }
      }
    } catch (e) {
      let currentHash3 = '词典数据解析异常-自动备份'
      console.error(currentHash3, e)
      window?.umami?.track('error', currentHash3 + e)
      await saveHashSnapshot(currentHash3, '')
      return defaultState
    }
  }
  return defaultState
}


export async function parseJsonStr(val: any, cb: any): Promise<SaveData> {
  let result: SaveData = JSON.parse(val)
  result.val = await cb(result)
  return result
}

export async function checkAndUpgradeSaveSetting(val: any) {
  // console.log(configStr)
  // console.log('s', new Blob([val]).size)
  // val = ''
  let defaultState = getDefaultSettingState()
  if (val) {
    try {
      let data
      if (typeof val === 'string') {
        data = JSON.parse(val)
      } else {
        data = val
      }
      if (!data.version) return defaultState
      let state: SettingState & { [key: string]: any } = data.val
      if (typeof state !== 'object') return defaultState
      state.load = false
      // debugger
      let version = Number(data.version)


      checkRiskKey(defaultState.shortcutKeyMap, state.shortcutKeyMap)

      let updateLocalData = false

      if (version <= 17) {
        defaultState.webAppVersion = (await get(APP_VERSION.key)) ?? APP_VERSION.version
        updateLocalData = true
      }




      if (version === 19) {
        try {
          const snapshotCutoffTime = new Date('2026-03-20T22:25:00+08:00').getTime()
          const rawIndex = (await get(BACKUP_INDEX_KEY)) as Array<{ key?: string; createdAt?: number }> | null
          const index = Array.isArray(rawIndex) ? rawIndex : []
          const targetSnapshot = index
            .filter(item => typeof item?.key === 'string' && Number(item?.createdAt) <= snapshotCutoffTime)
            .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))[0]
          if (targetSnapshot?.key) {
            const snapshot = await get(targetSnapshot.key)
            const snapshotSettingRaw = snapshot?.data?.setting
            let snapshotSettingState: any = null
            if (typeof snapshotSettingRaw === 'string') {
              snapshotSettingState = JSON.parse(snapshotSettingRaw)?.val ?? null
            } else if (snapshotSettingRaw && typeof snapshotSettingRaw === 'object') {
              snapshotSettingState = snapshotSettingRaw?.val ?? null
            }
            const snapshotFirstTime = Number(snapshotSettingState?.firstTime)
            const currentFirstTime = Number(state?.firstTime)
            if (Number.isFinite(snapshotFirstTime) && snapshotFirstTime > 0 && snapshotFirstTime !== currentFirstTime) {
              state.firstTime = snapshotFirstTime
              updateLocalData = true
            }
          }
        } catch (e) {
          console.warn('firstTime 快照回填跳过或失败，忽略并继续', e)
        }
      }


      if (version <= 20) {
        defaultState.shortcutKeyMap[ShortcutKey.Next] = DefaultShortcutKeyMap[ShortcutKey.Next]
        updateLocalData = true
      }


      if (version <= 21) {

        if (state.quickIdentify) state.identifyMethod = IdentifyMethod.QuickIdentify
        updateLocalData = true
      }

      // @ts-ignore
      delete state.shortcutKeyMap
      checkRiskKey(defaultState, state)
      ;(defaultState as any).__updateLocalData = updateLocalData
      return defaultState
    } catch (e) {
      let currentHash = '设置数据解析异常-自动备份'
      window?.umami?.track('error', currentHash + e)
      await saveHashSnapshot(currentHash, '')
      return defaultState
    }
  }
  return defaultState
}


export function shakeCommonDict(n: BaseState): BaseState {
  let data: BaseState = cloneDeep(n)
  data.word.bookList.map((v: Dict) => {
    if (!v.custom && ![DictId.wordKnown, DictId.wordWrong, DictId.wordCollect].includes(v.id)) v.words = []
  })
  data.article.bookList.map((v: Dict) => {
    if (!v.custom && ![DictId.articleCollect].includes(v.id)) v.articles = []
    else {
      v.articles.map(a => {

        a.sections = []
      })
    }
  })
  return data
}

export function isMobile(): boolean {
  //@ts-ignore
  if (import.meta.server) return false
  return /Mobi|iPhone|Android|ipad|tablet/i.test(window.navigator.userAgent)
}

export function useNav() {
  const router = useRouter()
  const runtimeStore = useRuntimeStore()

  function nav(path, query = {}, data?: any) {
    if (data) {
      runtimeStore.routeData = cloneDeep(data)
    }
    router.push({ path, query })
  }

  return { nav, push: nav, back: router.back }
}

export function _dateFormat(val: any, format: string = 'YYYY/MM/DD HH:mm'): string {
  if (!val) return ''
  if (String(val).length === 10) {
    val = val * 1000
  }
  const d = new Date(Number(val))
  return dayjs(d).format(format)
}

export function msToHourMinute(ms: number, en: boolean = false) {
  const d = dayjs.duration(ms)
  const totalMinutes = Math.floor(d.asMinutes())
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  
  let hUnit = '小时'
  let mUnit = '分钟'
  let sUnit = '秒'
  
  if (import.meta.client) {
    const htmlLang = document.documentElement.lang || ''
    if (htmlLang.startsWith('vi') || localStorage.getItem('i18n_redirected') === 'vi') {
      hUnit = ' giờ '
      mUnit = ' phút'
      sUnit = ' giây'
    } else if (en || htmlLang.startsWith('en')) {
      hUnit = 'h '
      mUnit = 'm'
      sUnit = 's'
    }
  }

  if (hours) return `${hours}${hUnit}${minutes}${mUnit}`
  if (minutes) return `${minutes}${mUnit}`
  return `${Math.floor(d.asSeconds())}${sUnit}`
}

export function msToMinute(ms: number, en: boolean = false) {
  let mUnit = '分钟'
  if (import.meta.client) {
    const htmlLang = document.documentElement.lang || ''
    if (htmlLang.startsWith('vi') || localStorage.getItem('i18n_redirected') === 'vi') {
      mUnit = ' phút'
    } else if (en || htmlLang.startsWith('en')) {
      mUnit = 'm'
    }
  }
  return `${Math.floor(dayjs.duration(ms).asMinutes())}${mUnit}`
}


export function _getAccomplishDays(total: number, dayNumber: number) {
  let r = Math.ceil(total / dayNumber)
  if (r) {
    return r === Infinity ? '-' : r
  }
  return '-'
}


export function _getAccomplishDate(total: number, dayNumber: number) {
  if (dayNumber <= 0) return '-'
  let d = _getAccomplishDays(total, dayNumber)
  if (d == '-') return '-'
  return dayjs()
    .add(d as number, 'day')
    .format('YYYY-MM-DD')
}


export function _getStudyProgress(index: number, total: number): number {
  //@ts-ignore
  return Number(((index / total) * 100).toFixed())
}

export function _nextTick(cb: () => void, time?: number) {
  if (time) {
    nextTick(() => setTimeout(cb, time))
  } else {
    nextTick(cb)
  }
}

export function _parseLRC(lrc: string): { start: number; end: number; text: string }[] {
  const lines = lrc.split('\n').filter(line => line.trim() !== '')
  const regex = /\[(\d{2}):(\d{2}\.\d{2})\](.*)/
  let parsed: any = []

  for (let i = 0; i < lines.length; i++) {
    let match = lines[i].match(regex)
    if (match) {
      let start = parseFloat(match[1]) * 60 + parseFloat(match[2])
      let text = match[3].trim()


      let nextMatch = lines[i + 1] ? lines[i + 1].match(regex) : null
      let end = nextMatch ? parseFloat(nextMatch[1]) * 60 + parseFloat(nextMatch[2]) : null

      parsed.push({ start, end, text })
    }
  }

  return parsed
}

export async function sleep(time: number) {
  return new Promise(resolve => setTimeout(resolve, time))
}

export async function _getDictDataByUrl(val: DictResource, type: DictType = DictType.word): Promise<Dict> {
  // await sleep(2000);
  let dictResourceUrl = ENV.RESOURCE_URL + `dicts/${val.language}/word/${val.url}`
  if (type === DictType.article) {
    dictResourceUrl = ENV.RESOURCE_URL + `dicts/${val.language}/article/${val.url}`
  }
  let s = await fetch(resourceWrap(dictResourceUrl, val.version)).then(r => r.json())
  if (s) {
    if (type === DictType.word) {
      return getDefaultDict({ ...val, words: s })
    } else {
      return getDefaultDict({ ...val, articles: s })
    }
  }
  return getDefaultDict()
}


export function convertToWord(raw: any) {
  const safeString = str => (typeof str === 'string' ? str.trim() : '')
  const safeSplit = (str, sep) => (safeString(str) ? safeString(str).split(sep).filter(Boolean) : [])

  // 1. trans
  const trans = safeSplit(raw.trans, '\n').map(line => {
    const match = safeString(line).match(/^([^\s.]+\.?)\s*(.*)$/)
    if (match) {
      let pos = safeString(match[1])
      let cn = safeString(match[2])


      if (!/^[a-zA-Z]+\.?$/.test(pos)) {
        cn = safeString(line)
        pos = ''
      }

      return { pos, cn }
    }
    return { pos: '', cn: safeString(line) }
  })

  // 2. sentences
  const sentences = safeSplit(raw.sentences, '\n\n').map(block => {
    const [c, cn] = block.split('\n')
    return { c: safeString(c), cn: safeString(cn) }
  })

  // 3. phrases
  const phrases = safeSplit(raw.phrases, '\n\n').map(block => {
    const [c, cn] = block.split('\n')
    return { c: safeString(c), cn: safeString(cn) }
  })

  // 4. synos
  const synos = safeSplit(raw.synos, '\n\n').map(block => {
    const lines = block.split('\n').map(safeString)
    const [posCn, wsStr] = lines
    let pos = ''
    let cn = ''

    if (posCn) {
      const posMatch = posCn.match(/^([a-zA-Z.]+)(.*)$/)
      pos = posMatch ? safeString(posMatch[1]) : ''
      cn = posMatch ? safeString(posMatch[2]) : safeString(posCn)
    }
    const ws = wsStr ? wsStr.split('/').map(safeString) : []

    return { pos, cn, ws }
  })

  // 5. relWords
  const relWordsText = safeString(raw.relWords)
  let root = ''
  const rels = []

  if (relWordsText) {
    const relLines = relWordsText.split('\n').filter(Boolean)
    if (relLines.length > 0) {
      root = safeString(relLines[0].replace(/^词根:/, ''))
      let currentPos = ''
      let currentWords = []

      for (let i = 1; i < relLines.length; i++) {
        const line = relLines[i].trim()
        if (!line) continue

        if (/^[a-z]+\./i.test(line)) {
          if (currentPos && currentWords.length > 0) {
            rels.push({ pos: currentPos, words: currentWords })
          }
          currentPos = safeString(line.replace(':', ''))
          currentWords = []
        } else if (line.includes(':')) {
          const [c, cn] = line.split(':')
          currentWords.push({ c: safeString(c), cn: safeString(cn) })
        }
      }
      if (currentPos && currentWords.length > 0) {
        rels.push({ pos: currentPos, words: currentWords })
      }
    }
  }

  // 6. etymology
  const etymology = safeSplit(raw.etymology, '\n\n').map(block => {
    const lines = block.split('\n').map(safeString)
    const t = lines.shift() || ''
    const d = lines.join('\n').trim()
    return { t, d }
  })

  return getDefaultWord({
    id: raw.id,
    word: safeString(raw.word),
    phonetic0: safeString(raw.phonetic0),
    phonetic1: safeString(raw.phonetic1),
    trans,
    sentences,
    phrases,
    synos,
    relWords: { root, rels },
    etymology,
    custom: true,
  })
}

export function cloneDeep<T>(val: T): T {
  return JSON.parse(JSON.stringify(val))
}

export function shuffle<T>(array: T[]): T[] {
  const result = array.slice()
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function last<T>(array: T[]): T | undefined {
  return array.length > 0 ? array[array.length - 1] : undefined
}

export function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timer: ReturnType<typeof setTimeout> | null = null
  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(this, args)
    }, wait)
  }
}

export function throttle<T extends (...args: any[]) => void>(func: T, wait: number) {
  let lastTime = 0
  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    const now = Date.now()
    if (now - lastTime >= wait) {
      func.apply(this, args)
      lastTime = now
    }
  }
}

export function reverse<T>(array: T[]): T[] {
  return array.slice().reverse()
}

export function groupBy<T extends Record<string, any>>(array: T[], key: string) {
  return array.reduce<Record<string, T[]>>((result, item) => {
    const groupKey = String(item[key])
    ;(result[groupKey] ||= []).push(item)
    return result
  }, {})
}


export function getRandomN(arr: any[], n: number) {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, n)
}


export function splitIntoN(arr: any[], n: number) {
  const result = []
  const len = arr.length
  const base = Math.floor(len / n)
  let extra = len % n

  let index = 0
  for (let i = 0; i < n; i++) {
    const size = base + (extra > 0 ? 1 : 0)
    result.push(arr.slice(index, index + size))
    index += size
    if (extra > 0) extra--
  }
  return result
}

export async function loadJsLib(key: string, url: string) {
  // @ts-ignore
  if (window[key]) return window[key]
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')

    if (url.includes('.mjs')) {
      script.type = 'module'
      script.src = url
      script.onload = async () => {
        try {

          const module = await import(url)
          // @ts-ignore
          window[key] = module.default || module
          // @ts-ignore
          resolve(window[key])
        } catch (err: any) {
          reject(`${key} 加载失败: ${err.message}`)
        }
      }
    } else {

      script.src = url
      // @ts-ignore
      script.onload = () => resolve(window[key])
    }
    script.onerror = () => reject(key + ' 加载失败')
    document.head.appendChild(script)
  })
}

export function total(arr: any[], key: string) {
  return arr.reduce((a, b) => {
    a += b[key]
    return a
  }, 0)
}

export function resourceWrap(resource: string, version?: number) {
  if (AppEnv.IS_OFFICIAL) {
    if (resource.includes('.json')) resource = resource.replace('.json', '')
    if (!resource.includes('http')) resource = RESOURCE_PATH + resource
    if (version === undefined) {
      const store = useBaseStore()
      return `${resource}_v${store.dictListVersion}.json`
    }
    return `${resource}_v${version}.json`
  }
  return withAppBaseURL(resource)
}

// check if it is a new user
export async function isNewUser() {
  let isNew = false
  let base = useBaseStore()
  console.log(JSON.stringify(base.$state))
  console.log(JSON.stringify(getDefaultBaseState()))
  return JSON.stringify(base.$state) === JSON.stringify({ ...getDefaultBaseState(), ...{ load: true } })
}

export function jump2Feedback() {
  window.open('https://v.wjx.cn/vm/ev0W7fv.aspx#', '_blank')
}

export function isIOS() {
  //@ts-ignore
  const userAgent = navigator.userAgent || navigator.vendor || window.opera

  //@ts-ignore
  return /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream
}

export function parseTimestamp(ts: string | undefined): number | null {
  if (!ts) return null
  const parsed = Date.parse(ts)
  return Number.isNaN(parsed) ? null : parsed
}

export function compareTimestamps(localTs: string | undefined, remoteTs: string | undefined): CompareResult {
  const localTime = parseTimestamp(localTs)
  const remoteTime = parseTimestamp(remoteTs)
  if (localTime == null || remoteTime == null) return CompareResult.NoRemote
  if (remoteTime > localTime) return CompareResult.RemoteNewer
  if (localTime > remoteTime) return CompareResult.LocalNewer
  return CompareResult.Equal
}


export function shouldFetchRemote(
  localUpdatedAt: string | undefined,
  remoteUpdatedAt: string | undefined,
  remoteVersion: number | undefined,
  currentVersion: number
): CompareResult {
  if (remoteVersion == null) return CompareResult.NoRemote
  if (remoteVersion > currentVersion) return CompareResult.RemoteNewer
  if (remoteVersion < currentVersion) return CompareResult.LocalNewer
  return compareTimestamps(localUpdatedAt, remoteUpdatedAt)
}

export function isEmpty(obj: any): boolean {
  if (typeof obj === 'object') {
    return Object.keys(obj).length === 0
  }
  if (Array.isArray(obj)) {
    return obj.length === 0
  }
  return obj === null || obj === undefined || obj === ''
}

const charMap = {
  '’': "'",
  '‘': "'",
  '“': '"',
  '”': '"',
  ' ': ' ',
  '。': '.',
  '，': ',',
  '？': '?',
  '【': '[',
  '】': ']',
  '￥': '$',
  '！': '!',
  '（': '(',
  '）': ')',
  '《': '<',
  '》': '>',
}

export function normalizeWord(word: string) {
  return word
    .split('')
    .map(ch => charMap[ch] || ch)
    .join('')
}