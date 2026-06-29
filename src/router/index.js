import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import HomeView from '../views/HomeView.vue'
import QuizView from '../views/QuizView.vue'
import WrongView from '../views/WrongView.vue'
import LoginView from '../views/LoginView.vue'

const routes = [
  { path: '/login', name: 'login', component: LoginView },
  { path: '/', name: 'home', component: HomeView, meta: { requiresAuth: true } },
  { path: '/quiz/:subject', name: 'quiz', component: QuizView, props: true, meta: { requiresAuth: true } },
  { path: '/wrong', name: 'wrong', component: WrongView, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to, from) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.loggedIn) {
    return '/login'
  }
})

export default router
