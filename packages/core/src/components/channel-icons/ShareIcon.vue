<script setup lang="ts">
import { APP_NAME, LIB_JS_URL, Origin } from '../../config/env.ts'
import { BaseIcon, Progress } from '@typewords/base'
import { usePracticeStore } from '../../stores/practice.ts'
import { useBaseStore } from '../../stores/base.ts'
import { loadJsLib, msToHourMinute } from '../../utils'
import dayjs from 'dayjs'
import { useUserStore } from '../../stores/user.ts'
import { defineAsyncComponent } from 'vue'
import { withAppBaseURL } from '../../utils/base-url'

const Dialog = defineAsyncComponent(() => import('@typewords/base/Dialog'))

const practiceStore = usePracticeStore()
const baseStore = useBaseStore()
const userStore = useUserStore()

let showShareDialog = $ref(false)
let loading1 = $ref(false)
let loading2 = $ref(false)
let posterEl = $ref<HTMLDivElement | null>(null)
let imgIndex = $ref(Math.floor(Math.random() * 10))


const studyStats = $computed(() => {
  return {
    total: practiceStore.total,
    newWords: practiceStore.newWordNumber,
    review: practiceStore.reviewWordNumber,
    wrong: practiceStore.wrong,
    correct: practiceStore.total - practiceStore.wrong,
    time: msToHourMinute(practiceStore.spend),
    date: dayjs().format('DD/MM'),
    dictionary: baseStore.sdict.name || 'Từ điển không xác định',
  }
})


async function copyImageToClipboard() {
  try {
    loading1 = true
    const snapdom = await loadJsLib('snapdom', LIB_JS_URL.SNAPDOM)
    const blob = await snapdom.toBlob(posterEl, { scale: 2, type: 'png' })
    if (!blob) throw new Error('capture failed')

    if (navigator.clipboard && (window as any).ClipboardItem) {
      await navigator.clipboard.write([new (window as any).ClipboardItem({ [blob.type || 'image/png']: blob })])
      Toass.success('Đã sao chép hình ảnh vào clipboard!')
    } else {
      await downloadImage()
    }
  } catch (error) {
    Toass.error('Sao chép thất bại!')
    await downloadImage()
  } finally {
    loading1 = false
  }
}


async function downloadImage() {
  loading2 = true
  const snapdom = await loadJsLib('snapdom', LIB_JS_URL.SNAPDOM)
  snapdom.download(posterEl, { scale: 2 })
  loading2 = false
}


function changeBackground() {
  const newIndex = Math.floor(Math.random() * 9) // 0-8
  imgIndex = newIndex >= imgIndex ? newIndex + 1 : newIndex
}


const studyProgress = $computed(() => {
  if (!baseStore.sdict.length) return 0
  return Math.round((baseStore.sdict.lastLearnIndex / baseStore.sdict.length) * 100)
})

const sentence = $computed(() => {
  let list = [
    { en: 'Actions speak louder than words.', cn: 'Hành động hơn lời nói' },
    { en: 'Keep going, never give up!', cn: 'Kiên trì là chiến thắng' },
    { en: "Where there's a will, there's a way.", cn: 'Có chí thì nên' },
    { en: 'Every cloud has a silver lining.', cn: 'Trong bóng tối luôn có ánh sáng' },
    { en: 'Time heals all wounds.', cn: 'Thời gian chữa lành mọi vết thương' },
    { en: 'Never say die.', cn: 'Không bao giờ bỏ cuộc' },
    { en: 'The best is yet to come.', cn: 'Điều tốt đẹp nhất vẫn chưa đến' },
    { en: "Believe you can and you're halfway there.", cn: 'Tin vào bản thân, bạn đã thành công một nửa' },
    { en: 'No pain, no gain.', cn: 'Không đau khổ, không thành công' },
    { en: 'Dream big and dare to fail.', cn: 'Dám mơ lớn, dám thất bại' },
    { en: 'Home is where the heart is.', cn: 'Nơi nào có trái tim, nơi đó là nhà' },
    { en: 'Knowledge is power.', cn: 'Kiến thức là sức mạnh' },
    { en: 'Practice makes perfect.', cn: 'Luyện tập tạo nên hoàn hảo' },
    { en: 'When in Rome, do as the Romans do.', cn: 'Nhập gia tùy tục' },
    { en: 'Just do it.', cn: 'Cứ làm thôi' },
    { en: 'So far, so good.', cn: 'Cho đến giờ vẫn tốt' },
    { en: 'The early bird catches the worm.', cn: 'Chim dậy sớm bắt được sâu' },
    { en: 'Every day is a new beginning.', cn: 'Mỗi ngày là một khởi đầu mới' },
    { en: 'Success is a journey, not a destination.', cn: 'Thành công là hành trình, không phải đích đến' },
    { en: 'Your only limit is your mind.', cn: 'Giới hạn duy nhất của bạn là tư duy' },
    { en: 'A friend in need is a friend indeed.', cn: 'Hoạn nạn mới biết bạn hiền' },
    { en: 'Silence is golden.', cn: 'Im lặng là vàng' },
    { en: 'Let bygones be bygones.', cn: 'Hãy để quá khứ qua đi' },
    { en: 'Keep calm and carry on.', cn: 'Bình tĩnh và tiếp tục' },
    { en: 'Live and learn.', cn: 'Sống đến già, học đến già' },
    { en: 'Mistakes are proof that you are trying.', cn: 'Sai lầm chứng minh bạn đang cố gắng' },
    { en: 'Better late than never.', cn: 'Muộn còn hơn không' },
    { en: 'Be the change you wish to see in the world.', cn: 'Hãy là sự thay đổi bạn muốn thấy' },
    { en: 'The journey of a thousand miles begins with a single step.', cn: 'Nghìn dặm bắt đầu từ một bước chân' },
    { en: 'When one door closes, another opens.', cn: 'Khi cánh cửa này đóng, cánh cửa khác sẽ mở' },
  ]
  return list[Math.floor(Math.random() * list.length)]
})
</script>

<template>
  
  <BaseIcon @click="showShareDialog = true" class="bounce">
    <IconFluentShare20Regular class="text-blue-500 hover:text-blue-600" />
  </BaseIcon>

  
  <Dialog v-model="showShareDialog" title="Chia sẻ">
    <div class="flex min-w-160 max-w-200 p-6 pt-0 gap-space">
      
      <div ref="posterEl" class="flex-1 border-r border-gray-200 bg-gray-100 rounded-xl overflow-hidden relative">
        <div class="flex p-5 gap-space flex-col justify-between relative z-2 color-white h-full box-border">
          <div class="flex flex-col flex-1 space-y-3">
            
            <div class="flex items-center">
              <div
                v-if="userStore.user?.username"
                class="w-12 h-12 bg-gray-600 rounded-full mr-3 flex items-center justify-center"
              >
                <IconSimpleIconsGithub class="w-6 h-6 text-white" />
              </div>
              <div>
                <div class="font-semibold text-lg">{{ userStore.user?.username }}</div>
                <div class="">{{ dayjs().format('DD/MM/YYYY') }}</div>
              </div>
              <div class="ml-auto text-xs">Quiz Words | Học tiếng Anh</div>
            </div>

            <div class="bg-gray-900/30 py-4 center flex-col rounded-2xl">
              <div class="text-center mb-2 text-xl">Đã học {{ studyStats.time }} {{ baseStore.sdict.name }}</div>
              <!-- Progress Overview -->
              <div class="w-90/100 flex items-center gap-space">
                <div class="shrink-0">Tiến độ</div>
                <Progress :percentage="studyProgress" size="normal" />
              </div>
            </div>

            
            <div class="grid grid-cols-3 gap-4">
              <div class="stat-card">
                <div class="text-2xl font-bold">{{ studyStats.newWords }}</div>
                <div class="text-base">Từ mới</div>
              </div>
              <div class="stat-card">
                <div class="text-2xl font-bold">{{ studyStats.review }}</div>
                <div class="text-base">Ôn tập</div>
              </div>
              <div class="stat-card">
                <div class="text-2xl font-bold">{{ studyStats.wrong }}</div>
                <div class="text-base">Sai</div>
              </div>
            </div>

            
            <div class="bg-gray-900/30 py-4 rounded-2xl center flex-col flex-1 p-4">
              <div class="text-3xl text-center italic mb-2 en-article-family">{{ sentence.en }}</div>
              <div class="text-base italic">{{ sentence.cn }}</div>
            </div>
          </div>

          
          <div class="bg-gray-900/30 py-4 rounded-2xl p-4">
            <div class="flex justify-between items-end">
              <div class="space-y-2">
              <div class="font-bold text-2xl">Quiz Words</div>
              <div class="text-base">{{ Origin }}</div>
              <div class="text-xs">Mỗi lần gõ, một bước tiến, công cụ học từ mã nguồn mở</div>
            </div>
              <img :src="withAppBaseURL('/imgs/share/qr.png')" class="w-20 w-20 rounded-md overflow-hidden" alt="" />
            </div>
          </div>
        </div>

        <img
          :src="withAppBaseURL(`/imgs/share/bg/${imgIndex}.jpg`)"
          class="w-full object-cover object-center absolute top-0"
          alt=""
        />
      </div>

      
      <div class="flex-1 pt-0">
        <div class="">
          <div class="text-2xl font-bold mb-4 flex items-center">
            <span class="mr-2">🎯</span>
            Chia sẻ tiến bộ của bạn
          </div>
          <div class="flex items-start">
            <span class="mr-2">🚀</span>
            Với {{ APP_NAME }}, học tiếng Anh cũng có thể trở nên thật sành điệu!
          </div>
          <div class="flex items-start">
            <span class="mr-2">📸</span>
            Hãy chia sẻ hình ảnh học tập của bạn và trở thành ngôi sao tiếng Anh! 😎
          </div>
          <div class="flex items-start">
            <span class="mr-2">💪</span>
            Đây không chỉ là điểm danh, mà còn là sân khấu để bạn thể hiện tiếng Anh!
          </div>
          <div class="flex items-start">
            <span class="mr-2">🔥</span>
            Chia sẻ kết quả học tập, nhận được like và sự công nhận từ bạn bè!
          </div>
        </div>

        <div class="space-y-4 mt-24">
          
          <div
            @click="changeBackground"
            class="flex items-center justify-start gap-space color-black px-6 py-3 bg-gray-200 rounded-lg cp hover:bg-gray-300 transition-all duration-200"
          >
            <IconMdiSparkles class="w-4 h-4 text-yellow-500" />
            Đổi hình nền
          </div>

          
          <div
            @click="copyImageToClipboard"
            class="flex items-center justify-start gap-space px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white cp rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200"
          >
            <IconEosIconsLoading class="text-xl" v-if="loading1" />
            <IconFluentCopy20Regular class="w-5 h-5" v-else />
            <span class="font-medium">Sao chép vào clipboard</span>
          </div>

          <div
            @click="downloadImage"
            class="flex items-center justify-start gap-space px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white cp rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200"
          >
            <IconEosIconsLoading class="text-xl" v-if="loading2" />
            <IconFluentArrowDownload20Regular class="w-5 h-5" v-else />
            <span class="font-medium">Lưu poster chất lượng cao</span>
          </div>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<style scoped lang="scss">
.stat-card {
  @apply text-center bg-gray-900/30 py-4 rounded-2xl;
}
</style>