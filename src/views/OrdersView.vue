<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUiStore } from '@/stores/ui'
import OrderTable  from './orders/OrderTable.vue'
import OrderDrawer from './orders/OrderDrawer.vue'
import type { OrderItem, OrderStatus } from '@/types'

const ui   = useUiStore()
const lang = computed(() => ui.lang)

const L = computed(() => lang.value === 'tk' ? {
  total: 'Jemi sargyt', pending: 'Garaşylýar', processing: 'Işlenýär', delivered: 'Eltildi',
  search: 'Sargyt gözle...', all: 'Hemmesi',
  deleteConfirm: 'Bu sargydy pozmak isleýärsiňizmi?',
  showing: 'Görkezilýär', of: '/',
} : {
  total: 'Всего заказов', pending: 'Ожидают', processing: 'В обработке', delivered: 'Доставлено',
  search: 'Поиск заказа...', all: 'Все',
  deleteConfirm: 'Удалить этот заказ?',
  showing: 'Показано', of: 'из',
})

// ── Mock data ─────────────────────────────────────────────────────────────────
const orders = ref<OrderItem[]>([
  {
    id: 'ORD-4825', customer: 'Merdan Ataýew', email: 'merdan@mail.com', phone: '+993 65 123456',
    address: 'Aşgabat, Bitarap Türkmenistan köç. 12, 16-njy öý',
    lines: [
      { productId: 'PRD-001', name: { tk: 'Simsiz Gulaklyk Pro',   ru: 'Наушники Pro'        }, image: '🎧', qty: 1, unitPrice: 24.99 },
      { productId: 'PRD-003', name: { tk: 'Göçme Zarýadlaýjy',    ru: 'Портативная зарядка' }, image: '🔋', qty: 2, unitPrice: 12.99 },
    ],
    total: 50.97, status: 'delivered', date: '08.03.2026',
  },
  {
    id: 'ORD-4824', customer: 'Aýna Durdyýewa', email: 'ayna@mail.com', phone: '+993 62 654321',
    address: 'Aşgabat, Görogly köç. 44, 3-nji öý',
    lines: [
      { productId: 'PRD-002', name: { tk: 'Akylly Sagat Series 3', ru: 'Умные часы Series 3' }, image: '⌚', qty: 1, unitPrice: 89.99 },
    ],
    total: 89.99, status: 'shipped', date: '08.03.2026',
    note: 'Sowgat bukjasy bilen iberilmegini haýyş edýärin.',
  },
  {
    id: 'ORD-4823', customer: 'Serdar Nurýew', email: 'serdar@mail.com', phone: '+993 61 987654',
    address: 'Mary, Mollanepes köç. 7, 22-nji öý',
    lines: [
      { productId: 'PRD-004', name: { tk: 'Bluetooth Dinamigi',   ru: 'Bluetooth-колонка'   }, image: '🔊', qty: 2, unitPrice: 24.99 },
      { productId: 'PRD-005', name: { tk: 'Kamera Çantasy',       ru: 'Сумка для камеры'    }, image: '🎒', qty: 1, unitPrice: 18.50 },
      { productId: 'PRD-009', name: { tk: 'Ýüz Kremi',            ru: 'Крем для лица'       }, image: '🧴', qty: 3, unitPrice: 15.00 },
    ],
    total: 113.48, status: 'processing', date: '07.03.2026',
  },
  {
    id: 'ORD-4822', customer: 'Güljeren Orazowa', email: 'guljeren@mail.com', phone: '+993 63 112233',
    address: 'Türkmenabat, Magtymguly köç. 3, 5-nji öý',
    lines: [
      { productId: 'PRD-006', name: { tk: 'Akylly Lampochka',     ru: 'Умная лампочка'      }, image: '💡', qty: 2, unitPrice: 9.99  },
    ],
    total: 24.97, status: 'pending', date: '07.03.2026',
  },
  {
    id: 'ORD-4821', customer: 'Döwlet Hojamow', email: 'dowlet@mail.com', phone: '+993 64 445566',
    address: 'Balkanabat, Ruhy köç. 18, 9-njy öý',
    lines: [
      { productId: 'PRD-007', name: { tk: 'USB-C Hub 7-in-1',     ru: 'USB-C Hub 7-в-1'    }, image: '🔌', qty: 1, unitPrice: 34.99 },
      { productId: 'PRD-010', name: { tk: 'Mehaniki Klawiatura',  ru: 'Механическая клавиатура' }, image: '⌨️', qty: 1, unitPrice: 59.99 },
    ],
    total: 99.97, status: 'cancelled', date: '06.03.2026',
    note: 'Müşderi yzyna gaýtarma talap etdi.',
  },
  {
    id: 'ORD-4820', customer: 'Orazgül Annaýewa', email: 'orazgul@mail.com', phone: '+993 65 778899',
    address: 'Aşgabat, Andalyp köç. 56, 12-nji öý',
    lines: [
      { productId: 'PRD-008', name: { tk: 'Sport Köwüş Nike',     ru: 'Кроссовки Nike'      }, image: '👟', qty: 1, unitPrice: 79.99 },
    ],
    total: 84.98, status: 'pending', date: '06.03.2026',
  },
  {
    id: 'ORD-4819', customer: 'Baýram Myradow', email: 'bayram@mail.com', phone: '+993 62 334455',
    address: 'Daşoguz, Nurmuhammet Andalyp köç. 2, 7-nji öý',
    lines: [
      { productId: 'PRD-001', name: { tk: 'Simsiz Gulaklyk Pro',   ru: 'Наушники Pro'        }, image: '🎧', qty: 2, unitPrice: 24.99 },
      { productId: 'PRD-004', name: { tk: 'Bluetooth Dinamigi',   ru: 'Bluetooth-колонка'   }, image: '🔊', qty: 1, unitPrice: 24.99 },
    ],
    total: 79.96, status: 'shipped', date: '05.03.2026',
  },
])

// ── Search + Filter ───────────────────────────────────────────────────────────
const search       = ref('')
const statusFilter = ref<OrderStatus | 'all'>('all')

const filtered = computed(() => {
  let list = orders.value
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(o =>
      o.id.toLowerCase().includes(q) ||
      o.customer.toLowerCase().includes(q) ||
      o.email.toLowerCase().includes(q)
    )
  }
  if (statusFilter.value !== 'all') {
    list = list.filter(o => o.status === statusFilter.value)
  }
  return list
})

// ── Summary counts ────────────────────────────────────────────────────────────
const totalCount     = computed(() => orders.value.length)
const pendingCount   = computed(() => orders.value.filter(o => o.status === 'pending').length)
const processingCount= computed(() => orders.value.filter(o => o.status === 'processing').length)
const deliveredCount = computed(() => orders.value.filter(o => o.status === 'delivered').length)

// ── Drawer ────────────────────────────────────────────────────────────────────
const drawerOpen  = ref(false)
const activeOrder = ref<OrderItem | null>(null)

function openDrawer(order: OrderItem) { activeOrder.value = order; drawerOpen.value = true }
function closeDrawer() { drawerOpen.value = false }

function onStatusChange(id: string, status: OrderStatus) {
  const o = orders.value.find(o => o.id === id)
  if (o) o.status = status
  // also update activeOrder so drawer re-renders immediately
  if (activeOrder.value?.id === id) activeOrder.value = { ...activeOrder.value, status }
}

// ── Delete ────────────────────────────────────────────────────────────────────
const deleteTarget  = ref<OrderItem | null>(null)
const deleteConfirm = ref(false)

function askDelete(order: OrderItem) {
  deleteTarget.value  = order
  deleteConfirm.value = true
}
function confirmDelete() {
  if (deleteTarget.value) {
    orders.value = orders.value.filter(o => o.id !== deleteTarget.value!.id)
    if (activeOrder.value?.id === deleteTarget.value.id) closeDrawer()
  }
  deleteTarget.value  = null
  deleteConfirm.value = false
}

const statusOptions: Array<OrderStatus | 'all'> = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled']
const statusLabel: Record<OrderStatus | 'all', Record<'tk' | 'ru', string>> = {
  all:        { tk: 'Hemmesi',     ru: 'Все'          },
  pending:    { tk: 'Garaşylýar', ru: 'Ожидает'      },
  processing: { tk: 'Işlenýär',   ru: 'В обработке'  },
  shipped:    { tk: 'Iberildi',   ru: 'Отправлен'    },
  delivered:  { tk: 'Eltildi',    ru: 'Доставлен'    },
  cancelled:  { tk: 'Ýatyryldy', ru: 'Отменён'      },
}
</script>

<template>
  <div class="view">

    <!-- Summary -->
    <div class="summary">
      <div class="s-card">
        <div class="s-icon" style="background:rgba(232,160,32,.1);color:var(--gold)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        </div>
        <div><p class="s-label">{{ L.total }}</p><p class="s-value">{{ totalCount }}</p></div>
      </div>
      <div class="s-card">
        <div class="s-icon" style="background:rgba(245,158,11,.1);color:#F59E0B">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <div><p class="s-label">{{ L.pending }}</p><p class="s-value" style="color:#F59E0B">{{ pendingCount }}</p></div>
      </div>
      <div class="s-card">
        <div class="s-icon" style="background:rgba(59,130,246,.1);color:#3B82F6">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
        </div>
        <div><p class="s-label">{{ L.processing }}</p><p class="s-value" style="color:#3B82F6">{{ processingCount }}</p></div>
      </div>
      <div class="s-card">
        <div class="s-icon" style="background:rgba(34,197,94,.1);color:#22C55E">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <div><p class="s-label">{{ L.delivered }}</p><p class="s-value" style="color:#22C55E">{{ deliveredCount }}</p></div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <label class="search-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input v-model="search" :placeholder="L.search" />
      </label>

      <div class="filter-tabs">
        <button
          v-for="s in statusOptions" :key="s"
          :class="['tab', { active: statusFilter === s }]"
          @click="statusFilter = s"
        >
          {{ statusLabel[s][lang] }}
        </button>
      </div>
    </div>

    <!-- Table -->
    <OrderTable
      :orders="filtered"
      :lang="lang"
      @view="openDrawer"
      @delete="askDelete"
    />

    <!-- Showing count -->
    <p class="showing">{{ L.showing }} {{ filtered.length }} {{ L.of }} {{ totalCount }}</p>

    <!-- Order detail drawer -->
    <OrderDrawer
      :open="drawerOpen"
      :order="activeOrder"
      :lang="lang"
      @close="closeDrawer"
      @status-change="onStatusChange"
    />

    <!-- Delete confirm -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="deleteConfirm" class="overlay" @click.self="deleteConfirm = false">
          <div class="confirm-box">
            <div class="confirm-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </div>
            <p class="confirm-text">{{ L.deleteConfirm }}</p>
            <p class="confirm-name">{{ deleteTarget?.id }} — {{ deleteTarget?.customer }}</p>
            <div class="confirm-actions">
              <button class="btn-cancel" @click="deleteConfirm = false">
                {{ lang === 'tk' ? 'Ýok' : 'Отмена' }}
              </button>
              <button class="btn-delete" @click="confirmDelete">
                {{ lang === 'tk' ? 'Hawa, poz' : 'Да, удалить' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<style scoped>
.view { display: flex; flex-direction: column; gap: 18px; }

/* Summary */
.summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.s-card {
  background: var(--white); border-radius: var(--radius-xl);
  border: 1.5px solid var(--border-light); box-shadow: var(--shadow-sm);
  padding: 16px 20px; display: flex; align-items: center; gap: 14px;
}
.s-icon { width: 44px; height: 44px; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.s-icon svg { width: 20px; height: 20px; }
.s-label { font-size: 11px; font-weight: 600; color: var(--subtle); text-transform: uppercase; letter-spacing: .05em; margin-bottom: 4px; }
.s-value { font-family: var(--font-display); font-size: 26px; font-weight: 700; color: var(--dark); line-height: 1; }

/* Toolbar */
.toolbar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.search-wrap {
  display: flex; align-items: center; gap: 8px;
  background: var(--white); border: 1.5px solid var(--border);
  border-radius: var(--radius-md); padding: 0 12px;
  height: 38px; min-width: 240px; cursor: text;
  transition: border-color .15s, box-shadow .15s;
}
.search-wrap:focus-within { border-color: var(--gold); box-shadow: 0 0 0 3px var(--gold-glow); }
.search-wrap svg { width: 14px; height: 14px; color: var(--subtle); flex-shrink: 0; }
.search-wrap input { flex: 1; border: none; background: transparent; outline: none; font-size: 13px; font-family: var(--font-body); color: var(--dark); }
.search-wrap input::placeholder { color: var(--subtle); }

.filter-tabs { display: flex; gap: 4px; background: var(--white); border: 1.5px solid var(--border); border-radius: var(--radius-md); padding: 3px; flex-wrap: wrap; }
.tab { padding: 4px 11px; border-radius: var(--radius-sm); border: none; background: transparent; font-size: 12px; font-weight: 600; color: var(--muted); cursor: pointer; transition: all .15s; font-family: var(--font-body); white-space: nowrap; }
.tab:hover  { background: var(--surface); color: var(--dark); }
.tab.active { background: var(--dark); color: var(--white); }

.showing { font-size: 12px; color: var(--subtle); font-weight: 500; text-align: right; }

/* Delete confirm */
.overlay { position: fixed; inset: 0; z-index: 500; background: rgba(15,17,23,.55); backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; padding: 20px; }
.confirm-box { background: var(--white); border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); padding: 28px; width: 100%; max-width: 360px; display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center; }
.confirm-icon { width: 52px; height: 52px; border-radius: 50%; background: var(--error-bg); display: flex; align-items: center; justify-content: center; color: var(--error); }
.confirm-icon svg { width: 24px; height: 24px; }
.confirm-text { font-size: 15px; font-weight: 700; color: var(--dark); }
.confirm-name { font-size: 13px; color: var(--muted); background: var(--surface); padding: 6px 14px; border-radius: var(--radius-md); }
.confirm-actions { display: flex; gap: 10px; margin-top: 4px; }
.btn-cancel { height: 38px; padding: 0 18px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--surface); font-size: 13px; font-weight: 700; color: var(--muted); cursor: pointer; font-family: var(--font-body); transition: all .15s; }
.btn-cancel:hover { border-color: var(--dark); color: var(--dark); }
.btn-delete { height: 38px; padding: 0 18px; border-radius: var(--radius-md); border: none; background: var(--error); font-size: 13px; font-weight: 800; color: white; cursor: pointer; font-family: var(--font-body); transition: background .15s; }
.btn-delete:hover { background: #DC2626; }

.modal-enter-active, .modal-leave-active { transition: opacity .2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

@media (max-width: 900px) { .summary { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 500px)  { .summary { grid-template-columns: 1fr 1fr; } }
</style>
