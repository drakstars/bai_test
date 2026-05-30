import { defineStore } from 'pinia'
import { checkAndUpgradeSaveDict, checkAndUpgradeSaveSetting, cloneDeep, parseJsonStr } from '../utils'
import { get, set } from 'idb-keyval'
import { APP_VERSION, AppEnv, DefaultShortcutKeyMap, SAVE_SETTING_KEY } from '../config/env'
import { getSetting } from '../apis'
import { IdentifyMethod, type SaveData, WordPracticeMode, WordPracticeType } from '../types'
import type { FSRSParameters } from 'ts-fsrs'

export interface SettingState {
  soundType: string

  wordSound: boolean
  wordSoundVolume: number
  wordSoundSpeed: number
  wordReviewRatio: number

  articleSound: boolean
  articleAutoPlayNext: boolean
  articleSoundVolume: number
  articleSoundSpeed: number

  keyboardSound: boolean
  keyboardSoundVolume: number
  keyboardSoundFile: string

  effectSound: boolean
  effectSoundVolume: number

  repeatCount: number
  repeatCustomCount?: number
  dictation: boolean
  translate: boolean
  showNearWord: boolean
  ignoreCase: boolean
  allowWordTip: boolean
  waitTimeForChangeWord: number
  fontSize: {
    articleForeignFontSize: number
    articleTranslateFontSize: number
    wordForeignFontSize: number
    wordTranslateFontSize: number
  }
  showToolbar: boolean
  showPanel: boolean
  sideExpand: boolean
  theme: string
  shortcutKeyMap: Record<string, string>
  first: boolean
  firstTime: number
  webAppVersion: number
  load: boolean
  conflictNotice: boolean
  showConflictNotice2: boolean
  showUsageTips: boolean
  ignoreSimpleWord: boolean
  wordPracticeMode: WordPracticeMode
  wordPracticeType: WordPracticeType
  autoNextWord: boolean
  inputWrongClear: boolean
  mobileNavCollapsed: boolean
  ignoreSymbol: boolean
  practiceSentence: boolean

  fsrsEasyLimit: number
  fsrsGoodLimit: number
  fsrsHardLimit: number
  fsrsParameters: FSRSParameters

  identifyMethod: IdentifyMethod
  _ignoreWatch: boolean
  ttsVoiceMap: { key: string; voice: string }[]
}

export const getDefaultSettingState = (): SettingState => ({
  soundType: 'us',

  wordSound: true,
  wordSoundVolume: 100,
  wordSoundSpeed: 1,
  wordReviewRatio: 3,

  articleSound: true,
  articleAutoPlayNext: false,
  articleSoundVolume: 100,
  articleSoundSpeed: 1,

  keyboardSound: true,
  keyboardSoundVolume: 100,
  keyboardSoundFile: '笔记本键盘',

  effectSound: true,
  effectSoundVolume: 100,

  repeatCount: 1,
  repeatCustomCount: null,
  dictation: false,
  translate: true,
  showNearWord: true,
  ignoreCase: true,
  allowWordTip: true,
  waitTimeForChangeWord: 300,
  fontSize: {
    articleForeignFontSize: 48,
    articleTranslateFontSize: 20,
    wordForeignFontSize: 48,
    wordTranslateFontSize: 20,
  },
  showToolbar: true,
  showPanel: true,
  sideExpand: true,
  theme: 'auto',
  shortcutKeyMap: cloneDeep(DefaultShortcutKeyMap),
  first: true,
  firstTime: Date.now(),
  webAppVersion: APP_VERSION.version,
  load: false,
  conflictNotice: true,
  showConflictNotice2: true,
  showUsageTips: true,
  ignoreSimpleWord: false,
  wordPracticeMode: WordPracticeMode.System,
  wordPracticeType: WordPracticeType.FollowWrite,
  autoNextWord: true,
  inputWrongClear: false,
  mobileNavCollapsed: false,
  ignoreSymbol: true,
  practiceSentence: false,

  fsrsEasyLimit: 0,
  fsrsGoodLimit: 3,
  fsrsHardLimit: 6,

  fsrsParameters: {
    request_retention: 0.9,
    maximum_interval: 36500,
    w: [
      0.212, 1.2931, 2.3065, 8.2956, 6.4133, 0.8334, 3.0194, 0.001, 1.8722, 0.1666, 0.796, 1.4835, 0.0614, 0.2629,
      1.6483, 0.6014, 1.8729, 0.5425, 0.0912, 0.0658, 0.1542,
    ],
    enable_fuzz: false,
    enable_short_term: true,
    learning_steps: ['1m', '10m'],
    relearning_steps: ['10m'],
  },

  identifyMethod: IdentifyMethod.SelfAssessment,
  _ignoreWatch: false,
  ttsVoiceMap: [],
})

export const useSettingStore = defineStore('setting', {
  state: (): SettingState => {
    return getDefaultSettingState()
  },
  actions: {
    setState(obj: any) {
      this.$patch(obj)
    },
    async init(): Promise<SaveData | null> {
      return new Promise(async resolve => {
        try {
          let jsonStr = await get(SAVE_SETTING_KEY.key)
          if (jsonStr) {
            let result = await parseJsonStr(jsonStr, checkAndUpgradeSaveSetting)


            const shouldRefreshUpdatedAt = (result.val as any)?.__updateLocalData ?? false
            delete (result.val as any)?.__updateLocalData
            if (shouldRefreshUpdatedAt) {
              await set(SAVE_SETTING_KEY.key, JSON.stringify(result))
            }

            if (AppEnv.CAN_REQUEST) {
              let res = await getSetting()
              if (res.success) {
                Object.assign(result.val, res.data)
              }
            }
            this.setState(result.val)
            resolve(result)
          }
          resolve(null)
        } catch (e) {
          console.error('读取本地设置数据失败', e)
          resolve(null)
        }
      })
    },
  },
})