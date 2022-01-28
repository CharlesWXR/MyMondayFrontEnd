import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import PersonalHome from '../views/PersonalHome.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/personalhome',
    name: 'PersonalHome',
    component: PersonalHome
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
