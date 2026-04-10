<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useUiStore } from '@/stores/ui'
import { ordersApi, type Order, type OrderStatus } from '@/api/orders'
import type { Lang } from '@/types'
import CreateOrderModal from '@/components/CreateOrderModal.vue'

const ui   = useUiStore()
const lang = computed((): Lang => ui.lang)

const orders       = ref<Order[]>([])
const total        = ref(0)
const page         = ref(1)
const loading      = ref(true)
const search       = ref('')
const filter       = ref<'ALL' | OrderStatus>('ALL')
const drawer       = ref<Order | null>(null)
const updating     = ref(false)
const deleteTarget = ref<Order | null>(null)
const deleting     = ref(false)
const createOpen   = ref(false)

const toast = ref<{ msg: string; type: 'success' | 'error' } | null>(null)

function hasLineOptions(line: any): boolean {
  if (!line.options || !line.product?.options) return false
  // Debug: check actual keys
  const keys = Object.keys(line.options)
  console.log('Line options keys:', keys, 'options:', line.options)
  return keys.length > 0 && Array.isArray(line.product.options) && line.product.options.length > 0
}

function getLineOptions(line: any): any[] {
  if (!line.product?.options || !Array.isArray(line.product.options)) return []
  return line.product.options.filter((opt: any) => line.options?.[opt.id])
}
function showToast(msg: string, type: 'success' | 'error' = 'success') {
  toast.value = { msg, type }
  setTimeout(() => toast.value = null, 2800)
}

async function load() {
  loading.value = true
  try {
    const res = await ordersApi.list({ status: filter.value === 'ALL' ? undefined : filter.value, search: search.value || undefined, page: page.value })
    orders.value = res.data.items
    total.value  = res.data.total
  } catch (err: any) {
    console.error('Failed to load orders:', err)
    showToast(err?.response?.data?.message ?? 'Failed to load orders', 'error')
  } finally { loading.value = false }
}

// ── Polling + tab-focus refresh ───────────────────────────────────────────────
let pollTimer: ReturnType<typeof setInterval>

function onVisibilityChange() {
  if (document.visibilityState === 'visible') load()
}

onMounted(() => {
  load()
  pollTimer = setInterval(load, 30_000)                               // re-fetch every 30s
  document.addEventListener('visibilitychange', onVisibilityChange)  // re-fetch on tab focus
})

onUnmounted(() => {
  clearInterval(pollTimer)
  document.removeEventListener('visibilitychange', onVisibilityChange)
})

watch([filter, page], load)
let st: ReturnType<typeof setTimeout>
watch(search, () => { clearTimeout(st); st = setTimeout(() => { page.value = 1; load() }, 400) })

const STATUS_LABELS: Record<OrderStatus, Record<Lang, string>> = {
  PENDING:    { tk: 'Garaşylýar',  ru: 'Ожидание'  },
  PROCESSING: { tk: 'Işlenilýär',  ru: 'В работе'  },
  SHIPPED:    { tk: 'Ugradyldy',   ru: 'Отправлен' },
  DELIVERED:  { tk: 'Gowşuryldy', ru: 'Доставлен' },
  CANCELLED:  { tk: 'Ýatyryldy',  ru: 'Отменён'   },
}
const STATUS_OPTIONS: OrderStatus[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

const filters = computed(() => [
  { key: 'ALL', label: lang.value === 'tk' ? 'Hemmesi' : 'Все' },
  ...STATUS_OPTIONS.map(s => ({ key: s, label: STATUS_LABELS[s][lang.value] })),
])

const stats = computed(() => {
  const counts = STATUS_OPTIONS.reduce((a, s) => { a[s] = orders.value.filter(o => o.status === s).length; return a }, {} as Record<OrderStatus, number>)
  const l = lang.value
  return [
    { label: l === 'tk' ? 'Jemi' : 'Всего',    value: total.value            },
    { label: STATUS_LABELS.PENDING[l],           value: counts.PENDING    ?? 0 },
    { label: STATUS_LABELS.PROCESSING[l],        value: counts.PROCESSING ?? 0 },
    { label: STATUS_LABELS.DELIVERED[l],         value: counts.DELIVERED  ?? 0 },
  ]
})

async function updateStatus(order: Order, status: OrderStatus) {
  updating.value = true
  try {
    const res = await ordersApi.update(order.id, { status })
    if (drawer.value?.id === order.id) drawer.value = res.data
    await load()
    showToast(lang.value === 'tk' ? 'Ýagdaý täzelendi' : 'Статус обновлён')
  } catch (err: unknown) {
    showToast((err as any)?.response?.data?.message ?? 'Error', 'error')
  } finally { updating.value = false }
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await ordersApi.remove(deleteTarget.value.id)
    showToast(lang.value === 'tk' ? 'Sargyt pozuldy' : 'Заказ удалён')
    deleteTarget.value = null
    drawer.value = null
    await load()
  } catch (e: any) {
    showToast(e.response?.data?.message ?? 'Error', 'error')
  } finally { deleting.value = false }
}

function fmt(n: number | string) { return Number(n).toFixed(2) }
function fmtDate(d: string) { return new Date(d).toLocaleDateString(lang.value === 'tk' ? 'tk-TM' : 'ru-RU', { day: '2-digit', month: 'short', year: 'numeric' }) }

const subtotal = computed(() => {
  if (!drawer.value?.lines) return 0
  return drawer.value.lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0)
})

const delivery = computed(() => {
  if (!drawer.value) return 0
  const diff = drawer.value.total - subtotal.value
  return diff > 0 ? diff : 0
})
</script>

<template>
  <div class="orders">

    <Transition name="toast">
      <div v-if="toast" :class="['toast', toast.type]">{{ toast.msg }}</div>
    </Transition>

    <!-- Stats -->
    <div class="stats-grid">
      <div v-for="s in stats" :key="s.label" class="stat-card">
        <div class="stat-value">{{ s.value }}</div>
        <div class="stat-label">{{ s.label }}</div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="filter-tabs">
        <button v-for="f in filters" :key="f.key" :class="['ftab', { active: filter === f.key }]" @click="filter = f.key as any; page = 1">{{ f.label }}</button>
      </div>
      <div class="search-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="search" class="search" :placeholder="lang === 'tk' ? 'Gözle...' : 'Поиск...'" />
      </div>

      <!-- Manual refresh button -->
      <button
        class="refresh-btn"
        :disabled="loading"
        :title="lang === 'tk' ? 'Täzele' : 'Обновить'"
        @click="load()"
      >
        <svg
          viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          :style="loading ? 'animation: spin .7s linear infinite' : ''"
        >
          <polyline points="23 4 23 10 17 10"/>
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
        </svg>
      </button>

      <button class="new-order-btn" @click="createOpen = true">
        + {{ lang === 'tk' ? 'Sargyt döret' : 'Новый заказ' }}
      </button>
    </div>

    <!-- Table -->
    <div class="card">
      <div v-if="loading" class="table-loading"><div class="spinner"></div></div>
      <template v-else>
        <div class="table">
          <div class="t-head">
            <span>{{ lang === 'tk' ? 'Sargyt' : 'Заказ' }}</span>
            <span>{{ lang === 'tk' ? 'Müşderi' : 'Клиент' }}</span>
            <span>{{ lang === 'tk' ? 'Sarylar' : 'Позиции' }}</span>
            <span>{{ lang === 'tk' ? 'Jemi' : 'Сумма' }}</span>
            <span>{{ lang === 'tk' ? 'Ýagdaý' : 'Статус' }}</span>
            <span>{{ lang === 'tk' ? 'Sene' : 'Дата' }}</span>
            <span></span>
          </div>
          <div v-for="o in orders" :key="o.id" class="t-row" @click="drawer = o">
            <span class="order-id">#{{ o.id.slice(-6).toUpperCase() }}</span>
            <div class="cust-cell">
              <div class="cust-name">{{ o.customer?.name }}</div>
              <div class="cust-email">{{ o.customer?.email }}</div>
            </div>
            <span class="cell-muted">{{ o.lines?.length ?? 0 }}</span>
            <span class="cell-bold">${{ fmt(o.total) }}</span>
            <span :class="['badge', o.status.toLowerCase()]">{{ STATUS_LABELS[o.status]?.[lang] }}</span>
            <span class="cell-muted">{{ fmtDate(o.createdAt) }}</span>
            <div class="actions" @click.stop>
              <button class="act-btn del" @click="deleteTarget = o">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
              </button>
            </div>
          </div>
          <div v-if="!orders.length" class="empty">{{ lang === 'tk' ? 'Sargyt tapylmady' : 'Заказы не найдены' }}</div>
        </div>
      </template>
    </div>

    <!-- Drawer -->
    <Transition name="drawer">
      <div v-if="drawer" class="drawer-overlay" @click.self="drawer = null">
        <div class="drawer">
          <div class="drawer-head">
            <div>
              <h3>#{{ drawer.id.slice(-6).toUpperCase() }}</h3>
              <p>{{ fmtDate(drawer.createdAt) }}</p>
            </div>
            <button class="close-btn" @click="drawer = null">×</button>
          </div>

          <!-- Customer -->
          <div class="drawer-section">
            <div class="section-title">{{ lang === 'tk' ? 'Müşderi' : 'Клиент' }}</div>
            <div class="info-card">
              <div class="info-row"><span>{{ lang === 'tk' ? 'Ady' : 'Имя' }}</span><strong>{{ drawer.customer?.name }}</strong></div>
              <div class="info-row"><span>{{ lang === 'tk' ? 'E-poçta' : 'Email' }}</span><strong>{{ drawer.customer?.email }}</strong></div>
              <div class="info-row"><span>{{ lang === 'tk' ? 'Telefon' : 'Телефон' }}</span><strong>{{ drawer.customer?.phone }}</strong></div>
              <div class="info-row"><span>{{ lang === 'tk' ? 'Salgy' : 'Адрес' }}</span><strong>{{ drawer.customer?.address }}</strong></div>
            </div>
          </div>

          <!-- Lines -->
          <div class="drawer-section">
            <div class="section-title">{{ lang === 'tk' ? 'Önümler' : 'Товары' }}</div>
            <div class="lines">
              <div v-for="l in drawer.lines" :key="l.id" class="line-row">
                <span class="line-img">{{ l.product?.image ?? '📦' }}</span>
                <div class="line-info">
                  <div class="line-name">{{ lang === 'tk' ? l.product?.nameTk : l.product?.nameRu }}</div>
                  <div class="line-qty">× {{ l.qty }}</div>
                  <div v-if="hasLineOptions(l)" class="line-options">
                    <span v-for="opt in getLineOptions(l)" :key="opt.id" class="line-opt">
                      {{ lang === 'tk' ? opt.nameTk : opt.nameRu }}: <strong>{{ l.options[opt.id] }}</strong>
                    </span>
                  </div>
                </div>
                <span class="line-price">${{ fmt(l.unitPrice * l.qty) }}</span>
              </div>
            </div>
            <div class="summary-section">
              <div class="summary-row">
                <span>{{ lang === 'tk' ? 'Ara jemi' : 'Подытог' }}</span>
                <span>${{ fmt(subtotal) }}</span>
              </div>
              <div v-if="delivery > 0" class="summary-row">
                <span>{{ lang === 'tk' ? 'Eltip beriş' : 'Доставка' }}</span>
                <span>${{ fmt(delivery) }}</span>
              </div>
              <div class="summary-divider" />
              <div class="summary-row total">
                <span>{{ lang === 'tk' ? 'Jemi' : 'Итого' }}</span>
                <strong>${{ fmt(drawer.total) }}</strong>
              </div>
            </div>
          </div>

          <!-- Note -->
          <div v-if="drawer.note" class="drawer-section">
            <div class="section-title">{{ lang === 'tk' ? 'Bellik' : 'Примечание' }}</div>
            <div class="note">{{ drawer.note }}</div>
          </div>

          <!-- Status change -->
          <div class="drawer-section">
            <div class="section-title">{{ lang === 'tk' ? 'Ýagdaýy üýtget' : 'Изменить статус' }}</div>
            <div class="status-btns">
              <button v-for="s in STATUS_OPTIONS" :key="s"
                :class="['status-btn', s.toLowerCase(), { active: drawer.status === s }]"
                :disabled="updating || drawer.status === s"
                @click="updateStatus(drawer, s)">
                {{ STATUS_LABELS[s][lang] }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Delete confirm -->
    <Transition name="modal">
      <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
        <div class="modal">
          <div class="modal-head">
            <h3>{{ lang === 'tk' ? 'Pozmagy tassykla' : 'Подтвердить удаление' }}</h3>
            <button class="close-btn" @click="deleteTarget = null">×</button>
          </div>
          <div class="modal-body"><p>{{ lang === 'tk' ? `"#${deleteTarget?.id.slice(-6).toUpperCase()}" sargydyny pozmak isleýärsiňizmi?` : `Удалить заказ "#${deleteTarget?.id.slice(-6).toUpperCase()}"?` }}</p></div>
          <div class="modal-foot">
            <button class="cancel-btn" @click="deleteTarget = null">{{ lang === 'tk' ? 'Ýok' : 'Нет' }}</button>
            <button class="del-confirm-btn" :disabled="deleting" @click="confirmDelete">{{ deleting ? '...' : (lang === 'tk' ? 'Hawa, poz' : 'Да, удалить') }}</button>
          </div>
        </div>
      </div>
    </Transition>

    <CreateOrderModal
      :open="createOpen"
      :lang="lang"
      @close="createOpen = false"
      @created="load()"
    />
  </div>
</template>

<style scoped>
.orders { display: flex; flex-direction: column; gap: 16px; }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.stat-card { background: var(--white); border-radius: var(--radius-lg); padding: 16px 20px; border: 1.5px solid var(--border-light); box-shadow: var(--shadow-sm); }
.stat-value { font-size: 24px; font-weight: 800; color: var(--dark); font-family: var(--font-display); }
.stat-label { font-size: 12px; color: var(--subtle); margin-top: 4px; }
.toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.filter-tabs { display: flex; gap: 4px; background: var(--white); border: 1.5px solid var(--border); border-radius: var(--radius-md); padding: 4px; flex-wrap: wrap; }
.ftab { padding: 5px 12px; border-radius: var(--radius-sm); border: none; background: transparent; font-size: 12px; font-weight: 600; color: var(--subtle); cursor: pointer; font-family: var(--font-body); transition: all .15s; }
.ftab.active { background: var(--dark); color: var(--white); }
.search-wrap { position: relative; }
.search-wrap svg { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); width: 14px; height: 14px; color: var(--subtle); }
.search { height: 38px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--white); padding: 0 12px 0 32px; font-size: 13px; font-family: var(--font-body); color: var(--dark); outline: none; width: 200px; }
.search:focus { border-color: var(--gold); }

/* Refresh button */
.refresh-btn {
  width: 38px; height: 38px;
  border-radius: var(--radius-md); border: 1.5px solid var(--border);
  background: var(--white); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: var(--muted); transition: all .15s; flex-shrink: 0;
}
.refresh-btn:hover:not(:disabled) { border-color: var(--gold); color: var(--gold); }
.refresh-btn:disabled { opacity: .5; cursor: not-allowed; }
.refresh-btn svg { width: 15px; height: 15px; }

.card { background: var(--white); border-radius: var(--radius-lg); border: 1.5px solid var(--border-light); overflow: hidden; box-shadow: var(--shadow-sm); }
.table-loading { display: flex; justify-content: center; padding: 60px; }
.spinner { width: 30px; height: 30px; border: 3px solid var(--border); border-top-color: var(--gold); border-radius: 50%; animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.t-head { display: grid; grid-template-columns: 90px 1.5fr 60px 80px 120px 100px 50px; gap: 8px; padding: 10px 20px; background: var(--surface); font-size: 11px; font-weight: 700; color: var(--subtle); text-transform: uppercase; letter-spacing: .04em; }
.t-row { display: grid; grid-template-columns: 90px 1.5fr 60px 80px 120px 100px 50px; gap: 8px; padding: 12px 20px; border-top: 1px solid var(--border-light); align-items: center; cursor: pointer; transition: background .12s; }
.t-row:hover { background: var(--surface); }
.order-id { font-size: 12px; font-weight: 700; color: var(--gold); font-family: monospace; }
.cust-name  { font-size: 13px; font-weight: 700; color: var(--dark); }
.cust-email { font-size: 11px; color: var(--subtle); margin-top: 1px; }
.cell-muted { font-size: 13px; color: var(--subtle); }
.cell-bold  { font-size: 13px; font-weight: 700; color: var(--dark); }
.badge { display: inline-flex; align-items: center; padding: 3px 9px; border-radius: var(--radius-pill); font-size: 11px; font-weight: 700; }
.badge.pending    { background: #FEF3C7; color: #92400E; }
.badge.processing { background: #DBEAFE; color: #1E40AF; }
.badge.shipped    { background: #EDE9FE; color: #5B21B6; }
.badge.delivered  { background: #DCFCE7; color: #14532D; }
.badge.cancelled  { background: #FEE2E2; color: #991B1B; }
.actions { display: flex; gap: 6px; }
.act-btn { width: 30px; height: 30px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--surface); cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--muted); transition: all .15s; }
.act-btn svg { width: 13px; height: 13px; }
.act-btn.del:hover { border-color: var(--error); color: var(--error); background: var(--error-bg); }
.empty { padding: 40px; text-align: center; color: var(--subtle); font-size: 14px; }

/* Drawer */
.drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.35); z-index: 900; }
.drawer { position: fixed; top: 0; right: 0; width: 420px; height: 100vh; background: var(--white); box-shadow: -8px 0 40px rgba(0,0,0,.15); overflow-y: auto; display: flex; flex-direction: column; }
.drawer-head { display: flex; align-items: flex-start; justify-content: space-between; padding: 24px; border-bottom: 1px solid var(--border-light); }
.drawer-head h3 { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--dark); }
.drawer-head p  { font-size: 12px; color: var(--subtle); margin-top: 3px; }
.close-btn { width: 30px; height: 30px; border-radius: 50%; border: none; background: var(--surface); font-size: 18px; cursor: pointer; color: var(--muted); }
.drawer-section { padding: 16px 24px; border-bottom: 1px solid var(--border-light); }
.section-title { font-size: 11px; font-weight: 700; color: var(--subtle); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 10px; }
.info-card { background: var(--surface); border-radius: var(--radius-md); padding: 12px; display: flex; flex-direction: column; gap: 8px; }
.info-row { display: flex; justify-content: space-between; font-size: 13px; }
.info-row span { color: var(--subtle); }
.info-row strong { color: var(--dark); }
.lines { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
.line-row { display: flex; align-items: center; gap: 10px; padding: 8px; border-radius: var(--radius-md); background: var(--surface); }
.line-img  { font-size: 22px; }
.line-info { flex: 1; }
.line-name { font-size: 13px; font-weight: 700; color: var(--dark); }
.line-qty  { font-size: 12px; color: var(--subtle); margin-top: 2px; }
.line-options {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 2px;
}
.line-opt {
  font-size: 11px;
  color: var(--subtle);
  background: var(--surface);
  padding: 1px 6px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--border-light);
}
.line-opt strong {
  color: var(--gold);
  font-weight: 700;
}
.line-price { font-size: 14px; font-weight: 700; color: var(--dark); }
.summary-section { display: flex; flex-direction: column; gap: 8px; }
.summary-row { display: flex; justify-content: space-between; font-size: 13px; color: var(--subtle); }
.summary-row span:last-child { font-weight: 600; color: var(--dark); }
.summary-divider { height: 1px; background: var(--border-light); margin: 4px 0; }
.summary-row.total { font-size: 15px; padding-top: 8px; border-top: 1px solid var(--border-light); }
.summary-row.total span { color: var(--dark); font-weight: 800; }
.summary-row.total span:last-child { font-size: 18px; font-family: var(--font-display); color: var(--gold); }
.note { font-size: 13px; color: var(--dark); background: var(--surface); border-radius: var(--radius-md); padding: 10px 12px; line-height: 1.5; }
.status-btns { display: flex; flex-wrap: wrap; gap: 8px; }
.status-btn { padding: 6px 14px; border-radius: var(--radius-pill); border: 1.5px solid var(--border); background: var(--surface); font-size: 12px; font-weight: 700; cursor: pointer; font-family: var(--font-body); transition: all .15s; color: var(--muted); }
.status-btn:disabled { cursor: not-allowed; }
.status-btn.active { cursor: default; }
.status-btn.pending.active    { background: #FEF3C7; border-color: #F59E0B; color: #92400E; }
.status-btn.processing.active { background: #DBEAFE; border-color: #3B82F6; color: #1E40AF; }
.status-btn.shipped.active    { background: #EDE9FE; border-color: #8B5CF6; color: #5B21B6; }
.status-btn.delivered.active  { background: #DCFCE7; border-color: #22C55E; color: #14532D; }
.status-btn.cancelled.active  { background: #FEE2E2; border-color: #EF4444; color: #991B1B; }
.status-btn:not(.active):hover { border-color: var(--gold); color: var(--gold); background: var(--gold-glow); }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
.modal { background: var(--white); border-radius: var(--radius-xl); width: 100%; max-width: 380px; box-shadow: 0 24px 64px rgba(0,0,0,.3); }
.modal-head { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 0; }
.modal-head h3 { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--dark); }
.modal-body { padding: 16px 24px; }
.modal-body p { font-size: 14px; color: var(--dark); }
.modal-foot { display: flex; gap: 10px; justify-content: flex-end; padding: 0 24px 20px; }
.cancel-btn { height: 38px; padding: 0 16px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--surface); font-size: 13px; font-weight: 600; color: var(--muted); cursor: pointer; font-family: var(--font-body); }
.del-confirm-btn { height: 38px; padding: 0 20px; border-radius: var(--radius-md); border: none; background: var(--error); font-size: 13px; font-weight: 700; color: var(--white); cursor: pointer; font-family: var(--font-body); }

/* Toast */
.toast { position: fixed; bottom: 24px; right: 24px; padding: 12px 20px; border-radius: var(--radius-md); font-size: 14px; font-weight: 700; z-index: 9999; box-shadow: 0 8px 24px rgba(0,0,0,.15); }
.toast.success { background: #22C55E; color: var(--white); }
.toast.error   { background: var(--error); color: var(--white); }
.toast-enter-active, .toast-leave-active { transition: all .25s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(12px); }
.drawer-enter-active, .drawer-leave-active { transition: opacity .2s; }
.drawer-enter-active .drawer, .drawer-leave-active .drawer { transition: transform .25s cubic-bezier(.4,0,.2,1); }
.drawer-enter-from .drawer, .drawer-leave-to .drawer { transform: translateX(100%); }
.drawer-enter-from, .drawer-leave-to { opacity: 0; }
.modal-enter-active, .modal-leave-active { transition: opacity .2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.new-order-btn {
  height: 38px; padding: 0 18px;
  border-radius: var(--radius-md); border: none;
  background: var(--gold); color: var(--white);
  font-size: 13px; font-weight: 700;
  cursor: pointer; font-family: var(--font-body);
  white-space: nowrap; transition: background .15s;
}
.new-order-btn:hover { background: var(--gold-dark); }
</style>
