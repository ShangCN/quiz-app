import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import QuizView from '../views/QuizView.vue'
import WrongView from '../views/WrongView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/quiz/:subject', name: 'quiz', component: QuizView, props: true },
  { path: '/wrong', name: 'wrong', component: WrongView },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
