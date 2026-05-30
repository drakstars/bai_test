<!-- src/components/NuxtImg.vue -->
<template>
  <img
    :src="optimizedSrc"
    :alt="alt"
    :loading="loading"
    :width="width"
    :height="height"
  />
</template>

<script setup>
import { defineProps, computed } from 'vue'

const props = defineProps({
  src: { type: String, required: true },
  alt: { type: String, default: '' },
  width: { type: [String, Number], default: 'auto' },
  height: { type: [String, Number], default: 'auto' },
  loading: { type: String, default: 'lazy' }
})


const optimizedSrc = computed(() => {
  return props.src + '?auto=format&fit=crop&w=500&h=500'
})
</script>