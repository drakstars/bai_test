<script setup lang="ts">
import { addStat, setUserDictProp } from '@typewords/core/apis'
import { BaseIcon, Tooltip, Toast } from '@typewords/base'
import ConflictNotice from '@typewords/core/components/dialog/ConflictNotice.vue'
import ArticleList from '@typewords/core/components/list/ArticleList.vue'
import Panel from '@typewords/core/components/Panel.vue'
import PracticeLayout from '@typewords/core/components/PracticeLayout.vue'
import SettingDialog from '@typewords/core/components/setting/SettingDialog.vue'
import { AppEnv, DICT_LIST } from '@typewords/core/config/env.ts'
import { genArticleSectionData, usePlaySentenceAudio } from '@typewords/core/hooks/article.ts'
import { useArticleOptions } from '@typewords/core/hooks/dict.ts'
import {
  useDisableEventListener,
  useOnKeyboardEventListener,
  useStartKeyboardEventListener,
} from '@typewords/core/hooks/event.ts'
import useTheme from '@typewords/core/hooks/theme.ts'
import ArticleAudio from '@typewords/core/components/article/ArticleAudio.vue'
import EditSingleArticleModal from '@typewords/core/components/article/EditSingleArticleModal.vue'
import TypingArticle from '@typewords/core/components/article/TypingArticle.vue'
import { useBaseStore } from '@typewords/core/stores/base.ts'
import { usePracticeStore } from '@typewords/core/stores/practice.ts'
import { useRuntimeStore } from '@typewords/core/stores/runtime.ts'
import { useSettingStore } from '@typewords/core/stores/setting.ts'
import { getDefaultArticle, getDefaultDict, getDefaultWord } from '@typewords/core/types/func.ts'
import type { Article, ArticleItem, ArticleWord, Dict, Statistics, Word } from '@typewords/core/types/types.ts'
import { _getDictDataByUrl, _nextTick, cloneDeep, msToMinute, resourceWrap, total } from '@typewords/core/utils'
import { getPracticeArticleCacheLocal } from '@typewords/core/utils/cache.ts'
import { usePracticeArticlePersistence } from '@typewords/core/composables/usePracticePersistence'
import { useEvents, emitter, EventKey } from '@typewords/core/utils/eventBus'
import { computed, onMounted, onUnmounted, provide, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { nanoid } from 'nanoid'
import { DictType, PracticeArticleWordType, ShortcutKey } from '@typewords/core/types/enum.ts'

const { t } = useI18n()
const store = useBaseStore()
const runtimeStore = useRuntimeStore()
const settingStore = useSettingStore()
const statStore = usePracticeStore()
const articlePersistence = usePracticeArticlePersistence()
const { toggleTheme } = useTheme()

let articleData = $ref({
  list: [],
  article: getDefaultArticle(),
})
let showEditArticle = $ref(false)
let typingArticleRef = $ref<any>()
let showConflictNotice = $ref(false)
let loading = $ref<boolean>(false)
let allWrongWords = new Set()
let editArticle = $ref<Article>(getDefaultArticle())
let audioRef = $ref<HTMLAudioElement>()
let timer = $ref<ReturnType<typeof setInterval> | number>(0)
let isFocus = true
let isTyped = $ref(false)

let lock = false

function write() {
  // console.log('write')
  settingStore.dictation = true
  repeat()
}



function repeat() {
  // console.log('repeat')
  getCurrentPractice()
}

function prev() {
  // console.log('next')
  if (store.sbook.lastLearnIndex === 0) {
    Toast.warning(t('already_first_chapter'))
  } else {
    store.sbook.lastLearnIndex--
    getCurrentPractice()
  }
}

const toggleShowTranslate = () => (settingStore.translate = !settingStore.translate)
const toggleDictation = () => (settingStore.dictation = !settingStore.dictation)
const togglePanel = () => (settingStore.showPanel = !settingStore.showPanel)
const skip = () => typingArticleRef?.nextSentence()
const collect = () => toggleArticleCollect(articleData.article)
const shortcutKeyEdit = () => edit()

function toggleConciseMode() {
  settingStore.showToolbar = !settingStore.showToolbar
  settingStore.showPanel = settingStore.showToolbar
}

function next() {
  articlePersistence.clear()
  if (store.sbook.lastLearnIndex >= articleData.list.length - 1) {
    store.sbook.complete = true
    store.sbook.lastLearnIndex = 0

  } else store.sbook.lastLearnIndex++
  getCurrentPractice()
}

const router = useRouter()
const route = useRoute()

async function init() {

  let dict = getDefaultDict()
  let dictId = route.params.id
  if (dictId) {

    dict = store.article.bookList.find(v => v.id == dictId)
    let r = await fetch(resourceWrap(DICT_LIST.ARTICLE.ALL))
    let book_list = await r.json()
    if (!dict) dict = book_list.find(v => v.id === dictId) as Dict
    if (dict && dict.id) {

      if (!dict.custom) dict = await _getDictDataByUrl(dict, DictType.article)
      if (!dict.articles.length) {
        router.push('/articles')
        return Toast.warning(t('no_articles_to_learn'))
      }
      await store.changeBook(dict)
      articleData.list = cloneDeep(store.sbook.articles)
      getCurrentPractice()
      loading = false
    } else {
      router.push('/articles')
    }
  } else {
    router.push('/articles')
  }
}

const initAudio = () => {
  _nextTick(() => {
    if (import.meta.server) return
    audioRef.volume = settingStore.articleSoundVolume / 100
    audioRef.playbackRate = settingStore.articleSoundSpeed
  })
}

const handleVolumeUpdate = (volume: number) => {
  settingStore.articleSoundVolume = volume
}

const handleSpeedUpdate = (speed: number) => {
  settingStore.articleSoundSpeed = speed
}

watch(
  [() => store.load, () => loading],
  ([a, b]) => {
    if (a && b) init()
  },
  { immediate: true }
)

watch(
  () => settingStore.$state,
  n => {
    initAudio()
  },
  { immediate: true, deep: true }
)


watch(
  () => store.sbook.lastLearnIndex,
  n => {
    if (lock) return
    getCurrentPractice()
  }
)

onActivated(() => {
  console.log('onActivated')
})
onMounted(() => {
  document.removeEventListener('visibilitychange', onvisibilitychange)
  document.addEventListener('visibilitychange', onvisibilitychange)

  console.log('onMounted')
  if (store.sbook?.articles?.length) {
    articleData.list = cloneDeep(store.sbook.articles)
    getCurrentPractice()
  } else {
    loading = true
  }
  if (route.query.guide) {
    showConflictNotice = false
  } else {
    showConflictNotice = true
  }
})

async function unmount() {
  document.removeEventListener('visibilitychange', onvisibilitychange)

  console.log('onUnmounted')
  runtimeStore.disableEventListener = false
  const cache = await getPracticeArticleCacheLocal()

  if (cache) {
    if (runtimeStore.globalLoading) return
    runtimeStore.globalLoading = true
    cache.statStoreData.spend = statStore.spend
    await articlePersistence.save(cache)
    runtimeStore.globalLoading = false
  }
  timer && clearInterval(timer)
}

onUnmounted(unmount)

onDeactivated(unmount)

useStartKeyboardEventListener()
useDisableEventListener(() => loading)

const onvisibilitychange = async () => {
  isFocus = !document.hidden
  if (isFocus) {
    if (runtimeStore.globalLoading) return
    runtimeStore.globalLoading = true
    try {
      const cache = await articlePersistence.fetch()
      if (cache) {
        statStore.$patch(cache.statStoreData)
        typingArticleRef?.applyPracticeCache?.(cache)
      }
    } finally {
      runtimeStore.globalLoading = false
    }
  }
}

function setArticle(val: Article) {
  statStore.wrong = 0
  statStore.total = 0
  statStore.startDate = Date.now()
  statStore.spend = 0
  allWrongWords = new Set()
  articleData.list[store.sbook.lastLearnIndex] = val
  articleData.article = val
  let ignoreSet = [store.allIgnoreWordsSet, store.knownWordsSet][settingStore.ignoreSimpleWord ? 0 : 1]
  articleData.article.sections.map((v, i) => {
    v.map(w => {
      w.words.map(s => {
        if (!ignoreSet.has(s.word.toLowerCase()) && s.type === PracticeArticleWordType.Word) {
          statStore.total++
        }
      })
    })
  })

  isTyped = false
  clearInterval(timer)
  timer = setInterval(() => {
    if (isFocus) {
      statStore.spend += 1000
    }
  }, 1000)

  _nextTick(typingArticleRef?.init)
}

async function complete() {
  clearInterval(timer)

  setTimeout(() => {
    articlePersistence.clear()
  }, 1500)


  let data: Partial<Statistics> & { title: string; articleId: number } = {
    articleId: Number(articleData.article.id),
    title: articleData.article.title,
    spend: statStore.spend,
    startDate: statStore.startDate,
    total: statStore.total,
    wrong: statStore.wrong,
  }

  let reportData = {
    name: store.sbook.name,
    index: store.sbook.lastLearnIndex,
    custom: store.sbook.custom,
    complete: store.sbook.complete,
    title: articleData.article.title,
    spend: Number(statStore.spend / 1000 / 60).toFixed(1),
    s: '',
  }
  reportData.s = `name:${store.sbook.name},title:${store.sbook.lastLearnIndex}.${data.title},spend:${Number(statStore.spend / 1000 / 60).toFixed(1)}`
  window.umami?.track('endStudyArticle', reportData)

  if (store.sbook.lastLearnIndex >= store.sbook.length - 1) {
    store.sdict.complete = true
  }
  if (AppEnv.CAN_REQUEST) {
    let res = await addStat({
      ...data,
      type: 'article',
      complete: store.sdict.complete,
    })
    if (!res.success) {
      Toast.error(res.msg)
    }
  }

  store.sbook.statistics.push(data as any)


  statStore.wrong = 0
  statStore.startDate = Date.now()
}

function getCurrentPractice() {
  emitter.emit(EventKey.resetWord)
  let currentArticle = articleData.list[store.sbook.lastLearnIndex]
  let article = getDefaultArticle(currentArticle)
  if (article.sections.length) {
    setArticle(article)
  } else {
    genArticleSectionData(article)
    setArticle(article)
  }
}

function saveArticle(val: Article) {
  console.log('saveArticle', val, JSON.stringify(val.lrcPosition))
  console.log('saveArticle', val.textTranslate)
  showEditArticle = false
  let rIndex = store.sbook.articles.findIndex(v => v.id === val.id)
  if (rIndex > -1) {
    store.sbook.articles[rIndex] = cloneDeep(val)
  }
  setArticle(val)
  store.sbook.custom = true
  if (!store.sbook.id.includes('_custom')) {
    store.sbook.id += '_custom_' + nanoid(6)
  }
}

function edit(val: Article = articleData.article) {
  editArticle = val
  showEditArticle = true
}

function wrong(word: Word) {
  let temp = word.word.toLowerCase()

  if (settingStore.ignoreSimpleWord) {
    if (store.simpleWords.includes(temp)) return
  }
  if (!allWrongWords.has(temp)) {
    allWrongWords.add(temp)
    statStore.wrong++
  }

  if (!store.wrong.words.find((v: Word) => v.word.toLowerCase() === temp)) {
    store.wrong.words.push(getDefaultWord(word))
    store.wrong.length = store.wrong.words.length
  }
}

function nextWord(word: ArticleWord) {
  if (!store.allIgnoreWords.includes(word.word.toLowerCase()) && word.type === PracticeArticleWordType.Word) {
    statStore.inputWordNumber++
  }
}

async function changeArticle(val: ArticleItem) {
  if (lock) return
  lock = true
  await articlePersistence.clear()
  let rIndex = articleData.list.findIndex(v => v.id === val.item.id)
  if (rIndex > -1) {
    store.sbook.lastLearnIndex = rIndex
    getCurrentPractice()

    if (AppEnv.CAN_REQUEST) {
      let res = await setUserDictProp(null, store.sbook)
      if (!res.success) {
        Toast.error(res.msg)
      }
    }
  }
  initAudio()
  lock = false
}

const handlePlayNext = (nextArticle: Article) => {
  let rIndex = articleData.list.findIndex(v => v.id === nextArticle.id)
  if (rIndex > -1) {
    store.sbook.lastLearnIndex = rIndex
    getCurrentPractice()
  }
}

const { isArticleCollect, toggleArticleCollect } = useArticleOptions()

function play() {
  typingArticleRef?.play()
}

function show() {
  typingArticleRef?.showSentence()
}

function onKeyUp() {
  typingArticleRef?.hideSentence()
}

async function onKeyDown(e: KeyboardEvent) {
  switch (e.key) {
    case 'Backspace':
      typingArticleRef.del()
      break
  }
}

useOnKeyboardEventListener(onKeyDown, onKeyUp)

useEvents([
  [EventKey.write, write],
  [EventKey.repeatStudy, repeat],
  [EventKey.continueStudy, next],

  [ShortcutKey.PreviousChapter, prev],
  [ShortcutKey.RepeatChapter, repeat],
  [ShortcutKey.DictationChapter, write],
  [ShortcutKey.ToggleShowTranslate, toggleShowTranslate],
  [ShortcutKey.ToggleDictation, toggleDictation],
  [ShortcutKey.ToggleTheme, toggleTheme],
  [ShortcutKey.ToggleConciseMode, toggleConciseMode],
  [ShortcutKey.TogglePanel, togglePanel],
  [ShortcutKey.NextChapter, next],
  [ShortcutKey.PlayWordPronunciation, play],
  [ShortcutKey.ShowWord, show],
  [ShortcutKey.Next, skip],
  [ShortcutKey.ToggleCollect, collect],
  [ShortcutKey.EditArticle, shortcutKeyEdit],
])

const { playSentenceAudio } = usePlaySentenceAudio()

function play2(e) {
  _nextTick(() => {
    if (settingStore.articleSound || e.handle) {
      playSentenceAudio(e.sentence, audioRef)
    }
  })
}

const currentPractice = computed(() => {
  if (store.sbook.statistics?.length) {
    return store.sbook.statistics.filter((v: any) => v.title === articleData.article.title)
  }
  return []
})

provide('currentPractice', currentPractice)
</script>
<template>
  <PracticeLayout v-loading="loading" panelLeft="var(--article-panel-margin-left)">
    <template v-slot:practice>
      <TypingArticle
        ref="typingArticleRef"
        @wrong="wrong"
        @next="next"
        @nextWord="nextWord"
        @play="play2"
        @replay="setArticle(articleData.article)"
        @complete="complete"
        :article="articleData.article"
      />
    </template>
    <template v-slot:panel>
      <Panel :style="{ width: 'var(--article-panel-width)' }">
        <template v-slot:title>
          <span>{{ store.sbook.name }} ({{ store.sbook.lastLearnIndex + 1 }} / {{ articleData.list.length }})</span>
        </template>
        <div class="panel-page-item pl-4">
          <ArticleList
            :isActive="settingStore.showPanel"
            :static="false"
            :show-translate="settingStore.translate"
            @click="changeArticle"
            :active-id="articleData.article.id ?? ''"
            :list="articleData.list"
          >
          </ArticleList>
        </div>
      </Panel>
    </template>
    <template v-slot:footer>
      <div class="footer pb-3">
        <div class="center h-10">
          <Tooltip
            :title="`${settingStore.showToolbar ? $t('collapse') : $t('expand')}(${settingStore.shortcutKeyMap[ShortcutKey.ToggleToolbar]})`"
          >
            <IconFluentChevronLeft20Filled
              @click="settingStore.showToolbar = !settingStore.showToolbar"
              :class="!settingStore.showToolbar && 'down'"
              color="#999"
              class="arrow"
            />
          </Tooltip>
        </div>
        <div class="bottom">
          <div class="flex justify-between items-center gap-2">
            <div class="stat">
              <div class="row">
                <div class="num">{{ currentPractice.length }} {{ $t('times').toLowerCase() }}/{{ msToMinute(total(currentPractice, 'spend')) }}</div>
                <div class="line"></div>
                <div class="name">{{ $t('record') }}</div>
              </div>
              <div class="row">
                
                <div class="num">{{ Math.floor(statStore.spend / 1000 / 60) }} {{ $t('minutes') }}</div>
                <div class="line"></div>
                <div class="name">{{ $t('time') }}</div>
              </div>
              <div class="row">
                <div class="num center gap-1">
                  {{ statStore.total }}
                  <Tooltip>
                    <IconFluentQuestionCircle20Regular width="18" />
                    <template #reference>
                      <div>
                        {{ $t('stat_words_count_tooltip_1', { op: settingStore.ignoreSimpleWord ? $t('not_include') : $t('include') }) }}
                        <div>{{ $t('stat_words_count_tooltip_2') }}</div>
                      </div>
                    </template>
                  </Tooltip>
                </div>
                <div class="line"></div>
                <div class="name">{{ $t('total_words') }}</div>
              </div>
            </div>
            <ArticleAudio
              ref="audioRef"
              :article="articleData.article"
              @update-speed="handleSpeedUpdate"
              @update-volume="handleVolumeUpdate"
            ></ArticleAudio>
            <div class="flex flex-col items-center justify-center gap-1">
              <div class="flex gap-2 center">
                <SettingDialog type="article" />

                <BaseIcon :title="`${$t('next_sentence')}(${settingStore.shortcutKeyMap[ShortcutKey.Next]})`" @click="skip">
                  <IconFluentArrowBounce20Regular class="transform-rotate-180" />
                </BaseIcon>
                <BaseIcon
                  :title="`${$t('play_current_sentence')}(${settingStore.shortcutKeyMap[ShortcutKey.PlayWordPronunciation]})`"
                  @click="play"
                >
                  <IconFluentReplay20Regular />
                </BaseIcon>
                <BaseIcon
                  @click="settingStore.dictation = !settingStore.dictation"
                  :title="`${$t('toggle_dictation_mode')}(${settingStore.shortcutKeyMap[ShortcutKey.ToggleDictation]})`"
                >
                  <IconFluentEyeOff16Regular v-if="settingStore.dictation" />
                  <IconFluentEye16Regular v-else />
                </BaseIcon>

                <BaseIcon
                  :title="`${$t('toggle_translation')}(${settingStore.shortcutKeyMap[ShortcutKey.ToggleShowTranslate]})`"
                  @click="settingStore.translate = !settingStore.translate"
                >
                  <IconPhTranslate v-if="settingStore.translate" />
                  <IconFluentTranslateOff16Regular v-else />
                </BaseIcon>

                <!--              <BaseIcon-->
                
                <!--                  icon="tabler:edit"-->
                <!--                  @click="emitter.emit(ShortcutKey.EditArticle)"-->
                <!--              />-->
                <BaseIcon
                  @click="settingStore.showPanel = !settingStore.showPanel"
                  :title="`${$t('panel')}(${settingStore.shortcutKeyMap[ShortcutKey.TogglePanel]})`"
                >
                  <IconFluentTextListAbcUppercaseLtr20Regular />
                </BaseIcon>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </PracticeLayout>

  <EditSingleArticleModal v-model="showEditArticle" :article="editArticle" @save="saveArticle" />

  <ConflictNotice v-if="showConflictNotice" />
</template>

<style scoped lang="scss">
.footer {
  width: var(--article-toolbar-width);
  @apply bg-primary;

  .bottom {
    @apply relative w-full box-border rounded-lg bg-second shadow-lg z-2;
    padding: 0.5rem var(--space);
    border: 1px solid var(--color-item-border);

    .stat {
      margin-top: 0.5rem;
      display: flex;
      justify-content: space-around;
      gap: var(--stat-gap);

      .row {
        @apply flex flex-col items-center gap-1 text-gray-500;

        .num,
        .name {
          word-break: keep-all;
          padding: 0 0.4rem;
        }

        .line {
          height: 1px;
          width: 100%;
          background: var(--color-sub-gray);
        }
      }
    }
  }

  .arrow {
    cursor: pointer;
    transition: all 0.5s;
    transform: rotate(-90deg);
    padding: 0.5rem;
    font-size: 1.2rem;

    &.down {
      transform: rotate(90deg);
    }
  }
}


@media (max-width: 768px) {

  .practice-article {
    padding-top: 3rem;
  }


  .typing-article {
    header {
      position: fixed;
      top: 4.5rem;
      left: 0;
      right: 0;
      z-index: 100;
      background: var(--bg-color);
      padding: 0.5rem 1rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      margin-bottom: 0;

      .title {
        font-size: 1rem;
        line-height: 1.4;
        word-break: break-word;

        .font-family {
          font-size: 0.9rem;
        }
      }

      .titleTranslate {
        font-size: 0.8rem;
        margin-top: 0.2rem;
        opacity: 0.8;
      }
    }

    .article-content {
      margin-top: 2rem;
    }
  }

  .footer {
    width: 100%;

    .bottom {
      padding: 0.3rem 0.5rem 0.5rem 0.5rem;
      border-radius: 0.4rem;

      .stat {
        margin-top: 0.3rem;
        gap: 0.2rem;
        flex-direction: row;
        overflow-x: auto;

        .row {
          min-width: 3.5rem;
          gap: 0.2rem;

          .num {
            font-size: 0.8rem;
            font-weight: bold;
          }

          .name {
            font-size: 0.7rem;
          }
        }
      }

      .flex.flex-col.items-center.justify-center.gap-1 {
        .flex.gap-2.center {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.4rem;

          .base-icon {
            padding: 0.3rem;
            font-size: 1rem;
            min-height: 44px;
            min-width: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
      }
    }

    .arrow {
      font-size: 1rem;
      padding: 0.3rem;
    }
  }
}
</style>