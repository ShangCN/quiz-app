<template>
  <div class="max-w-lg mx-auto p-4">
    <h2 class="text-xl font-bold text-gray-700 mb-4">📝 错题本</h2>

    <!-- 按科目分组 -->
    <div v-if="wrongBook.allSubjects.length === 0" class="text-center py-20 text-gray-400">
      暂无错题 🎉
      <div class="mt-4">
        <router-link to="/" class="text-blue-500 underline">去刷题</router-link>
      </div>
    </div>

    <div v-else>
      <!-- 科目 tab -->
      <div class="flex gap-2 mb-4 overflow-x-auto pb-1">
        <button
          v-for="s in wrongBook.allSubjects"
          :key="s"
          @click="activeSubject = s"
          class="px-4 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap"
          :class="activeSubject === s ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'"
        >
          {{ labelMap[s] || s }}（{{ wrongBook.getWrongBySubject(s).length }}）
        </button>
      </div>

      <!-- 错题列表 -->
      <div v-if="activeSubject" class="space-y-3">
        <div v-if="wrongBook.getWrongBySubject(activeSubject).length === 0" class="text-center text-gray-400 py-10">
          该科目暂无错题
        </div>
        <div
          v-for="(q, qi) in wrongBook.getWrongBySubject(activeSubject)"
          :key="qi"
          class="bg-white rounded-xl shadow p-4"
        >
          <div class="flex justify-between items-start mb-2">
            <span class="px-2 py-0.5 rounded text-xs bg-red-100 text-red-600">{{ q.type }}</span>
            <button
              @click="removeAndReload(activeSubject, q.stem)"
              class="text-xs text-gray-400 hover:text-red-500"
            >
              移除
            </button>
          </div>
          <div class="text-sm font-medium text-gray-800 mb-3">{{ q.stem }}</div>
          <!-- 选项 -->
          <div v-if="q.options?.length" class="mb-2">
            <div v-for="(opt, oi) in q.options" :key="oi" class="text-xs text-gray-500">
              {{ 'ABCDEFGH'[oi] }}. {{ opt }}
            </div>
          </div>
          <div class="text-xs p-2 bg-green-50 rounded text-green-700">
            <strong>答案：</strong>{{ q.answer }}
          </div>
          <div v-if="q.explanation" class="text-xs p-2 bg-blue-50 rounded text-blue-700 mt-1">
            <strong>解析：</strong>{{ q.explanation }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useWrongBookStore } from '../stores/wrongBook.js'

const wrongBook = useWrongBookStore()
const activeSubject = ref('')

const labelMap = { bai: '白', dong: '董', ma: '马', hou: '候', xu: '徐' }

// 默认选中第一个有错题的科目
if (wrongBook.allSubjects.length > 0) {
  activeSubject.value = wrongBook.allSubjects[0]
}

function removeAndReload(subject, stem) {
  wrongBook.removeWrong(subject, stem)
  if (wrongBook.getWrongBySubject(subject).length === 0) {
    const remaining = wrongBook.allSubjects
    activeSubject.value = remaining.length > 0 ? remaining[0] : ''
  }
}
</script>
