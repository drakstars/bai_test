<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import BaseInput from './BaseInput.vue'

interface IProps {
  currentPage?: number
  pageSize?: number
  pageSizes?: number[]
  layout?: string
  total: number
  hideOnSinglePage?: boolean
}

const props = withDefaults(defineProps<IProps>(), {
  currentPage: 1,
  pageSize: 10,
  pageSizes: () => [10, 20, 30, 40, 50, 100],
  layout: 'prev, pager, next',
  hideOnSinglePage: false,
})

const emit = defineEmits<{
  'update:currentPage': [val: number]
  'update:pageSize': [val: number]
  'size-change': [val: number]
  'current-change': [val: number]
}>()

const internalCurrentPage = ref(props.currentPage)
const jumpTarget = $ref('')
const internalPageSize = ref(props.pageSize)


const pageCount = computed(() => {
  return Math.max(1, Math.ceil(props.total / internalPageSize.value))
})


const availablePagerCount = ref(5)


const shouldShow = computed(() => {
  return props.hideOnSinglePage ? pageCount.value > 1 : true
})


function jumpPage(val: number) {
  if (Number(val) > pageCount.value) val = pageCount.value
  if (Number(val) <= 0) val = 1
  internalCurrentPage.value = val
  emit('update:currentPage', Number(val))
  emit('current-change', Number(val))
}

function jumpToTarget() {
  let d = Number(jumpTarget)
  if (d > pageCount.value) {


    let page = Math.floor((d - 1) / internalPageSize.value) + 1
    jumpPage(page)
  } else {
    jumpPage(d)
  }
}


function handleSizeChange(val: number) {
  internalPageSize.value = val
  emit('update:pageSize', val)
  emit('size-change', val)


  calculateAvailablePagerCount()


  const newPageCount = Math.ceil(props.total / val)
  if (internalCurrentPage.value > newPageCount) {
    internalCurrentPage.value = newPageCount
    emit('update:currentPage', newPageCount)
    emit('current-change', newPageCount)
  }
}


function calculateAvailablePagerCount() {

  setTimeout(() => {
    const paginationEl = document.querySelector('.pagination') as HTMLElement
    if (!paginationEl) return

    const containerWidth = paginationEl.offsetWidth
    const buttonWidth = 38
    const availableWidth = containerWidth - 120


    const maxPagers = Math.max(3, Math.floor(availableWidth / buttonWidth) - 2)
    availablePagerCount.value = maxPagers
  }, 0)
}


onMounted(() => {
  window.addEventListener('resize', calculateAvailablePagerCount)

  calculateAvailablePagerCount()
})


onUnmounted(() => {
  window.removeEventListener('resize', calculateAvailablePagerCount)
})


function prev() {
  const newPage = internalCurrentPage.value - 1
  if (newPage >= 1) {
    jumpPage(newPage)
  }
}


function next() {
  const newPage = internalCurrentPage.value + 1
  if (newPage <= pageCount.value) {
    jumpPage(newPage)
  }
}
</script>

<template>
  <div class="pagination" v-if="shouldShow">
    <div class="pagination-container">
      
      <span v-if="layout.includes('total')" class="total text-base"> {{ $t('total') }}{{ total }}{{ $t('total_items') }} </span>
      
      <button class="btn-prev" :disabled="internalCurrentPage <= 1" @click="prev">
        <IconFluentChevronLeft20Filled />
      </button>

      
      <div class="flex items-center">
        <div class="w-12">
          <BaseInput v-model="internalCurrentPage" @enter="jumpPage(internalCurrentPage)" class="text-center" />
        </div>
        <span class="mx-2">/</span>
        <span class="text-base">{{ pageCount }}</span>
      </div>

      
      <button class="btn-next" :disabled="internalCurrentPage >= pageCount" @click="next">
        <IconFluentChevronLeft20Filled class="transform-rotate-180" />
      </button>

      
      <div v-if="layout.includes('sizes')" class="sizes">
        <select :value="internalPageSize" @change="handleSizeChange(Number($event.target.value))">
          <option v-for="item in pageSizes" :key="item" :value="item">{{ item }}{{ $t('items_per_page') }}</option>
        </select>
      </div>

      <div class="flex items-center gap-1 ml-2">
        {{ $t('jump_to') }}
        <div class="w-15">
          <BaseInput :placeholder="$t('page_or_index')" v-model="jumpTarget" @enter="jumpToTarget" class="text-center" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.pagination {
  white-space: normal;
  color: var(--color-main-text);
  font-weight: normal;
  display: flex;
  justify-content: center;
  width: 100%;

  .pagination-container {
    display: flex;
    align-items: center;
    font-size: 0.875rem;
    max-width: 100%;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .btn-prev,
  .btn-next {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    font-size: 1rem;
    min-width: 1.9375rem;
    height: 1.9375rem;
    border-radius: 0.2rem;
    cursor: pointer;
    color: #606266;
    border: none;
    padding: 0 0.375rem;
    margin: 0.25rem 0.25rem;
    background-color: transparent;
    transition: all 0.3s;

    &:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    &:hover:not(:disabled) {
      background-color: var(--color-third);
      color: var(--color-select-bg);
    }
  }

  .sizes {
    border: 1px solid var(--color-input-border);
    border-radius: 0.25rem;
    padding-right: 0.2rem;
    background-color: var(--color-bg);
    overflow: hidden;

    select {
      height: 1.9375rem;
      padding: 0 0.5rem;
      font-size: 0.875rem;
      border: none;
      background-color: transparent;
      color: var(--color-main-text);

      &:focus {
        outline: none;
        border-color: var(--el-color-primary, #409eff);
      }

      &:disabled {
        background-color: #f5f7fa;
        color: #c0c4cc;
        cursor: not-allowed;
      }
    }
  }

  .total {
    color: var(--color-main-text);
  }
}
</style>