<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUiStore } from '@/stores/ui'
import RevenueChart   from './analytics/RevenueChart.vue'
import OrdersChart    from './analytics/OrdersChart.vue'
import TopCategories  from './analytics/TopCategories.vue'
import TopProducts    from './analytics/TopProducts.vue'
import type { Lang } from '@/types'

const ui   = useUiStore()
const lang = computed(() => ui.lang)

// ── Time range ────────────────────────────────────────────────────────────────
type Range = '7d' | '30d' | '12m'
const range = ref<Range>('30d')

const RANGE_LABELS: Record<Range, Record<Lang, string>> = {
  '7d':  { tk: '7 gün',   ru: '7 дней'   },
  '30d': { tk: '30 gün',  ru: '30 дней'  },
  '12m': { tk: '12 aý',   ru: '12 месяцев' },
}

// ── KPI cards ─────────────────────────────────────────────────────────────────
const kpis = computed(() => {
  const map = {
    '7d':  { revenue: 48295,  orders: 284,  customers: 38,   aov: 170.05 },
    '30d': { revenue: 182400, orders: 1284, customers: 212,  aov: 142.06 },
    '12m': { revenue: 924800, orders: 7104, customers: 1840, aov: 130.18 },
  }
  const prev = {
    '7d':  { revenue: 42100,  orders: 260,  customers: 32,   aov: 162.00 },
    '30d': { revenue: 168000, orders: 1180, customers: 193,  aov: 142.37 },
    '12m': { revenue: 834200, orders: 6540, customers: 1590, aov: 127.55 },
  }
  const cur = map[range.value]
  const pre = prev[range.value]
  const chg = (a: number, b: number) => Math.round(((a - b) / b) * 100 * 10) / 10

  return [
    { icon: 'revenue',   color: '#E8A020', label: { tk: 'Jemi girdeji',   ru: 'Общая выручка'    }, value: `$${cur.revenue.toLocaleString()}`, change: chg(cur.revenue, pre.revenue)   },
    { icon: 'orders',    color: '#3B82F6', label: { tk: 'Sargytlar',      ru: 'Заказов'          }, value: cur.orders.toLocaleString(),         change: chg(cur.orders, pre.orders)     },
    { icon: 'customers', color: '#22C55E', label: { tk: 'Täze müşderiler', ru: 'Новых клиентов'  }, value: cur.customers.toLocaleString(),      change: chg(cur.customers, pre.customers) },
    { icon: 'aov',       color: '#8B5CF6', label: { tk: 'Ortalama sargyt', ru: 'Средний чек'     }, value: `$${cur.aov}`,                       change: chg(cur.aov, pre.aov)           },
  ]
})

// ── Revenue chart data ────────────────────────────────────────────────────────
const revenuePoints = computed(() => {
  const days7tk  = ['Duş','Si','Çar','Pen','An','Şen','Ýek']
  const days7ru  = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс']
  const days30   = Array.from({ length: 10 }, (_, i) => `${(i + 1) * 3}`)
  const months   = { tk: ['Ýan','Few','Mar','Apr','Maý','Iýun','Iýul','Awg','Sen','Okt','Noý','Dek'],
                     ru: ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'] }
  if (range.value === '7d') {
    const lbls = lang.value === 'tk' ? days7tk : days7ru
    const vals = [6200, 8100, 5800, 9400, 7600, 11200, 9100]
    return lbls.map((l, i) => ({ label: l, value: vals[i] }))
  }
  if (range.value === '30d') {
    const vals = [14200, 18600, 12400, 21800, 16900, 23400, 19100, 25200, 18700, 22600]
    return days30.map((l, i) => ({ label: l, value: vals[i] }))
  }
  // 12m
  const vals = [62000, 58000, 74000, 68000, 82000, 91000, 88000, 76000, 94000, 87000, 102000, 97000]
  return months[lang.value].map((l, i) => ({ label: l, value: vals[i] }))
})

// ── Orders chart data ─────────────────────────────────────────────────────────
const ordersPoints = computed(() => {
  const days7tk = ['Duş','Si','Çar','Pen','An','Şen','Ýek']
  const days7ru = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс']
  const days30  = Array.from({ length: 10 }, (_, i) => `${(i + 1) * 3}`)
  const months  = { tk: ['Ýan','Few','Mar','Apr','Maý','Iýun','Iýul','Awg','Sen','Okt','Noý','Dek'],
                    ru: ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'] }
  if (range.value === '7d') {
    const lbls = lang.value === 'tk' ? days7tk : days7ru
    return lbls.map((l, i) => ({ label: l, value: [32, 45, 28, 54, 41, 63, 48][i] }))
  }
  if (range.value === '30d') {
    const vals = [88, 112, 76, 134, 102, 148, 118, 155, 108, 143]
    return days30.map((l, i) => ({ label: l, value: vals[i] }))
  }
  const vals = [410, 380, 520, 490, 580, 640, 610, 540, 680, 620, 740, 690]
  return months[lang.value].map((l, i) => ({ label: l, value: vals[i] }))
})

// ── Top categories ────────────────────────────────────────────────────────────
const catMap = {
  '7d':  [142, 88, 64, 52, 38],
  '30d': [584, 312, 218, 187, 143],
  '12m': [2840, 1620, 1140, 980, 740],
}
const categories = computed(() => {
  const vals = catMap[range.value]
  return [
    { label: { tk: 'Elektronika', ru: 'Электроника' }, value: vals[0], color: '#E8A020' },
    { label: { tk: 'Aksesuar',    ru: 'Аксессуары'  }, value: vals[1], color: '#3B82F6' },
    { label: { tk: 'Egin-eşik',   ru: 'Одежда'      }, value: vals[2], color: '#22C55E' },
    { label: { tk: 'Gözellik',    ru: 'Красота'      }, value: vals[3], color: '#8B5CF6' },
    { label: { tk: 'Öý üçin',     ru: 'Для дома'    }, value: vals[4], color: '#F59E0B' },
  ]
})

// ── Top products ──────────────────────────────────────────────────────────────
const productMap = {
  '7d':  [{ sold: 58, rev: 1449.42 }, { sold: 44, rev: 3959.56 }, { sold: 91, rev: 1181.09 }, { sold: 38, rev: 949.62 }, { sold: 27, rev: 499.50 }],
  '30d': [{ sold: 284, rev: 7095.16 }, { sold: 173, rev: 15566.27 }, { sold: 461, rev: 5992.39 }, { sold: 198, rev: 4949.02 }, { sold: 134, rev: 2479.00 }],
  '12m': [{ sold: 1840, rev: 45991.60 }, { sold: 1024, rev: 92147.76 }, { sold: 2810, rev: 36521.90 }, { sold: 1398, rev: 34940.02 }, { sold: 890, rev: 16465.00 }],
}
const topProducts = computed(() =>
  productMap[range.value].map((p, i) => ({
    name: [
      { tk: 'Simsiz Gulaklyk Pro',  ru: 'Наушники Pro'             },
      { tk: 'Akylly Sagat Series 3', ru: 'Умные часы Series 3'     },
      { tk: 'Göçme Zarýadlaýjy',    ru: 'Портативная зарядка'     },
      { tk: 'Bluetooth Dinamigi',   ru: 'Bluetooth-колонка'       },
      { tk: 'Kamera Çantasy',       ru: 'Сумка для камеры'        },
    ][i] as Record<Lang, string>,
    image:   ['🎧','⌚','🔋','🔊','🎒'][i],
    sold:    p.sold,
    revenue: p.rev,
  }))
)

// ── Translations ──────────────────────────────────────────────────────────────
const L = computed(() => lang.value === 'tk' ? {
  vsLabel: 'öňki döwür bilen deňeşdirilende',
} : {
  vsLabel: 'по сравнению с прошлым периодом',
})
</script>

<template>
  <div class="view">

    <!-- Range selector -->
    <div class="toolbar">
      <div class="range-tabs">
        <button v-for="r in (['7d','30d','12m'] as Range[])" :key="r"
          :class="['rtab', { active: range === r }]"
          @click="range = r">
          {{ RANGE_LABELS[r][lang] }}
        </button>
      </div>
      <p class="vs-label">{{ L.vsLabel }}</p>
    </div>

    <!-- KPI row -->
    <div class="kpi-row">
      <div v-for="k in kpis" :key="k.icon" class="kpi-card">
        <div class="kpi-icon" :style="{ background: k.color + '18', color: k.color }">
          <svg v-if="k.icon==='revenue'"   viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          <svg v-if="k.icon==='orders'"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          <svg v-if="k.icon==='customers'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <svg v-if="k.icon==='aov'"       viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
        </div>
        <div class="kpi-body">
          <p class="kpi-label">{{ k.label[lang] }}</p>
          <p class="kpi-value">{{ k.value }}</p>
          <p :class="['kpi-change', k.change >= 0 ? 'up' : 'down']">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline v-if="k.change >= 0" points="18 15 12 9 6 15"/>
              <polyline v-else               points="6 9 12 15 18 9"/>
            </svg>
            {{ Math.abs(k.change) }}%
          </p>
        </div>
      </div>
    </div>

    <!-- Charts row 1: Revenue (wide) + Orders -->
    <div class="charts-row">
      <div class="chart-wide">
        <RevenueChart :points="revenuePoints" :lang="lang" />
      </div>
      <div class="chart-narrow">
        <OrdersChart :points="ordersPoints" :lang="lang" />
      </div>
    </div>

    <!-- Charts row 2: Top categories + Top products -->
    <div class="charts-row">
      <TopCategories :items="categories" :lang="lang" />
      <TopProducts   :items="topProducts" :lang="lang" />
    </div>

  </div>
</template>

<style scoped>
.view { display: flex; flex-direction: column; gap: 20px; }

/* Toolbar */
.toolbar { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.range-tabs { display: flex; gap: 4px; background: var(--white); border: 1.5px solid var(--border); border-radius: var(--radius-md); padding: 3px; }
.rtab { padding: 5px 16px; border-radius: var(--radius-sm); border: none; background: transparent; font-size: 13px; font-weight: 700; color: var(--muted); cursor: pointer; transition: all .15s; font-family: var(--font-body); }
.rtab:hover  { background: var(--surface); color: var(--dark); }
.rtab.active { background: var(--dark); color: var(--white); }
.vs-label { font-size: 12px; color: var(--subtle); }

/* KPI row */
.kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.kpi-card { background: var(--white); border-radius: var(--radius-xl); border: 1.5px solid var(--border-light); box-shadow: var(--shadow-sm); padding: 18px 20px; display: flex; align-items: center; gap: 14px; transition: box-shadow .2s, transform .2s; }
.kpi-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
.kpi-icon { width: 44px; height: 44px; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.kpi-icon svg { width: 20px; height: 20px; }
.kpi-label  { font-size: 11px; font-weight: 600; color: var(--subtle); text-transform: uppercase; letter-spacing: .05em; margin-bottom: 4px; }
.kpi-value  { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--dark); line-height: 1; margin-bottom: 4px; }
.kpi-change { display: inline-flex; align-items: center; gap: 3px; font-size: 12px; font-weight: 700; }
.kpi-change svg { width: 12px; height: 12px; }
.kpi-change.up   { color: var(--success); }
.kpi-change.down { color: var(--error); }

/* Chart rows */
.charts-row { display: grid; grid-template-columns: 1.6fr 1fr; gap: 18px; }
.chart-wide, .chart-narrow { min-width: 0; }

@media (max-width: 1100px) { .kpi-row { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 860px)  { .charts-row { grid-template-columns: 1fr; } }
@media (max-width: 560px)  { .kpi-row { grid-template-columns: 1fr 1fr; } }
</style>
