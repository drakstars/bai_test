<script setup lang="ts">
import type { ButtonProps } from './types.ts'
import BaseButton from './BaseButton.vue'
import { computed, useAttrs } from 'vue'


defineOptions({ inheritAttrs: false })

const props = defineProps<ButtonProps & { accept: string }>()
const attrs = useAttrs()

const buttonBind = computed(() => ({
  ...attrs,
  ...props,
}))

type Emits = {
  change: [e: Element]
}
const emit = defineEmits<Emits>()

const onChange = e => {
  emit('change', e)

  if (e && e.target) {
    e.target.value = ''
  }
}
</script>
<template>
  <div class="base-button inline-block relative">
    <BaseButton v-bind="buttonBind"><slot></slot></BaseButton>
    <input
      v-if="!buttonBind.disabled"
      type="file"
      class="absolute left-0 top-0 w-full h-full opacity-0"
      :accept="accept"
      @change="onChange"
    />
  </div>
</template>

<style scoped>
.base-button + .base-button {
  margin-left: 1rem;
}
</style>