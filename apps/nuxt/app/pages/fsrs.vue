<script setup lang="ts">
import { useBaseStore } from '@typewords/core/stores/base.ts'
import { BaseButton } from '@typewords/base'
import dayjs from 'dayjs'
import isToday from 'dayjs/plugin/isToday' // ES 2015
import utc from 'dayjs/plugin/utc'
import Header from '@typewords/core/components/Header.vue'

dayjs.extend(isToday)
dayjs.extend(utc)

const baseStore = useBaseStore()
let type = $ref('today')


const fsrsList = computed(() => {
  return Object.entries(baseStore.fsrsData)
    .filter(([word, card]) => {
      return type === 'today' ? dayjs.utc(card.last_review).local().isToday() : true
    })
    .map(([word, card]: [string, any]) => ({
      word,
      ...card,
    }))
  // .sort((a, b) => dayjs.utc(b.due).valueOf() - dayjs.utc(a.due).valueOf())
})
</script>

<template>
  <div class="p-4 box-border h-screen flex flex-col">
    <Header :title="$t('learning_record')" />
    <div class="flex justify-end items-center mb-4">
      <span class="mr-4">{{ $t('fsrs_total_records', { count: fsrsList.length }) }}</span>
      <BaseButton :type="type === 'today' ? 'primary' : 'info'" @click="type = 'today'">{{ $t('fsrs_today_study') }}</BaseButton>
      <BaseButton :type="type === 'all' ? 'primary' : 'info'" @click="type = 'all'">{{ $t('fsrs_all_records') }}</BaseButton>
    </div>

    <FsrsRecordsTable :rows="fsrsList" />
  </div>
</template>

<style scoped lang="scss"></style>