<script setup lang="ts">
import { watch } from 'vue'
import { BaseButton, Dialog } from '@typewords/base'
import { useExport } from '../../hooks/export'
import { IS_DEV } from '../../config/env.ts'

const model = defineModel()

const { loading: backupLoading, exportData } = useExport()

let backupTriggered = $ref(false)

watch(model, visible => {
  if (!visible) backupTriggered = false
})

async function onBackup() {
  await exportData('Đã tự động sao lưu dữ liệu', 'TypeWords-backup.zip')
  backupTriggered = true
}
</script>

<template>
  <Dialog v-model="model" title="Sao lưu dữ liệu">
    <div class="flex flex-col gap-3 p-4 w-100">
      <div>
        Trước khi thực hiện bước tiếp theo, vui lòng nhấn nút<span class="text-red font-bold"> Sao lưu dữ liệu </span>để lưu dữ liệu hiện tại, tránh mất dữ liệu do thao tác nhầm
      </div>

      <div class="flex justify-end mt-4">
        <BaseButton :loading="backupLoading" @click="onBackup">Sao lưu dữ liệu</BaseButton>
        <slot :disabled="!backupTriggered && !IS_DEV"></slot>
      </div>
    </div>
  </Dialog>
</template>
