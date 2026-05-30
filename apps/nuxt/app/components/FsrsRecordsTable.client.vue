<script setup lang="ts">
import { getCurrentInstance, type App } from 'vue'
import VxeUITable from 'vxe-table'
import 'vxe-table/lib/style.css'
import dayjs from 'dayjs'
import { State } from 'ts-fsrs'

export interface FsrsRow {
  word: string
  last_review?: string | Date | null
  due?: string | Date | null
  state: number
  stability?: number
  difficulty?: number
  elapsed_days?: number
  scheduled_days?: number
  learning_steps?: number
  reps?: number
  lapses?: number
  [key: string]: unknown
}

defineProps<{
  rows: FsrsRow[]
}>()


const FSRS_VXE_INSTALLED = '__fsrsVxeTableInstalled' as const

const instance = getCurrentInstance()
if (instance) {
  const app = instance.appContext.app as App & { [FSRS_VXE_INSTALLED]?: boolean }
  if (!app[FSRS_VXE_INSTALLED]) {
    app.use(VxeUITable)
    app[FSRS_VXE_INSTALLED] = true
  }
}

function formatDate(v: string | Date | null | undefined) {
  return v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-'
}

function getStateKey(state: number) {
  const keys = ['fsrs_state_new', 'fsrs_state_learning', 'fsrs_state_review', 'fsrs_state_relearning']
  return keys[state] || ''
}
</script>

<template>
  <div class="flex-1 overflow-hidden h-full">
    <vxe-table
      round
      border
      show-overflow
      show-header-overflow
      show-footer-overflow
      height="auto"
      :data="rows"
      :row-config="{ keyField: 'word', isHover: true }"
      :virtual-y-config="{ enabled: true, gt: 100 }"
      :sort-config="{
        defaultSort: {
          field: 'due',
          order: 'asc',
        },
      }"
    >
      <vxe-column field="word" :title="$t('fsrs_word')" min-width="120" fixed="left" sortable />
      <vxe-column field="last_review" :title="$t('fsrs_last_review')" min-width="160" sortable>
        <template #default="{ row }">
          {{ formatDate(row.last_review as string | Date | null | undefined) }}
        </template>
      </vxe-column>
      <vxe-column field="due" :title="$t('fsrs_due')" min-width="160" sortable>
        <template #default="{ row }">
          {{ formatDate(row.due as string | Date | null | undefined) }}
        </template>
      </vxe-column>
      <vxe-column field="state" :title="$t('fsrs_state')" min-width="100">
        <template #default="{ row }">
          {{ $t(getStateKey(row.state as number)) }}
        </template>
      </vxe-column>
      <vxe-column field="stability" :title="$t('fsrs_stability')" min-width="100" sortable />
      <vxe-column field="difficulty" :title="$t('fsrs_difficulty')" min-width="80" sortable />
      
      <vxe-column field="scheduled_days" :title="$t('fsrs_scheduled_days')" min-width="90" sortable />
      
      <vxe-column field="reps" :title="$t('fsrs_reps')" min-width="90" sortable />
      <vxe-column field="lapses" :title="$t('fsrs_lapses')" min-width="90" sortable />
    </vxe-table>
  </div>
</template>

<style scoped lang="scss">
</style>