import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const USERS = {
  '尚国贤': '9sK&7pT#2z',
  '王存莲': 'R5@bQ8$dG3',
  '伊西措占': '7F^m2S*j9L',
  '董芝芳': 't6#N4kP&8V',
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref(localStorage.getItem('quiz_user') || '')
  const loggedIn = computed(() => !!user.value)

  function login(username, password) {
    if (USERS[username] === password) {
      user.value = username
      localStorage.setItem('quiz_user', username)
      return true
    }
    return false
  }

  function logout() {
    user.value = ''
    localStorage.removeItem('quiz_user')
  }

  return { user, loggedIn, login, logout }
})
