import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useWrongBookStore = defineStore('wrongBook', () => {
  const records = ref(JSON.parse(localStorage.getItem('wrong_book') || '{}'))

  function save() {
    localStorage.setItem('wrong_book', JSON.stringify(records.value))
  }

  function addWrong(subject, question) {
    if (!records.value[subject]) records.value[subject] = []
    const exists = records.value[subject].find(q => q.stem === question.stem)
    if (!exists) {
      records.value[subject].push({
        ...question,
        wrongTime: Date.now(),
        reviewCount: 0,
      })
      save()
    }
  }

  function removeWrong(subject, stem) {
    if (!records.value[subject]) return
    records.value[subject] = records.value[subject].filter(q => q.stem !== stem)
    if (records.value[subject].length === 0) delete records.value[subject]
    save()
  }

  function markReviewed(subject, stem) {
    const q = records.value[subject]?.find(q => q.stem === stem)
    if (q) q.reviewCount++
    save()
  }

  function getWrongBySubject(subject) {
    return records.value[subject] || []
  }

  const allSubjects = computed(() => Object.keys(records.value))

  return {
    records,
    addWrong,
    removeWrong,
    markReviewed,
    getWrongBySubject,
    allSubjects,
  }
})
