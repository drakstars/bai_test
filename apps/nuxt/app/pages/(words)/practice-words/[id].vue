<script setup lang="ts">
import { onMounted, onUnmounted, provide, watch } from 'vue'
import Statistics from '@typewords/core/components/word/Statistics.vue'
import { emitter, EventKey, useEvents } from '@typewords/core/utils/eventBus.ts'
import { useSettingStore } from '@typewords/core/stores/setting.ts'
import { useRuntimeStore } from '@typewords/core/stores/runtime.ts'
import type { Dict, PracticeData, TaskWords, Word } from '@typewords/core/types/types.ts'
import {
  useDisableEventListener,
  useOnKeyboardEventListener,
  useStartKeyboardEventListener,
} from '@typewords/core/hooks/event.ts'
import useTheme from '@typewords/core/hooks/theme.ts'
import { getCurrentStudyWord, useWordOptions } from '@typewords/core/hooks/dict.ts'
import {
  _getDictDataByUrl,
  _nextTick,
  cloneDeep,
  debounce,
  isMobile,
  loadJsLib,
  resourceWrap,
  shuffle,
  throttle,
} from '@typewords/core/utils'
import { useRoute, useRouter } from 'vue-router'
import Footer from '@typewords/core/components/word/Footer.vue'
import Panel from '@typewords/core/components/Panel.vue'
import { BaseIcon, Toast, ToastComponent, Tooltip } from '@typewords/base'
import WordList from '@typewords/core/components/list/WordList.vue'
import TypeWord from '@typewords/core/components/word/TypeWord.vue'
import Empty from '@typewords/core/components/Empty.vue'
import { useBaseStore } from '@typewords/core/stores/base.ts'
import { usePracticeStore } from '@typewords/core/stores/practice.ts'
import { getDefaultDict, getDefaultWord } from '@typewords/core/types/func.ts'
import ConflictNotice from '@typewords/core/components/dialog/ConflictNotice.vue'
import PracticeLayout from '@typewords/core/components/PracticeLayout.vue'
import { AppEnv, DICT_LIST, LIB_JS_URL, TourConfig, WordPracticeModeStageMap } from '@typewords/core/config/env.ts'
import { watchOnce } from '@vueuse/core'
import { addStat, setUserDictProp } from '@typewords/core/apis'
import GroupList from '@typewords/core/components/word/GroupList.vue'
import { getPracticeWordCacheLocal } from '@typewords/core/utils/cache.ts'
import { useDataSyncPersistence } from '@typewords/core/composables/useDataSyncPersistence.ts'
import { flushStatToStore, usePracticeWordPersistence } from '@typewords/core/composables/usePracticePersistence.ts'
import {
  IdentifyMethod,
  ShortcutKey,
  WordPracticeMode,
  WordPracticeStage,
  WordPracticeType,
} from '@typewords/core/types/enum.ts'
import ConflictNotice2 from '@typewords/core/components/dialog/ConflictNotice2.vue'
import { createEmptyCard, Rating } from 'ts-fsrs'
import { useGetGradeByWrongTimes, useNextCard } from '@typewords/core/hooks/fsrs.ts'
import WordMarkPickList, { type WordMarkPickResult } from '@typewords/core/components/word/WordMarkPickList.vue'
import { buildQuestion } from '@typewords/core/utils/word-test.ts'
import CollectNotice from '@typewords/core/components/dialog/CollectNotice.vue'

const { toggleWordCollect, isWordSimple, toggleWordSimple } = useWordOptions()
const settingStore = useSettingStore()
const runtimeStore = useRuntimeStore()
const { toggleTheme } = useTheme()
const router = useRouter()
const route = useRoute()
const store = useBaseStore()
const statStore = usePracticeStore()
const dataSync = useDataSyncPersistence()
const wordPersistence = usePracticeWordPersistence()
let { getGradeByWrongTimes } = useGetGradeByWrongTimes()
let { nextCard } = useNextCard()
const typingRef: any = $ref()
let showConflictNotice = $ref(false)
let showCollectNotice = $ref(false)
let showConflictNotice2 = $ref(false)
let isComplete = $ref(false)
let loading = $ref(false)
let settling = $ref(false)
let timer = $ref<any>(-1)

let isFocus = true
const IDLE_MS = 3 * 60 * 1000
let lastKeyActivity = Date.now()
let taskWords = $ref<TaskWords>({
  new: [],
  review: [],
})

if (import.meta.client) {
}

let watchRefList = []

function getDefaultPracticeData(origin?: Partial<PracticeData>, val?: Partial<PracticeData>): PracticeData {
  return Object.assign(origin, {
    index: 0,
    words: [],
    wrongWords: [],
    excludeWords: [],
    allWrongWords: [],
    wrongTimesMap: {},
    ratingMap: {},
    wrongTimes: 0,
    isTypingWrongWord: false,
    question: null,
    ...val,
  })
}
let data = $ref<PracticeData>(getDefaultPracticeData({}))

watch(
  () => data.words,
  () => {
    updateQuestion()
    handleResumeTimer()
  }
)
watch(
  () => data.index,
  () => {
    updateQuestion()
    handleResumeTimer()
  }
)

function updateQuestion() {
  if (data.words?.[data.index]) {
    data.question = buildQuestion(data.words[data.index], allWords)
  }
}

provide('practiceData', data)
provide('practiceTaskWords', taskWords)

function bumpPracticeTimerActivity() {
  lastKeyActivity = Date.now()
}
provide('bumpPracticeTimerActivity', bumpPracticeTimerActivity)

function handleResumeTimer() {
  if (!isFocus) return
  if (statStore.timerPaused) {
    statStore.resumeTimer()
    Toast.success(t('timer_resumed'))
  }
  bumpPracticeTimerActivity()
}

async function loadDict() {

  let dict = getDefaultDict()
  let dictId = route.params.id
  if (dictId) {

    dict = store.word.bookList.find(v => v.id === dictId)
    let r = await fetch(resourceWrap(DICT_LIST.WORD.ALL))
    let dict_list = await r.json()
    if (!dict) dict = dict_list.flat().find(v => v.id === dictId) as Dict
    if (dict && dict.id) {

      if (!dict.custom) dict = await _getDictDataByUrl(dict)
      if (!dict.words.length) {
        router.push('/words')
        return Toast.warning(t('no_words_to_learn'))
      }
      store.changeDict(dict)
      await initData(null, true)
      loading = false
    } else {
      router.push('/words')
    }
  } else {
    router.push('/words')
  }
}

watch(
  [() => store.load, () => loading],
  ([a, b]) => {
    if (a && b) loadDict()
  },
  { immediate: true }
)

const onvisibilitychange = async () => {
  isFocus = !document.hidden
  if (isFocus) {
    bumpPracticeTimerActivity()
    if (statStore.timerPaused && statStore.timerPauseReason === 'auto_visibility') {

      setTimeout(() => {
        statStore.resumeTimer()
        Toast.success(t('timer_auto_resumed'))
      }, 1500)
    }
    if (runtimeStore.globalLoading) return
    runtimeStore.globalLoading = true
    try {

      const d = await wordPersistence.fetch()
      if (d) {
        taskWords = Object.assign(taskWords, d.taskWords)
        data = Object.assign(data, d.practiceData)
        statStore.$patch(d.statStoreData)


        if (!statStore.timerPaused) {
          const now = Date.now()
          statStore.segments.push([now, now])
        }
      }
    } finally {
      runtimeStore.globalLoading = false
    }
  } else {
    statStore.pauseTimer('auto_visibility')
  }
}

onMounted(async () => {

  if (runtimeStore.routeData) {
    await initData(null, true)
  } else {
    loading = true
  }
  if (!route.query.guide) {
    showConflictNotice = true
    setTimeout(() => {
      showCollectNotice = true
    }, 10000)
  }
  document.removeEventListener('visibilitychange', onvisibilitychange)
  document.addEventListener('visibilitychange', onvisibilitychange)
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', onvisibilitychange)
  if (getPracticeWordCacheLocal()) {
    savePracticeDataIns('onUnmounted')
  }
  timer && clearInterval(timer)
  watchRefList.map(v => v?.stop())
})

watchOnce(
  () => data.words.length,
  (newVal, oldVal) => {

    if (!oldVal && newVal) {
      _nextTick(async () => {
        const Shepherd = await loadJsLib('Shepherd', LIB_JS_URL.SHEPHERD)
        const tour = new Shepherd.Tour(TourConfig)
        tour.on('cancel', () => {
          localStorage.setItem('tour-guide', '1')
        })
        tour.addStep({
          id: 'step5',
          text: '这里可以练习拼写单词，只需要按下键盘上对应的按键即可，没有输入框！',
          attachTo: { element: '#word', on: 'bottom' },
          buttons: [
            {
              text: `关闭`,
              action() {
                settingStore.first = false
                tour.next()
                setTimeout(() => {
                  showConflictNotice = true
                }, 1500)
                setTimeout(() => {
                  showCollectNotice = true
                }, 10000)
              },
            },
          ],
        })

        const r = localStorage.getItem('tour-guide')
        if (settingStore.first && !r && !isMobile()) {
          tour.start()
        }
      }, 500)
    }
  }
)

let allWords: Word[] = []

let isIniting = ref(true)
async function initData(initVal?: TaskWords, init: boolean = false) {
  isIniting.value = true

  if (init) {
    let d = runtimeStore.routeData
    if (!d) {
      d = await wordPersistence.load()
    }
    if (!d) {
      initData(getCurrentStudyWord())
      return
    }
    if (!(d.practiceData && d.statStoreData)) {
      initData(d.taskWords)
      return
    }
    console.log('initData')
    taskWords = Object.assign(taskWords, d.taskWords)

    data = getDefaultPracticeData(data, d.practiceData)
    statStore.$patch(d.statStoreData)


    if (!statStore.timerPaused) {
      const now = Date.now()
      statStore.segments.push([now, now])
    }
  } else {
    console.log('initData')
    // taskWords = initVal

    taskWords = Object.assign(taskWords, initVal)

    if (settingStore.wordPracticeMode === WordPracticeMode.Shuffle) {
      settingStore.wordPracticeType = WordPracticeType.Dictation
      data = getDefaultPracticeData(data, { words: taskWords.review })
      statStore.stage = WordPracticeStage.Shuffle
      statStore.total = taskWords.review.length
      statStore.newWordNumber = 0
      statStore.reviewWordNumber = 0
    } else if (settingStore.wordPracticeMode === WordPracticeMode.Review) {
      if (taskWords.review.length) {
        data = getDefaultPracticeData(data, { words: taskWords.review })
        statStore.stage = WordPracticeStage.IdentifyReview
      }
      statStore.total = taskWords.review.length
      statStore.newWordNumber = 0
      statStore.reviewWordNumber = taskWords.review.length
    } else {
      if (taskWords.new.length === 0) {
        if (taskWords.review.length) {
          data = getDefaultPracticeData(data, { words: taskWords.review })
          if (settingStore.wordPracticeMode === WordPracticeMode.System) {
            statStore.stage = WordPracticeStage.IdentifyReview
          } else if (settingStore.wordPracticeMode === WordPracticeMode.Free) {
            statStore.stage = WordPracticeModeStageMap[settingStore.wordPracticeMode][0]
          } else if (settingStore.wordPracticeMode === WordPracticeMode.IdentifyOnly) {
            statStore.stage = WordPracticeStage.IdentifyReview
          } else if (settingStore.wordPracticeMode === WordPracticeMode.DictationOnly) {
            statStore.stage = WordPracticeStage.DictationReview
          } else if (settingStore.wordPracticeMode === WordPracticeMode.ListenOnly) {
            statStore.stage = WordPracticeStage.ListenReview
          }
        } else {
          Toast.warning(t('no_words_to_learn'))
          router.push('/words')
        }
      } else {
        data = getDefaultPracticeData(data, { words: taskWords.new })
        statStore.stage = WordPracticeModeStageMap[settingStore.wordPracticeMode][0]
      }
      statStore.total = taskWords.review.length + taskWords.new.length
      statStore.newWordNumber = taskWords.new.length
      statStore.reviewWordNumber = taskWords.review.length
    }

    statStore.startDate = Date.now()
    statStore.inputWordNumber = 0
    statStore.wrong = 0
    statStore.spend = 0
    statStore.segments = []
    statStore.resumeTimer()
    watchStage(statStore.stage)
    watchPracticeType(settingStore.wordPracticeType)
  }


  let dictId: any = route.params.id
  let d = store.word.bookList.find(v => v.id === dictId)
  if (!d) d = store.sdict
  if (!d?.id) return router.push('/words')
  allWords = shuffle(d.words)
  updateQuestion()

  clearInterval(timer)
  bumpPracticeTimerActivity()
  timer = setInterval(() => {
    if (!isFocus) return
    if (statStore.timerPaused) return

    const now = Date.now()
    if (now - lastKeyActivity >= IDLE_MS) {
      return statStore.pauseTimer('auto_idle')
    }
    statStore.spend += 1000
  }, 1000)
  isIniting.value = false
  settling = isComplete = false
}

const word = $computed<Word>(() => {
  return data.words[data.index] ?? getDefaultWord()
})
const prevWord: Word = $computed(() => {
  return data.words?.[data.index - 1] ?? undefined
})
const nextWord: Word = $computed(() => {
  return data.words?.[data.index + 1] ?? undefined
})



function watchStage(n: WordPracticeStage) {
  switch (n) {
    case WordPracticeStage.DictationNewWord:
    case WordPracticeStage.DictationReview:
    case WordPracticeStage.Shuffle:
      settingStore.wordPracticeType = WordPracticeType.Dictation
      break
    case WordPracticeStage.ListenNewWord:
    case WordPracticeStage.ListenReview:
      settingStore.wordPracticeType = WordPracticeType.Listen
      break
    case WordPracticeStage.FollowWriteNewWord:
    case WordPracticeStage.FollowWriteReview:
      settingStore.wordPracticeType = WordPracticeType.FollowWrite
      break
    case WordPracticeStage.IdentifyNewWord:
    case WordPracticeStage.IdentifyReview:
      settingStore.wordPracticeType = WordPracticeType.Identify
      break
  }
}

function watchPracticeType(n: WordPracticeType) {
  if (settingStore.wordPracticeMode === WordPracticeMode.Free) return
  switch (n) {
    case WordPracticeType.Spell:
    case WordPracticeType.Dictation:
      settingStore.dictation = true
      settingStore.translate = true
      break
    case WordPracticeType.Listen:
      settingStore.dictation = true
      settingStore.translate = false
      break
    case WordPracticeType.FollowWrite:
      settingStore.dictation = false
      settingStore.translate = true
      break
    case WordPracticeType.Identify:
      settingStore.dictation = false
      settingStore.translate = false
      break
  }
}

const groupSize = 7

function wordLoop() {

  if (settingStore.wordPracticeType === WordPracticeType.FollowWrite) {
    data.index++

    if (data.index % groupSize === 0) {
      settingStore.wordPracticeType = WordPracticeType.Spell
      data.index -= groupSize
    }
  } else {

    data.index++

    if (data.index % groupSize === 0) {
      settingStore.wordPracticeType = WordPracticeType.FollowWrite
    }
  }
}

function nextStage(originList: Word[], log: string = '', toast: boolean = false) {

  let list = originList.filter(v => !checkWordIsNeedNext(v))
  console.log(log)
  statStore.stage = statStore.nextStage
  if (list.length) {
    data.words = list
    data.index = 0
  } else {
    console.log(log + ':无单词略过')

    data.words = []
    data.index = 0
    next(false)
  }
}

async function complete() {
  if (!isComplete) {
    let start = Date.now()
    console.log('全完学完了')
    isComplete = true
    settling = true
    runtimeStore.globalLoading = true
    clearInterval(timer)


    if (settingStore.wordPracticeMode !== WordPracticeMode.Shuffle) {
      store.sdict.lastLearnIndex = store.sdict.lastLearnIndex + statStore.newWordNumber

      let ignoreList = [store.allIgnoreWords, store.knownWords][settingStore.ignoreSimpleWord ? 0 : 1]

      const ignoreCount = ignoreList.filter(word =>
        store.sdict.words.slice(store.sdict.lastLearnIndex).some(w => w.word.toLowerCase() === word)
      ).length

      if (store.sdict.lastLearnIndex + ignoreCount >= store.sdict.length) {
        store.sdict.complete = true
        store.sdict.lastLearnIndex = store.sdict.length
      }
    }


    if (!statStore.timerPaused && statStore.segments.length > 0) {
      statStore.segments[statStore.segments.length - 1][1] = Date.now()
    }


    flushStatToStore(statStore.$state)

    for (const [word, wrongTimes] of Object.entries(data.wrongTimesMap)) {
      let rating = data.ratingMap[word]
      if (rating !== undefined) {
        setWordCard(rating, word)
      } else {

        setWordCard(getGradeByWrongTimes(wrongTimes), word, wrongTimes)
      }
    }

    if (AppEnv.CAN_REQUEST) {
      let res = await addStat({
        ...data,
        type: 'word',
        perDayStudyNumber: store.sdict.perDayStudyNumber,
        lastLearnIndex: store.sdict.lastLearnIndex,
        complete: store.sdict.complete,
      })
      if (!res.success) {
        Toast.error(res.msg)
      }
    }

    await dataSync.saveDictState(store.$state, { pullWhenRemoteNewer: false })
    await wordPersistence.clear()

    let trackData = {
      funSpend: Date.now() - start,
      name: store.sdict.name,
      spend: Number(statStore.spend / 1000 / 60).toFixed(1),
      index: store.sdict.lastLearnIndex,
      per: store.sdict.perDayStudyNumber,
      custom: store.sdict.custom,
      complete: store.sdict.complete,
      str: '',
    }
    trackData.str = `name:${trackData.name},per:${trackData.per},spend:${trackData.spend},index:${trackData.index},funSpend:${trackData.funSpend}`
    window.umami?.track('endStudyWord', trackData)
    settling = false
    runtimeStore.globalLoading = false
  }
}

function next(isTyping: boolean = true, ignoreLoop = false) {
  let temp = word.word.toLowerCase()
  let preTimes = data.wrongTimesMap[temp] ?? 0



  if (settingStore.wordPracticeType === WordPracticeType.Spell && data.wrongTimes === 0 && preTimes) {
    let rIndex = data.wrongWords.findIndex(v => v.word.toLowerCase() === temp)
    if (rIndex >= 0) {
      data.wrongWords.splice(rIndex, 1)
    }
  }

  data.wrongTimesMap[temp] = preTimes + data.wrongTimes
  data.wrongTimes = 0

  // debugger
  if (isTyping) statStore.inputWordNumber++
  if (settingStore.wordPracticeMode === WordPracticeMode.Free) {
    if (data.index === data.words.length - 1) {
      data.wrongWords = data.wrongWords.filter(v => !data.excludeWords.includes(v.word))
      if (data.wrongWords.length) {
        data.isTypingWrongWord = true
        settingStore.wordPracticeType = WordPracticeType.FollowWrite
        console.log('当前学完了，但还有错词')
        data.words = shuffle(cloneDeep(data.wrongWords))
        data.index = 0
        data.wrongWords = []
      } else {
        data.isTypingWrongWord = false
        complete()
      }
    } else {
      data.index++
    }
  } else {

    if (data.words.length === 0 || data.index === data.words.length - 1) {

      if (data.words.length) {
        if ((statStore.stage === WordPracticeStage.FollowWriteNewWord || data.isTypingWrongWord) && !ignoreLoop) {
          if (settingStore.wordPracticeType !== WordPracticeType.Spell) {

            data.index = Math.floor(data.index / groupSize) * groupSize
            emitter.emit(EventKey.resetWord)
            settingStore.wordPracticeType = WordPracticeType.Spell
            if (checkWordIsNeedNext(word)) next(false, ignoreLoop)
            return
          }
        }
      }
      data.wrongWords = data.wrongWords.filter(v => !checkWordIsNeedNext(v))
      if (data.wrongWords.length) {
        data.isTypingWrongWord = true
        settingStore.wordPracticeType = WordPracticeType.FollowWrite
        console.log('当前学完了，但还有错词')
        data.words = shuffle(cloneDeep(data.wrongWords))
        data.index = 0
        data.wrongWords = []
      } else {
        data.isTypingWrongWord = false
        console.log('当前学完了，没错词', statStore.total, statStore.stage, data.index)

        if (settingStore.wordPracticeMode === WordPracticeMode.System) {
          if (statStore.stage === WordPracticeStage.FollowWriteNewWord) {
            nextStage(shuffle(taskWords.new), '开始听写新词', true)
          } else if (statStore.stage === WordPracticeStage.ListenNewWord) {
            nextStage(shuffle(taskWords.new), '开始默写新词')
          } else if (statStore.stage === WordPracticeStage.DictationNewWord) {
            console.log('新词学习完成')
            nextStage(taskWords.review, '开始自测旧词')
          } else if (statStore.stage === WordPracticeStage.IdentifyReview) {
            nextStage(shuffle(taskWords.review), '开始听写旧词', true)
          } else if (statStore.stage === WordPracticeStage.ListenReview) {
            nextStage(shuffle(taskWords.review), '开始默写旧词')
          } else if (statStore.stage === WordPracticeStage.DictationReview) {
            complete()
          }
        } else if (settingStore.wordPracticeMode === WordPracticeMode.ListenOnly) {
          if (statStore.stage === WordPracticeStage.ListenNewWord) {
            nextStage(taskWords.review, '开始听写旧词', true)
          } else if (statStore.stage === WordPracticeStage.ListenReview) complete()
        } else if (settingStore.wordPracticeMode === WordPracticeMode.DictationOnly) {
          if (statStore.stage === WordPracticeStage.DictationNewWord) {
            nextStage(taskWords.review, '开始默写旧词', true)
          } else if (statStore.stage === WordPracticeStage.DictationReview) complete()
        } else if (settingStore.wordPracticeMode === WordPracticeMode.IdentifyOnly) {
          if (statStore.stage === WordPracticeStage.IdentifyNewWord) {
            nextStage(taskWords.review, '开始自测旧词')
          } else if (statStore.stage === WordPracticeStage.IdentifyReview) complete()
        } else if (settingStore.wordPracticeMode === WordPracticeMode.Shuffle) {
          if (statStore.stage === WordPracticeStage.Shuffle) complete()
        } else if (settingStore.wordPracticeMode === WordPracticeMode.Review) {
          if (statStore.stage === WordPracticeStage.IdentifyReview) {
            nextStage(shuffle(taskWords.review), '开始听写旧词', true)
          } else if (statStore.stage === WordPracticeStage.ListenReview) {
            nextStage(shuffle(taskWords.review), '开始默写旧词')
          } else if (statStore.stage === WordPracticeStage.DictationReview) complete()
        }
      }
    } else {
      if (statStore.stage === WordPracticeStage.FollowWriteNewWord) {
        wordLoop()
      } else {
        if (data.isTypingWrongWord) wordLoop()
        else data.index++
      }
    }
  }


  if (data.words.length > 0 && checkWordIsNeedNext(word)) next(false, ignoreLoop)
}



function checkWordIsNeedNext(word: Word) {
  if (!word.word) return false
  let rIndex = data.excludeWords.findIndex(v => v === word.word)
  return isWordSimple(word) || rIndex > -1
}

function skipStep() {
  data.index = data.words.length - 1
  data.wrongWords = []
  next(false, true)
}

function addExcludeWord() {

  let rIndex = data.excludeWords.findIndex(v => v === word.word)
  if (rIndex < 0) {
    data.excludeWords.push(word.word)
  }
}

function onWordKnow() {

  data.ratingMap[word.word.toLowerCase()] = Rating.Good
  addExcludeWord()
}

function onTypeWrong() {
  data.wrongTimes++


  let temp = word.word.toLowerCase()
  if (!data.allWrongWords.find(v => v === temp)) {
    data.allWrongWords.push(temp)
    statStore.wrong++
  }
  if (!store.wrong.words.find((v: Word) => v.word.toLowerCase() === temp)) {
    store.wrong.words.push(word)
    store.wrong.length = store.wrong.words.length
  }
  if (!data.wrongWords.find((v: Word) => v.word.toLowerCase() === temp)) {
    data.wrongWords.push(word)
  }
  let rIndex = data.excludeWords.findIndex(v => v === word.word)
  if (rIndex > -1) {
    data.excludeWords.splice(rIndex, 1)
  }
  savePracticeData('wrong')
}


function setWordCard(rating: number, wordStr = word.word, times?: number) {
  let card = store.fsrsData[wordStr]
  if (!card) {
    card = createEmptyCard()
  }
  card = nextCard(card, rating)
  store.fsrsData[wordStr] = card
  // console.log(

  //   card,
  //   cloneDeep(store.fsrsData)
  // )
}

async function savePracticeDataIns(where?) {
  const stages = WordPracticeModeStageMap[settingStore.wordPracticeMode]
  if (
    data.index === 0 &&
    statStore.stage === stages[0] &&
    settingStore.wordPracticeType === WordPracticeType.FollowWrite
  ) {

    return
  }
  if (isComplete) return
  // console.log('savePracticeData', where)
  if (runtimeStore.globalLoading) return
  runtimeStore.globalLoading = true

  if (!statStore.timerPaused && statStore.segments.length > 0) {
    statStore.segments[statStore.segments.length - 1][1] = Date.now()
  }
  await wordPersistence.save({
    taskWords,
    practiceData: data,
    statStoreData: statStore.$state,
  })
  runtimeStore.globalLoading = false
}

const savePracticeData = debounce(savePracticeDataIns, 500)

function onKeyUp(e: KeyboardEvent) {
  // console.log('onKeyUp', e)
  typingRef.hideWord()
}

function onKeyDown(e: KeyboardEvent) {
  // console.log('onKeyDown', e)
  switch (e.key) {
    case 'Backspace':
      typingRef.del()
      break
  }
}

function repeat() {
  console.log('重学一遍')
  wordPersistence.clear()
  let temp = cloneDeep(taskWords)
  let ignoreSet = [store.allIgnoreWordsSet, store.knownWordsSet][settingStore.ignoreSimpleWord ? 0 : 1]

  if (settingStore.wordPracticeMode === WordPracticeMode.Shuffle) {
    temp.review = shuffle(temp.review.filter(v => !ignoreSet.has(v.word)))
  } else {

    store.sdict.lastLearnIndex = store.sdict.lastLearnIndex - statStore.newWordNumber

    temp.new = temp.new.filter(v => !ignoreSet.has(v.word))
    temp.review = temp.review.filter(v => !ignoreSet.has(v.word))
  }
  emitter.emit(EventKey.resetWord)
  initData(temp)
}

function prev() {
  if (data.index === 0) {
    Toast.warning(t('already_first_word'))
  } else {
    data.index--
  }
}

function skip() {
  addExcludeWord()
  next(false)
}

function show(e: KeyboardEvent) {
  typingRef.showWord()
}

function collect(e: KeyboardEvent) {
  toggleWordCollect(word)
}

function play() {
  typingRef.play()
}

function toggleWordSimpleWrapper() {
  if (!isWordSimple(word)) {
    setTimeout(() => next(false))
  }
  toggleWordSimple(word)
  let rIndex = data.excludeWords.findIndex(v => v === word.word)
  if (rIndex > -1) {
    data.excludeWords.splice(rIndex, 1)
  } else {
    data.excludeWords.push(word.word)
  }
}

function toggleConciseMode() {
  settingStore.showToolbar = !settingStore.showToolbar
  settingStore.showPanel = settingStore.showToolbar
}

async function continueStudy() {
  wordPersistence.clear()
  let temp = cloneDeep(taskWords)
  let ignoreList = [store.allIgnoreWords, store.knownWords][settingStore.ignoreSimpleWord ? 0 : 1]

  if (settingStore.wordPracticeMode === WordPracticeMode.Shuffle) {
    temp.review = shuffle(store.sdict.words.filter(v => !ignoreList.includes(v.word))).slice(
      0,
      runtimeStore.routeData.total ?? temp.review.length
    )
  } else {

    if (!isComplete) {
      console.log('没学完，强行跳过')
      store.sdict.lastLearnIndex = store.sdict.lastLearnIndex + statStore.newWordNumber

      const ignoreCount = ignoreList.filter(word => store.sdict.words.some(w => w.word.toLowerCase() === word)).length

      if (store.sdict.lastLearnIndex + ignoreCount >= store.sdict.length) {
        store.sdict.complete = true
        store.sdict.lastLearnIndex = store.sdict.length
      }
    } else {
      console.log('学完了，正常下一组')
    }

    temp = getCurrentStudyWord()
  }
  emitter.emit(EventKey.resetWord)
  initData(temp)

  if (AppEnv.CAN_REQUEST) {
    let res = await setUserDictProp(null, { ...store.sdict, type: 'word' })
    if (!res.success) {
      Toast.error(res.msg)
    }
  }
}

async function jumpToGroup(group: number) {
  window?.umami?.track('jumpToGroup')
  wordPersistence.clear()
  console.log('没学完，强行跳过', group)
  store.sdict.lastLearnIndex = (group - 1) * store.sdict.perDayStudyNumber
  emitter.emit(EventKey.resetWord)
  initData(getCurrentStudyWord())
  if (AppEnv.CAN_REQUEST) {
    let res = await setUserDictProp(null, { ...store.sdict, type: 'word' })
    if (!res.success) {
      Toast.error(res.msg)
    }
  }
}

function randomWrite() {
  window?.umami?.track('randomWrite')
  console.log('随机默写')
  data.words = shuffle(data.words)
  data.index = 0
  settingStore.dictation = true
}

useStartKeyboardEventListener()
useDisableEventListener(() => loading)
useOnKeyboardEventListener(onKeyDown, onKeyUp)

watch(isIniting, n => {
  if (!n) {
    watchRefList = [
      watch(() => statStore.stage, watchStage),
      watch(() => settingStore.wordPracticeType, watchPracticeType),
      watch(() => data.index, savePracticeData),

      watch(
        () => statStore.spend,
        curr => {
          if (curr % (30 * 1000) === 0 && curr !== 0) {
            savePracticeData('spend')
          }
        }
      ),
    ]
  }
})

function onWordMarkPickComplete(result: WordMarkPickResult) {
  result.know.map(word => {
    data.ratingMap[word.word.toLowerCase()] = Rating.Good
    data.excludeWords.push(word.word)
  })
  result.mastered.map(word => {
    data.excludeWords.push(word.word)
  })
  console.log(result)
  if (result.unknown.length > 0) {
    data.isTypingWrongWord = true
    settingStore.wordPracticeType = WordPracticeType.FollowWrite
    console.log('当前学完了，但还有错词')
    data.words = shuffle(cloneDeep(result.unknown))
    data.index = 0
    data.wrongWords = []

    data.allWrongWords = data.allWrongWords.concat(result.unknown.map(v => v.word.toLowerCase()))
    result.unknown.forEach(v => {
      data.wrongTimesMap[v.word.toLowerCase()] = 1
    })
  } else {
    data.words = []
    next(false)
  }
}

useEvents([
  [EventKey.onTyping, handleResumeTimer],
  [EventKey.repeatStudy, repeat],
  [EventKey.continueStudy, continueStudy],

  [ShortcutKey.ShowWord, throttle(show, 300)],
  [ShortcutKey.Previous, prev],
  [ShortcutKey.Next, throttle(() => next(false), 300)],
  [ShortcutKey.Ignore, throttle(skip, 300)],
  [ShortcutKey.ToggleCollect, collect],
  [ShortcutKey.ToggleSimple, toggleWordSimpleWrapper],
  [ShortcutKey.PlayWordPronunciation, play],

  [ShortcutKey.RepeatChapter, repeat],
  [ShortcutKey.NextChapter, continueStudy],
  [ShortcutKey.NextStep, skipStep],
  [ShortcutKey.ToggleShowTranslate, () => (settingStore.translate = !settingStore.translate)],
  [ShortcutKey.ToggleDictation, () => (settingStore.dictation = !settingStore.dictation)],
  [ShortcutKey.ToggleTheme, toggleTheme],
  [ShortcutKey.ToggleConciseMode, toggleConciseMode],
  [ShortcutKey.ToggleToolbar, () => (settingStore.showToolbar = !settingStore.showToolbar)],
  [ShortcutKey.TogglePanel, () => (settingStore.showPanel = !settingStore.showPanel)],
  [ShortcutKey.RandomWrite, randomWrite],
])
</script>

<template>
  <PracticeLayout v-loading="loading" panelLeft="var(--word-panel-margin-left)">
    <template v-slot:practice>
      <div class="practice-word">
        <div class="fixed z-99999 center mt-3" v-if="statStore.timerPaused">
          <ToastComponent
            :duration="0"
            :anim="statStore.timerPauseReason !== 'auto_visibility'"
            :shadow="false"
            :showClose="true"
            :message="statStore.timerPauseReason === 'auto_idle' ? $t('timer_paused_idle') : $t('timer_paused')"
            @close="statStore.resumeTimer"
          />
        </div>

        <WordMarkPickList
          v-if="
            settingStore.wordPracticeType === WordPracticeType.Identify &&
            data.wrongWords.length === 0 &&
            settingStore.identifyMethod === IdentifyMethod.QuickIdentify
          "
          :words="data.words"
          @complete="onWordMarkPickComplete"
        />

        <div class="mb-50 w-full" v-else>
          
          <div
            class="fixed z-1 top-4 w-full hidden md:block"
            style="left: calc(50vw + var(--aside-width) / 2 - var(--toolbar-width) / 2); width: var(--toolbar-width)"
            v-if="settingStore.showNearWord"
          >
            <Tooltip :title="`${$t('prev_word')}(${settingStore.shortcutKeyMap[ShortcutKey.Previous]})`">
              <div class="relative z-2 center gap-2 cp float-left" @click="prev" v-if="prevWord">
                <IconFluentArrowLeft16Regular class="arrow" width="22" />
                <div class="word">{{ prevWord.word }}</div>
              </div>
            </Tooltip>

            <div
              class="center gap-1 absolute w-full cp"
              v-if="settingStore.showConflictNotice2"
              @click="showConflictNotice2 = true"
            >
              <IconFluentQuestionCircle20Regular />
              <span class="">{{ $t('cannot_type_q') }}</span>
            </div>

            <Tooltip :title="`${$t('next_word')}(${settingStore.shortcutKeyMap[ShortcutKey.Next]})`">
              <div class="relative center gap-2 cp float-right mr-3" @click="next(false)" v-if="nextWord">
                <div class="word" :class="settingStore.dictation && 'word-shadow'">
                  {{ nextWord.word }}
                </div>
                <IconFluentArrowRight16Regular class="arrow" width="22" />
              </div>
            </Tooltip>
          </div>
          <TypeWord
            ref="typingRef"
            :word="word"
            :question="data.question"
            @wrong="onTypeWrong"
            @complete="next"
            @mastered="toggleWordSimpleWrapper"
            @know="onWordKnow"
            @skip="skip"
            @toggle-simple="toggleWordSimpleWrapper"
          />
        </div>
      </div>
    </template>
    <template v-slot:panel>
      <Panel>
        <template v-slot:title>
          <div class="center gap-1">
            <span>{{ store.sdict.name }}</span>

            <GroupList
              @click="jumpToGroup"
              v-if="taskWords.new.length && settingStore.wordPracticeMode !== WordPracticeMode.Shuffle"
            />
            <BaseIcon
              v-if="
                taskWords.new.length &&
                ![WordPracticeMode.Review, WordPracticeMode.Shuffle].includes(settingStore.wordPracticeMode)
              "
              @click="continueStudy"
              :title="`下一组(${settingStore.shortcutKeyMap[ShortcutKey.NextChapter]})`"
            >
              <IconFluentArrowRight16Regular class="arrow" width="22" />
            </BaseIcon>

            <BaseIcon @click="randomWrite" :title="`随机默写(${settingStore.shortcutKeyMap[ShortcutKey.RandomWrite]})`">
              <IconFluentArrowShuffle16Regular class="arrow" width="22" />
            </BaseIcon>
          </div>
        </template>
        <div class="panel-page-item pl-4">
          <WordList
            v-if="data.words.length"
            :is-active="settingStore.showPanel"
            :static="false"
            :show-word="!settingStore.dictation"
            :show-translate="settingStore.translate"
            :list="data.words"
            :activeIndex="data.index"
            :excludeWords="data.excludeWords"
            @click="(val: any) => (data.index = val.index)"
          >
          </WordList>
          <Empty v-else />
        </div>
      </Panel>
    </template>
    <template v-slot:footer>
      <Footer @skipStep="skipStep" />
    </template>
  </PracticeLayout>
  <Statistics v-model="isComplete" :loading="settling" />
  <ConflictNotice v-if="showConflictNotice" />
  <CollectNotice v-model="showCollectNotice" />
  <ConflictNotice2 v-model="showConflictNotice2" />
</template>

<style scoped lang="scss">
.practice-wrapper {
  @apply w-full h-full flex justify-center overflow-hidden;
}

.practice-word {
  @apply h-full flex flex-col justify-between items-center relative;
  width: var(--toolbar-width);
}


@media (max-width: 768px) {
  .practice-word {
    width: 100%;

    .absolute.z-1.top-4 {
      z-index: 100;

      .center.gap-2.cursor-pointer {
        min-height: 44px;
        min-width: 44px;
        padding: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;

        .word {
          pointer-events: none;
        }

        .arrow {
          pointer-events: none;
        }
      }
    }
  }
}

.word-panel-wrapper {
  position: absolute;
  left: var(--panel-margin-left);
  //left: 0;
  top: 0.8rem;
  z-index: 1;
  height: calc(100% - 1.5rem);
}
</style>