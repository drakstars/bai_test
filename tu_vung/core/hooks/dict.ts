import type { Article, Dict, TaskWords, Word } from '../types'
import { DictType, getDefaultDict, getDefaultWord } from '../types'
import { useBaseStore } from '../stores/base.ts'
import { useSettingStore } from '../stores/setting.ts'
import { _getDictDataByUrl, cloneDeep, getRandomN, resourceWrap, shuffle, splitIntoN } from '../utils'
import { onMounted, watch } from 'vue'
import { AppEnv, DICT_LIST, DictId } from '../config/env.ts'
import { detail } from '../apis'
import { useRuntimeStore } from '../stores/runtime.ts'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { computed } from 'vue'

export function useWordOptions() {
  const store = useBaseStore()

  function isWordCollect(val: Word) {
    return !!store.collectWord.words.find(v => v.word.toLowerCase() === val.word.toLowerCase())
  }

  function toggleWordCollect(val: Word) {
    let rIndex = store.collectWord.words.findIndex(v => v.word.toLowerCase() === val.word.toLowerCase())
    if (rIndex > -1) {
      store.collectWord.words.splice(rIndex, 1)
    } else {
      store.collectWord.words.push(val)
    }
    store.collectWord.length = store.collectWord.words.length
  }

  function isWordSimple(val: Word) {
    return !!store.knownWordsSet.has(val.word.toLowerCase())
  }

  function toggleWordSimple(val: Word) {
    let rIndex = store.knownWords.findIndex(v => v === val.word.toLowerCase())
    if (rIndex > -1) {
      store.known.words.splice(rIndex, 1)
    } else {
      store.known.words.push(val)
    }
    store.known.length = store.known.words.length
  }

  function delWrongWord(val: Word) {
    let rIndex = store.wrong.words.findIndex(v => v.word.toLowerCase() === val.word.toLowerCase())
    if (rIndex > -1) {
      store.wrong.words.splice(rIndex, 1)
    }
    store.wrong.length = store.wrong.words.length
  }

  function delSimpleWord(val: Word) {
    let rIndex = store.known.words.findIndex(v => v.word.toLowerCase() === val.word.toLowerCase())
    if (rIndex > -1) {
      store.known.words.splice(rIndex, 1)
    }
    store.known.length = store.known.words.length
  }

  return {
    isWordCollect,
    toggleWordCollect,
    isWordSimple,
    toggleWordSimple,
    delWrongWord,
    delSimpleWord,
  }
}

export function useArticleOptions() {
  const store = useBaseStore()

  function isArticleCollect(val: Article) {
    return !!store.collectArticle?.articles?.find(v => v.id === val.id)
  }


  function toggleArticleCollect(val: Article) {
    let rIndex = store.collectArticle.articles.findIndex(v => v.id === val.id)
    if (rIndex > -1) {
      store.collectArticle.articles.splice(rIndex, 1)
    } else {
      store.collectArticle.articles.push(val)
    }
    store.collectArticle.length = store.collectArticle.articles.length
  }

  return {
    isArticleCollect,
    toggleArticleCollect,
  }
}

export function getCurrentStudyWord(): TaskWords {
  const store = useBaseStore()
  let data: TaskWords = { new: [], review: [] }
  let dict = store.sdict
  let isTest = false
  let words = dict.words.slice()
  if (isTest) {
    words = Array.from({ length: 10 }).map((v, i) => {
      return getDefaultWord({ word: String(i) })
    })
  }

  if (words?.length) {
    const settingStore = useSettingStore()

    const ignoreSet = [store.allIgnoreWordsSet, store.knownWordsSet][settingStore.ignoreSimpleWord ? 0 : 1]
    const perDay = dict.perDayStudyNumber
    const start = isTest ? 1 : dict.lastLearnIndex
    const complete = isTest ? true : dict.complete
    const isEnd = start >= dict.length - 1 && dict.length !== 1
    const reviewRatio = settingStore.wordReviewRatio

    let end = start
    if (!isEnd) {

      for (let i = start; i < words.length; i++) {
        let item = words[i]
        if (data.new.length >= perDay) break
        if (!ignoreSet.has(item.word)) {
          data.new.push(item)
        }
        end++
      }
    }


    if (reviewRatio >= 1 || complete || isEnd) {

      const wordMap = new Map(words.map(s => [s.word, s]))

      const totalNeed = perDay * (isEnd ? reviewRatio || 1 : reviewRatio)
      const now = Date.now()

      let waitRemoveFromFsrsData = []


      let reviewWordStrList = Object.entries(store.fsrsData)
        .filter(([word, card]) => {




          let isMastered = ignoreSet.has(word)
          if (isMastered) {
            waitRemoveFromFsrsData.push(word)
          }
          return (
            !isMastered && dayjs(card.due).valueOf() <= now && wordMap.has(word) && !data.new.find(v => v.word === word)
          )
        })
        .sort((a, b) => dayjs(a[1].due).valueOf() - dayjs(b[1].due).valueOf())
        .map(([word]) => word)

      waitRemoveFromFsrsData.map(word => {
        delete store.fsrsData[word]
      })


      data.review = shuffle(
        reviewWordStrList
          .slice(0, totalNeed)
          .map(word => wordMap.get(word))
          .filter(obj => obj)
      )

      if (data.review.length < totalNeed) {

        let list = words.slice(0, start).reverse()
        if (complete) list = list.concat(words.slice(end).reverse())

        let set = new Set(
          Array.from(ignoreSet)
            .concat(Object.keys(store.fsrsData))
            .concat(data.new.map(v => v.word))
        )
        list = list.filter(item => !set.has(item.word))
        data.review = data.review.concat(list.slice(0, totalNeed - data.review.length))
      }
    }
  }
  return data
}

export function useGetDict() {
  const store = useBaseStore()
  const runtimeStore = useRuntimeStore()
  let waiting = $ref(false)
  let fetching = $ref(false)
  const route = useRoute()
  const router = useRouter()

  watch(
    [() => store.load, () => waiting],
    ([a, b]) => {
      if (a && b) {
        loadDict()
      }
    },
    { immediate: true }
  )

  onMounted(() => {
    // console.log('onMounted')
    if (route.query?.isAdd) {
      runtimeStore.editDict = getDefaultDict()
    } else {
      if (!runtimeStore.editDict?.id) {
        let dictId = route.params?.id
        if (!dictId) {
          return router.push('/articles')
        }
        waiting = true
      } else {
        loadDict(runtimeStore.editDict)
      }
    }
  })

  async function loadDict(dict?: Dict) {
    if (!dict) {
      dict = getDefaultDict()
      let dictId = route.params.id

      dict = store.article.bookList.find(v => v.id === dictId)
      let r = await fetch(resourceWrap(DICT_LIST.ARTICLE.ALL))
      let dict_list = await r.json()
      if (!dict) dict = dict_list.flat().find(v => v.id === dictId) as Dict
    }
    if (dict && dict.id) {
      if (
        !dict?.articles?.length &&
        !dict?.custom &&
        ![DictId.articleCollect].includes(dict.en_name || dict.id) &&
        !dict?.is_default
      ) {
        fetching = true
        let r = await _getDictDataByUrl(dict, DictType.article)
        runtimeStore.editDict = r
      }
      if (store.article.bookList.find(book => book.id === runtimeStore.editDict.id)) {
        if (AppEnv.CAN_REQUEST) {
          let res = await detail({ id: runtimeStore.editDict.id })
          if (res.success) {
            runtimeStore.editDict.statistics = res.data.statistics
            if (res.data.articles.length) {
              runtimeStore.editDict.articles = res.data.articles
            }
          }
        }
      }
    } else {
      router.push('/articles')
    }

    waiting = false
    fetching = false
  }

  const loading = computed(() => waiting || fetching)

  return { loading }
}