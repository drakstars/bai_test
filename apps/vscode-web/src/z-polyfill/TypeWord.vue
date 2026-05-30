<script setup lang="ts">
import type { Question, Word } from '@typewords/core/types/types.ts'
import { useSettingStore } from '@typewords/core/stores/setting.ts'
import { useBaseStore } from '@typewords/core/stores/base.ts'
import {
  usePlayBeep,
  usePlayCorrect,
  usePlayKeyboardAudio,
  usePlayWordAudio,
  useTTsPlayAudio,
} from '@typewords/core/hooks/sound.ts'
import { emitter, EventKey, useEvents, useEventsByWatch } from '@typewords/core/utils/eventBus.ts'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import SentenceHightLightWord from '@typewords/core/components/word/SentenceHightLightWord.vue'
import { getDefaultWord } from '@typewords/core/types/func.ts'
import { _nextTick, last } from '@typewords/core/utils'
import { BaseButton, Toast, Tooltip, VolumeIcon } from '@typewords/base'
import Space from '@typewords/core/components/article/Space.vue'
import { IdentifyMethod, ShortcutKey, WordPracticeType } from '@typewords/core/types/enum.ts'
import { useI18n } from 'vue-i18n'
import { useWordOptions } from '@typewords/core/hooks/dict.ts'
import HoverReveal from '@/z-polyfill/HoverReveal.vue'

const { t: $t } = useI18n()

interface IProps {
  word: Word
  question?: Question
}

const props = withDefaults(defineProps<IProps>(), {
  word: () => getDefaultWord(),
})

const emit = defineEmits<{
  complete: []
  wrong: []
  know: []
  mastered: []
  skip: []
  toggleSimple: []
}>()

let input = $ref('')
let wrong = $ref('')
let showFullWord = $ref(false)

let wrongTimes = ref(0)

let inputLock = false
let wordRepeatCount = 0

let wordCompletedTime = 0
let jumpTimer: ReturnType<typeof setTimeout> | null = null
let cursor = $ref({
  top: 0,
  left: 0,
})
const settingStore = useSettingStore()
const store = useBaseStore()

const playBeep = usePlayBeep()
const playCorrect = usePlayCorrect()
const playKeyboardAudio = usePlayKeyboardAudio()
const playWordAudio = usePlayWordAudio()
const ttsPlayAudio = useTTsPlayAudio()
const volumeIconRef: any = $ref()
const sentenceVolumeIconsRefs: any = $ref([])
const typingWordRef = $ref<HTMLDivElement>()
// const volumeTranslateIconRef: any = $ref()

let showAllCandidates = $ref(false)

let displayWord = $computed(() => {
  return props.word.word.slice(input.length + wrong.length)
})
let displaySentence = $computed(() => {
  return props.word.sentences[currentPracticeSentenceIndex].c.slice(input.length + wrong.length)
})

let isSelfAssessment = $computed(() => {
  return (
    settingStore.wordPracticeType === WordPracticeType.Identify &&
    settingStore.identifyMethod === IdentifyMethod.SelfAssessment
  )
})

let isWordTest = $computed(() => {
  return (
    settingStore.wordPracticeType === WordPracticeType.Identify &&
    settingStore.identifyMethod === IdentifyMethod.WordTest
  )
})


function updateCurrentWordInfo() {
  window.__CURRENT_WORD_INFO__ = {
    word: props.word.word,
    input: input,
    inputLock: inputLock,
    containsSpace: props.word.word.includes(' '),
  }
}

watch(() => props.word, reset, { deep: true })

function reset() {
  clearJumpTimer()
  wrong = input = ''
  wordRepeatCount = 0
  showWordResult.value = inputLock = completeSelect = showAllCandidates = false
  currentPracticeSentenceIndex = -1
  wordCompletedTime = 0
  wrongTimes.value = 0
  if (settingStore.wordSound) {
    if (settingStore.wordPracticeType !== WordPracticeType.Dictation) {
      volumeIconRef?.play(400, true)
    }
  }

  updateCurrentWordInfo()
  checkCursorPosition()
}


watch(
  () => input,
  () => {
    updateCurrentWordInfo()
  }
)

onMounted(() => {

  updateCurrentWordInfo()

  emitter.on(EventKey.resetWord, reset)
  emitter.on(EventKey.onTyping, onTyping)
})

onUnmounted(() => {
  clearJumpTimer()
  emitter.off(EventKey.resetWord, reset)
  emitter.off(EventKey.onTyping, onTyping)
})

function clearJumpTimer() {
  if (!jumpTimer) {
    return
  }
  clearTimeout(jumpTimer)
  jumpTimer = null
}

function repeat() {
  setTimeout(() => {
    wrong = input = ''
    wordRepeatCount++
    inputLock = false

    if (settingStore.wordSound) volumeIconRef?.play()
  }, settingStore.waitTimeForChangeWord)
}

let showWordResult = ref(false)
let pressNumber = 0

const right = $computed(() => {
  let target
  if (isTypingSentence()) {
    target = props.word.sentences[currentPracticeSentenceIndex].c
  } else {
    target = props.word.word
  }
  if (settingStore.ignoreCase) {
    return input.toLowerCase() === target.toLowerCase()
  } else {
    return input === target
  }
})

let showNotice = false

function know(e) {
  if (isSelfAssessment) {
    if (!showWordResult.value) {
      inputLock = showWordResult.value = true
      input = props.word.word
      emit('know')
      if (!showNotice) {
        Toast.info($t('know_word_tip'), { duration: 5000 })
        showNotice = true
      }
      return
    }
  }
  onTyping(e)
}

function mastered(e) {
  if (isSelfAssessment) {
    emit('mastered')
    return
  }
  onTyping(e)
}

function unknown(e) {
  if (isSelfAssessment) {
    if (!showWordResult.value) {
      showWordResult.value = true
      typo()
      if (settingStore.wordSound) volumeIconRef?.play()
      return
    }
  }
  onTyping(e)
}

let selectIndex = $ref(-1)
let completeSelect = false
function select(e, index: number) {
  if (completeSelect) return
  if (isWordTest) {
    completeSelect = true
    selectIndex = index
    if (index == props?.question?.correctIndex) {
      input = props.word.word
      playCorrect()
      emit('know')
    } else {
      wrong = props.word.word
      playBeep()
      play()
      emit('wrong')
    }

    if (!showNotice) {
      Toast.info($t('press_space_continue'), { duration: 5000 })
      showNotice = true
    }
    return
  }
  onTyping(e)
}

let currentPracticeSentenceIndex = $ref(-1)

async function onTyping(e: KeyboardEvent) {
  if (isWordTest) {
    if (e.code === 'Space') {
      if (completeSelect) {
        completeTypeWord(false)
      } else {
        select(e, -1)
      }
    }
    return
  }

  // debugger
  let target
  let targetVolumeIcon
  if (isTypingSentence()) {
    target = props.word.sentences[currentPracticeSentenceIndex].c
    targetVolumeIcon = sentenceVolumeIconsRefs[currentPracticeSentenceIndex]
  } else {
    target = props.word.word
    targetVolumeIcon = volumeIconRef
  }

  if (inputLock) {

    if (e.code === 'Space') {

      if (right) {
        clearJumpTimer()

        if (wordCompletedTime && Date.now() - wordCompletedTime < 300) {
          return
        }
        completeTypeWord(false)
        showWordResult.value = inputLock = false
      } else {
        if (showWordResult.value) {

          pressNumber++
          if (pressNumber >= 3) {
            Toast.info($t('press_delete_reinput'), { duration: 2000 })
            pressNumber = 0
          }
        }
      }
    } else {

      if (right) {
        pressNumber++
        if (pressNumber >= 3) {
          Toast.info($t('press_space_continue'), { duration: 2000 })
          pressNumber = 0
        }
      } else {

        showWordResult.value = inputLock = false
        input = wrong = ''
        onTyping(e)
      }
    }
    return
  }
  inputLock = true
  let letter = e.key
  // console.log('letter',letter)

  if (settingStore.wordPracticeType === WordPracticeType.Dictation) {
    if (e.code === 'Space') {


      if (input.length && (input.length >= target.length || !target.includes(' '))) {

        if (input.toLowerCase() === target.toLowerCase()) {

          if (showWordResult.value) {
            return emit('complete')
          } else {

            playCorrect()
            if (settingStore.wordSound) targetVolumeIcon?.play()
          }
        } else {

          playBeep()
          if (settingStore.wordSound) targetVolumeIcon?.play()
          typo()
        }
        showWordResult.value = true
        return
      }
    }

    input += letter
    wrong = ''
    playKeyboardAudio()
    updateCurrentWordInfo()
    inputLock = false
  } else if (settingStore.wordPracticeType === WordPracticeType.Identify && !showWordResult.value) {

    showWordResult.value = true
    typo()
    if (settingStore.wordSound) targetVolumeIcon?.play()
    inputLock = false
    onTyping(e)
  } else {
    let right = false
    if (settingStore.ignoreCase) {
      right = letter.toLowerCase() === target[input.length].toLowerCase()
    } else {
      right = letter === target[input.length]
    }

    if (
      e.shiftKey &&
      (('！' === target[input.length] && e.code === 'Digit1') ||
        ('￥' === target[input.length] && e.code === 'Digit4') ||
        ('…' === target[input.length] && e.code === 'Digit6') ||
        ('（' === target[input.length] && e.code === 'Digit9') ||
        ('—' === target[input.length] && e.code === 'Minus') ||
        ('？' === target[input.length] && e.code === 'Slash') ||
        ('》' === target[input.length] && e.code === 'Period') ||
        ('《' === target[input.length] && e.code === 'Comma') ||
        ('“' === target[input.length] && e.code === 'Quote') ||
        ('”' === target[input.length] && e.code === 'Quote') ||
        ('：' === target[input.length] && e.code === 'Semicolon') ||
        ('）' === target[input.length] && e.code === 'Digit0'))
    ) {
      right = true
      letter = target[input.length]
    }
    if (
      !e.shiftKey &&
      (('、' === target[input.length] && e.code === 'Slash') ||
        ('。' === target[input.length] && e.code === 'Period') ||
        ('，' === target[input.length] && e.code === 'Comma') ||
        ('‘' === target[input.length] && e.code === 'Quote') ||
        ('’' === target[input.length] && e.code === 'Quote') ||
        ('；' === target[input.length] && e.code === 'Semicolon') ||
        ('【' === target[input.length] && e.code === 'BracketLeft') ||
        ('】' === target[input.length] && e.code === 'BracketRight'))
    ) {
      right = true
      letter = target[input.length]
    }
    // console.log('e', e, e.code, e.shiftKey, word[input.length])

    if (right) {
      input += letter
      wrong = ''
      playKeyboardAudio()
    } else {
      typo()
      wrong = letter
      playBeep()
      if (settingStore.wordSound) targetVolumeIcon?.play()
      setTimeout(() => {
        if (settingStore.inputWrongClear && !isTypingSentence()) input = ''
        wrong = ''
      }, 500)
    }

    updateCurrentWordInfo()

    if (input.toLowerCase() === target.toLowerCase()) {
      wordCompletedTime = Date.now()
      playCorrect()
      if (
        [WordPracticeType.Listen, WordPracticeType.Identify].includes(settingStore.wordPracticeType) &&
        !showWordResult.value
      ) {
        showWordResult.value = true
      }
      if ([WordPracticeType.FollowWrite, WordPracticeType.Spell].includes(settingStore.wordPracticeType)) {
        if (settingStore.autoNextWord) {
          completeTypeWord(true)
        }
      }
    } else {
      inputLock = false
    }
  }
}

function shouldRepeat() {
  if (settingStore.wordPracticeType === WordPracticeType.FollowWrite) {
    if (settingStore.repeatCount == 100) {
      return settingStore.repeatCustomCount > wordRepeatCount + 1
    } else {
      return settingStore.repeatCount > wordRepeatCount + 1
    }
  } else {
    return false
  }
}

function isTypingSentence() {
  return currentPracticeSentenceIndex !== -1
}

function completeTypeWord(delay: boolean) {
  if (settingStore.wordPracticeType === WordPracticeType.FollowWrite && settingStore.practiceSentence) {
    currentPracticeSentenceIndex++
    if (currentPracticeSentenceIndex < props.word.sentences.length) {

      inputLock = false
      wrong = input = ''
      return
    }
  }
  if (shouldRepeat()) {
    repeat()
  } else {
    if (delay) {
      clearJumpTimer()
      jumpTimer = setTimeout(() => emit('complete'), settingStore.waitTimeForChangeWord)
    } else {
      emit('complete')
    }
  }
}

function del() {
  playKeyboardAudio()
  inputLock = false
  if (showWordResult.value) {
    input = ''
    showWordResult.value = false

    if (settingStore.wordPracticeType === WordPracticeType.Identify) {
      typo()
      if (settingStore.wordSound) volumeIconRef?.play()
    }
  } else {
    if (wrong) {
      wrong = ''
    } else {
      input = input.slice(0, -1)
    }
  }

  updateCurrentWordInfo()
}

function showWord() {
  if (settingStore.allowWordTip) {

    if (settingStore.wordPracticeType !== WordPracticeType.FollowWrite || settingStore.dictation) {
      typo()
    }
    if (
      settingStore.wordPracticeType === WordPracticeType.Identify &&
      settingStore.identifyMethod === IdentifyMethod.WordTest
    ) {
      showAllCandidates = true
      return
    }
    showFullWord = true
  }
}

function hideWord() {
  showAllCandidates = false
  showFullWord = false
}

function typo() {
  emit('wrong')
  wrongTimes.value++
}

function play() {
  if (settingStore.wordPracticeType === WordPracticeType.Dictation || settingStore.dictation) {
    if (!showWordResult.value && !right) {

      typo()
    }
  }
  volumeIconRef?.play()
}

defineExpose({ del, showWord, hideWord, play, showWordResult, wrongTimes })

function mouseleave() {
  setTimeout(() => {
    showFullWord = false
  }, 50)
}

watch([() => input, () => showFullWord, () => settingStore.dictation], checkCursorPosition)


function checkCursorPosition() {
  _nextTick(() => {
    let cursorOffset
    if (isTypingSentence()) {
      cursorOffset = { top: 0, left: 0 }
    } else {
      cursorOffset = { top: 0, left: -3 }
    }

    const cursorEl = document.querySelector(`.cursor`)
    const inputList = document.querySelectorAll(`.l`)
    if (!typingWordRef || !cursorEl) return
    const typingWordRect = typingWordRef.getBoundingClientRect()

    if (inputList.length) {
      let inputRect = last(Array.from(inputList)).getBoundingClientRect()
      cursor = {
        top: inputRect.top + inputRect.height - cursorEl.clientHeight - typingWordRect.top + cursorOffset.top,
        left: inputRect.right - typingWordRect.left + cursorOffset.left,
      }
    } else {
      const dictation = document.querySelector(`.dictation`)
      let elRect
      if (dictation) {
        elRect = dictation.getBoundingClientRect()
      } else {
        const letter = document.querySelector(`.letter`)
        elRect = letter.getBoundingClientRect()
      }
      cursor = {
        top: elRect.top + elRect.height - cursorEl.clientHeight - typingWordRect.top + cursorOffset.top,
        left: elRect.left - typingWordRect.left + cursorOffset.left,
      }
    }
  })
}

useEventsByWatch(
  [
    [ShortcutKey.KnowWord, know],
    [ShortcutKey.UnknownWord, unknown],
    [ShortcutKey.MasteredWord, mastered],
  ],
  () => isSelfAssessment
)

useEventsByWatch(
  [
    [ShortcutKey.ChooseA, e => select(e, 0)],
    [ShortcutKey.ChooseB, e => select(e, 1)],
    [ShortcutKey.ChooseC, e => select(e, 2)],
    [ShortcutKey.ChooseD, e => select(e, 3)],
  ],
  () => isWordTest
)

const notice = $computed(() => {
  let text =
    settingStore.wordPracticeType === WordPracticeType.Identify
      ? '选择后/输入后，按空格键切换下一个'
      : settingStore.wordPracticeType === WordPracticeType.Listen
        ? '输入完成后按空格键切换下一个'
        : showWordResult.value
          ? right
            ? '按空格键切换下一个'
            : $t('press_delete_reinput')
          : '按空格键完成输入'
  return {
    show: [WordPracticeType.Listen, WordPracticeType.Identify, WordPracticeType.Dictation].includes(
      settingStore.wordPracticeType
    ),
    text,
  }
})

const { isWordCollect, toggleWordCollect, isWordSimple, toggleWordSimple } = useWordOptions()

const isSimple = $computed(() => isWordSimple(props.word))
const isCollect = $computed(() => isWordCollect(props.word))
</script>

<template>
  <div class="typing-word" ref="typingWordRef" v-if="word.word.length">
    <div class="flex flex-col">
      <div class="flex gap-space items-end mb-2">
        <Tooltip
          :title="
            settingStore.dictation ? `可以按快捷键 ${settingStore.shortcutKeyMap[ShortcutKey.ShowWord]} 显示单词` : ''
          "
        >
          <div id="word" class="word" :class="wrong && 'is-wrong'" @mouseenter="showWord" @mouseleave="mouseleave">
            <div v-if="settingStore.wordPracticeType === WordPracticeType.Dictation">
              <div
                class="letter w-full inline-block"
                v-opacity="!settingStore.dictation || showWordResult || showFullWord"
              >
                {{ word.word }}
              </div>
              <div class="min-h-8 flex flex-col">
                <div class="w-50 flex-1" :class="showWordResult ? (right ? 'right' : 'wrong') : ''">
                  <template v-for="i in input">
                    <span class="l" v-if="i !== ' '">{{ i }}</span>
                    <Space class="l" v-else :is-wrong="showWordResult ? !right : false" :is-wait="!showWordResult" />
                  </template>
                </div>
                <div class="dictation"></div>
              </div>
            </div>
            <template v-else>
              <span class="input" v-if="input">{{ input }}</span>
              <span class="wrong" v-if="wrong">{{ wrong }}</span>
              <span class="letter" v-if="settingStore.dictation && !showFullWord">
                {{
                  displayWord
                    .split('')
                    .map(v => (v === ' ' ? '&nbsp;' : '_'))
                    .join('')
                }}
              </span>
              <span class="letter" v-else>{{ displayWord }}</span>
            </template>
          </div>
        </Tooltip>
        <HoverReveal class="flex items-end gap-1">
          <div
            class="phonetic"
            :class="
              (settingStore.dictation ||
                [WordPracticeType.Spell, WordPracticeType.Listen, WordPracticeType.Dictation].includes(
                  settingStore.wordPracticeType
                )) &&
              !showFullWord &&
              !showWordResult &&
              'word-shadow'
            "
            v-if="settingStore.soundType === 'uk' && word.phonetic0"
          >
            | {{ word.phonetic0 }}
          </div>
          <div
            class="phonetic"
            :class="
              (settingStore.dictation ||
                [WordPracticeType.Spell, WordPracticeType.Listen, WordPracticeType.Dictation].includes(
                  settingStore.wordPracticeType
                )) &&
              !showFullWord &&
              !showWordResult &&
              'word-shadow'
            "
            v-if="settingStore.soundType === 'us' && word.phonetic1"
          >
            | {{ word.phonetic1 }}
          </div>
          <template v-slot:hover>
            <VolumeIcon
              :title="`发音(${settingStore.shortcutKeyMap[ShortcutKey.PlayWordPronunciation]})`"
              ref="volumeIconRef"
              :simple="true"
              :cb="() => playWordAudio(word.word)"
            />
          </template>
        </HoverReveal>
      </div>

      <div class="mb-2 flex" v-if="settingStore.wordPracticeType === WordPracticeType.Identify && !showWordResult">
        <BaseButton
          :keyboard="`${$t('shortcut')}(${settingStore.shortcutKeyMap[ShortcutKey.KnowWord]})`"
          size="small"
          @click="know"
          >{{ $t('i_know') }}
        </BaseButton>
        <BaseButton
          :keyboard="`${$t('shortcut')}(${settingStore.shortcutKeyMap[ShortcutKey.UnknownWord]})`"
          size="small"
          @click="unknown"
          >{{ $t('i_dont_know') }}
        </BaseButton>
        <BaseButton
          :keyboard="`${$t('shortcut')}(${settingStore.shortcutKeyMap[ShortcutKey.MasteredWord]})`"
          size="small"
          @click="mastered"
          >已掌握
        </BaseButton>
      </div>

      <div class="translate text-base" v-opacity="settingStore.translate || showWordResult || showFullWord">
        <div class="flex" v-for="v in word.trans">
          <span class="shrink-0 mr-1" :class="v.pos ? 'en-article-family' : ''">
            {{ v.pos }}
          </span>
          <span v-if="!settingStore.dictation || showWordResult || showFullWord">{{ v.cn }}</span>
          <SentenceHightLightWord v-else :text="v.cn" :word="word.word" :dictation="true" :high-light="false" />
        </div>
      </div>
    </div>

    <div
      class="other anim"
      v-if="false"
      v-opacity="
        ![WordPracticeType.Listen, WordPracticeType.Dictation, WordPracticeType.Identify].includes(
          settingStore.wordPracticeType
        ) ||
        showFullWord ||
        showWordResult
      "
    >
      <template v-if="word?.sentences?.length">
        <!--        <div class="line-white my-1"></div>-->
        <div class="flex flex-col gap-2 mt-2">
          <div class="sentence" v-for="item in word.sentences">
            <HoverReveal class="text-base flex gap-1">
              <SentenceHightLightWord
                :text="item.c"
                :word="word.word"
                :dictation="!(!settingStore.dictation || showFullWord || showWordResult)"
              />
              <template v-slot:hover>
                <VolumeIcon :title="`发音`" :simple="false" @click="ttsPlayAudio(item.c)" />
              </template>
            </HoverReveal>
            <div class="anim text-sm" v-opacity="settingStore.translate || showFullWord || showWordResult">
              {{ item.cn }}
            </div>
          </div>
        </div>
      </template>

      <template v-if="word?.phrases?.length">
        <div class="line-white my-1"></div>
        <div class="flex-wrap">
          <div class="flex items-center gap-2 mr-2" v-for="item in word.phrases">
            <SentenceHightLightWord
              class="shrink-0"
              :text="item.c"
              :word="word.word"
              :dictation="!(!settingStore.dictation || showFullWord || showWordResult)"
            />
            <span class="anim shrink-0 text-sm" v-opacity="settingStore.translate || showFullWord || showWordResult">
              {{ item.cn }}
            </span>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.dictation {
  border-bottom: 1px solid gray;
}

.typing-word {
  width: 100%;
  flex: 1;
  word-break: break-word;
  position: relative;

  .phonetic, {
    font-size: 1.1rem;
  }

  .phonetic {
    color: var(--color-font-1);
    font-family: var(--word-font-family);
  }

  .word {
    letter-spacing: 0.1rem;
    .input,
    .right {
      color: rgb(22, 163, 74);
    }

    .wrong {
      color: rgba(red, 0.6);
    }

    &.is-wrong {
      animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    }
  }

  .cn {
    @apply text-base;
  }

  .en {
    @apply text-lg;
  }

  .pos {
    font-family: var(--en-article-family);
    @apply text-lg w-12;
  }
}

.line-white {
  border-bottom: 0.5px solid #433f3f;
}
</style>