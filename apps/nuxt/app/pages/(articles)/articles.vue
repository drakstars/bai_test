<script setup lang="ts">
import { myDictList } from '@typewords/core/apis'
import { BaseButton, BaseIcon, BasePage, DeleteIcon, PopConfirm, Progress, Toast } from '@typewords/base'
import Book from '@typewords/core/components/Book.vue'
import { APP_NAME, AppEnv, DICT_LIST, LIB_JS_URL, Old_Host, Origin, TourConfig } from '@typewords/core/config/env.ts'
import { useBaseStore } from '@typewords/core/stores/base.ts'
import { useRuntimeStore } from '@typewords/core/stores/runtime.ts'
import { useSettingStore } from '@typewords/core/stores/setting.ts'
import { getDefaultDict } from '@typewords/core/types/func.ts'
import type { DictResource } from '@typewords/core/types/types.ts'
import {
  _getDictDataByUrl,
  _nextTick,
  isMobile,
  loadJsLib,
  msToHourMinute,
  resourceWrap,
  total,
  useNav,
} from '@typewords/core/utils'
import { useFetch } from '@vueuse/core'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import isoWeek from 'dayjs/plugin/isoWeek'
import { watch } from 'vue'
import { useRouter } from 'vue-router'
import { DictType } from '@typewords/core/types/enum.ts'
import { usePracticeArticlePersistence } from '@typewords/core/composables/usePracticePersistence.ts'

dayjs.extend(isoWeek)
dayjs.extend(isBetween)

const { t } = useI18n()

useHead({
  title: APP_NAME + ' ' + t('articles'),
})

const { nav } = useNav()
const base = useBaseStore()
const store = useBaseStore()
const settingStore = useSettingStore()
const router = useRouter()
const runtimeStore = useRuntimeStore()
let isSaveData = $ref(false)
const articlePersistence = usePracticeArticlePersistence()

watch(
  [() => store.load, () => runtimeStore.globalLoading],
  ([a, b]) => {
    if (a && !b) {
      init()
    }
  },
  { immediate: true }
)

async function onvisibilitychange() {
  if (!document.hidden) {

    const d = await articlePersistence.load()
    if (d) {
      isSaveData = true
    }
  }
}

onUnmounted(() => {
  document.removeEventListener('visibilitychange', onvisibilitychange)
})

async function init() {
  document.removeEventListener('visibilitychange', onvisibilitychange)
  document.addEventListener('visibilitychange', onvisibilitychange)

  if (AppEnv.CAN_REQUEST) {
    let res = await myDictList({ type: 'article' })
    if (res.success) {
      store.setState(Object.assign(store.$state, res.data))
    }
  }
  if (store.article.studyIndex >= 1) {
    if (!store.sbook.custom && !store.sbook.articles.length) {
      store.article.bookList[store.article.studyIndex] = await _getDictDataByUrl(store.sbook, DictType.article)
    }
  }
  const d = await articlePersistence.load()
  if (d) {
    isSaveData = true
  }
}

watch(
  () => store?.sbook?.id,
  n => {
    if (!n && import.meta.client) {
      _nextTick(async () => {
        const Shepherd = await loadJsLib('Shepherd', LIB_JS_URL.SHEPHERD)
        const tour = new Shepherd.Tour(TourConfig)
        tour.on('cancel', () => {
          localStorage.setItem('tour-guide', '1')
        })
        tour.addStep({
          id: 'step7',
          text: t('tour_step7_text'),
          attachTo: {
            element: '#no-book',
            on: 'bottom',
          },
          buttons: [
            {
              text: t('tour_next_step_7', { total: TourConfig.total }),
              action() {
                tour.next()
                nav('/practice-articles/article_nce2', { guide: 1 })
              },
            },
          ],
        })

        const r = localStorage.getItem('tour-guide')
        if (settingStore.first && !r && !isMobile()) {
          tour.start()
        }
      }, 500)
    }
  },
  { immediate: true }
)

function startStudy() {
  // console.log(store.sbook.articles[1])
  // genArticleSectionData(cloneDeep(store.sbook.articles[1]))
  // return
  if (base.sbook.id) {
    if (!base.sbook.articles.length) {
      return Toast.warning(t('no_articles_to_learn'))
    }
    window.umami?.track('startStudyArticle', {
      name: base.sbook.name,
      custom: base.sbook.custom,
      complete: base.sbook.complete,
      s: `name:${base.sbook.name},index:${base.sbook.lastLearnIndex},title:${base.sbook.articles[base.sbook.lastLearnIndex].title}`,
    })
    nav('/practice-articles/' + store.sbook.id)
  } else {
    window.umami?.track('no-book')
    Toast.warning(t('please_select_book'))
  }
}

let isMultiple = $ref(false)
let selectIds = $ref([])

function handleBatchDel() {
  selectIds.forEach(id => {
    let r = base.article.bookList.findIndex(v => v.id === id)
    if (r !== -1) {
      if (base.article.studyIndex === r) {
        base.article.studyIndex = -1
      }
      if (base.article.studyIndex > r) {
        base.article.studyIndex--
      }
      base.article.bookList.splice(r, 1)
    }
  })
  selectIds = []
  Toast.success(t('delete_success'))
}

function toggleSelect(item) {
  let rIndex = selectIds.findIndex(v => v === item.id)
  if (rIndex > -1) {
    selectIds.splice(rIndex, 1)
  } else {
    selectIds.push(item.id)
  }
}

async function goBookDetail(val: DictResource) {
  runtimeStore.editDict = getDefaultDict(val)
  // nav('book',{id: val.id})
  nav('/book/' + val.id)
}

const totalSpend = $computed(() => {
  if (base.sbook.statistics?.length) {
    return msToHourMinute(total(base.sbook.statistics, 'spend'))
  }
  return 0
})
const todayTotalSpend = $computed(() => {
  if (base.sbook.statistics?.length) {
    return msToHourMinute(
      total(
        base.sbook.statistics.filter(v => dayjs(v.startDate).isSame(dayjs(), 'day')),
        'spend'
      )
    )
  }
  return 0
})

const totalDay = $computed(() => {
  if (base.sbook.statistics?.length) {
    return new Set(base.sbook.statistics.map(v => dayjs(v.startDate).format('YYYY-MM-DD'))).size
  }
  return 0
})

const weekList = $computed(() => {
  const list = Array(7).fill(false)


  const startOfWeek = dayjs().startOf('isoWeek')
  const endOfWeek = dayjs().endOf('isoWeek')

  store.sbook.statistics?.forEach(item => {
    const date = dayjs(item.startDate)
    if (date.isBetween(startOfWeek, endOfWeek, null, '[]')) {
      let idx = date.day()


      if (idx === 0) {
        idx = 6
      } else {
        idx = idx - 1
      }
      list[idx] = true
    }
  })
  return list
})

const { data: recommendBookList, isFetching } = useFetch(resourceWrap(DICT_LIST.ARTICLE.RECOMMENDED)).json()

let isOldHost = $ref(false)
onMounted(() => {
  isOldHost = window.location.host === Old_Host
})
</script>

<template>
  <BasePage>
    <div class="my-30 text-2xl text-red" v-if="isOldHost">
      {{ $t('new_domain_enabled') }}
      <a class="mr-4" :href="`${Origin}/words?from_old_site=1`">{{ Origin }}</a
      >{{ $t('old_domain_discontinue_notice') }}
    </div>

    <div class="card flex flex-col md:flex-row justify-between gap-space p-4 md:p-6">
      <div class="">
        <Book
          v-if="base.sbook.id"
          :is-add="false"
          :quantifier="$t('articles_count')"
          :item="base.sbook"
          :show-progress="false"
          @click="goBookDetail(base.sbook)"
        />
        <Book v-else :is-add="true" @click="router.push('/book-list')" />
      </div>
      <div class="flex-1">
        <div class="flex justify-between items-start">
          <div class="flex items-center min-w-0">
            <div class="title mr-4 truncate">{{ $t('this_week_record') }}</div>
            <div class="flex gap-4 color-gray">
              <div
                class="w-6 h-6 md:w-8 md:h-8 rounded-md center text-sm md:text-base"
                :class="item ? 'bg-[#409eff] color-white' : 'bg-gray-200'"
                v-for="(item, i) in weekList"
                :key="i"
              >
                {{ i + 1 }}
              </div>
            </div>
          </div>
          <div class="flex gap-4 items-center" v-opacity="base.sbook.id">
            <div class="color-link cursor-pointer" @click="router.push('/book-list')">{{ $t('change_book') }}</div>
          </div>
        </div>
        <div class="flex flex-col sm:flex-row gap-3 items-center mt-3 gap-space w-full">
          <div
            class="w-full sm:flex-1 rounded-xl p-4 box-border relative bg-[var(--bg-history)] border border-gray-200"
          >
            <div class="text-[#409eff] text-xl font-bold">{{ todayTotalSpend }}</div>
            <div class="text-gray-500">{{ $t('today_study_time') }}</div>
          </div>
          <div
            class="w-full sm:flex-1 rounded-xl p-4 box-border relative bg-[var(--bg-history)] border border-gray-200"
          >
            <div class="text-[#409eff] text-xl font-bold">{{ totalDay }}</div>
            <div class="text-gray-500">{{ $t('total_study_days') }}</div>
          </div>
          <div
            class="w-full sm:flex-1 rounded-xl p-4 box-border relative bg-[var(--bg-history)] border border-gray-200"
          >
            <div class="text-[#409eff] text-xl font-bold">{{ totalSpend }}</div>
            <div class="text-gray-500">{{ $t('total_study_time') }}</div>
          </div>
        </div>
        <div class="flex gap-3 mt-3">
          <Progress
            class="w-full md:w-auto"
            size="large"
            :percentage="base.currentBookProgress"
            :format="() => `${base.sbook?.lastLearnIndex || 0}/${base.sbook?.length || 0} ${$t('articles_count')}`"
            :show-text="true"
          ></Progress>

          <BaseButton size="large" class="w-full md:w-auto" @click="startStudy" :disabled="!base.sbook.name">
            <div class="flex items-center gap-2 justify-center w-full">
              <span class="line-height-[2]">{{ isSaveData ? $t('continue_learning') : $t('start_learning') }}</span>
              <IconFluentArrowCircleRight16Regular class="text-xl" />
            </div>
          </BaseButton>
        </div>
      </div>
    </div>

    <div class="card flex flex-col">
      <div class="flex justify-between">
        <div class="title">{{ $t('my_books') }}</div>
        <div class="flex gap-4 items-center">
          <PopConfirm :title="$t('confirm_delete_selected')" @confirm="handleBatchDel" v-if="selectIds.length">
            <BaseIcon class="del" :title="$t('delete')">
              <DeleteIcon />
            </BaseIcon>
          </PopConfirm>

          <div
            class="color-link cursor-pointer"
            v-if="base.article.bookList.length > 1"
            @click="
              () => {
                isMultiple = !isMultiple
                selectIds = []
              }
            "
          >
            {{ isMultiple ? $t('cancel') : $t('manage_books') }}
          </div>
          <div class="color-link cursor-pointer" @click="nav('/book', { isAdd: true })">
            {{ $t('create_personal_book') }}
          </div>
        </div>
      </div>
      <div class="flex gap-4 flex-wrap mt-4">
        <Book
          :is-add="false"
          :is-user="true"
          :quantifier="$t('articles_count')"
          :item="item"
          :checked="selectIds.includes(item.id)"
          @check="() => toggleSelect(item)"
          :show-checkbox="isMultiple && j >= 1"
          v-for="(item, j) in base.article.bookList"
          @click="goBookDetail(item)"
        />
        <Book :is-add="true" @click="router.push('/book-list')" />
      </div>
    </div>

    <div class="card flex flex-col min-h-50" v-loading="isFetching">
      <div class="flex justify-between">
        <div class="title">{{ $t('recommend') }}</div>
        <div class="flex gap-4 items-center">
          <div class="color-link cursor-pointer" @click="router.push('/book-list')">{{ $t('more') }}</div>
        </div>
      </div>

      <div class="flex gap-4 flex-wrap mt-4">
        <Book
          :is-add="false"
          :quantifier="$t('articles_count')"
          :item="item as any"
          v-for="(item, j) in recommendBookList"
          @click="goBookDetail(item as any)"
        />
      </div>
    </div>
  </BasePage>
</template>

<style scoped lang="scss">
.stat {
  @apply rounded-xl p-4 box-border relative flex-1 bg-[var(--bg-history)];
  border: 1px solid gainsboro;

  .num {
    @apply color-[#409eff] text-xl font-bold;
  }

  .txt {
    @apply color-gray-500;
  }
}
</style>