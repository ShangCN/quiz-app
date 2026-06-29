<template>
  <div class="max-w-lg mx-auto p-4">
    <div v-if="loading" class="text-center py-20 text-gray-400">加载题库中...</div>

    <div v-else-if="currentQuestion" class="bg-white rounded-xl shadow p-5">
      <!-- 顶栏 -->
      <div class="flex justify-between items-center mb-3 text-sm text-gray-500">
        <router-link to="/" class="text-blue-500">← 科目</router-link>
        <span class="text-gray-400 text-xs">{{ auth.user }}</span>
        <span>{{ index + 1 }} / {{ questions.length }}</span>
        <span class="px-2 py-0.5 rounded text-xs" :class="typeTagClass">{{ typeLabel }}</span>
      </div>

      <!-- 题干 -->
      <div class="text-base font-medium text-gray-800 mb-4 leading-relaxed">{{ currentQuestion.stem }}</div>

      <!-- 进度条 -->
      <div class="w-full bg-gray-200 rounded-full h-1.5 mb-4">
        <div class="bg-blue-500 h-1.5 rounded-full transition-all duration-300" :style="{ width: ((index + 1) / questions.length) * 100 + '%' }"></div>
      </div>

      <!-- ====== 单选题 single ====== -->
      <div v-if="qtype === 'single'">
        <div
          v-for="(opt, oi) in optList" :key="oi"
          @click="!answered ? pickSingle(oi) : null"
          class="block w-full text-left p-3 rounded-lg mb-2 border-2 transition cursor-pointer select-none"
          :class="singleOptClass(oi)"
        ><span class="font-bold mr-2">{{ labels[oi] }}.</span>{{ stripLabel(opt) }}</div>
        <div v-if="answered" class="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
          <strong>解析：</strong>{{ currentQuestion.explanation || '暂无解析' }}
        </div>
      </div>

      <!-- ====== 判断题 judge ====== -->
      <div v-else-if="qtype === 'judge'">
        <div class="flex gap-3">
          <button
            v-for="ch in ['对','错']" :key="ch"
            @click="!answered ? pickJudge(ch) : null"
            class="flex-1 py-4 rounded-xl border-2 text-lg font-bold transition"
            :class="judgeBtnClass(ch)"
          >{{ ch === '对' ? '✅ 对' : '❌ 错' }}</button>
        </div>
        <div v-if="answered" class="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
          <strong>解析：</strong>{{ currentQuestion.explanation || '暂无解析' }}
        </div>
      </div>

      <!-- ====== 多选题 multi ====== -->
      <div v-else-if="qtype === 'multi'">
        <div
          v-for="(opt, oi) in optList" :key="oi"
          @click="!multiJudged ? toggleMulti(oi) : null"
          class="block w-full text-left p-3 rounded-lg mb-2 border-2 transition cursor-pointer select-none"
          :class="multiOptClass(oi)"
        ><span class="font-bold mr-2">{{ labels[oi] }}.</span>{{ stripLabel(opt) }}</div>
        <button v-if="!multiJudged && multiSelected.length" @click="judgeMulti"
          class="mt-3 w-full bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition">提交</button>
        <div v-if="multiJudged" class="mt-3">
          <div :class="multiCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'" class="p-3 rounded-lg text-sm font-medium">
            {{ multiCorrect ? '✅ 正确' : '❌ 错误' }}（正确答案：{{ currentQuestion.answer }}）
          </div>
          <div class="mt-3 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
            <strong>解析：</strong>{{ currentQuestion.explanation || '暂无解析' }}
          </div>
        </div>
      </div>

      <!-- ====== 简答题 essay ====== -->
      <div v-else-if="qtype === 'essay'">
        <textarea v-model="userInput" :disabled="subjectiveJudged" placeholder="请输入你的答案..." rows="4"
          class="w-full border-2 border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-400 resize-none"></textarea>
        <button v-if="!subjectiveJudged" @click="judgeEssay" :disabled="!userInput.trim()"
          class="mt-3 w-full bg-blue-500 text-white py-2 rounded-lg font-medium disabled:opacity-40 hover:bg-blue-600 transition">判分</button>
        <div v-if="subjectiveJudged" class="mt-4">
          <div :class="subjectiveCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'" class="p-3 rounded-lg text-sm font-medium">
            {{ subjectiveCorrect ? '✅ 正确' : '❌ 错误' }}
            <span class="font-normal ml-2">相似度：{{ (similarityScore * 100).toFixed(1) }}%</span>
          </div>
          <div class="mt-3 p-3 bg-blue-50 rounded-lg text-sm text-blue-800"><strong>参考答案：</strong>{{ currentQuestion.answer }}</div>
          <div v-if="currentQuestion.explanation" class="mt-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-800"><strong>解析：</strong>{{ currentQuestion.explanation }}</div>
        </div>
      </div>

      <!-- 下一题 -->
      <button @click="nextQuestion"
        class="mt-5 w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition">
        {{ index + 1 < questions.length ? '下一题' : '完成刷题' }}
      </button>
    </div>

    <!-- 完成 -->
    <div v-else class="text-center py-20">
      <div class="text-5xl mb-4">🎉</div>
      <p class="text-lg text-gray-700 mb-2">已完成 {{ subjectName }}</p>
      <p class="text-gray-500 mb-4">正确 {{ correctCount }} / {{ questions.length }}（{{ rate }}%）</p>
      <router-link to="/" class="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg">返回首页</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWrongBookStore } from '../stores/wrongBook.js'
import { useAuthStore } from '../stores/auth.js'

const props = defineProps({ subject: String })
const route = useRoute()
const router = useRouter()
const wrongBook = useWrongBookStore()
const auth = useAuthStore()
const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

const nameMap = { bai: '白', dong: '董', ma: '马', hou: '候', xu: '徐' }
const subjectName = computed(() => nameMap[props.subject] || props.subject)

const typeAlias = { single: '单选', judge: '判断', multi: '多选', essay: '简答', '单选题': '单选', '简答题': '简答' }

// 题库状态
const questions = ref([])
const loading = ref(true)
const index = ref(0)
const correctCount = ref(0)

// 单选/判断
const answered = ref(false)
const pickedLabel = ref('')

// 多选
const multiSelected = ref([])
const multiJudged = ref(false)
const multiCorrect = ref(false)

// 简答
const userInput = ref('')
const subjectiveJudged = ref(false)
const subjectiveCorrect = ref(false)
const similarityScore = ref(0)

const currentQuestion = computed(() => index.value < questions.value.length ? questions.value[index.value] : null)

const typeMap = { single: 'single', judge: 'judge', multi: 'multi', essay: 'essay', '单选题': 'single', '简答题': 'essay' }
const qtype = computed(() => typeMap[currentQuestion.value?.type] || '')
const typeLabel = computed(() => typeAlias[qtype.value] || qtype.value)
const typeTagClass = computed(() => {
  const m = { single: 'bg-blue-100 text-blue-600', judge: 'bg-green-100 text-green-600', multi: 'bg-orange-100 text-orange-600', essay: 'bg-purple-100 text-purple-600' }
  return m[qtype.value] || 'bg-gray-100 text-gray-600'
})

function normalizeOpts() {
  const q = currentQuestion.value
  if (!q) return []
  if (qtype.value === 'judge') {
    return typeof q.options === 'string' ? q.options.split('|') : ['对', '错']
  }
  if (Array.isArray(q.options)) return q.options
  if (typeof q.options === 'string' && q.options) return q.options.split('|')
  return []
}
const optList = computed(() => normalizeOpts())

function stripLabel(opt) {
  // 去掉 "A. " 等前缀
  if (typeof opt === 'string') return opt.replace(/^[A-H][.、]\s*/, '')
  return opt
}

// ---------- 单选题 ----------
function singleOptClass(oi) {
  if (!answered.value) return 'border-gray-200 hover:border-blue-300'
  const correctIdx = labels.indexOf(currentQuestion.value.answer)
  if (oi === correctIdx) return 'border-green-400 bg-green-50 text-green-700'
  if (oi === pickedLabel.value && oi !== correctIdx) return 'border-red-400 bg-red-50 text-red-700'
  return 'border-gray-200 opacity-50'
}

function pickSingle(oi) {
  answered.value = true
  pickedLabel.value = oi
  const correctIdx = labels.indexOf(currentQuestion.value.answer)
  if (oi === correctIdx) correctCount.value++
  else wrongBook.addWrong(props.subject, currentQuestion.value)
}

// ---------- 判断题 ----------
function judgeBtnClass(ch) {
  if (!answered.value) return 'border-gray-200 hover:border-blue-300 bg-white text-gray-700'
  const ans = currentQuestion.value.answer
  if (ch === ans) return 'border-green-400 bg-green-50 text-green-700'
  if (ch === pickedLabel.value && ch !== ans) return 'border-red-400 bg-red-50 text-red-700'
  return 'border-gray-200 opacity-50'
}

function pickJudge(ch) {
  answered.value = true
  pickedLabel.value = ch
  if (ch === currentQuestion.value.answer) correctCount.value++
  else wrongBook.addWrong(props.subject, currentQuestion.value)
}

// ---------- 多选题 ----------
function toggleMulti(oi) {
  const idx = multiSelected.value.indexOf(oi)
  if (idx >= 0) multiSelected.value.splice(idx, 1)
  else multiSelected.value.push(oi)
}

function multiOptClass(oi) {
  if (!multiJudged.value) {
    return multiSelected.value.includes(oi) ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
  }
  const correctLetters = (currentQuestion.value.answer || '').split(',').map(s => labels.indexOf(s.trim())).filter(i => i >= 0)
  if (correctLetters.includes(oi)) return 'border-green-400 bg-green-50 text-green-700'
  if (multiSelected.value.includes(oi)) return 'border-red-400 bg-red-50 text-red-700'
  return 'border-gray-200 opacity-50'
}

function judgeMulti() {
  multiJudged.value = true
  const answerSet = new Set((currentQuestion.value.answer || '').split(',').map(s => s.trim()).filter(Boolean))
  const selectedSet = new Set(multiSelected.value.map(i => labels[i]))
  multiCorrect.value = answerSet.size === selectedSet.size && [...answerSet].every(x => selectedSet.has(x))
  if (multiCorrect.value) correctCount.value++
  else wrongBook.addWrong(props.subject, currentQuestion.value)
}

// ---------- 简答题 ----------
function cleanText(str) {
  if (!str) return ''
  return str.replace(/[\s\n\r]+/g, '').replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '')
}

function judgeEssay() {
  if (!userInput.value.trim()) return
  const userClean = cleanText(userInput.value)
  const answerClean = currentQuestion.value.cleanAnswer || cleanText(currentQuestion.value.answer)
  const sim = window.stringSimilarity ? window.stringSimilarity.compareTwoStrings(userClean, answerClean) : 0
  similarityScore.value = sim
  subjectiveJudged.value = true
  subjectiveCorrect.value = sim >= 0.5
  if (!subjectiveCorrect.value) wrongBook.addWrong(props.subject, currentQuestion.value)
  else correctCount.value++
}

// ---------- 通用 ----------
function nextQuestion() {
  answered.value = false; pickedLabel.value = ''
  multiSelected.value = []; multiJudged.value = false; multiCorrect.value = false
  userInput.value = ''; subjectiveJudged.value = false; subjectiveCorrect.value = false; similarityScore.value = 0
  index.value++
}

const rate = computed(() => questions.value.length ? ((correctCount.value / questions.value.length) * 100).toFixed(0) : 0)

async function loadQuestions() {
  loading.value = true; index.value = 0; correctCount.value = 0
  answered.value = false; pickedLabel.value = ''; multiSelected.value = []; multiJudged.value = false; multiCorrect.value = false
  userInput.value = ''; subjectiveJudged.value = false; subjectiveCorrect.value = false; similarityScore.value = 0
  try {
    const res = await fetch(`./questions/${props.subject}.json`)
    if (!res.ok) throw new Error('Not found')
    let text = await res.text()
    // 去掉 JSON 中的 // 和 /* */ 注释
    text = text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
    const raw = JSON.parse(text)
    questions.value = raw.sort(() => Math.random() - 0.5)
  } catch (e) { console.error('加载题库失败:', e); questions.value = [] }
  finally { loading.value = false }
}

loadQuestions()
watch(() => route.params.subject, loadQuestions)
</script>
