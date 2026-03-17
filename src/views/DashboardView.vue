<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useUiStore } from '@/stores/ui'
import { dashboardApi, type DashboardResponse } from '@/api/dashboard'

const ui   = useUiStore()
const lang = computed(() => ui.lang)

const data    = ref<DashboardResponse | null>(null)
const loading = ref(true)
const error   = ref<string | null>(null)

onMounted(async () => {
  try {
    const res = await dashboardApi.get()
    data.value = res.data
  } catch (e: any) {
    error.value = e.response?.data?.message ?? 'Failed to load dashboard'
  } finally {
    loading.value = false
  }
})

const STATUS_LABELS: Record<string, Record<string, string>> = {
  pending:    { tk: 'Garaşylýar',   ru: 'Ожидание'    },
  processing: { tk: 'Işlenilýär',   ru: 'В работе'    },
  shipped:    { tk: 'Ugradyldy',    ru: 'Отправлен'   },
  delivered:  { tk: 'Gowşuryldy',  ru: 'Доставлен'   },
  cancelled:  { tk: 'Ýatyryldy',   ru: 'Отменён'     },
}
const STATUS_CLASS: Record<string, string> = {
  PENDING: 'pending', PROCESSING: 'processing',
  SHIPPED: 'shipped', DELIVERED: 'delivered', CANCELLED: 'cancelled',
}

function fmt(n: number) { return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }
function fmtDate(d: string) { return new Date(d).toLocaleDateString(lang.value === 'tk' ? 'tk-TM' : 'ru-RU', { day: '2-digit', month: 'short' }) }

const stats = computed(() => {
  if (!data.value) return []
  const s = data.value.stats
  const l = lang.value
  return [
    { label: l === 'tk' ? 'Umumy girdéji' : 'Общий доход',      value: `$${fmt(s.revenue)}`,   icon: '💰', color: '#E8A020' },
    { label: l === 'tk' ? 'Sargytlar'     : 'Заказы',            value: s.orders,                icon: '📦', color: '#3B82F6' },
    { label: l === 'tk' ? 'Müşderiler'   : 'Клиенты',           value: s.customers,             icon: '👥', color: '#22C55E' },
    { label: l === 'tk' ? 'Önümler'      : 'Товары',             value: s.products,              icon: '🛍️', color: '#8B5CF6' },
  ]
})
</script>

<template>
  <div class="dashboard">

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="() => { loading = true; dashboardApi.get().then(r => { data = r.data; error = null }).catch(() => {}).finally(() => loading = false) }">
        {{ lang === 'tk' ? 'Täzeden synanyş' : 'Повторить' }}
      </button>
    </div>

    <template v-else-if="data">
      <!-- Stat cards -->
      <div class="stats-grid">
        <div v-for="s in stats" :key="s.label" class="stat-card">
          <div class="stat-icon" :style="{ background: s.color + '18', color: s.color }">{{ s.icon }}</div>
          <div class="stat-body">
            <div class="stat-value">{{ s.value }}</div>
            <div class="stat-label">{{ s.label }}</div>
          </div>
        </div>
      </div>

      <!-- Status breakdown + recent orders -->
      <div class="row">

        <!-- Order statuses -->
        <div class="card status-card">
          <h3 class="card-title">{{ lang === 'tk' ? 'Sargyt ýagdaýlary' : 'Статусы заказов' }}</h3>
          <div class="status-list">
            <div v-for="(count, key) in data.ordersByStatus" :key="key" class="status-row">
              <span :class="['badge', key]">{{ STATUS_LABELS[key]?.[lang] ?? key }}</span>
              <div class="status-bar-wrap">
                <div class="status-bar" :class="key"
                  :style="{ width: data.stats.orders ? (count / data.stats.orders * 100) + '%' : '0%' }"></div>
              </div>
              <span class="status-count">{{ count }}</span>
            </div>
          </div>
        </div>

        <!-- Recent orders -->
        <div class="card orders-card">
          <h3 class="card-title">{{ lang === 'tk' ? 'Soňky sargytlar' : 'Последние заказы' }}</h3>
          <div class="orders-table">
            <div class="orders-head">
              <span>{{ lang === 'tk' ? 'ID' : 'ID' }}</span>
              <span>{{ lang === 'tk' ? 'Müşderi' : 'Клиент' }}</span>
              <span>{{ lang === 'tk' ? 'Jemi' : 'Сумма' }}</span>
              <span>{{ lang === 'tk' ? 'Ýagdaý' : 'Статус' }}</span>
              <span>{{ lang === 'tk' ? 'Sene' : 'Дата' }}</span>
            </div>
            <div v-for="o in data.recentOrders" :key="o.id" class="order-row">
              <span class="order-id">#{{ o.id.slice(-6).toUpperCase() }}</span>
              <span class="order-customer">{{ o.customer?.name ?? '—' }}</span>
              <span class="order-total">${{ fmt(o.total) }}</span>
              <span :class="['badge', STATUS_CLASS[o.status] ?? '']">{{ STATUS_LABELS[o.status?.toLowerCase()]?.[lang] ?? o.status }}</span>
              <span class="order-date">{{ fmtDate(o.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Top products -->
      <div class="card">
        <h3 class="card-title">{{ lang === 'tk' ? 'Iň köp satylýan önümler' : 'Топ продукты' }}</h3>
        <div class="top-products">
          <div v-for="(p, i) in data.topProducts" :key="p.id" class="product-row">
            <span class="rank" :class="['rank-' + (i+1)]">{{ i + 1 }}</span>
            <span class="prod-img">{{ p.image }}</span>
            <div class="prod-info">
              <div class="prod-name">{{ lang === 'tk' ? p.nameTk : p.nameRu }}</div>
              <div class="prod-cat">{{ lang === 'tk' ? p.category?.nameTk : p.category?.nameRu }}</div>
            </div>
            <div class="prod-stats">
              <span class="prod-sold">{{ p.sold }} {{ lang === 'tk' ? 'sat.' : 'прод.' }}</span>
              <span class="prod-price">${{ fmt(p.price) }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.dashboard { display: flex; flex-direction: column; gap: 20px; }

.loading-state { display: flex; justify-content: center; padding: 80px; }
.spinner { width: 36px; height: 36px; border: 3px solid var(--border); border-top-color: var(--gold); border-radius: 50%; animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.error-state { text-align: center; padding: 60px; color: var(--error); }
.error-state button { margin-top: 12px; padding: 8px 20px; border-radius: var(--radius-md); border: 1.5px solid var(--gold); background: none; color: var(--gold); font-family: var(--font-body); font-weight: 700; cursor: pointer; }

.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.stat-card { background: var(--white); border-radius: var(--radius-lg); padding: 18px 20px; border: 1.5px solid var(--border-light); display: flex; align-items: center; gap: 14px; box-shadow: var(--shadow-sm); }
.stat-icon { width: 46px; height: 46px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
.stat-value { font-size: 22px; font-weight: 800; color: var(--dark); font-family: var(--font-display); line-height: 1; }
.stat-label { font-size: 12px; color: var(--subtle); margin-top: 4px; }

.row { display: grid; grid-template-columns: 1fr 2fr; gap: 16px; }
.card { background: var(--white); border-radius: var(--radius-lg); padding: 20px 24px; border: 1.5px solid var(--border-light); box-shadow: var(--shadow-sm); }
.card-title { font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--dark); margin-bottom: 16px; }

/* Statuses */
.status-list { display: flex; flex-direction: column; gap: 10px; }
.status-row { display: grid; grid-template-columns: 100px 1fr 32px; align-items: center; gap: 10px; }
.status-bar-wrap { height: 6px; background: var(--border-light); border-radius: var(--radius-pill); overflow: hidden; }
.status-bar { height: 100%; border-radius: var(--radius-pill); transition: width .4s ease; }
.status-bar.pending    { background: #F59E0B; }
.status-bar.processing { background: #3B82F6; }
.status-bar.shipped    { background: #8B5CF6; }
.status-bar.delivered  { background: #22C55E; }
.status-bar.cancelled  { background: #EF4444; }
.status-count { font-size: 12px; font-weight: 700; color: var(--dark); text-align: right; }

/* Orders table */
.orders-table { display: flex; flex-direction: column; gap: 2px; }
.orders-head { display: grid; grid-template-columns: 80px 1fr 80px 110px 70px; gap: 8px; padding: 6px 8px; font-size: 11px; font-weight: 700; color: var(--subtle); text-transform: uppercase; letter-spacing: .04em; }
.order-row { display: grid; grid-template-columns: 80px 1fr 80px 110px 70px; gap: 8px; padding: 8px; border-radius: var(--radius-md); align-items: center; transition: background .12s; }
.order-row:hover { background: var(--surface); }
.order-id { font-size: 12px; font-weight: 700; color: var(--gold); font-family: monospace; }
.order-customer { font-size: 13px; font-weight: 600; color: var(--dark); }
.order-total { font-size: 13px; font-weight: 700; color: var(--dark); }
.order-date { font-size: 12px; color: var(--subtle); }

/* Badges */
.badge { display: inline-flex; align-items: center; padding: 3px 9px; border-radius: var(--radius-pill); font-size: 11px; font-weight: 700; }
.badge.pending    { background: #FEF3C7; color: #92400E; }
.badge.processing { background: #DBEAFE; color: #1E40AF; }
.badge.shipped    { background: #EDE9FE; color: #5B21B6; }
.badge.delivered  { background: #DCFCE7; color: #14532D; }
.badge.cancelled  { background: #FEE2E2; color: #991B1B; }

/* Top products */
.top-products { display: flex; flex-direction: column; gap: 10px; }
.product-row { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: var(--radius-md); transition: background .12s; }
.product-row:hover { background: var(--surface); }
.rank { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; background: var(--border-light); color: var(--subtle); flex-shrink: 0; }
.rank-1 { background: #FEF3C7; color: #92400E; }
.rank-2 { background: #F3F4F6; color: #374151; }
.rank-3 { background: #FEF9EC; color: #B45309; }
.prod-img { font-size: 24px; flex-shrink: 0; }
.prod-info { flex: 1; min-width: 0; }
.prod-name { font-size: 14px; font-weight: 700; color: var(--dark); }
.prod-cat  { font-size: 12px; color: var(--subtle); margin-top: 2px; }
.prod-stats { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
.prod-sold  { font-size: 12px; font-weight: 700; color: var(--gold); }
.prod-price { font-size: 13px; font-weight: 700; color: var(--dark); }

@media (max-width: 900px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .row { grid-template-columns: 1fr; }
}
</style>
