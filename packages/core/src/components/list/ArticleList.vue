<script setup lang="ts">
import type { Article } from '../../types'
import BaseList from './BaseList.vue'
import { BaseIcon, BaseInput } from '@typewords/base'
import { useArticleOptions } from '../../hooks/dict.ts'

interface IProps {
  list: Article[]
  showTranslate?: boolean
  showDesc?: boolean
}

const props = withDefaults(defineProps<IProps>(), {
  list: () => [] as Article[],
  showTranslate: true,
  showDesc: false,
})

const emit = defineEmits<{
  click: [val: { item: Article; index: number }]
}>()

let searchKey = $ref('')
let localList = $computed(() => {
  if (searchKey) {

    let t = searchKey.toLowerCase()
    let strings = t.split(' ').filter(v => v)
    let res = props.list.filter((item: Article) => {
      return strings.some(value => {
        return item.title.toLowerCase().includes(value) || item.titleTranslate.toLowerCase().includes(value)
      })
    })
    try {
      let d = Number(t)

      if (!isNaN(d)) {
        if (d - 1 < props.list.length) {
          res.push(props.list[d - 1])
        }
      }
    } catch (err) {}
    return res.sort((a: Article, b: Article) => {

      const aMatch = a.title.toLowerCase().includes(t)
      const bMatch = b.title.toLowerCase().includes(t)

      if (aMatch && !bMatch) return -1
      if (!aMatch && bMatch) return 1
      return 0
    })
  } else {
    return props.list
  }
})

const listRef: any = $ref(null as any)

function scrollToBottom() {
  listRef?.scrollToBottom()
}

function scrollToItem(index: number) {
  listRef?.scrollToItem(index)
}
const { isArticleCollect, toggleArticleCollect } = useArticleOptions()

defineExpose({ scrollToBottom, scrollToItem })
</script>

<template>
  <div class="list">
    <div class="search">
      <BaseInput clearable v-model="searchKey">
        <template #subfix>
          <IconFluentSearch24Regular class="text-lg text-gray" />
        </template>
      </BaseInput>
    </div>
    <BaseList ref="listRef" @click="(e: any) => emit('click', e)" :list="localList" v-bind="$attrs">
      <template v-slot="{ item, index, active }">
        <div class="common-list-item" :class="{ active }">
          <div class="left">
            <div class="title-wrapper">
              <div class="item-title">
                <div class="name">
                  <span class="text-sm text-gray-500" v-if="index != undefined && !searchKey">
                    {{ item.id == -1 ? '' : index - (props.showDesc ? 1 : 0) + '.' }}
                  </span>
                  {{ item.title }}
                </div>
              </div>
              <div class="item-sub-title" v-if="item.titleTranslate && showTranslate">
                <div class="item-translate">{{ ` ${item.titleTranslate}` }}</div>
              </div>
            </div>
          </div>
          <div class="right">
            <BaseIcon
              :class="!isArticleCollect(item) ? 'collect' : 'fill'"
              @click.stop="toggleArticleCollect(item)"
              :title="!isArticleCollect(item) ? $t('collect') : $t('uncollect')"
            >
              <IconFluentStar16Regular v-if="!isArticleCollect(item)" />
              <IconFluentStar16Filled v-else />
            </BaseIcon>
            
            <!--              <IconBxVolumeFull class="opacity-100! color-gray" />-->
            <!--            </BaseIcon>-->
          </div>
        </div>
      </template>
    </BaseList>
  </div>
</template>

<style scoped lang="scss">
.list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
  overflow: hidden;

  .search {
    box-sizing: border-box;
    width: 100%;
    padding-right: var(--space);
  }

  .translate {
    font-size: 1rem;
  }
}
</style>