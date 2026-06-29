<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <div class="text-4xl mb-2">📝</div>
        <h1 class="text-2xl font-bold text-gray-800">考前突击刷题</h1>
        <p class="text-gray-500 mt-1 text-sm">请输入账号密码登录</p>
      </div>

      <div class="bg-white rounded-xl shadow-lg p-6">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-600 mb-1">账号</label>
          <input v-model="username" type="text" placeholder="请输入账号" @keyup.enter="handleLogin"
            class="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition" />
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-600 mb-1">密码</label>
          <input v-model="password" type="password" placeholder="请输入密码" @keyup.enter="handleLogin"
            class="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition" />
        </div>

        <div v-if="error" class="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">{{ error }}</div>

        <button @click="handleLogin" :disabled="loading"
          class="w-full bg-blue-500 text-white py-2.5 rounded-lg font-medium hover:bg-blue-600 transition active:scale-[0.98] disabled:opacity-50">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </div>

      <p class="text-center text-gray-400 text-xs mt-8">© 2026 考前突击专用</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const router = useRouter()
const auth = useAuthStore()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  if (!username.value.trim() || !password.value.trim()) {
    error.value = '请输入账号和密码'
    return
  }
  loading.value = true
  error.value = ''
  const ok = await auth.login(username.value.trim(), password.value)
  loading.value = false
  if (ok) {
    router.replace('/')
  } else {
    error.value = '账号或密码错误'
  }
}
</script>
