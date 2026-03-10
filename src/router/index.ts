import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/',           redirect: '/dashboard' },
    { path: '/dashboard',  name: 'dashboard',  component: DashboardView },
    { path: '/products',   name: 'products',   component: () => import('@/views/ProductsView.vue')   },
    { path: '/orders',     name: 'orders',     component: () => import('@/views/OrdersView.vue')     },
    { path: '/customers',  name: 'customers',  component: () => import('@/views/CustomersView.vue')  },
    // { path: '/analytics',  name: 'analytics',  component: () => import('@/views/AnalyticsView.vue')  },
    // { path: '/settings',   name: 'settings',   component: () => import('@/views/SettingsView.vue')   },
  ],
})
