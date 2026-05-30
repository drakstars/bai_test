<template>
  <div class="inline-flex w-full relative" :class="[disabled && 'disabled']">
    <textarea
      ref="textareaRef"
      v-model="innerValue"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :rows="rows"
      :disabled="disabled"
      :style="textareaStyle"
      class="w-full px-3 py-2 border border-gray-300 rounded-md outline-none resize-none transition-colors duration-200 box-border"
      @input="handleInput"
    />
    
    <span
      v-if="showWordLimit && maxlength"
      class="absolute bottom-1 right-2 text-xs text-gray-400 select-none"
    >
      {{ innerValue.length }} / {{ maxlength }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue'

const props = defineProps<{
  modelValue: string
  placeholder?: string
  maxlength?: number
  rows?: number
  autosize: boolean | { minRows?: number; maxRows?: number }
  showWordLimit?: boolean
  disabled?: boolean
}>()

const emit = defineEmits(['update:modelValue'])

const innerValue = ref(props.modelValue ?? '')
watch(
  () => props.modelValue,
  v => (innerValue.value = v ?? '')
)

const textareaRef = ref<HTMLTextAreaElement>()


const textareaStyle = computed(() => {
  return props.autosize ? { height: 'auto' } : {}
})


const handleInput = (e: Event) => {
  const val = (e.target as HTMLTextAreaElement).value
  innerValue.value = val
  emit('update:modelValue', val)
  if (props.autosize) nextTick(resizeTextarea)
}


const resizeTextarea = () => {
  if (!textareaRef.value) return
  const el = textareaRef.value
  el.style.height = 'auto'
  let height = el.scrollHeight
  let overflow = 'hidden'

  if (typeof props.autosize === 'object') {
    const { minRows, maxRows } = props.autosize
    const lineHeight = 24
    if (minRows) height = Math.max(height, minRows * lineHeight)
    if (maxRows) {
      const maxHeight = maxRows * lineHeight
      if (height > maxHeight) {
        height = maxHeight
        overflow = 'auto'
      }
    }
  }

  el.style.height = height + 'px'
  el.style.overflowY = overflow
}

watch(
  innerValue,
  () => {
    if (props.autosize) nextTick(resizeTextarea)
  },
  { immediate: true }
)
</script>
<style scoped lang="scss">
.disabled {
  opacity: 0.5;
  textarea {
    cursor: not-allowed !important;
  }
}

textarea {
  font-family: var(--font-family);
  color: var(--color-input-color);
  background: var(--color-input-bg);
  @apply text-base;

  &:focus {
    outline: none;
    border: 1px solid var(--color-select-bg);
  }
}
</style>