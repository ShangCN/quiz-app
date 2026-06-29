import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const USERS = {
  '尚国贤': '9sK&7pT#2z',
  '王存莲': 'R5@bQ8$dG3',
  '伊西措占': '7F^m2S*j9L',
  '董芝芳': 't6#N4kP&8V',
}

// ========== 跨设备会话管理 ==========
const BLOB_URL = 'https://jsonblob.com/api/jsonBlob/019f13b1-4b1b-7ed9-a50e-9bdc2097000d'

function genToken() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 10)
}

async function fetchBlob() {
  try { const r = await fetch(BLOB_URL); if (r.ok) return r.json() } catch (e) { /* ignore */ }
  return null
}

async function recreateBlob(data) {
  try {
    const r = await fetch('https://jsonblob.com/api/jsonBlob', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data || { sessions: {}, updatedAt: Date.now() })
    })
    return r.headers.get('X-jsonblob-id') // new ID will be stored in localStorage
  } catch (e) { return null }
}

async function putBlob(data) {
  try {
    await fetch(BLOB_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return true
  } catch (e) { return false }
}

// Same-tab cross-device channel
const bc = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('quiz_lock') : null
if (bc) {
  bc.onmessage = (e) => {
    if (e.data?.type === 'login') {
      // Another tab logged in — store the event for the store to handle
      window.__quizLockEvent = e.data
    }
  }
}

// ========== Pinia Store ==========
export const useAuthStore = defineStore('auth', () => {
  const user = ref(localStorage.getItem('quiz_user') || '')
  const token = ref(localStorage.getItem('quiz_token') || '')
  const loginTime = ref(Number(localStorage.getItem('quiz_time') || 0))
  const _kicked = ref(localStorage.getItem('quiz_kicked') === '1')
  const loggedIn = computed(() => !!user.value && !_kicked.value)

  let _poller = null
  let _blobCachedId = localStorage.getItem('quiz_blob_id') || ''

  // === 恢复已有会话 ===
  if (user.value && token.value && !_kicked.value) _startPolling()

  // === Login ===
  async function login(username, password) {
    if (USERS[username] !== password) return false

    const t = genToken()
    const now = Date.now()

    // 本地先存（不影响登录体验）
    user.value = username
    token.value = t
    loginTime.value = now
    _kicked.value = false
    _save()

    // 广播同设备通知
    if (bc) bc.postMessage({ type: 'login', user: username, token: t, time: now })

    // 远程同步（不阻塞登录）
    _syncRemote(username, t, now)

    _startPolling()
    return true
  }

  // === Logout ===
  function logout() {
    user.value = ''
    token.value = ''
    loginTime.value = 0
    _kicked.value = false
    localStorage.removeItem('quiz_user')
    localStorage.removeItem('quiz_token')
    localStorage.removeItem('quiz_time')
    localStorage.removeItem('quiz_kicked')
    localStorage.removeItem('quiz_blob_id')
    _stopPolling()
  }

  // === Force logout (kicked) ===
  function kickOut() {
    _kicked.value = true
    localStorage.setItem('quiz_kicked', '1')
    _stopPolling()
  }

  // === Helpers ===
  function _save() {
    localStorage.setItem('quiz_user', user.value)
    localStorage.setItem('quiz_token', token.value)
    localStorage.setItem('quiz_time', String(loginTime.value))
    localStorage.removeItem('quiz_kicked')
  }

  async function _syncRemote(u, t, now) {
    let data = await fetchBlob()
    if (!data) {
      // Blob expired — recreate
      const newId = await recreateBlob({ sessions: { [u]: { token: t, time: now } }, updatedAt: now })
      if (newId) {
        _blobCachedId = newId
        localStorage.setItem('quiz_blob_id', newId)
      }
      return
    }
    data.sessions = data.sessions || {}
    data.sessions[u] = { token: t, time: now }
    data.updatedAt = now
    await putBlob(data)
  }

  async function _checkRemote() {
    if (!user.value || !token.value) return
    // 检查同设备广播
    if (window.__quizLockEvent) {
      const ev = window.__quizLockEvent
      window.__quizLockEvent = null
      if (ev.user === user.value && ev.token !== token.value) {
        kickOut(); return
      }
    }
    // 检查远程会话
    let data = await fetchBlob()
    if (!data) {
      // Blob 过期 → 重建并写入当前会话
      const newId = await recreateBlob({ sessions: { [user.value]: { token: token.value, time: loginTime.value } }, updatedAt: Date.now() })
      if (newId) {
        _blobCachedId = newId
        localStorage.setItem('quiz_blob_id', newId)
      }
      return
    }
    const sess = (data.sessions || {})[user.value]
    if (sess && sess.token !== token.value) {
      // 另一台设备登录了
      kickOut()
    }
  }

  function _startPolling() {
    _stopPolling()
    _checkRemote() // 首次立即检查
    _poller = setInterval(_checkRemote, 10000)
  }

  function _stopPolling() {
    if (_poller) { clearInterval(_poller); _poller = null }
  }

  return { user, token, loginTime, loggedIn, login, logout, kickOut,
    kickedOut: computed(() => _kicked.value) }
})
