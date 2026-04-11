<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CustomerItem, CustomerStatus, OrderStatus, Lang } from '@/types'

const props = defineProps<{
  customer: CustomerItem | null
  lang:     Lang
  open:     boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'edit', customer: CustomerItem): void
}>()

type Tab = 'detail' | 'orders'
const activeTab = ref<Tab>('detail')

const L = computed(() => props.lang === 'tk' ? {
  subtitle:    'Müşderi maglumaty',
  tabs:        { detail: 'Maglumat', orders: 'Sargytlar' },
  info:        'Şahsy maglumat',
  contact:     'Habarlaşmak',
  address:     'Salgy',
  stats:       'Statistika',
  totalOrders: 'Jemi sargyt',
  totalSpent:  'Jemi sarp edilen',
  joined:      'Goşulan senesi',
  status:      'Ýagdaý',
  noOrders:    'Sargyt ýok',
  edit:        'Üýtget',
  close:       'Ýap',
} : {
  subtitle:    'Детали клиента',
  tabs:        { detail: 'Данные', orders: 'Заказы' },
  info:        'Личная информация',
  contact:     'Контакты',
  address:     'Адрес',
  stats:       'Статистика',
  totalOrders: 'Всего заказов',
  totalSpent:  'Всего потрачено',
  joined:      'Дата регистрации',
  status:      'Статус',
  noOrders:    'Заказов нет',
  edit:        'Редактировать',
  close:       'Закрыть',
})

const AVATAR_COLORS = ['#E8A020','#3B82F6','#22C55E','#8B5CF6','#EF4444','#F59E0B','#06B6D4']
function avatarColor(name: string) {
  const i = name.split('').reduce((s, c) => s + c.charCodeAt(0), 0) % AVATAR_COLORS.length
  return AVATAR_COLORS[i]
}
function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

const STATUS_CFG: Record<CustomerStatus, { color: string; bg: string; tk: string; ru: string }> = {
  ACTIVE:  { color: '#22C55E', bg: 'rgba(34,197,94,.12)',  tk: 'Işjeň',     ru: 'Активен'      },
  BLOCKED: { color: '#EF4444', bg: 'rgba(239,68,68,.12)',  tk: 'Bloklanan', ru: 'Заблокирован'  },
}

const ORDER_STATUS: Record<OrderStatus, { color: string; bg: string; tk: string; ru: string }> = {
  PENDING:    { color: '#F59E0B', bg: 'rgba(245,158,11,.12)', tk: 'Garaşylýar', ru: 'Ожидает'     },
  PROCESSING: { color: '#3B82F6', bg: 'rgba(59,130,246,.12)', tk: 'Işlenýär',   ru: 'В обработке' },
  SHIPPED:    { color: '#8B5CF6', bg: 'rgba(139,92,246,.12)', tk: 'Iberildi',   ru: 'Отправлен'   },
  DELIVERED:  { color: '#22C55E', bg: 'rgba(34,197,94,.12)',  tk: 'Eltildi',    ru: 'Доставлен'   },
  CANCELLED:  { color: '#EF4444', bg: 'rgba(239,68,68,.12)',  tk: 'Ýatyryldy', ru: 'Отменён'     },
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="backdrop" @click="emit('close')" />
    </Transition>

    <Transition name="drawer">
      <div v-if="open && customer" class="drawer">

        <!-- Head -->
        <div class="drawer-head">
          <div class="head-profile">
            <div class="big-avatar" :style="{ background: avatarColor(customer.name) }">
              {{ initials(customer.name) }}
            </div>
            <div>
              <p class="drawer-subtitle">{{ L.subtitle }}</p>
              <h2 class="drawer-name">{{ customer.name }}</h2>
              <span class="status-badge"
                :style="{ color: STATUS_CFG[customer.status].color, background: STATUS_CFG[customer.status].bg }">
                {{ STATUS_CFG[customer.status][props.lang] }}
              </span>
            </div>
          </div>
          <button class="close-btn" @click="emit('close')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Tabs -->
        <div class="tabs">
          <button :class="['tab', { active: activeTab === 'detail' }]" @click="activeTab = 'detail'">
            {{ L.tabs.detail }}
          </button>
          <button :class="['tab', { active: activeTab === 'orders' }]" @click="activeTab = 'orders'">
            {{ L.tabs.orders }}
            <span class="tab-badge">{{ customer.orders.length }}</span>
          </button>
        </div>

        <!-- Body -->
        <div class="drawer-body">

          <!-- ── Detail tab ─────────────────────────────────────────────── -->
          <template v-if="activeTab === 'detail'">

            <!-- Stats row -->
            <div class="stats-row">
              <div class="stat-card">
                <p class="stat-label">{{ L.totalOrders }}</p>
                <p class="stat-value gold">{{ customer.totalOrders }}</p>
              </div>
              <div class="stat-card">
                <p class="stat-label">{{ L.totalSpent }}</p>
                <p class="stat-value">${{ customer.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</p>
              </div>
              <div class="stat-card">
                <p class="stat-label">{{ L.joined }}</p>
                <p class="stat-value sm">{{ customer.joined }}</p>
              </div>
            </div>

            <!-- Contact -->
            <div class="section">
              <p class="section-label">{{ L.contact }}</p>
              <div class="detail-list">
                <div class="detail-row">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <span>{{ customer.email }}</span>
                </div>
                <div class="detail-row">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  <span>{{ customer.phone }}</span>
                </div>
                <div class="detail-row">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span>{{ customer.address }}</span>
                </div>
              </div>
            </div>

          </template>

          <!-- ── Orders tab ─────────────────────────────────────────────── -->
          <template v-else>
            <div v-if="customer.orders.length === 0" class="no-orders">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              <p>{{ L.noOrders }}</p>
            </div>
            <div v-else class="orders-list">
              <div v-for="o in customer.orders" :key="o.id" class="order-row">
                <div class="order-id">{{ o.id }}</div>
                <div class="order-mid">
                  <span class="order-pill" :style="{ color: ORDER_STATUS[o.status].color, background: ORDER_STATUS[o.status].bg }">
                    {{ ORDER_STATUS[o.status][props.lang] }}
                  </span>
                  <span class="order-date">{{ o.date }}</span>
                </div>
                <span class="order-total">${{ o.total.toFixed(2) }}</span>
              </div>
            </div>
          </template>

        </div>

        <!-- Footer -->
        <div class="drawer-foot">
          <button class="btn-close" @click="emit('close')">{{ L.close }}</button>
          <button class="btn-edit" @click="emit('edit', customer)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            {{ L.edit }}
          </button>
        </div>

      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.backdrop { position: fixed; inset: 0; z-index: 200; background: rgba(15,17,23,.45); backdrop-filter: blur(2px); }
.fade-enter-active, .fade-leave-active { transition: opacity .22s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.drawer {
  position: fixed; top: 0; right: 0; bottom: 0; z-index: 201;
  width: 100%; max-width: 460px;
  background: var(--white); box-shadow: -8px 0 32px rgba(0,0,0,.12);
  display: flex; flex-direction: column; overflow: hidden;
}
.drawer-enter-active, .drawer-leave-active { transition: transform .28s cubic-bezier(.4,0,.2,1); }
.drawer-enter-from, .drawer-leave-to { transform: translateX(100%); }

/* Head */
.drawer-head { display: flex; align-items: flex-start; justify-content: space-between; padding: 22px 24px; border-bottom: 1px solid var(--border-light); flex-shrink: 0; gap: 12px; }
.head-profile { display: flex; align-items: center; gap: 14px; }
.big-avatar { width: 50px; height: 50px; border-radius: var(--radius-lg); color: #fff; font-size: 18px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.drawer-subtitle { font-size: 11px; font-weight: 700; color: var(--subtle); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 3px; }
.drawer-name { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--dark); margin-bottom: 5px; }
.status-badge { display: inline-flex; padding: 2px 9px; border-radius: var(--radius-pill); font-size: 11px; font-weight: 700; }
.close-btn { width: 30px; height: 30px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--surface); display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--muted); transition: all .15s; flex-shrink: 0; }
.close-btn svg { width: 14px; height: 14px; }
.close-btn:hover { border-color: var(--error); color: var(--error); background: var(--error-bg); }

/* Tabs */
.tabs { display: flex; gap: 4px; padding: 12px 24px; border-bottom: 1px solid var(--border-light); flex-shrink: 0; }
.tab { display: flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: var(--radius-md); border: 1.5px solid transparent; background: transparent; font-size: 13px; font-weight: 600; color: var(--muted); cursor: pointer; transition: all .15s; font-family: var(--font-body); }
.tab:hover  { background: var(--surface); color: var(--dark); }
.tab.active { background: var(--dark); color: var(--white); border-color: var(--dark); }
.tab-badge { background: var(--gold); color: #fff; font-size: 10px; font-weight: 800; padding: 1px 6px; border-radius: var(--radius-pill); }

/* Body */
.drawer-body { flex: 1; overflow-y: auto; padding: 20px 24px; display: flex; flex-direction: column; gap: 20px; }

/* Stats row */
.stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.stat-card { background: var(--surface); border-radius: var(--radius-lg); border: 1.5px solid var(--border-light); padding: 12px 14px; }
.stat-label { font-size: 10px; font-weight: 700; color: var(--subtle); text-transform: uppercase; letter-spacing: .05em; margin-bottom: 6px; }
.stat-value { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--dark); line-height: 1; }
.stat-value.gold { color: var(--gold); }
.stat-value.sm   { font-size: 14px; }

/* Section */
.section { display: flex; flex-direction: column; gap: 10px; }
.section-label { font-size: 11px; font-weight: 700; color: var(--subtle); text-transform: uppercase; letter-spacing: .06em; }

/* Detail list */
.detail-list { background: var(--surface); border-radius: var(--radius-lg); border: 1.5px solid var(--border-light); overflow: hidden; }
.detail-row { display: flex; align-items: center; gap: 10px; padding: 11px 14px; border-bottom: 1px solid var(--border-light); font-size: 13px; color: var(--dark); }
.detail-row:last-child { border-bottom: none; }
.detail-row svg { width: 15px; height: 15px; color: var(--subtle); flex-shrink: 0; }

/* Orders list */
.no-orders { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 40px 20px; color: var(--subtle); }
.no-orders svg { width: 36px; height: 36px; opacity: .35; }
.no-orders p { font-size: 13px; font-weight: 600; }
.orders-list { background: var(--surface); border-radius: var(--radius-lg); border: 1.5px solid var(--border-light); overflow: hidden; }
.order-row { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-bottom: 1px solid var(--border-light); transition: background .12s; }
.order-row:last-child { border-bottom: none; }
.order-row:hover { background: var(--white); }
.order-id { font-size: 13px; font-weight: 700; color: var(--gold); min-width: 90px; }
.order-mid { display: flex; flex-direction: column; gap: 3px; flex: 1; }
.order-pill { display: inline-flex; padding: 2px 8px; border-radius: var(--radius-pill); font-size: 10px; font-weight: 700; width: fit-content; }
.order-date { font-size: 11px; color: var(--subtle); }
.order-total { font-size: 13px; font-weight: 700; color: var(--dark); font-family: var(--font-display); flex-shrink: 0; }

/* Footer */
.drawer-foot { display: flex; gap: 10px; padding: 16px 24px; border-top: 1px solid var(--border-light); flex-shrink: 0; }
.btn-close { flex: 1; height: 40px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--surface); font-size: 13px; font-weight: 700; color: var(--muted); cursor: pointer; transition: all .15s; font-family: var(--font-body); }
.btn-close:hover { border-color: var(--dark); color: var(--dark); }
.btn-edit { flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px; height: 40px; border-radius: var(--radius-md); border: none; background: linear-gradient(135deg, var(--gold), var(--gold-dark)); font-size: 13px; font-weight: 800; color: #fff; cursor: pointer; transition: all .15s; font-family: var(--font-body); box-shadow: 0 4px 12px var(--gold-shadow); }
.btn-edit svg { width: 14px; height: 14px; }
.btn-edit:hover { transform: translateY(-1px); box-shadow: 0 6px 16px var(--gold-shadow); }
</style>
