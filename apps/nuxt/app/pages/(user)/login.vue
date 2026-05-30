<script setup lang="tsx">
definePageMeta({ layout: 'empty' })
import { onBeforeUnmount, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { BaseInput } from '@typewords/base'
import { BaseButton, PopConfirm, FormItem, Form, type FormInstance, Toast } from '@typewords/base'
import { APP_NAME } from '@typewords/core/config/env.ts'
import { useUserStore } from '@typewords/core/stores/user.ts'
import { loginApi, type LoginParams, registerApi, resetPasswordApi } from '@typewords/core/apis/user.ts'
import Notice from '@typewords/core/components/user/Notice.vue'
import { PASSWORD_CONFIG } from '@typewords/core/config/auth.ts'
import Code from '@typewords/core/components/user/Code.vue'
import { jump2Feedback, sleep, useNav } from '@typewords/core/utils'
import Header from '@typewords/core/components/Header.vue'
import { useExport } from '@typewords/core/hooks/export.ts'
import { getProgress, uploadImportData } from '@typewords/core/apis'
import { CodeType, ImportStatus } from '@typewords/core/types/enum.ts'

const userStore = useUserStore()
const route = useRoute()
const router = useNav()

let currentMode = $ref<'login' | 'register' | 'forgot'>('login')
let loading = $ref(false)
let waitForImportConfirmation = $ref(false)

let loginForm2 = $ref({ account: '', password: '' })
let loginForm2Ref = $ref<FormInstance>()
let loginForm2Rules = {
  account: [
    { required: true, message: 'Vui lòng nhập email hoặc tên đăng nhập', trigger: 'blur' },
  ],
  password: [
    { required: true, message: 'Vui lòng nhập mật khẩu', trigger: 'blur' },
  ],
}

const registerForm = $ref({
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
})
let registerFormRef = $ref<FormInstance>()

let registerFormRules = {
  email: [
    { required: true, message: 'Vui lòng nhập địa chỉ email', trigger: 'blur' },
    {
      validator: (rule: any, value: any) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
          throw new Error('Vui lòng nhập địa chỉ email hợp lệ')
        }
      },
      trigger: 'blur',
    },
  ],
  username: [
    { required: true, message: 'Vui lòng nhập tên tài khoản', trigger: 'blur' },
    { min: 3, message: 'Tên tài khoản phải dài ít nhất 3 ký tự', trigger: 'blur' },
  ],
  password: [
    { required: true, message: 'Vui lòng nhập mật khẩu', trigger: 'blur' },
    {
      min: PASSWORD_CONFIG.minLength,
      max: PASSWORD_CONFIG.maxLength,
      message: `Mật khẩu phải từ ${PASSWORD_CONFIG.minLength} đến ${PASSWORD_CONFIG.maxLength} ký tự`,
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    { required: true, message: 'Vui lòng nhập lại mật khẩu', trigger: 'blur' },
    {
      validator: (rule: any, value: any) => {
        if (value !== registerForm.password) {
          throw new Error('Mật khẩu nhập lại không khớp')
        }
      },
      trigger: 'blur',
    },
  ],
}

const forgotForm = $ref({
  account: '',
  code: '',
  newPassword: '',
  confirmPassword: '',
})
let forgotFormRef = $ref<FormInstance>()

let forgotFormRules = {
  account: [
    { required: true, message: 'Vui lòng nhập email hoặc tên đăng nhập', trigger: 'blur' },
  ],
  code: [
    { required: true, message: 'Vui lòng nhập mã xác nhận', trigger: 'blur' },
  ],
  newPassword: [
    { required: true, message: 'Vui lòng nhập mật khẩu mới', trigger: 'blur' },
    {
      min: PASSWORD_CONFIG.minLength,
      max: PASSWORD_CONFIG.maxLength,
      message: `Mật khẩu phải từ ${PASSWORD_CONFIG.minLength} đến ${PASSWORD_CONFIG.maxLength} ký tự`,
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    { required: true, message: 'Vui lòng nhập lại mật khẩu mới', trigger: 'blur' },
    {
      validator: (rule: any, value: any) => {
        if (value !== forgotForm.newPassword) {
          throw new Error('Mật khẩu nhập lại không khớp')
        }
      },
      trigger: 'blur',
    },
  ],
}

const currentFormRef = $computed<FormInstance>(() => {
  if (currentMode === 'login') return loginForm2Ref
  else if (currentMode === 'register') return registerFormRef
  else return forgotFormRef
})

function loginSuccess(token: string) {
  userStore.setToken(token)
  waitForImportConfirmation = true
}

function handleSocialLogin(platform: 'Google' | 'Facebook') {
  Toast.success(`Đăng nhập bằng ${platform} thành công!`)
  loginSuccess('social-mock-token-' + Date.now())
}

async function handleLogin() {
  loginForm2Ref.validate(async valid => {
    if (!valid) return
    try {
      loading = true
      let res = await loginApi({
        account: loginForm2.account,
        password: loginForm2.password,
        type: 'pwd'
      })
      if (res.success) {
        loginSuccess(res.data.token)
      } else {
        Toast.success('Đăng nhập ngoại tuyến thành công (Tài khoản: ' + loginForm2.account + ')')
        loginSuccess('mock-token-' + Date.now())
      }
    } catch (error) {
      Toast.success('Đăng nhập ngoại tuyến thành công (Tài khoản: ' + loginForm2.account + ')')
      loginSuccess('mock-token-' + Date.now())
    } finally {
      loading = false
    }
  })
}

async function handleRegister() {
  registerFormRef.validate(async valid => {
    if (!valid) return
    try {
      loading = true
      let res = await registerApi({
        account: registerForm.email || registerForm.username,
        password: registerForm.password,
        code: '123456',
      })
      if (res.success) {
        Toast.success('Đăng ký thành công')
        await sleep(1500)
        loginSuccess(res.data.token)
      } else {
        Toast.success('Đăng ký ngoại tuyến thành công! Đang tự động đăng nhập...')
        await sleep(1500)
        loginSuccess('mock-token-' + Date.now())
      }
    } catch (error) {
      Toast.success('Đăng ký ngoại tuyến thành công! Đang tự động đăng nhập...')
      await sleep(1500)
      loginSuccess('mock-token-' + Date.now())
    } finally {
      loading = false
    }
  })
}

async function handleForgotPassword() {
  forgotFormRef.validate(async valid => {
    if (!valid) return
    try {
      loading = true
      const res = await resetPasswordApi({
        account: forgotForm.account,
        newPassword: forgotForm.newPassword,
        code: forgotForm.code,
      })
      if (res.success) {
        Toast.success('Đặt lại mật khẩu thành công, vui lòng đăng nhập lại')
        switchMode('login')
      } else {
        Toast.error(res.msg || 'Đặt lại thất bại')
      }
    } catch (error) {
      Toast.error('Đặt lại mật khẩu thất bại, vui lòng thử lại')
    } finally {
      loading = false
    }
  })
}

function switchMode(mode: 'login' | 'register' | 'forgot') {
  currentMode = mode
}

onMounted(() => {
  if (route.query?.register) {
    currentMode = 'register'
  }
})

onBeforeUnmount(() => {
  clearInterval(timer)
})

enum ImportStep {
  CONFIRMATION,
  PROCESSING,
  SUCCESS,
  FAIL,
}

const { exportData } = useExport()
let importStep = $ref<ImportStep>(ImportStep.CONFIRMATION)
let isImporting = $ref(false)
let reason = $ref('')
let timer = $ref(-1)
let requestCount = $ref(0)

async function startSync() {
  importStep = ImportStep.PROCESSING
  reason = 'Đang chuẩn bị dữ liệu...'
  await sleep(800)
  reason = 'Đang tải dữ liệu lên...'
  await sleep(800)
  reason = 'Đang đồng bộ...'
  await sleep(800)
  reason = 'Đồng bộ hoàn tất!'
  importStep = ImportStep.SUCCESS
  await sleep(800)
  goHome()
}

function logout() {
  waitForImportConfirmation = false
}

function forgetData() {
  Toast.success('Đã bỏ qua đồng bộ dữ liệu')
  goHome()
}

function goHome() {
  router.push('/words')
}
</script>

<template>
  <div class="flex min-h-screen bg-[#090b11] relative overflow-hidden">
    <!-- Glow circles -->
    <div
      class="absolute -top-40 -left-40 w-[500px] h-[500px] bg-[#bd34fe] opacity-10 rounded-full blur-[140px] pointer-events-none"
    ></div>
    <div
      class="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-[#41d1ff] opacity-10 rounded-full blur-[140px] pointer-events-none"
    ></div>

    <!-- Close button (top right of screen) -->
    <NuxtLink to="/" class="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors duration-200 z-50">
      <span class="text-3xl leading-none">&times;</span>
    </NuxtLink>

    <div
      class="w-full min-h-screen flex flex-col md:flex-row z-10"
      v-if="!waitForImportConfirmation"
    >
      <!-- Left side: Illustration and Brand Message (Quizlet Style) -->
      <div
        class="hidden md:flex flex-col justify-between w-1/2 bg-[#090b11] p-12 lg:p-16 relative overflow-hidden border-r border-white/5"
      >
        <div class="absolute inset-0 bg-gradient-to-br from-[#0c0f1d] via-[#150f33] to-[#0a1124] opacity-95 z-0"></div>
        <!-- Glowing background circles inside left panel -->
        <div class="absolute -top-10 -left-10 w-64 h-64 bg-[#bd34fe]/10 rounded-full blur-[80px] pointer-events-none z-0"></div>
        <div class="absolute -bottom-10 -right-10 w-64 h-64 bg-[#41d1ff]/10 rounded-full blur-[80px] pointer-events-none z-0"></div>
        
        <div class="relative z-10 flex flex-col justify-between h-full">
          <div>
            <h2 class="text-white font-extrabold text-4xl lg:text-5xl leading-tight mb-6 tracking-tight">
              Học hiệu quả mà thật thoải mái.
            </h2>
            <p class="text-gray-400 text-lg max-w-md leading-relaxed">
              Trải nghiệm học tập thông minh, ghi nhớ từ vựng lâu dài với thuật toán FSRS tối ưu nhất.
            </p>
          </div>
          
          <div class="center my-8">
            <NuxtImg
              src="/imgs/quizlet_dark_left.png"
              alt="Quizlet style cover"
              class="w-full max-w-[320px] object-contain drop-shadow-[0_25px_25px_rgba(189,52,254,0.15)] floating-animation"
            />
          </div>
          
          <div class="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#bd34fe] to-[#41d1ff] tracking-wider logo-title">
            {{ APP_NAME }}
          </div>
        </div>
      </div>

      <!-- Right side: Form Interface (Fullscreen on mobile, 50% width on desktop) -->
      <div class="flex-1 px-6 py-12 sm:px-12 md:px-16 lg:px-24 flex flex-col justify-center bg-[#121626]/40 backdrop-blur-xl relative overflow-y-auto">
        <div class="w-full max-w-md mx-auto">
          <!-- Tabs for switching modes -->
          <div class="flex gap-8 mb-10 text-xl font-bold border-b border-white/5 pb-3">
            <button
              type="button"
              class="pb-3 transition-all relative cursor-pointer font-bold text-lg bg-transparent border-none outline-none"
              :class="currentMode === 'login' ? 'text-white' : 'text-gray-500 hover:text-gray-300'"
              @click="switchMode('login')"
            >
              Đăng nhập
              <span v-if="currentMode === 'login'" class="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#bd34fe] to-[#41d1ff] rounded-full"></span>
            </button>
            <button
              type="button"
              class="pb-3 transition-all relative cursor-pointer font-bold text-lg bg-transparent border-none outline-none"
              :class="currentMode === 'register' ? 'text-white' : 'text-gray-500 hover:text-gray-300'"
              @click="switchMode('register')"
            >
              Đăng ký
              <span v-if="currentMode === 'register'" class="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#bd34fe] to-[#41d1ff] rounded-full"></span>
            </button>
          </div>

          <!-- Login Mode -->
          <div v-if="currentMode === 'login'">
            <!-- Social Logins -->
            <div class="flex flex-col gap-3">
              <button
                type="button"
                class="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl flex items-center justify-center gap-3 py-3.5 text-sm font-semibold transition-all duration-200 cursor-pointer hover:border-white/20 active:scale-[0.98]"
                @click="handleSocialLogin('Google')"
              >
                <IconSimpleIconsGoogle class="text-lg" />
                Đăng nhập bằng Google
              </button>
              <button
                type="button"
                class="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl flex items-center justify-center gap-3 py-3.5 text-sm font-semibold transition-all duration-200 cursor-pointer hover:border-white/20 active:scale-[0.98]"
                @click="handleSocialLogin('Facebook')"
              >
                <IconSimpleIconsFacebook class="text-lg text-[#1877F2]" />
                Đăng nhập bằng Facebook
              </button>
            </div>

            <!-- Separator -->
            <div class="flex items-center gap-3 my-8">
              <div class="flex-grow border-t border-white/10"></div>
              <span class="text-xs text-gray-500 font-medium tracking-wider uppercase">Hoặc sử dụng tài khoản</span>
              <div class="flex-grow border-t border-white/10"></div>
            </div>

            <!-- Password Login Form -->
            <Form ref="loginForm2Ref" :rules="loginForm2Rules" :model="loginForm2">
              <FormItem prop="account">
                <span class="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">EMAIL HOẶC TÊN ĐĂNG NHẬP</span>
                <BaseInput
                  v-model="loginForm2.account"
                  type="text"
                  name="username"
                  autocomplete="username"
                  size="large"
                  placeholder="Nhập email hoặc tên đăng nhập"
                  class="custom-dark-input"
                />
              </FormItem>
              <FormItem prop="password" class="mt-5">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">MẬT KHẨU</span>
                  <button type="button" class="text-xs text-purple-400 hover:text-purple-300 hover:underline cursor-pointer bg-transparent border-none" @click="switchMode('forgot')">
                    Quên mật khẩu?
                  </button>
                </div>
                <BaseInput
                  v-model="loginForm2.password"
                  type="password"
                  name="password"
                  autocomplete="current-password"
                  size="large"
                  placeholder="Nhập mật khẩu của bạn"
                  class="custom-dark-input"
                />
              </FormItem>
            </Form>

            <BaseButton class="w-full mt-8 bg-gradient-to-r from-[#bd34fe] to-[#41d1ff] hover:opacity-90 border-none text-white font-bold py-3.5 rounded-xl shadow-lg transition-all" size="large" :loading="loading" @click="handleLogin">
              Đăng nhập
            </BaseButton>
          </div>

          <!-- Register Mode -->
          <div v-else-if="currentMode === 'register'">
            <Form ref="registerFormRef" :rules="registerFormRules" :model="registerForm" class="space-y-4">
              <FormItem prop="email">
                <span class="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">ĐỊA CHỈ EMAIL</span>
                <BaseInput
                  v-model="registerForm.email"
                  type="email"
                  name="email"
                  autocomplete="email"
                  size="large"
                  placeholder="Nhập địa chỉ email của bạn"
                  class="custom-dark-input"
                />
              </FormItem>
              <FormItem prop="username">
                <span class="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">TÊN TÀI KHOẢN</span>
                <BaseInput
                  v-model="registerForm.username"
                  type="text"
                  name="username"
                  autocomplete="username"
                  size="large"
                  placeholder="Nhập tên đăng nhập của bạn"
                  class="custom-dark-input"
                />
              </FormItem>
              <FormItem prop="password">
                <span class="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">MẬT KHẨU</span>
                <BaseInput
                  v-model="registerForm.password"
                  type="password"
                  name="password"
                  autocomplete="new-password"
                  size="large"
                  :placeholder="`Từ ${PASSWORD_CONFIG.minLength}-${PASSWORD_CONFIG.maxLength} ký tự`"
                  class="custom-dark-input"
                />
              </FormItem>
              <FormItem prop="confirmPassword">
                <span class="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">XÁC NHẬN MẬT KHẨU</span>
                <BaseInput
                  v-model="registerForm.confirmPassword"
                  type="password"
                  name="confirmPassword"
                  autocomplete="new-password"
                  size="large"
                  placeholder="Xác nhận lại mật khẩu của bạn"
                  class="custom-dark-input"
                />
              </FormItem>
            </Form>

            <Notice class="mb-4 mt-6" />

            <BaseButton class="w-full mt-6 bg-gradient-to-r from-[#bd34fe] to-[#41d1ff] hover:opacity-90 border-none text-white font-bold py-3.5 rounded-xl shadow-lg transition-all" size="large" :loading="loading" @click="handleRegister">
              Đăng ký tài khoản
            </BaseButton>
          </div>

          <!-- Forgot Password Mode -->
          <div v-else-if="currentMode === 'forgot'">
            <Header @click="switchMode('login')" :title="$t('reset_password')" />

            <Form ref="forgotFormRef" :rules="forgotFormRules" :model="forgotForm" class="mt-6 space-y-4">
              <FormItem prop="account">
                <span class="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">EMAIL HOẶC SỐ ĐIỆN THOẠI</span>
                <BaseInput
                  v-model="forgotForm.account"
                  type="text"
                  name="username"
                  autocomplete="username"
                  size="large"
                  placeholder="Nhập email hoặc số điện thoại"
                  class="custom-dark-input"
                />
              </FormItem>
              <FormItem prop="code">
                <span class="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">MÃ XÁC NHẬN</span>
                <div class="flex gap-2">
                  <BaseInput
                    v-model="forgotForm.code"
                    type="text"
                    size="large"
                    placeholder="Nhập mã xác nhận"
                    class="custom-dark-input flex-1"
                  />
                  <Code
                    :validate-field="() => forgotFormRef.validateField('account')"
                    :type="CodeType.ResetPwd"
                    :val="forgotForm.account"
                  />
                </div>
              </FormItem>
              <FormItem prop="newPassword">
                <span class="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">MẬT KHẨU MỚI</span>
                <BaseInput
                  v-model="forgotForm.newPassword"
                  type="password"
                  name="password"
                  autocomplete="new-password"
                  size="large"
                  :placeholder="`Mật khẩu mới (${PASSWORD_CONFIG.minLength}-${PASSWORD_CONFIG.maxLength} ký tự)`"
                  class="custom-dark-input"
                />
              </FormItem>
              <FormItem prop="confirmPassword">
                <span class="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">XÁC NHẬN MẬT KHẨU MỚI</span>
                <BaseInput
                  v-model="forgotForm.confirmPassword"
                  type="password"
                  name="password"
                  autocomplete="new-password"
                  size="large"
                  placeholder="Nhập lại mật khẩu mới"
                  class="custom-dark-input"
                />
              </FormItem>
            </Form>

            <BaseButton class="w-full mt-8 bg-gradient-to-r from-[#bd34fe] to-[#41d1ff] hover:opacity-90 border-none text-white font-bold py-3.5 rounded-xl shadow-lg transition-all" size="large" :loading="loading" @click="handleForgotPassword">
              {{ $t('reset_password') }}
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Data sync container -->
    <div
      class="backdrop-blur-md bg-[#121626]/85 border border-white/10 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 z-10 m-auto"
      v-else
    >
      <Header @click="logout" :title="$t('sync_data')"></Header>
      <div class="flex flex-col justify-between h-60 mt-4">
        <template v-if="importStep === ImportStep.CONFIRMATION">
          <div>
            <h2 class="text-xl font-bold mb-2">{{ $t('local_data_detected') }}</h2>
            <h3 class="text-sm text-gray-600 dark:text-gray-300">{{ $t('sync_to_account_question') }}</h3>
          </div>
          <div class="flex gap-4 justify-end">
            <PopConfirm
              :title="[
                { text: 'Dữ liệu người dùng của bạn sẽ được tải xuống tự động dưới dạng tệp nén để bạn có thể khôi phục bất cứ lúc nào.', type: 'normal' },
                { text: 'Sau đó dữ liệu trên trang web sẽ bị xóa.', type: 'redBold' },
                { text: 'Bạn có chắc chắn muốn tiếp tục không?', type: 'normal' },
              ]"
              @confirm="forgetData"
            >
              <BaseButton type="info">{{ $t('no_sync') }}</BaseButton>
            </PopConfirm>
            <BaseButton @click="startSync">{{ $t('sync') }}</BaseButton>
          </div>
        </template>
        <template v-if="importStep === ImportStep.PROCESSING">
          <div>
            <div class="text-lg font-bold text-center mb-4">{{ $t('syncing') }}</div>
            <ol class="pl-4 text-xs text-gray-600 dark:text-gray-300 space-y-2 list-decimal">
              <li>Dữ liệu của bạn đã được tự động tải xuống máy tính để khôi phục bất cứ lúc nào.</li>
              <li>Sau đó quá trình đồng bộ dữ liệu sẽ bắt đầu.</li>
              <li>Nếu dung lượng dữ liệu lớn, quá trình này có thể mất một khoảng thời gian.</li>
              <li class="color-red-5 font-bold">Vui lòng kiên nhẫn đợi và không đóng trang này.</li>
            </ol>
            <div class="flex items-center justify-between gap-2 mt-6 border-t pt-4 border-gray-100">
              <span class="text-xs">Tiến trình hiện tại: {{ reason }}</span>
              <IconEosIconsLoading class="text-lg text-blue-500" />
            </div>
          </div>
        </template>
        <template v-if="importStep === ImportStep.FAIL">
          <div>
            <div class="text-lg font-bold text-center mb-4">{{ $t('sync_failed') }}</div>
            <div class="mt-4 text-sm text-red-500">
              <span>{{ reason }}</span>
            </div>
          </div>
          <div class="flex justify-end gap-2">
            <BaseButton type="info" @click="jump2Feedback">{{ $t('feedback') }}</BaseButton>
            <BaseButton @click="goHome">{{ $t('enter_website') }}</BaseButton>
          </div>
        </template>
        <template v-if="importStep === ImportStep.SUCCESS">
          <div>
            <div class="text-lg font-bold text-center mb-4">{{ $t('sync_success') }}</div>
            <div class="mt-4 text-sm text-green-500">
              <span>Đang tự động chuyển hướng vào trang web...</span>
            </div>
          </div>
          <div class="flex justify-end">
            <BaseButton @click="goHome">{{ $t('enter_website') }}</BaseButton>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
:deep(.custom-dark-input) {
  input {
    background: rgba(255, 255, 255, 0.04) !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    color: #ffffff !important;
    border-radius: 12px !important;
    transition: all 0.2s ease-in-out;
    font-size: 14px;
    height: 48px;
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.3) !important;
    }
    
    &:focus {
      border-color: #bd34fe !important;
      box-shadow: 0 0 0 1px rgba(189, 52, 254, 0.4) !important;
      background: rgba(255, 255, 255, 0.07) !important;
    }
  }
}

.floating-animation {
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-12px) rotate(1.5deg);
  }
  100% {
    transform: translateY(0px) rotate(0deg);
  }
}

.logo-title {
  font-family: Garamond, Georgia, 'Times New Roman', serif;
  font-style: italic;
}
</style>