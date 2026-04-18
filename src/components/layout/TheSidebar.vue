<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import type { NavItem } from '@/types'
import { client } from '@/api/client'

const ui   = useUiStore()
const auth = useAuthStore()

// ── Live badge counts ──────────────────────────────────────────
const pendingOrders   = ref(0)
const newRequests     = ref(0)

async function fetchCounts() {
  if (!auth.isLoggedIn) return
  try {
    const [orders, requests] = await Promise.all([
      client.get('/orders', { params: { status: 'PENDING', limit: 1 } }),
      client.get('/requests', { params: { status: 'NEW', limit: 1 } }),
    ])
    pendingOrders.value = orders.data.total  ?? 0
    newRequests.value   = requests.data.total ?? 0
  } catch {}
}

let timer: ReturnType<typeof setInterval>
onMounted(() => {
  fetchCounts()
  timer = setInterval(fetchCounts, 30_000)
})
onUnmounted(() => clearInterval(timer))

// ── Nav items ──────────────────────────────────────────────────
const navItems = computed<NavItem[]>(() => [
  { key: 'dashboard', label: { tk: 'Dolandyryş paneli', ru: 'Панель управления' }, icon: 'dashboard', path: '/dashboard'                                    },
  { key: 'products',  label: { tk: 'Önümler',           ru: 'Товары'            }, icon: 'products',  path: '/products'                                      },
  { key: 'orders',    label: { tk: 'Sargytlar',         ru: 'Заказы'            }, icon: 'orders',    path: '/orders',   badge: pendingOrders.value || undefined },
  { key: 'customers', label: { tk: 'Müşderiler',        ru: 'Клиенты'           }, icon: 'customers', path: '/customers'                                     },
  { key: 'analytics', label: { tk: 'Statistika',        ru: 'Аналитика'         }, icon: 'analytics', path: '/analytics'                                     },
  { key: 'settings',  label: { tk: 'Sazlamalar',        ru: 'Настройки'         }, icon: 'settings',  path: '/settings'                                      },
  { key: 'requests',  label: { tk: 'Talaplar',          ru: 'Запросы'           }, icon: 'requests',  path: '/requests', badge: newRequests.value || undefined   },
  { key: 'comments',  label: { tk: 'Teswirler',         ru: 'Отзывы'            }, icon: 'comments',  path: '/comments'                                      },
  { key: 'categories', label: { tk: 'Kategoriýalar',     ru: 'Категории'         }, icon: 'categories', path: '/categories'                                    },
])
</script>

<template>
  <aside :class="['sidebar', { collapsed: ui.collapsed }]">

    <!-- Logo -->
    <div class="logo">
      <div class="logo-mark">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
          <line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
      </div>
      <Transition name="fade-slide">
        <div v-if="!ui.collapsed" class="logo-text">
          <span class="logo-name">China_Box</span>
          <span class="logo-sub">Admin</span>
        </div>
      </Transition>
    </div>

    <div class="sep" />

    <!-- Nav -->
    <nav class="nav">
      <Transition name="fade-slide">
        <p v-if="!ui.collapsed" class="group-label">
          {{ ui.lang === 'tk' ? 'Esasy' : 'Основное' }}
        </p>
      </Transition>

      <RouterLink
        v-for="item in navItems"
        :key="item.key"
        :to="item.path"
        class="nav-link"
        active-class="nav-link--active"
        :title="ui.collapsed ? item.label[ui.lang] : undefined"
      >
        <span class="icon">
          <svg v-if="item.icon==='dashboard'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
          <svg v-if="item.icon==='products'"  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
          <svg v-if="item.icon==='orders'"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          <svg v-if="item.icon==='customers'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <svg v-if="item.icon==='analytics'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>
          <svg v-if="item.icon==='settings'"  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          <svg v-if="item.icon==='requests'"  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="12" y1="7" x2="12" y2="13"/></svg>
          <svg v-if="item.icon==='comments'"  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
          <svg v-if="item.icon==='categories'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
        </span>

        <Transition name="fade-slide">
          <span v-if="!ui.collapsed" class="label">{{ item.label[ui.lang] }}</span>
        </Transition>

        <Transition name="fade-slide">
          <span v-if="!ui.collapsed && item.badge" class="badge">{{ item.badge }}</span>
        </Transition>

        <span v-if="ui.collapsed && item.badge" class="badge-dot" />
      </RouterLink>
    </nav>

    <div class="spacer" />
    <div class="sep" />

    <!-- Collapse toggle -->
    <button class="collapse-btn" @click="ui.toggleSidebar()">
      <span class="icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
          :style="{ transform: ui.collapsed ? 'rotate(180deg)' : 'none', transition: 'transform .28s' }">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </span>
      <Transition name="fade-slide">
        <span v-if="!ui.collapsed" class="label">
          {{ ui.lang === 'tk' ? 'Daralt' : 'Свернуть' }}
        </span>
      </Transition>
    </button>

  </aside>
</template>

<style scoped>
.sidebar { position: fixed; inset: 0 auto 0 0; width: var(--sidebar-width); background: var(--sidebar-bg); display: flex; flex-direction: column; border-right: 1px solid var(--sidebar-border); z-index: 100; overflow: hidden; transition: width .28s cubic-bezier(.4,0,.2,1); }
.sidebar.collapsed { width: var(--sidebar-collapsed); }
.logo { display: flex; align-items: center; gap: 11px; padding: 18px 14px; min-height: 68px; overflow: hidden; }
.logo-mark { width: 36px; height: 36px; flex-shrink: 0; border-radius: 10px; background: linear-gradient(135deg, var(--gold), var(--gold-dark)); display: flex; align-items: center; justify-content: center; color: #fff; box-shadow: 0 4px 12px var(--gold-shadow); }
.logo-mark svg { width: 18px; height: 18px; }
.logo-name { display: block; font-family: var(--font-display); font-size: 17px; color: #fff; white-space: nowrap; }
.logo-sub  { display: block; font-size: 9px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--gold); margin-top: 1px; }
.sep { height: 1px; background: var(--sidebar-border); margin: 0 14px; flex-shrink: 0; }
.nav { display: flex; flex-direction: column; gap: 2px; padding: 12px 8px; overflow-y: auto; }
.group-label { font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: rgba(255,255,255,.22); padding: 0 8px; margin-bottom: 4px; white-space: nowrap; }
.nav-link { display: flex; align-items: center; gap: 11px; padding: 9px 10px; border-radius: var(--radius-md); text-decoration: none; color: rgba(255,255,255,.5); font-size: 13px; font-weight: 600; font-family: var(--font-body); white-space: nowrap; position: relative; overflow: hidden; transition: background .15s, color .15s; }
.nav-link:hover   { background: var(--sidebar-hover); color: rgba(255,255,255,.88); }
.nav-link--active { background: var(--sidebar-active); color: var(--gold); }
.nav-link--active::before { content: ''; position: absolute; left: 0; top: 20%; bottom: 20%; width: 3px; background: var(--gold); border-radius: 0 3px 3px 0; }
.icon { width: 20px; height: 20px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.icon svg { width: 17px; height: 17px; }
.label { flex: 1; overflow: hidden; text-overflow: ellipsis; }
.badge { background: var(--gold); color: #fff; font-size: 10px; font-weight: 800; padding: 1px 7px; border-radius: var(--radius-pill); }
.badge-dot { position: absolute; top: 7px; right: 7px; width: 7px; height: 7px; border-radius: 50%; background: var(--gold); }
.spacer { flex: 1; }
.collapse-btn { display: flex; align-items: center; gap: 11px; margin: 0 8px 12px; padding: 9px 10px; border-radius: var(--radius-md); background: none; border: none; cursor: pointer; color: rgba(255,255,255,.28); font-size: 13px; font-weight: 600; font-family: var(--font-body); white-space: nowrap; transition: background .15s, color .15s; }
.collapse-btn:hover { background: var(--sidebar-hover); color: rgba(255,255,255,.65); }
.fade-slide-enter-active { transition: opacity .14s .08s, transform .14s .08s; }
.fade-slide-leave-active { transition: opacity .08s, transform .08s; }
.fade-slide-enter-from, .fade-slide-leave-to { opacity: 0; transform: translateX(-8px); }
</style>
