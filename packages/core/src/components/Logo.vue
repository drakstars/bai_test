<script setup lang="ts">
import { useSettingStore } from '../stores/setting.ts'
import { useRouter } from 'vue-router'
import { IS_DEV, APP_NAME } from '../config/env'
import { withAppBaseURL } from '../utils/base-url'

const settingStore = useSettingStore()
const router = useRouter()

function goHome() {
  if (IS_DEV) {
    router.push('/')
  } else {
    location.href = window.atob('aHR0cHM6Ly90eXBld29yZHMuY2M=')
  }
}
</script>

<template>
  <div class="center logo-container" @click="goHome">
    <span class="logo-title">{{ APP_NAME }}</span>
  </div>
</template>

<style scoped lang="scss">
.logo-container {
  padding: 1.2rem 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}
.logo-title {
  font-family: Garamond, Georgia, 'Times New Roman', serif;
  font-style: italic;
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  background: linear-gradient(to right, #bd34fe, #41d1ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  
  &:hover {
    transform: scale(1.06);
    filter: drop-shadow(0 0 8px rgba(189, 52, 254, 0.3));
  }
}
</style>
