<script setup lang="ts">
import { BaseIcon, MiniDialog, Option, Select, Switch, VolumeIcon } from '@typewords/base'
import { SoundFileOptions } from '../../config/env.ts'
import { useWindowClick } from '../../hooks/event.ts'
import { getAudioFileUrl, usePlayAudio } from '../../hooks/sound.ts'
import { useSettingStore } from '../../stores/setting.ts'
import { emitter, EventKey } from '../../utils/eventBus'

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
  <div class="setting" @click="eventCheck">
    <BaseIcon @mouseenter="toggle(true)" @mouseleave="toggle(false)">
      <IconClarityVolumeUpLine />
    </BaseIcon>
    <MiniDialog width="18rem" @mouseenter="toggle(true)" @mouseleave="toggle(false)" v-model="show">
      <div class="mini-row-title">Cài đặt âm thanh</div>
      <div class="mini-row">
        <label class="item-title">Tự động phát âm từ</label>
        <div class="wrapper">
          <Switch v-model="settingStore.wordSound" inline-prompt active-text="Bật" inactive-text="Tắt" />
        </div>
      </div>
      <div class="mini-row">
        <label class="item-title">Giọng phát âm</label>
        <div class="wrapper">
          <Select v-model="settingStore.soundType" @toggle="selectToggle" placeholder="Chọn..." size="small">
            <Option label="Mỹ (US)" value="us" />
            <Option label="Anh (UK)" value="uk" />
          </Select>
        </div>
      </div>
      <div class="mini-row">
        <label class="item-title">Tiếng phím</label>
        <div class="wrapper">
          <Switch v-model="settingStore.keyboardSound" inline-prompt active-text="Bật" inactive-text="Tắt" />
        </div>
      </div>
      <div class="mini-row">
        <label class="item-title">Hiệu ứng tiếng phím</label>
        <div class="wrapper">
          <Select v-model="settingStore.keyboardSoundFile" @toggle="selectToggle" placeholder="Chọn..." size="small">
            <Option v-for="item in SoundFileOptions" :key="item.value" :label="item.label" :value="item.value">
              <div class="el-option-row">
                <span>{{ item.label }}</span>
                <VolumeIcon :time="100" @click="usePlayAudio(getAudioFileUrl(item.value)[0])" />
              </div>
            </Option>
          </Select>
        </div>
      </div>
      <div class="mini-row">
        <label class="item-title">Hiệu ứng khác</label>
        <div class="wrapper">
          <Switch v-model="settingStore.effectSound" inline-prompt active-text="Bật" inactive-text="Tắt" />
        </div>
      </div>
    </MiniDialog>
  </div>
</template>

<style scoped lang="scss">
.wrapper {
  width: 50%;
  position: relative;
  text-align: right;
}

.setting {
  position: relative;
}

.el-option-row {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .icon-wrapper {
    transform: translateX(10rem);
  }
}
</style>