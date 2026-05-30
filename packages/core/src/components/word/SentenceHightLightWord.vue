<script setup lang="ts">
import { computed } from 'vue'

interface IProps {
  text: string
  dictation: boolean
  highLight?: boolean
  word: string
}

const props = withDefaults(defineProps<IProps>(), {
  text: '',
  dictation: false,
  highLight: true,
  word: '',
})


const highlightedText = computed(() => {
  if (!props.text || !props.word) {
    return props.text
  }

  const classNames = [props.highLight ? 'highlight-word' : '', props.dictation ? 'word-shadow' : '']
    .filter(Boolean)
    .join(' ')
  const wrap = (match: string) => `<span class="${classNames}">${match}</span>`


  return getWordRegexes(props.word).reduce((result, regex) => result.replace(regex, wrap), props.text)
})


function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getWordRegexes(word: string): RegExp[] {
  const normalized = word.trim().toLowerCase()
  if (!normalized) {
    return []
  }
  const escaped = escapeRegExp(normalized)
  const patterns = [
    `\\b${escaped}\\b`,
    `\\b${escaped}s\\b`,
    `\\b${escaped}es\\b`,
    `\\b${escaped}ed\\b`,
    `\\b${escaped}ing\\b`,
  ]
  const uniquePatterns = Array.from(new Set(patterns))
  return uniquePatterns.map(pattern => new RegExp(pattern, 'gi'))
}
</script>

<template>
  <span v-html="highlightedText"></span>
</template>

<style scoped lang="scss">
:deep(.highlight-word) {
  color: var(--color-select-bg);
}
</style>