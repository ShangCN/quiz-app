<template>
  <div class="min-h-screen flex flex-col">
    <header class="bg-blue-600 text-white px-4 py-3 flex items-center justify-between shadow">
      <router-link to="/" class="text-lg font-bold tracking-wide">📚 考前突击</router-link>
      <router-link to="/wrong" class="text-sm bg-white text-blue-600 px-3 py-1 rounded-full font-medium">错题本</router-link>
    </header>
    <main class="flex-1">
      <router-view />
    </main>
    <footer class="text-center text-xs text-gray-400 py-3">© 2026 考前突击专用</footer>
  </div>
</template>

<script setup>
</script>
