import { APP_VERSION, AppEnv } from '../config/env'
import { debounce } from '../utils'
import { syncSetting } from '../apis'
import { BaseState, SettingState, useBaseStore, useRuntimeStore, useSettingStore, useUserStore } from '../stores'
import { Supabase } from '../utils/supabase'
import { ensureHashGuardBeforeInit, useDataSyncPersistence } from './useDataSyncPersistence'
import { SyncDataType } from '../types'
import { SubscriptionCallbackMutation } from 'pinia'
import { onUnmounted } from 'vue'
// import { startRrwebRecording } from './useRrweb'

let unsub = null
let unsub2 = null

export function useInit() {
  const store = useBaseStore()
  const settingStore = useSettingStore()
  const runtimeStore = useRuntimeStore()
  // const userStore = useUserStore()
  const dataSync = useDataSyncPersistence()
  let initializing = false
  let focus = true
  let fetching = false
  let fetching2 = false
  let restoreFetching = false

  const onvisibilitychange = async () => {
    focus = !document.hidden
    if (focus) {
      try {

        if (restoreFetching) return
        restoreFetching = true
        await dataSync.syncData(
          { [SyncDataType.dict]: null, [SyncDataType.setting]: null },

          { pushWhenLocalNewer: false }
        )
      } finally {
        restoreFetching = false
      }
    }
  }

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', onvisibilitychange)
  })


  async function init() {
    if (initializing) return
    initializing = true
    console.time('init')


    unsub?.()
    unsub2?.()
    document.removeEventListener('visibilitychange', onvisibilitychange)

    await ensureHashGuardBeforeInit()
    // await userStore.init()
    let dictData = await store.init()
    let settingData = await settingStore.init()
    if (dictData && settingData) {
      await dataSync.syncData({
        [SyncDataType.dict]: dictData,
        [SyncDataType.setting]: settingData,
      })
    }
    settingStore.load = true
    store.load = true
    console.timeEnd('init')
    initializing = false


    document.addEventListener('visibilitychange', onvisibilitychange)

    unsub = store.$subscribe(
      debounce(async (mutation, data: BaseState) => {
        if (fetching || !focus || runtimeStore.globalLoading || restoreFetching) return
        if (data._ignoreWatch) {
          data._ignoreWatch = false
          return
        }
        if (mutation.type === 'direct' && mutation.events?.key === '_ignoreWatch') {
          return
        }
        console.log('store.$subscribe', mutation, data, data._ignoreWatch)
        fetching = true
        try {
          await dataSync.saveDictState(data)
        } finally {
          fetching = false
        }
      }, 1000)
    )

    unsub2 = settingStore.$subscribe(
      debounce(async (mutation: SubscriptionCallbackMutation<SettingState>, data: SettingState) => {
        if (fetching2 || !focus || runtimeStore.globalLoading || restoreFetching) return
        console.log('settingStore.$subscribe', mutation, data, data._ignoreWatch)
        if (data._ignoreWatch) {
          data._ignoreWatch = false
          return
        }
        if (mutation.type === 'direct' && mutation.events?.key === '_ignoreWatch') {
          return
        }
        fetching2 = true
        try {
          await dataSync.saveLocalAndSync(SyncDataType.setting, data)
        } finally {
          fetching2 = false
        }
        if (AppEnv.CAN_REQUEST) {
          syncSetting(null, settingStore.$state)
        }
      }, 1000)
    )

    runtimeStore.isNew = APP_VERSION.version > Number(settingStore.webAppVersion)
    runtimeStore.isError = Supabase.getStatus().status === 'error'
    window.umami?.track('host', { host: window.location.host })


    // startRrwebRecording().catch(console.error)
  }

  return init
}