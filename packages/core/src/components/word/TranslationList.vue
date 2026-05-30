<script setup lang="ts">
import { Word } from '../../types'
import { computed } from 'vue'
import SentenceHightLightWord from './SentenceHightLightWord.vue'

const props = withDefaults(
  defineProps<{
    word: Word
    showFull: boolean
    posSpace?: boolean
  }>(),
  {
    posSpace: true,
  }
)

const posList = computed<{ pos: string; totalFreq?: number; trans: { pos: string; cn: string; frequency?: number }[] }[]>(() => {
    const trans = props.word.trans
    let posMap = new Map<string, { pos: string; cn: string; frequency?: number }[]>()
    trans.forEach(item => {
      if (!posMap.has(item.pos)) {
        posMap.set(item.pos, [])
      }
      posMap.get(item.pos)?.push(item)
    })
    let list = Array.from(posMap, ([pos, trans]) => ({ pos: pos, trans: trans, totalFreq: 0 }));
    list.forEach(pos => {
      let totalFreq = 0;
      pos.trans = pos.trans.sort((a, b) => b.frequency - a.frequency);
      pos.trans.forEach((tran, _) => {
        if (tran.frequency) {
          totalFreq += tran.frequency
        }
      });
      pos.totalFreq = totalFreq;
    })
    list = list.sort((a, b) => b.totalFreq - a.totalFreq)
    return list;
  }
)
</script>
<template>
  <div>
    <div class="flex" v-for="pos in posList">
      <div class="shrink-0 pos" :class="posSpace && (pos.pos ? 'min-w-12' : '-ml-3')">
        {{ pos.pos }}&nbsp;
      </div>
      <div class="flex gap-3 flex-wrap items-end">
        <span v-for="tran in pos.trans">
          <span v-if="tran.frequency != undefined" :class="['rare', 'uncommon', 'common'][tran.frequency]">{{
            tran.cn
          }}</span>
          <SentenceHightLightWord
            v-else
            :text="tran.cn"
            :word="word.word"
            :dictation="!props.showFull"
            :high-light="false"
          />
        </span>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.rare {
  opacity: 0.6;
  font-weight: 100;
}

.uncommon {
  opacity: 0.8;
  font-weight: 300;
}

.common {
  opacity: 1;
  font-weight: 500;
}
</style>