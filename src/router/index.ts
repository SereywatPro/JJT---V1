import { createRouter, createWebHistory } from 'vue-router'
import { isAuthenticated } from '../lib/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/LoginPage.vue'),
    meta: { public: true },
  },
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../pages/DashboardPage.vue'),
  },
  {
    path: '/trades',
    name: 'Trades',
    component: () => import('../pages/TradesPage.vue'),
  },
  {
    path: '/trades/new',
    name: 'NewTrade',
    component: () => import('../pages/TradeFormPage.vue'),
  },
  {
    path: '/trades/:id/edit',
    name: 'EditTrade',
    component: () => import('../pages/TradeFormPage.vue'),
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: () => import('../pages/CalendarPage.vue'),
  },
  {
    path: '/daily-review',
    name: 'DailyReview',
    component: () => import('../pages/DailyReviewPage.vue'),
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../pages/SettingsPage.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

// Navigation guard
router.beforeEach((to) => {
  if (!to.meta.public && !isAuthenticated()) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }
})

export default router
