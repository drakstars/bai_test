<script setup lang="ts">
import { Toast } from '@typewords/base'
import { Origin } from '../../config/env.ts'
import { set } from 'idb-keyval'
import { defineAsyncComponent } from 'vue'

const Dialog = defineAsyncComponent(() => import('@typewords/base/Dialog'))

const model = defineModel()

const emit = defineEmits<{ ok: [] }>()

async function migrateFromOldSite() {
  return new Promise(async (resolve, reject) => {

    var OLD_ORIGIN = 'https://2study.top'

    var IDB_KEYS = ['type-words-app-version', 'typing-word-dict', 'typing-word-setting', 'typing-word-files']

    var LS_KEYS = ['PracticeSaveWord', 'PracticeSaveArticle']
    const migrateWin = window.open(`${OLD_ORIGIN}/migrate.html`, '_blank', 'width=400,height=400')

    if (!migrateWin) return reject('弹窗被阻止，请在网址输入栏最右边，点击允许弹窗')

    async function onMessage(event) {
      if (event.origin !== OLD_ORIGIN) return
      if (event.data?.type !== 'MIGRATION_RESULT') return
      const payload = event.data.payload
      console.log('payload', payload)


      LS_KEYS.forEach(key => {
        if (payload.localStorage[key] !== undefined) {
          localStorage.setItem(key, payload.localStorage[key])
        }
      })


      for (let key of IDB_KEYS) {
        if (payload.indexedDB[key] !== undefined) {
          await set(key, payload.indexedDB[key])
        }
      }

      window.removeEventListener('message', onMessage)
      resolve(true)
    }

    window.addEventListener('message', onMessage)


    const timer = setInterval(() => {
      if (!migrateWin || migrateWin.closed) {
        clearInterval(timer)
        reject('迁移窗口已关闭')
      } else {
        try {
          migrateWin.postMessage({ type: 'REQUEST_MIGRATION_DATA' }, OLD_ORIGIN)
        } catch (e) {

        }
      }
    }, 100)
  })
}

async function transfer() {
  try {
    await migrateFromOldSite()
    localStorage.setItem('__migrated_from_2study_top__', '1')
    console.log('迁移完成')
    Toast.success('迁移完成')
    model.value = false
    emit('ok')
  } catch (e) {
    Toast.error('迁移失败：' + e)
    console.error('迁移失败', e)
  }
}
</script>

<template>
  <Dialog
    v-model="model"
    :footer="true"
    @ok="transfer"
    :confirmButtonText="$t('migrate_data')"
    :title="$t('migrate_data')"
  >
    <div class="px-4 flex-col center w-100">
      <h2 class="text-align-center text-2xl">
        {{ $t('migrate_new_domain') }} <span class="color-blue">{{ Origin }}</span>
      </h2>
      <h3>
        {{ $t('migrate_old_domain_notice') }}
      </h3>
      <div>如果您不想此时迁移，关闭弹窗后，您可随时在“设置” -> “数据管理” 里面再次进行</div>
    </div>
  </Dialog>
</template>

<style scoped lang="scss"></style>