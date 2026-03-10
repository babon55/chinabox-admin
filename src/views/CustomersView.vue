<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUiStore } from '@/stores/ui'
import CustomerTable  from './customers/CustomerTable.vue'
import CustomerDrawer from './customers/CustomerDrawer.vue'
import CustomerModal  from './customers/CustomerModal.vue'
import type { CustomerItem, CustomerForm, CustomerStatus } from '@/types'

const ui   = useUiStore()
const lang = computed(() => ui.lang)

const L = computed(() => lang.value === 'tk' ? {
  total: 'Jemi müşderi', active: 'Işjeň', blocked: 'Bloklanan', newThisMonth: 'Bu aý täze',
  search: 'Müşderi gözle...', all: 'Hemmesi',
  deleteConfirm: 'Bu müşderini pozmak isleýärsiňizmi?',
  showing: 'Görkezilýär', of: '/',
} : {
  total: 'Всего клиентов', active: 'Активных', blocked: 'Заблокировано', newThisMonth: 'Новых в месяц',
  search: 'Поиск клиента...', all: 'Все',
  deleteConfirm: 'Удалить этого клиента?',
  showing: 'Показано', of: 'из',
})

// ── Mock data ─────────────────────────────────────────────────────────────────
const customers = ref<CustomerItem[]>([
  {
    id: 'CST-001', name: 'Merdan Ataýew', email: 'merdan@mail.com', phone: '+993 65 123456',
    address: 'Aşgabat, Bitarap Türkmenistan köç. 12, 16-njy öý',
    status: 'active', totalOrders: 8, totalSpent: 412.50, joined: '12.01.2025',
    orders: [
      { id: 'ORD-4825', total: 50.97,  status: 'delivered',  date: '08.03.2026' },
      { id: 'ORD-4801', total: 89.99,  status: 'delivered',  date: '10.02.2026' },
      { id: 'ORD-4780', total: 124.00, status: 'cancelled',  date: '15.01.2026' },
    ],
  },
  {
    id: 'CST-002', name: 'Aýna Durdyýewa', email: 'ayna@mail.com', phone: '+993 62 654321',
    address: 'Aşgabat, Görogly köç. 44, 3-nji öý',
    status: 'active', totalOrders: 5, totalSpent: 289.95, joined: '03.03.2025',
    orders: [
      { id: 'ORD-4824', total: 89.99, status: 'shipped',   date: '08.03.2026' },
      { id: 'ORD-4810', total: 45.00, status: 'delivered', date: '20.02.2026' },
    ],
  },
  {
    id: 'CST-003', name: 'Serdar Nurýew', email: 'serdar@mail.com', phone: '+993 61 987654',
    address: 'Mary, Mollanepes köç. 7, 22-nji öý',
    status: 'active', totalOrders: 12, totalSpent: 870.20, joined: '17.06.2024',
    orders: [
      { id: 'ORD-4823', total: 113.48, status: 'processing', date: '07.03.2026' },
      { id: 'ORD-4799', total: 210.00, status: 'delivered',  date: '01.02.2026' },
      { id: 'ORD-4755', total: 54.99,  status: 'delivered',  date: '10.01.2026' },
    ],
  },
  {
    id: 'CST-004', name: 'Güljeren Orazowa', email: 'guljeren@mail.com', phone: '+993 63 112233',
    address: 'Türkmenabat, Magtymguly köç. 3, 5-nji öý',
    status: 'active', totalOrders: 3, totalSpent: 74.97, joined: '22.11.2025',
    orders: [
      { id: 'ORD-4822', total: 24.97, status: 'pending', date: '07.03.2026' },
    ],
  },
  {
    id: 'CST-005', name: 'Döwlet Hojamow', email: 'dowlet@mail.com', phone: '+993 64 445566',
    address: 'Balkanabat, Ruhy köç. 18, 9-njy öý',
    status: 'blocked', totalOrders: 2, totalSpent: 99.97, joined: '05.01.2026',
    orders: [
      { id: 'ORD-4821', total: 99.97, status: 'cancelled', date: '06.03.2026' },
    ],
  },
  {
    id: 'CST-006', name: 'Orazgül Annaýewa', email: 'orazgul@mail.com', phone: '+993 65 778899',
    address: 'Aşgabat, Andalyp köç. 56, 12-nji öý',
    status: 'active', totalOrders: 6, totalSpent: 509.94, joined: '14.08.2024',
    orders: [
      { id: 'ORD-4820', total: 84.98, status: 'pending',   date: '06.03.2026' },
      { id: 'ORD-4808', total: 159.98, status: 'delivered', date: '18.02.2026' },
    ],
  },
  {
    id: 'CST-007', name: 'Baýram Myradow', email: 'bayram@mail.com', phone: '+993 62 334455',
    address: 'Daşoguz, Nurmuhammet Andalyp köç. 2, 7-nji öý',
    status: 'active', totalOrders: 4, totalSpent: 239.93, joined: '30.10.2025',
    orders: [
      { id: 'ORD-4819', total: 79.96, status: 'shipped',   date: '05.03.2026' },
      { id: 'ORD-4790', total: 34.99, status: 'delivered', date: '25.01.2026' },
    ],
  },
  {
    id: 'CST-008', name: 'Maral Halmyradowa', email: 'maral@mail.com', phone: '+993 61 667788',
    address: 'Aşgabat, Oguzhan köç. 9, 4-nji öý',
    status: 'active', totalOrders: 1, totalSpent: 24.99, joined: '01.03.2026',
    orders: [
      { id: 'ORD-4826', total: 24.99, status: 'pending', date: '09.03.2026' },
    ],
  },
])

// ── Search + Filter ───────────────────────────────────────────────────────────
const search       = ref('')
const statusFilter = ref<CustomerStatus | 'all'>('all')

const filtered = computed(() => {
  let list = customers.value
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q)
    )
  }
  if (statusFilter.value !== 'all') {
    list = list.filter(c => c.status === statusFilter.value)
  }
  return list
})

const totalCount    = computed(() => customers.value.length)
const activeCount   = computed(() => customers.value.filter(c => c.status === 'active').length)
const blockedCount  = computed(() => customers.value.filter(c => c.status === 'blocked').length)
const newThisMonth  = computed(() => customers.value.filter(c => c.joined.endsWith('2026')).length)

// ── Drawer ────────────────────────────────────────────────────────────────────
const drawerOpen      = ref(false)
const activeCustomer  = ref<CustomerItem | null>(null)

function openDrawer(c: CustomerItem) { activeCustomer.value = c; drawerOpen.value = true }
function closeDrawer() { drawerOpen.value = false }

// ── Edit modal ────────────────────────────────────────────────────────────────
const modalOpen = ref(false)
const editing   = ref<CustomerItem | null>(null)

function openEdit(c: CustomerItem) {
  editing.value   = c
  modalOpen.value = true
  drawerOpen.value = false
}

function saveCustomer(form: CustomerForm) {
  const idx = customers.value.findIndex(c => c.id === editing.value!.id)
  if (idx !== -1) {
    customers.value[idx] = { ...customers.value[idx], ...form }
    // keep activeCustomer in sync
    if (activeCustomer.value?.id === editing.value!.id) {
      activeCustomer.value = { ...activeCustomer.value, ...form }
    }
  }
  modalOpen.value = false
  editing.value   = null
}

// ── Delete ────────────────────────────────────────────────────────────────────
const deleteTarget  = ref<CustomerItem | null>(null)
const deleteConfirm = ref(false)

function askDelete(c: CustomerItem) { deleteTarget.value = c; deleteConfirm.value = true; drawerOpen.value = false }
function confirmDelete() {
  if (deleteTarget.value) customers.value = customers.value.filter(c => c.id !== deleteTarget.value!.id)
  deleteTarget.value = null; deleteConfirm.value = false
}

const statusOptions: Array<CustomerStatus | 'all'> = ['all', 'active', 'blocked']
const statusLabel: Record<CustomerStatus | 'all', Record<'tk' | 'ru', string>> = {
  all:     { tk: 'Hemmesi',     ru: 'Все'            },
  active:  { tk: 'Işjeň',      ru: 'Активные'       },
  blocked: { tk: 'Bloklanan',  ru: 'Заблокированные' },
}
</script>

<template>
  <div class="view">

    <!-- Summary -->
    <div class="summary">
      <div class="s-card">
        <div class="s-icon" style="background:rgba(232,160,32,.1);color:var(--gold)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <div><p class="s-label">{{ L.total }}</p><p class="s-value">{{ totalCount }}</p></div>
      </div>
      <div class="s-card">
        <div class="s-icon" style="background:rgba(34,197,94,.1);color:#22C55E">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <div><p class="s-label">{{ L.active }}</p><p class="s-value" style="color:#22C55E">{{ activeCount }}</p></div>
      </div>
      <div class="s-card">
        <div class="s-icon" style="background:rgba(239,68,68,.1);color:#EF4444">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        </div>
        <div><p class="s-label">{{ L.blocked }}</p><p class="s-value" style="color:#EF4444">{{ blockedCount }}</p></div>
      </div>
      <div class="s-card">
        <div class="s-icon" style="background:rgba(59,130,246,.1);color:#3B82F6">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </div>
        <div><p class="s-label">{{ L.newThisMonth }}</p><p class="s-value" style="color:#3B82F6">{{ newThisMonth }}</p></div>
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
        <button v-for="s in statusOptions" :key="s"
          :class="['tab', { active: statusFilter === s }]"
          @click="statusFilter = s">
          {{ statusLabel[s][lang] }}
        </button>
      </div>
    </div>

    <!-- Table -->
    <CustomerTable :customers="filtered" :lang="lang"
      @view="openDrawer" @edit="openEdit" @delete="askDelete" />

    <!-- Showing count -->
    <p class="showing">{{ L.showing }} {{ filtered.length }} {{ L.of }} {{ totalCount }}</p>

    <!-- Detail drawer -->
    <CustomerDrawer :open="drawerOpen" :customer="activeCustomer" :lang="lang"
      @close="closeDrawer" @edit="openEdit" />

    <!-- Edit modal -->
    <CustomerModal :open="modalOpen" :editing="editing" :lang="lang"
      @close="modalOpen = false" @save="saveCustomer" />

    <!-- Delete confirm -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="deleteConfirm" class="overlay" @click.self="deleteConfirm = false">
          <div class="confirm-box">
            <div class="confirm-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </div>
            <p class="confirm-text">{{ L.deleteConfirm }}</p>
            <p class="confirm-name">{{ deleteTarget?.name }}</p>
            <div class="confirm-actions">
              <button class="btn-cancel" @click="deleteConfirm = false">{{ lang === 'tk' ? 'Ýok' : 'Отмена' }}</button>
              <button class="btn-delete" @click="confirmDelete">{{ lang === 'tk' ? 'Hawa, poz' : 'Да, удалить' }}</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<style scoped>
.view { display: flex; flex-direction: column; gap: 18px; }

.summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.s-card { background: var(--white); border-radius: var(--radius-xl); border: 1.5px solid var(--border-light); box-shadow: var(--shadow-sm); padding: 16px 20px; display: flex; align-items: center; gap: 14px; }
.s-icon { width: 44px; height: 44px; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.s-icon svg { width: 20px; height: 20px; }
.s-label { font-size: 11px; font-weight: 600; color: var(--subtle); text-transform: uppercase; letter-spacing: .05em; margin-bottom: 4px; }
.s-value { font-family: var(--font-display); font-size: 26px; font-weight: 700; color: var(--dark); line-height: 1; }

.toolbar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.search-wrap { display: flex; align-items: center; gap: 8px; background: var(--white); border: 1.5px solid var(--border); border-radius: var(--radius-md); padding: 0 12px; height: 38px; min-width: 240px; cursor: text; transition: border-color .15s, box-shadow .15s; }
.search-wrap:focus-within { border-color: var(--gold); box-shadow: 0 0 0 3px var(--gold-glow); }
.search-wrap svg { width: 14px; height: 14px; color: var(--subtle); flex-shrink: 0; }
.search-wrap input { flex: 1; border: none; background: transparent; outline: none; font-size: 13px; font-family: var(--font-body); color: var(--dark); }
.search-wrap input::placeholder { color: var(--subtle); }

.filter-tabs { display: flex; gap: 4px; background: var(--white); border: 1.5px solid var(--border); border-radius: var(--radius-md); padding: 3px; }
.tab { padding: 4px 12px; border-radius: var(--radius-sm); border: none; background: transparent; font-size: 12px; font-weight: 600; color: var(--muted); cursor: pointer; transition: all .15s; font-family: var(--font-body); white-space: nowrap; }
.tab:hover  { background: var(--surface); color: var(--dark); }
.tab.active { background: var(--dark); color: var(--white); }

.showing { font-size: 12px; color: var(--subtle); font-weight: 500; text-align: right; }

.overlay { position: fixed; inset: 0; z-index: 500; background: rgba(15,17,23,.55); backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; padding: 20px; }
.confirm-box { background: var(--white); border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); padding: 28px; width: 100%; max-width: 360px; display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center; }
.confirm-icon { width: 52px; height: 52px; border-radius: 50%; background: var(--error-bg); display: flex; align-items: center; justify-content: center; color: var(--error); }
.confirm-icon svg { width: 24px; height: 24px; }
.confirm-text { font-size: 15px; font-weight: 700; color: var(--dark); }
.confirm-name { font-size: 13px; color: var(--muted); background: var(--surface); padding: 6px 14px; border-radius: var(--radius-md); }
.confirm-actions { display: flex; gap: 10px; margin-top: 4px; }
.btn-cancel { height: 38px; padding: 0 18px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--surface); font-size: 13px; font-weight: 700; color: var(--muted); cursor: pointer; font-family: var(--font-body); transition: all .15s; }
.btn-cancel:hover { border-color: var(--dark); color: var(--dark); }
.btn-delete { height: 38px; padding: 0 18px; border-radius: var(--radius-md); border: none; background: var(--error); font-size: 13px; font-weight: 800; color: #fff; cursor: pointer; font-family: var(--font-body); transition: background .15s; }
.btn-delete:hover { background: #DC2626; }

.modal-enter-active, .modal-leave-active { transition: opacity .2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

@media (max-width: 900px) { .summary { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 500px)  { .summary { grid-template-columns: 1fr 1fr; } }
</style>
