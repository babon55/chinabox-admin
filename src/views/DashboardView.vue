<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUiStore } from '@/stores/ui'
import DashboardStats       from './dashboard/DashboardStats.vue'
import DashboardChart       from './dashboard/DashboardChart.vue'
import DashboardOrders      from './dashboard/DashboardOrders.vue'
import DashboardTopProducts from './dashboard/DashboardTopProducts.vue'
import type { StatCard, ChartPoint, Order, Product } from '@/types'

const ui   = useUiStore()
const lang = computed(() => ui.lang)

const statCards = computed<StatCard[]>(() => [
  { key: 'revenue',   label: { tk: 'Jemi girdeji',      ru: 'Общая выручка'   }, value: '$48,295', change: +12.5, icon: 'revenue',   color: '#E8A020' },
  { key: 'orders',    label: { tk: 'Bu aýky sargytlar', ru: 'Заказов в месяц' }, value: '1,284',   change: +8.2,  icon: 'orders',    color: '#3B82F6' },
  { key: 'customers', label: { tk: 'Täze müşderiler',   ru: 'Новые клиенты'   }, value: '389',     change: +22.1, icon: 'customers', color: '#22C55E' },
  { key: 'products',  label: { tk: 'Önüm sany',         ru: 'Всего товаров'   }, value: '2,841',   change: -3.4,  icon: 'products',  color: '#8B5CF6' },
])

const chartPoints = computed<ChartPoint[]>(() => {
  const days = lang.value === 'tk'
    ? ['Duş', 'Si', 'Çar', 'Pen', 'An', 'Şen', 'Ýek']
    : ['Пн',  'Вт', 'Ср',  'Чт',  'Пт', 'Сб',  'Вс' ]
  return [
    { label: days[0], value: 3200 },
    { label: days[1], value: 5800 },
    { label: days[2], value: 4100 },
    { label: days[3], value: 7200 },
    { label: days[4], value: 6400 },
    { label: days[5], value: 9100 },
    { label: days[6], value: 7800 },
  ]
})

const chartTitle = computed(() =>
  lang.value === 'tk' ? 'Hepdelik girdeji' : 'Недельная выручка'
)

const quickStats = computed(() => [
  { icon: 'clock', color: '#E8A020', bg: 'rgba(232,160,32,.1)',  label: { tk: 'Garaşýan sargytlar',   ru: 'Ожидающие заказы'      }, value: '24'                                              },
  { icon: 'alert', color: '#EF4444', bg: 'rgba(239,68,68,.1)',   label: { tk: 'Az stok',              ru: 'Мало на складе'         }, value: `7 ${lang.value === 'tk' ? 'önüm' : 'товаров'}` },
  { icon: 'check', color: '#22C55E', bg: 'rgba(34,197,94,.1)',   label: { tk: 'Şu gün eltildi',       ru: 'Доставлено сегодня'     }, value: '38'                                              },
  { icon: 'users', color: '#3B82F6', bg: 'rgba(59,130,246,.1)',  label: { tk: 'Şu gün täze müşderi', ru: 'Новых клиентов сегодня' }, value: '12'                                              },
])

const orders = ref<Order[]>([
  { id: 'ORD-4821', customer: 'Merdan Ataýew',    items: 3, total: 124.99, status: 'delivered',  date: '08.03.2026' },
  { id: 'ORD-4820', customer: 'Aýna Durdyýewa',   items: 1, total: 89.00,  status: 'shipped',    date: '08.03.2026' },
  { id: 'ORD-4819', customer: 'Serdar Nurýew',    items: 5, total: 340.50, status: 'processing', date: '07.03.2026' },
  { id: 'ORD-4818', customer: 'Güljeren Orazowa', items: 2, total: 55.80,  status: 'pending',    date: '07.03.2026' },
  { id: 'ORD-4817', customer: 'Döwlet Hojamow',   items: 4, total: 210.00, status: 'cancelled',  date: '06.03.2026' },
])

const topProducts = ref<Product[]>([
  { id: '1', name: { tk: 'Simsiz Gulaklyk Pro', ru: 'Наушники Pro'        }, image: '🎧', sold: 284, revenue: 7095.16,  stock: 42  },
  { id: '2', name: { tk: 'Akylly Sagat',        ru: 'Умные часы'          }, image: '⌚', sold: 173, revenue: 15566.27, stock: 18  },
  { id: '3', name: { tk: 'Göçme Zarýadlaýjy',  ru: 'Портативная зарядка' }, image: '🔋', sold: 461, revenue: 5992.39,  stock: 105 },
  { id: '4', name: { tk: 'Bluetooth Dinamigi', ru: 'Bluetooth-колонка'   }, image: '🔊', sold: 198, revenue: 4949.02,  stock: 67  },
  { id: '5', name: { tk: 'Kamera Çantasy',     ru: 'Сумка для камеры'    }, image: '🎒', sold: 134, revenue: 2479.00,  stock: 89  },
])
</script>

<template>
  <div class="view">
    <DashboardStats :cards="statCards" :lang="lang" />

    <div class="mid">
      <DashboardChart :points="chartPoints" :lang="lang" :title="chartTitle" />

      <div class="quick-card">
        <h3 class="quick-title">{{ lang === 'tk' ? 'Tiz maglumat' : 'Быстрая сводка' }}</h3>
        <div class="quick-list">
          <div v-for="q in quickStats" :key="q.icon" class="quick-row">
            <div class="quick-icon" :style="{ background: q.bg, color: q.color }">
              <svg v-if="q.icon==='clock'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <svg v-if="q.icon==='alert'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <svg v-if="q.icon==='check'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <svg v-if="q.icon==='users'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div>
              <p class="q-label">{{ q.label[lang] }}</p>
              <p class="q-value">{{ q.value }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bottom">
      <DashboardOrders      :orders="orders"       :lang="lang" />
      <DashboardTopProducts :products="topProducts" :lang="lang" />
    </div>
  </div>
</template>

<style scoped>
.view { display: flex; flex-direction: column; gap: 22px; }
.mid  { display: grid; grid-template-columns: 1fr 300px; gap: 22px; align-items: start; }
.bottom { display: grid; grid-template-columns: 1fr 360px; gap: 22px; align-items: start; }

.quick-card { background: var(--white); border-radius: var(--radius-xl); border: 1.5px solid var(--border-light); box-shadow: var(--shadow-sm); padding: 20px; }
.quick-title { font-family: var(--font-display); font-size: 16px; font-weight: 700; color: var(--dark); margin-bottom: 16px; }
.quick-list  { display: flex; flex-direction: column; gap: 14px; }
.quick-row   { display: flex; align-items: center; gap: 12px; }
.quick-icon  { width: 38px; height: 38px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.quick-icon svg { width: 17px; height: 17px; }
.q-label { font-size: 11px; color: var(--subtle); margin-bottom: 2px; }
.q-value { font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--dark); }

@media (max-width: 1100px) { .mid, .bottom { grid-template-columns: 1fr; } }
</style>
