<script setup lang="ts">
import type { Article } from '@typewords/core/types/types.ts'
import { BaseButton, Toast, MiniDialog, UploadButton ,BackIcon} from '@typewords/base'
import { cloneDeep, loadJsLib } from '@typewords/core/utils'

import List from '@typewords/core/components/list/List.vue'
import { useWindowClick } from '@typewords/core/hooks/event.ts'
import { MessageBox } from '@typewords/core/utils/MessageBox.tsx'
import { useRuntimeStore } from '@typewords/core/stores/runtime.ts'
import { nanoid } from 'nanoid'
import EditArticle from '@typewords/core/components/article/EditArticle.vue'
import { getDefaultArticle } from '@typewords/core/types/func.ts'
import { onMounted } from 'vue'
import { LIB_JS_URL } from '@typewords/core/config/env.ts'
import { syncBookInMyStudyList } from '@typewords/core/hooks/article.ts'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const runtimeStore = useRuntimeStore()

let article = $ref<Article>(getDefaultArticle())
let editArticleRef: any = $ref()
let listEl: any = $ref()

async function selectArticle(item: Article) {
  let r = await checkDataChange()
  if (r) {
    article = cloneDeep(item)
  }
}

function checkDataChange() {
  return new Promise(resolve => {
    let editArticle: Article = editArticleRef.getEditArticle()

    if (editArticle.id !== '-1') {
      editArticle.title = editArticle.title.trim()
      editArticle.titleTranslate = editArticle.titleTranslate.trim()
      editArticle.text = editArticle.text.trim()
      editArticle.textTranslate = editArticle.textTranslate.trim()

      if (
        editArticle.title !== article.title ||
        editArticle.titleTranslate !== article.titleTranslate ||
        editArticle.text !== article.text ||
        editArticle.textTranslate !== article.textTranslate
      ) {

        return MessageBox.confirm(
          t('data_changed_save_confirm'),
          t('notice'),
          async () => {
            let r = await editArticleRef.save('save')
            if (r) resolve(true)
          },
          () => resolve(true),
          null,
          {t}
        )
      }
    } else {
      if (editArticle.title.trim() && editArticle.text.trim()) {
        return MessageBox.confirm(
          t('data_changed_save_confirm'),
          t('notice'),
          async () => {
            let r = await editArticleRef.save('save')
            if (r) resolve(true)
          },
          () => resolve(true),
          null,
          {t}
        )
      }
    }
    resolve(true)
  })
}

async function add() {
  let r = await checkDataChange()
  if (r) {
    article = getDefaultArticle()
  }
}

function saveArticle(val: Article): boolean {
  if (val.id) {
    let rIndex = runtimeStore.editDict.articles.findIndex(v => v.id === val.id)
    if (rIndex > -1) {
      runtimeStore.editDict.articles[rIndex] = cloneDeep(val)
    }
  } else {
    let has = runtimeStore.editDict.articles.find((item: Article) => item.title === val.title)
    if (has) {
      Toast.error(t('article_already_exists'))
      return false
    }
    val.id = nanoid(6)
    runtimeStore.editDict.articles.push(val)
    setTimeout(() => {
      listEl.scrollBottom()
    })
  }
  article = cloneDeep(val)

  Toast.success(t('save_success'))
  syncBookInMyStudyList()
  return true
}

function saveAndNext(val: Article) {
  if (saveArticle(val)) {
    add()
  }
}

let showExport = $ref(false)
useWindowClick(() => (showExport = false))

onMounted(() => {
  if (runtimeStore.editDict.articles.length) {
    article = runtimeStore.editDict.articles[0]
  }
})

let exportLoading = $ref(false)
let importLoading = $ref(false)

function importData(e: any) {
  let file = e.target.files[0]
  if (!file) return
  // no()
  let reader = new FileReader()
  reader.onload = async function (s) {
    importLoading = true
    const XLSX = await loadJsLib('XLSX', LIB_JS_URL.XLSX)
    let data = s.target.result
    let workbook = XLSX.read(data, { type: 'binary' })
    let res: any[] = XLSX.utils.sheet_to_json(workbook.Sheets['Sheet1'])
    if (res.length) {
      let articles = res
        .map(v => {
          if (v['原文标题'] && v['原文正文']) {
            return getDefaultArticle({
              id: nanoid(6),
              title: String(v['原文标题']),
              titleTranslate: String(v['译文标题']),
              text: String(v['原文正文']),
              textTranslate: String(v['译文正文']),
              audioSrc: String(v['音频地址']),
            })
          }
        })
        .filter(v => v)

      let repeat = []
      let noRepeat = []
      articles.map((v: any) => {
        let rIndex = runtimeStore.editDict.articles.findIndex(s => s.title === v.title)
        if (rIndex > -1) {
          v.index = rIndex
          repeat.push(v)
        } else {
          noRepeat.push(v)
        }
      })

      runtimeStore.editDict.articles = runtimeStore.editDict.articles.concat(noRepeat)

      if (repeat.length) {
        MessageBox.confirm(
          t('article_exists_overwrite_confirm', { title: repeat.map(v => v.title).join(', ') }),
          t('duplicate_article_detected'),
          () => {
            repeat.map(v => {
              runtimeStore.editDict.articles[v.index] = v
              delete runtimeStore.editDict.articles[v.index]['index']
            })
            setTimeout(listEl?.scrollToBottom, 100)
          },
          null,
          () => {
            e.target.value = ''
            importLoading = false
            syncBookInMyStudyList()
            Toast.success(t('import_success'))
          },
          {t}
        )
      } else {
        syncBookInMyStudyList()
        Toast.success(t('import_success'))
      }
    } else {
      Toast.error(t('import_failed_empty'))
    }
    e.target.value = ''
    importLoading = false
  }
  reader.readAsBinaryString(file)
}

async function exportData(val: { type: string; data?: Article }) {
  exportLoading = true
  const XLSX = await loadJsLib('XLSX', LIB_JS_URL.XLSX)
  const { type, data } = val
  let list = []
  let filename = ''
  if (type === 'item') {
    if (!data.id) {
      return Toast.error(t('please_select_article'))
    }
    list = [data]
    filename = runtimeStore.editDict.name + `-${data.title}`
  } else {
    list = runtimeStore.editDict.articles
    filename = runtimeStore.editDict.name
  }
  let wb = XLSX.utils.book_new()
  let sheetData = list.map(v => {
    return {
      原文标题: v.title,
      原文正文: v.text,
      译文标题: v.titleTranslate,
      译文正文: v.textTranslate,
      音频地址: v.audioSrc,
    }
  })
  wb.Sheets['Sheet1'] = XLSX.utils.json_to_sheet(sheetData)
  wb.SheetNames = ['Sheet1']
  XLSX.writeFile(wb, `${filename}.xlsx`)
  Toast.success(t('export_success', { name: filename }))
  showExport = false
  exportLoading = false
}

function updateList(e) {
  runtimeStore.editDict.articles = e
  syncBookInMyStudyList()
}
</script>

<template>
  <div class="add-article">
    <div class="aslide">
      <header class="flex gap-2 items-center">
        <BackIcon />
        <div class="text-xl">{{ runtimeStore.editDict.name }}</div>
      </header>
      <List
        ref="listEl"
        :list="runtimeStore.editDict.articles"
        @update:list="updateList"
        :select-item="article"
        @del-select-item="article = getDefaultArticle()"
        @select-item="selectArticle"
      >
        <template v-slot="{ item, index }">
          <div>
            <div class="name">
              <span class="text-sm text-gray-500" v-if="index != undefined"> {{ index + 1 }}. </span>
              {{ item.title }}
            </div>
            <div class="translate-name">{{ `   ${item.titleTranslate}` }}</div>
          </div>
        </template>
      </List>
      <div class="add" v-if="!article.title">{{ $t('adding_new_article') }}</div>
      <div class="footer">
        <UploadButton
          @change="importData"
          :loading="importLoading"
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        >
          {{ $t('import') }}
        </UploadButton>
        <div class="export" style="position: relative" @click.stop="null">
          <BaseButton @click="showExport = true">{{ $t('export') }}</BaseButton>
          <MiniDialog v-model="showExport" style="width: 8rem; bottom: calc(100% + 1rem); top: unset">
            <div class="mini-row-title">{{ $t('export_options') }}</div>
            <div class="flex">
              <BaseButton :loading="exportLoading" @click="exportData({ type: 'all' })">{{ $t('all') }}</BaseButton>
              <BaseButton
                :loading="exportLoading"
                :disabled="!article.id"
                @click="exportData({ type: 'item', data: article })"
                >{{ $t('current') }}
              </BaseButton>
            </div>
          </MiniDialog>
        </div>
        <BaseButton @click="add">{{ $t('add') }}</BaseButton>
      </div>
    </div>

    <EditArticle ref="editArticleRef" type="batch" @save="saveArticle" @saveAndNext="saveAndNext" :article="article" />
  </div>
</template>

<style scoped lang="scss">
.add-article {
  width: 100%;
  height: 100vh;
  box-sizing: border-box;
  color: var(--color-font-1);
  display: flex;
  background: var(--color-second);

  .close {
    position: absolute;
    right: 1.2rem;
    top: 1.2rem;
  }

  .aslide {
    width: 14vw;
    height: 100%;
    padding: 0 0.6rem;
    display: flex;
    flex-direction: column;

    $height: 3rem;

    header {
      height: $height;
    }

    .name {
      font-size: 1.1rem;
    }

    .translate-name {
      font-size: 1rem;
    }

    .add {
      width: 100%;
      box-sizing: border-box;
      border-radius: 0.5rem;
      margin-bottom: 0.6rem;
      padding: 0.6rem;
      display: flex;
      justify-content: space-between;
      transition: all 0.3s;
      color: var(--color-font-active-1);
      background: var(--color-select-bg);
    }

    .footer {
      height: $height;
      display: flex;
      gap: 0.6rem;
      align-items: center;
      justify-content: flex-end;

      .import {
        display: inline-flex;
        position: relative;

        input {
          position: absolute;
          height: 100%;
          width: 100%;
          opacity: 0;
        }
      }
    }
  }
}
</style>