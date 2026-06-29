<template>
  <div class="min-h-screen flex flex-col">
    <header class="bg-blue-600 text-white px-4 py-3 flex items-center justify-between shadow">
      <router-link to="/" class="text-lg font-bold tracking-wide">📚 考前突击</router-link>
      <div class="flex items-center gap-2">
        <span v-if="auth.user" class="text-xs text-blue-100">{{ auth.user }}</span>
        <router-link to="/wrong" class="text-sm bg-white text-blue-600 px-3 py-1 rounded-full font-medium">错题本</router-link>
      </div>
    </header>
    <main class="flex-1">
      <router-view />
    </main>
    <footer class="text-center text-xs text-gray-400 py-3">© 2026 考前突击专用</footer>

    <!-- 被踢出遮罩 -->
    <div v-if="auth.kickedOut" class="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center animate-bounce-in">
        <div class="text-5xl mb-4">🔒</div>
        <h2 class="text-xl font-bold text-gray-800 mb-2">会话已失效</h2>
        <p class="text-gray-500 mb-6 text-sm leading-relaxed">您的账号已在另一台设备上登录，当前会话已被强制退出。</p>
        <button @click="handleReLogin"
          class="w-full bg-blue-500 text-white py-2.5 rounded-lg font-medium hover:bg-blue-600 transition active:scale-[0.98]">
          重新登录
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth.js'

const router = useRouter()
const auth = useAuthStore()

function handleReLogin() {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
@keyframes bounceIn {
  0% { transform: scale(0.8); opacity: 0; }
  50% { transform: scale(1.03); }
  100% { transform: scale(1); opacity: 1; }
}
.animate-bounce-in { animation: bounceIn 0.3s ease-out; }
</style>
