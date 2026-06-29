<template>
  <div class="p-4 max-w-lg mx-auto">
    <h2 class="text-xl font-bold text-gray-700 mb-4">选择科目</h2>
    <div class="grid gap-3">
      <router-link
        v-for="subject in subjects"
        :key="subject.file"
        :to="`/quiz/${subject.file}`"
        class="block bg-white rounded-xl shadow p-5 hover:shadow-md transition border-l-4"
        :class="subject.border"
      >
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold">{{ subject.emoji }} {{ subject.name }}</span>
          <span class="text-blue-500 text-sm">开始刷题 →</span>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
const subjects = [
  { name: '白', file: 'bai',    emoji: '📖', border: 'border-indigo-400' },
  { name: '董', file: 'dong',   emoji: '📘', border: 'border-blue-400' },
  { name: '马', file: 'ma',     emoji: '📙', border: 'border-orange-400' },
  { name: '候', file: 'hou',    emoji: '📗', border: 'border-green-400' },
  { name: '徐', file: 'xu',     emoji: '📕', border: 'border-red-400' },
]
</script>
