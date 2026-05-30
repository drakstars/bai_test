import { defineStore } from 'pinia'
import { useSettingStore } from './setting'
import { WordPracticeStage } from '../types'
import { WordPracticeModeStageMap, WordPracticeStageNameMap } from '../config/env'

export type TimerPauseReason = null | 'manual' | 'auto_visibility' | 'auto_idle'

export interface PracticeState {
  stage: WordPracticeStage
  startDate: number
  spend: number
  total: number
  newWordNumber: number
  reviewWordNumber: number
  inputWordNumber: number
  wrong: number
  
  timerPaused: boolean
  
  timerPauseReason: TimerPauseReason
  
  segments: [number, number][]
}

export const usePracticeStore = defineStore('practice', {
  state: (): PracticeState => {
    return {
      stage: WordPracticeStage.FollowWriteNewWord,
      spend: 0,
      startDate: Date.now(),
      total: 0,
      newWordNumber: 0,
      reviewWordNumber: 0,
      inputWordNumber: 0,
      wrong: 0,
      timerPaused: false,
      timerPauseReason: null,
      segments: [],
    }
  },
  getters: {
    getStageName: state => {
      return WordPracticeStageNameMap[state.stage]
    },
    nextStage: state => {
      const settingStore = useSettingStore()
      const stages = WordPracticeModeStageMap[settingStore.wordPracticeMode]
      const index = stages.findIndex(v => v === state.stage)
      return stages[index + 1]
    },
  },
  actions: {
    pauseTimer(reason: TimerPauseReason) {
      if (!this.timerPaused) {

        if (this.segments.length > 0) {
          this.segments[this.segments.length - 1][1] = Date.now()
        }
        this.timerPaused = true
        this.timerPauseReason = reason
      }
    },
    resumeTimer() {
      this.timerPaused = false
      this.timerPauseReason = null

      const now = Date.now()
      this.segments.push([now, now])
    },
  },
})