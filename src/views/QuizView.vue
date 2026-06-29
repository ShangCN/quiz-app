<template>
  <div class="max-w-lg mx-auto p-4">
    <!-- loading -->
    <div v-if="loading" class="text-center py-20 text-gray-400">加载题库中...</div>

    <!-- 题目 -->
    <div v-else-if="currentQuestion" class="bg-white rounded-xl shadow p-5">
      <!-- 进度 -->
      <div class="flex justify-between items-center mb-3 text-sm text-gray-500">
        <span>
          <router-link to="/" class="text-blue-500">← 科目</router-link>
        </span>
        <span>{{ index + 1 }} / {{ questions.length }}</span>
        <span class="px-2 py-0.5 rounded text-xs" :class="typeTagClass">
          {{ currentQuestion.type }}
        </span>
      </div>

      <!-- 题干 -->
      <div class="text-base font-medium text-gray-800 mb-4 leading-relaxed">
        {{ currentQuestion.stem }}
      </div>

      <!-- 进度条 -->
      <div class="w-full bg-gray-200 rounded-full h-1.5 mb-4">
        <div
          class="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
          :style="{ width: ((index + 1) / questions.length) * 100 + '%' }"
        ></div>
      </div>

      <!-- ====== 客观题 ====== -->
      <div v-if="currentQuestion.type !== '简答题'">
        <div
          v-for="(opt, oi) in currentQuestion.options"
          :key="oi"
          @click="!answered ? pickOption(opt) : null"
          class="block w-full text-left p-3 rounded-lg mb-2 border-2 transition cursor-pointer select-none"
          :class="optionClass(opt)"
        >
          <span class="font-bold mr-2">{{ labels[oi] }}.</span>{{ opt }}
        </div>
        <!-- 解析 -->
        <div v-if="answered" class="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
          <strong>解析：</strong>{{ currentQuestion.explanation || '暂无解析' }}
        </div>
      </div>

      <!-- ====== 简答题 ====== -->
      <div v-else>
        <textarea
          v-model="userInput"
          :disabled="subjectiveJudged"
          placeholder="请输入你的答案..."
          rows="4"
          class="w-full border-2 border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-400 resize-none"
        ></textarea>
        <button
          v-if="!subjectiveJudged"
          @click="judgeSubjective"
          :disabled="!userInput.trim()"
          class="mt-3 w-full bg-blue-500 text-white py-2 rounded-lg font-medium disabled:opacity-40 hover:bg-blue-600 transition"
        >
          判分
        </button>
        <!-- 判分结果 -->
        <div v-if="subjectiveJudged" class="mt-4">
          <div
            class="p-3 rounded-lg text-sm font-medium"
            :class="subjectiveCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'"
          >
            {{ subjectiveCorrect ? '✅ 正确' : '❌ 错误' }}
            <span class="font-normal ml-2">相似度：{{ (similarityScore * 100).toFixed(1) }}%</span>
          </div>
          <div class="mt-3 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
            <strong>参考答案：</strong>{{ currentQuestion.answer }}
          </div>
          <div v-if="currentQuestion.explanation" class="mt-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
            <strong>解析：</strong>{{ currentQuestion.explanation }}
          </div>
        </div>
      </div>

      <!-- 下一题 -->
      <button
        v-if="(currentQuestion.type !== '简答题' && answered) || (currentQuestion.type === '简答题' && subjectiveJudged)"
        @click="nextQuestion"
        class="mt-5 w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition"
      >
        {{ index + 1 < questions.length ? '下一题' : '完成刷题' }}
      </button>
    </div>

    <!-- 完成 -->
    <div v-else class="text-center py-20">
      <div class="text-5xl mb-4">🎉</div>
      <p class="text-lg text-gray-700 mb-2">已完成 {{ subjectName }}</p>
      <p class="text-gray-500 mb-4">
        正确 {{ correctCount }} / {{ questions.length }}
        （{{ questions.length > 0 ? ((correctCount / questions.length) * 100).toFixed(0) : 0 }}%）
      </p>
      <router-link to="/" class="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg">返回首页</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useWrongBookStore } from '../stores/wrongBook.js'

const props = defineProps({ subject: String })
const route = useRoute()
const wrongBook = useWrongBookStore()

const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

const subjectName = computed(() => {
  const map = { bai: '白', dong: '董', ma: '马', hou: '候', xu: '徐' }
  return map[props.subject] || props.subject
})

// 题库
const questions = ref([])
const loading = ref(true)
const index = ref(0)
const answered = ref(false)
const pickedOption = ref('')
const correctCount = ref(0)

// 简答
const userInput = ref('')
const subjectiveJudged = ref(false)
const subjectiveCorrect = ref(false)
const similarityScore = ref(0)

const currentQuestion = computed(() => {
  if (index.value < questions.value.length) {
    return questions.value[index.value]
  }
  return null
})

const typeTagClass = computed(() => {
  const t = currentQuestion.value?.type
  if (t === '简答题') return 'bg-purple-100 text-purple-600'
  return 'bg-green-100 text-green-600'
})

function optionClass(opt) {
  if (!answered.value) return 'border-gray-200 hover:border-blue-300'
  const ans = currentQuestion.value.answer
  if (opt === ans) return 'border-green-400 bg-green-50 text-green-700'
  if (opt === pickedOption.value && opt !== ans) return 'border-red-400 bg-red-50 text-red-700'
  return 'border-gray-200 opacity-50'
}

function pickOption(opt) {
  answered.value = true
  pickedOption.value = opt
  if (opt === currentQuestion.value.answer) {
    correctCount.value++
  } else {
    wrongBook.addWrong(props.subject, currentQuestion.value)
  }
}

function cleanText(str) {
  if (!str) return ''
  // 去除所有标点符号（中英文）、空格、换行，仅保留文字和数字
  return str.replace(/[\s\n\r]+/g, '').replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '')
}

function judgeSubjective() {
  if (!userInput.value.trim()) return
  const userClean = cleanText(userInput.value)
  const answerClean = currentQuestion.value.cleanAnswer || cleanText(currentQuestion.value.answer)

  // 使用 CDN 引入的 string-similarity
  const sim = window.stringSimilarity
    ? window.stringSimilarity.compareTwoStrings(userClean, answerClean)
    : 0

  similarityScore.value = sim
  subjectiveJudged.value = true
  subjectiveCorrect.value = sim >= 0.5

  if (!subjectiveCorrect.value) {
    wrongBook.addWrong(props.subject, currentQuestion.value)
  } else {
    correctCount.value++
  }
}

function nextQuestion() {
  answered.value = false
  pickedOption.value = ''
  userInput.value = ''
  subjectiveJudged.value = false
  subjectiveCorrect.value = false
  similarityScore.value = 0
  index.value++
}

// 动态加载 JSON
async function loadQuestions() {
  try {
    loading.value = true
    const res = await fetch(`./questions/${props.subject}.json`)
    if (!res.ok) throw new Error('Not found')
    questions.value = await res.json()
    // 随机打乱
    questions.value = shuffle(questions.value)
  } catch (e) {
    console.error('加载题库失败:', e)
    questions.value = []
  } finally {
    loading.value = false
  }
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

onMounted(loadQuestions)
// 路由变化时重新加载
watch(() => route.params.subject, loadQuestions)
</script>
