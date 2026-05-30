<script setup lang="ts">
import { BaseIcon, MiniDialog } from '@typewords/base'
import { useWindowClick } from '@typewords/core/hooks/event.ts'
import { useSettingStore } from '@typewords/core/stores/setting.ts'
import { emitter, EventKey } from '@typewords/core/utils/eventBus'

const settingStore = useSettingStore()
let timer = 0

let selectIsOpen = false
let show = $ref(false)

useWindowClick(() => {
  if (selectIsOpen) {
    selectIsOpen = false
  } else {
    show = false
  }
})

function toggle(val: boolean) {
  if (selectIsOpen) return
  clearTimeout(timer)
  if (val) {
    emitter.emit(EventKey.closeOther)
    show = val
  } else {
    timer = setTimeout(() => {
      show = val
    }, 100)
  }
}

function selectToggle(e: boolean) {

  setTimeout(() => (selectIsOpen = e))
}

function eventCheck(e) {
  const isSelfOrChild = e.currentTarget.contains(e.target)
  if (isSelfOrChild) {

    if (selectIsOpen) return
    e.stopPropagation()
  }
}
</script>

<template>
  <div class="relative z-999" @click="eventCheck">
    <BaseIcon @click="toggle(true)">
      <IconFluentMoreHorizontal20Regular class="color-gray-600" />
    </BaseIcon>
    <MiniDialog width="14rem" v-model="show">
      <NuxtLink to="/words" class="mini-row">单词</NuxtLink>
      
      <NuxtLink to="/setting" class="mini-row">设置</NuxtLink>
    </MiniDialog>
  </div>
</template>

<style scoped lang="scss">
.mini-row {
  @apply hover:bg-gray-700;
}
</style>