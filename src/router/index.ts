import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import DashboardView from '@/views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path:      '/login',
      name:      'login',
      component: () => import('@/views/LoginView.vue'),
      meta:      { public: true },
    },
    { path: '/', redirect: '/dashboard' },
    { path: '/dashboard', name: 'dashboard', component: DashboardView },
    { path: '/products',  name: 'products',  component: () => import('@/views/ProductsView.vue')  },
    { path: '/orders',    name: 'orders',    component: () => import('@/views/OrdersView.vue')    },
    { path: '/customers', name: 'customers', component: () => import('@/views/CustomersView.vue') },
    { path: '/analytics', name: 'analytics', component: () => import('@/views/AnalyticsView.vue') },
    { path: '/settings',  name: 'settings',  component: () => import('@/views/SettingsView.vue')  },
    { path: '/requests', name: 'requests', component: () => import('@/views/RequestsView.vue') },
    { path: '/admin/comments', component: () => import('@/views/CommentView.vue') },
    { path: '/categories', name: 'categories', component: () => import('@/views/CategoriesView.vue') },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (!auth.user && auth.accessToken) await auth.restore()
  if (!to.meta.public && !auth.isLoggedIn) return { name: 'login' }
  if (to.name === 'login' && auth.isLoggedIn) return { name: 'dashboard' }
})

export default router
