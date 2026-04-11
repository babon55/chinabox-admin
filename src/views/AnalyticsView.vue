<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useUiStore } from '@/stores/ui'
import { analyticsApi, type AnalyticsRange, type AnalyticsResponse } from '@/api/analytics'

const ui   = useUiStore()
const lang = computed(() => ui.lang)

const range   = ref<AnalyticsRange>('30d')
const data    = ref<AnalyticsResponse | null>(null)
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    const res = await analyticsApi.get(range.value)
    data.value = res.data
  } finally { loading.value = false }
}

onMounted(load)
watch(range, load)

const ranges = computed(() => [
  { key: '7d',  label: lang.value === 'tk' ? '7 gün'  : '7 дней'   },
  { key: '30d', label: lang.value === 'tk' ? '30 gün' : '30 дней'  },
  { key: '12m', label: lang.value === 'tk' ? '12 aý'  : '12 мес.'  },
])

const kpiCards = computed(() => {
  if (!data.value) return []
  const { kpis } = data.value
  const l = lang.value
  return [
    { label: l === 'tk' ? 'Girdéji'       : 'Доход',               value: `$${kpis.revenue.value.toFixed(2)}`,   change: kpis.revenue.change   },
    { label: l === 'tk' ? 'Sargytlar'     : 'Заказы',              value: kpis.orders.value,                     change: kpis.orders.change    },
    { label: l === 'tk' ? 'Täze müşderi' : 'Новые клиенты',       value: kpis.customers.value,                  change: kpis.customers.change },
    { label: l === 'tk' ? 'Ortaça sargyt': 'Средний чек',         value: `$${kpis.aov.value.toFixed(2)}`,        change: kpis.aov.change       },
  ]
})

// SVG chart helpers
const chartW = 600; const chartH = 180; const pad = 40

function revenuePoints(items: { revenue: number }[]) {
  const max = Math.max(...items.map(i => i.revenue), 1)
  return items.map((item, i) => {
    const x = pad + (i / (items.length - 1)) * (chartW - pad * 2)
    const y = chartH - pad - (item.revenue / max) * (chartH - pad * 2)
    return `${x},${y}`
  }).join(' ')
}
function revenuePath(items: { revenue: number }[]) {
  const pts = revenuePoints(items).split(' ')
  if (pts.length < 2) return ''
  const first = pts[0]?.split(',')
  const last  = pts[pts.length - 1]?.split(',')
  if (!first || !last) return ''
  return `M ${pts.join(' L ')} L ${last[0]},${chartH - pad} L ${first[0]},${chartH - pad} Z`
}
function ordersBars(items: { orders: number }[]) {
  const max = Math.max(...items.map(i => i.orders), 1)
  const bw  = (chartW - pad * 2) / items.length * 0.6
  return items.map((item, i) => {
    const x = pad + (i / items.length) * (chartW - pad * 2) + bw * 0.4
    const h = (item.orders / max) * (chartH - pad * 2)
    const y = chartH - pad - h
    return { x, y, w: bw, h, orders: item.orders }
  })
}
</script>

<template>
  <div class="analytics">

    <!-- Range selector -->
    <div class="range-bar">
      <button v-for="r in ranges" :key="r.key" :class="['rtab', { active: range === r.key }]" @click="range = r.key as AnalyticsRange">{{ r.label }}</button>
    </div>

    <div v-if="loading" class="loading-state"><div class="spinner"></div></div>

    <template v-else-if="data">

      <!-- KPI cards -->
      <div class="kpi-grid">
        <div v-for="k in kpiCards" :key="k.label" class="kpi-card">
          <div class="kpi-label">{{ k.label }}</div>
          <div class="kpi-value">{{ k.value }}</div>
          <div :class="['kpi-change', k.change >= 0 ? 'pos' : 'neg']">
            {{ k.change >= 0 ? '↑' : '↓' }} {{ Math.abs(k.change) }}%
          </div>
        </div>
      </div>

      <!-- Revenue chart -->
      <div class="card">
        <h3 class="card-title">{{ lang === 'tk' ? 'Girdéji dinamikasy' : 'Динамика дохода' }}</h3>
        <div class="chart-wrap">
          <svg :viewBox="`0 0 ${chartW} ${chartH}`" class="chart-svg" preserveAspectRatio="none">
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stop-color="#E8A020" stop-opacity="0.35"/>
                <stop offset="100%" stop-color="#E8A020" stop-opacity="0"/>
              </linearGradient>
            </defs>
            <path :d="revenuePath(data.timeSeries)" fill="url(#revGrad)" />
            <polyline :points="revenuePoints(data.timeSeries)" fill="none" stroke="#E8A020" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <!-- X labels -->
            <text v-for="(pt, i) in data.timeSeries" :key="i"
              :x="pad + (i / (data.timeSeries.length - 1)) * (chartW - pad * 2)"
              :y="chartH - 4" text-anchor="middle" font-size="9" fill="#9CA3AF">{{ pt.label }}</text>
          </svg>
        </div>
      </div>

      <!-- Orders chart -->
      <div class="card">
        <h3 class="card-title">{{ lang === 'tk' ? 'Sargytlar sany' : 'Количество заказов' }}</h3>
        <div class="chart-wrap">
          <svg :viewBox="`0 0 ${chartW} ${chartH}`" class="chart-svg" preserveAspectRatio="none">
            <rect v-for="(b, i) in ordersBars(data.timeSeries)" :key="i"
              :x="b.x" :y="b.y" :width="b.w" :height="b.h"
              rx="3" fill="#3B82F6" opacity="0.85"/>
            <text v-for="(pt, i) in data.timeSeries" :key="'l'+i"
              :x="pad + (i / data.timeSeries.length) * (chartW - pad * 2) + ((chartW - pad * 2) / data.timeSeries.length * 0.6) / 2 + (chartW - pad * 2) / data.timeSeries.length * 0.2"
              :y="chartH - 4" text-anchor="middle" font-size="9" fill="#9CA3AF">{{ pt.label }}</text>
          </svg>
        </div>
      </div>

      <!-- Top products -->
      <div class="card">
        <h3 class="card-title">{{ lang === 'tk' ? 'Iň köp satylýan' : 'Топ продуктов' }}</h3>
        <div class="top-list">
          <div v-for="(p, i) in data.topProducts" :key="p.id" class="top-row">
            <span :class="['rank', 'rank-'+(i+1)]">{{ i + 1 }}</span>
            <span class="top-img">{{ p.image }}</span>
            <div class="top-info">
              <div class="top-name">{{ lang === 'tk' ? p.nameTk : p.nameRu }}</div>
              <div class="top-bar-wrap">
                <div class="top-bar" :style="{ width: (p.sold / (data.topProducts[0]?.sold || 1) * 100) + '%' }"></div>
              </div>
            </div>
            <span class="top-sold">{{ p.sold }} {{ lang === 'tk' ? 'sat.' : 'прод.' }}</span>
          </div>
        </div>
      </div>

    </template>
  </div>
</template>

<style scoped>
.analytics { display: flex; flex-direction: column; gap: 16px; }
.range-bar { display: flex; gap: 4px; background: var(--white); border: 1.5px solid var(--border); border-radius: var(--radius-md); padding: 4px; width: fit-content; }
.rtab { padding: 6px 18px; border-radius: var(--radius-sm); border: none; background: transparent; font-size: 13px; font-weight: 700; color: var(--subtle); cursor: pointer; font-family: var(--font-body); transition: all .15s; }
.rtab.active { background: var(--dark); color: var(--white); }
.loading-state { display: flex; justify-content: center; padding: 80px; }
.spinner { width: 32px; height: 32px; border: 3px solid var(--border); border-top-color: var(--gold); border-radius: 50%; animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.kpi-card { background: var(--white); border-radius: var(--radius-lg); padding: 18px 20px; border: 1.5px solid var(--border-light); box-shadow: var(--shadow-sm); }
.kpi-label { font-size: 12px; color: var(--subtle); margin-bottom: 6px; }
.kpi-value { font-size: 24px; font-weight: 800; color: var(--dark); font-family: var(--font-display); }
.kpi-change { font-size: 12px; font-weight: 700; margin-top: 6px; }
.kpi-change.pos { color: #22C55E; }
.kpi-change.neg { color: #EF4444; }
.card { background: var(--white); border-radius: var(--radius-lg); padding: 20px 24px; border: 1.5px solid var(--border-light); box-shadow: var(--shadow-sm); }
.card-title { font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--dark); margin-bottom: 16px; }
.chart-wrap { width: 100%; overflow: hidden; }
.chart-svg { width: 100%; height: 180px; }
.top-list { display: flex; flex-direction: column; gap: 10px; }
.top-row { display: flex; align-items: center; gap: 12px; }
.rank { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; background: var(--border-light); color: var(--subtle); flex-shrink: 0; }
.rank-1 { background: #FEF3C7; color: #92400E; }
.rank-2 { background: #F3F4F6; color: #374151; }
.rank-3 { background: #FEF9EC; color: #B45309; }
.top-img  { font-size: 22px; flex-shrink: 0; }
.top-info { flex: 1; min-width: 0; }
.top-name { font-size: 13px; font-weight: 700; color: var(--dark); margin-bottom: 4px; }
.top-bar-wrap { height: 5px; background: var(--border-light); border-radius: var(--radius-pill); }
.top-bar  { height: 100%; background: linear-gradient(90deg, var(--gold), var(--gold-dark)); border-radius: var(--radius-pill); transition: width .4s ease; }
.top-sold { font-size: 13px; font-weight: 700; color: var(--gold); flex-shrink: 0; }
</style>
