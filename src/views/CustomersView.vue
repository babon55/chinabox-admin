<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useUiStore } from '@/stores/ui'
import { customersApi, type Customer, type CustomerForm } from '@/api/customers'

const ui   = useUiStore()
const lang = computed(() => ui.lang)

const customers    = ref<Customer[]>([])
const total        = ref(0)
const page         = ref(1)
const loading      = ref(true)
const search       = ref('')
const filter       = ref<'ALL' | 'ACTIVE' | 'BLOCKED'>('ALL')
const drawer       = ref<Customer | null>(null)
const drawerTab    = ref<'details' | 'orders'>('details')
const drawerLoading = ref(false)
const showModal    = ref(false)
const editTarget   = ref<Customer | null>(null)
const saving       = ref(false)
const form         = ref<CustomerForm & { status: 'ACTIVE' | 'BLOCKED' }>({ name: '', email: '', phone: '', address: '', status: 'ACTIVE' })
const formErrors   = ref<Record<string, string>>({})
const deleteTarget = ref<Customer | null>(null)
const deleting     = ref(false)

const toast = ref<{ msg: string; type: 'success' | 'error' } | null>(null)
function showToast(msg: string, type: 'success' | 'error' = 'success') {
  toast.value = { msg, type }
  setTimeout(() => toast.value = null, 2800)
}

async function load() {
  loading.value = true
  try {
    const res = await customersApi.list({ status: filter.value === 'ALL' ? undefined : filter.value, search: search.value || undefined, page: page.value })
    customers.value = res.data.items
    total.value     = res.data.total
  } finally { loading.value = false }
}

onMounted(load)
watch([filter, page], load)
let st: ReturnType<typeof setTimeout>
watch(search, () => { clearTimeout(st); st = setTimeout(() => { page.value = 1; load() }, 400) })

// ── Open drawer — fetch full customer with orders ─────────────────────────────
async function openDrawer(c: Customer, tab: 'details' | 'orders' = 'details') {
  drawer.value    = c
  drawerTab.value = tab
  drawerLoading.value = true
  try {
    const res = await customersApi.get(c.id)
    drawer.value = res.data
  } catch {
    // keep the list data if fetch fails
  } finally {
    drawerLoading.value = false
  }
}

const stats = computed(() => {
  const l = lang.value
  return [
    { label: l === 'tk' ? 'Jemi müşderi'      : 'Всего клиентов',  value: total.value },
    { label: l === 'tk' ? 'Işjeň'             : 'Активные',        value: customers.value.filter(c => c.status === 'ACTIVE').length  },
    { label: l === 'tk' ? 'Bloklanan'         : 'Заблокированные', value: customers.value.filter(c => c.status === 'BLOCKED').length },
    { label: l === 'tk' ? 'Umumy satyn alyş'  : 'Общие покупки',   value: `$${customers.value.reduce((s, c) => s + (c.totalSpent ?? 0), 0).toFixed(2)}` },
  ]
})

const filters = computed(() => [
  { key: 'ALL',     label: lang.value === 'tk' ? 'Hemmesi'   : 'Все'             },
  { key: 'ACTIVE',  label: lang.value === 'tk' ? 'Işjeň'     : 'Активные'        },
  { key: 'BLOCKED', label: lang.value === 'tk' ? 'Bloklanan' : 'Заблокированные' },
])

const AVATAR_COLORS = ['#E8A020','#3B82F6','#22C55E','#8B5CF6','#EC4899','#14B8A6']
function avatarColor(name: string) {
  return AVATAR_COLORS[(name ?? '').split('').reduce((s, c) => s + c.charCodeAt(0), 0) % AVATAR_COLORS.length]
}

function openEdit(c: Customer) {
  editTarget.value = c
  form.value       = { name: c.name, email: c.email, phone: c.phone, address: c.address, status: c.status }
  formErrors.value = {}
  showModal.value  = true
}

function validate() {
  const e: Record<string, string> = {}
  const req = lang.value === 'tk' ? 'Hökman' : 'Обязательно'
  if (!form.value.name)    e.name    = req
  if (!form.value.email)   e.email   = req
  if (!form.value.phone)   e.phone   = req
  if (!form.value.address) e.address = req
  formErrors.value = e
  return Object.keys(e).length === 0
}

async function save() {
  if (!validate()) return
  saving.value = true
  try {
    if (editTarget.value) {
      const res = await customersApi.update(editTarget.value.id, form.value)
      if (drawer.value?.id === editTarget.value.id) drawer.value = { ...drawer.value, ...res.data }
      showToast(lang.value === 'tk' ? 'Müşderi täzelendi' : 'Клиент обновлён')
    }
    showModal.value = false
    await load()
  } catch (err: unknown) {
    showToast((err as any)?.response?.data?.message ?? 'Error', 'error')
  } finally { saving.value = false }
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await customersApi.remove(deleteTarget.value.id)
    showToast(lang.value === 'tk' ? 'Müşderi pozuldy' : 'Клиент удалён')
    deleteTarget.value = null
    drawer.value = null
    await load()
  } catch (err: unknown) {
    showToast((err as any)?.response?.data?.message ?? 'Error', 'error')
  } finally { deleting.value = false }
}

const STATUS_LABELS: Record<string, Record<string, string>> = {
  PENDING:    { tk: 'Garaşylýar',  ru: 'Ожидание'  },
  PROCESSING: { tk: 'Işlenilýär',  ru: 'В работе'  },
  SHIPPED:    { tk: 'Ugradyldy',   ru: 'Отправлен' },
  DELIVERED:  { tk: 'Gowşuryldy', ru: 'Доставлен' },
  CANCELLED:  { tk: 'Ýatyryldy',  ru: 'Отменён'   },
}

function fmt(n: number | string) { return Number(n).toFixed(2) }
function fmtDate(d: string) { return new Date(d).toLocaleDateString(lang.value === 'tk' ? 'tk-TM' : 'ru-RU', { day: '2-digit', month: 'short', year: 'numeric' }) }
</script>

<template>
  <div class="customers">

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
    </div>

    <!-- Table -->
    <div class="card">
      <div v-if="loading" class="table-loading"><div class="spinner"></div></div>
      <template v-else>
        <div class="table">
          <div class="t-head">
            <span>{{ lang === 'tk' ? 'Müşderi' : 'Клиент' }}</span>
            <span>{{ lang === 'tk' ? 'Telefon' : 'Телефон' }}</span>
            <span>{{ lang === 'tk' ? 'Sargytlar' : 'Заказы' }}</span>
            <span>{{ lang === 'tk' ? 'Jemi sarp edildi' : 'Потрачено' }}</span>
            <span>{{ lang === 'tk' ? 'Ýagdaý' : 'Статус' }}</span>
            <span>{{ lang === 'tk' ? 'Goşulan' : 'Дата' }}</span>
            <span></span>
          </div>
          <div v-for="c in customers" :key="c.id" class="t-row" @click="openDrawer(c)">
            <div class="cust-cell">
              <div class="avatar" :style="{ background: avatarColor(c.name) }">{{ c.name[0] }}</div>
              <div>
                <div class="cust-name">{{ c.name }}</div>
                <div class="cust-email">{{ c.email }}</div>
              </div>
            </div>
            <span class="cell-muted">{{ c.phone }}</span>
            <span class="cell-muted">{{ c._count?.orders ?? 0 }}</span>
            <span class="cell-bold">${{ fmt(c.totalSpent ?? 0) }}</span>
            <span :class="['badge', c.status.toLowerCase()]">{{ c.status === 'ACTIVE' ? (lang === 'tk' ? 'Işjeň' : 'Активный') : (lang === 'tk' ? 'Blokly' : 'Заблокирован') }}</span>
            <span class="cell-muted">{{ fmtDate(c.createdAt) }}</span>
            <div class="actions" @click.stop>
              <button class="act-btn edit" @click="openEdit(c)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="act-btn del" @click="deleteTarget = c">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
              </button>
            </div>
          </div>
          <div v-if="!customers.length" class="empty">{{ lang === 'tk' ? 'Müşderi tapylmady' : 'Клиенты не найдены' }}</div>
        </div>
      </template>
    </div>

    <!-- Drawer -->
    <Transition name="drawer">
      <div v-if="drawer" class="drawer-overlay" @click.self="drawer = null">
        <div class="drawer">
          <div class="drawer-head">
            <div class="drawer-avatar" :style="{ background: avatarColor(drawer.name) }">{{ drawer.name[0] }}</div>
            <div style="flex:1">
              <h3>{{ drawer.name }}</h3>
              <p>{{ drawer.email }}</p>
            </div>
            <button class="close-btn" @click="drawer = null">×</button>
          </div>
          <div class="drawer-tabs">
            <button :class="['dtab', { active: drawerTab === 'details' }]" @click="drawerTab = 'details'">{{ lang === 'tk' ? 'Maglumat' : 'Данные' }}</button>
            <button :class="['dtab', { active: drawerTab === 'orders' }]" @click="drawerTab = 'orders'">{{ lang === 'tk' ? 'Sargytlar' : 'Заказы' }} <span v-if="drawer._count?.orders" class="tab-count">{{ drawer._count.orders }}</span></button>
          </div>

          <!-- Loading state -->
          <div v-if="drawerLoading" class="drawer-loading">
            <div class="spinner"></div>
          </div>

          <template v-else>
            <!-- Details tab -->
            <div v-if="drawerTab === 'details'" class="drawer-section">
              <div class="stats-mini">
                <div class="mini-stat">
                  <div class="mini-val">{{ drawer._count?.orders ?? 0 }}</div>
                  <div class="mini-lbl">{{ lang === 'tk' ? 'Sargytlar' : 'Заказы' }}</div>
                </div>
                <div class="mini-stat">
                  <div class="mini-val">${{ fmt(drawer.totalSpent ?? 0) }}</div>
                  <div class="mini-lbl">{{ lang === 'tk' ? 'Jemi' : 'Потрачено' }}</div>
                </div>
                <div class="mini-stat">
                  <span :class="['badge', drawer.status.toLowerCase()]">{{ drawer.status === 'ACTIVE' ? (lang === 'tk' ? 'Işjeň' : 'Активный') : (lang === 'tk' ? 'Blokly' : 'Заблокирован') }}</span>
                </div>
              </div>
              <div class="info-card">
                <div class="info-row"><span>{{ lang === 'tk' ? 'Telefon' : 'Телефон' }}</span><strong>{{ drawer.phone }}</strong></div>
                <div class="info-row"><span>{{ lang === 'tk' ? 'Salgy' : 'Адрес' }}</span><strong>{{ drawer.address }}</strong></div>
                <div class="info-row"><span>{{ lang === 'tk' ? 'Goşulan' : 'Зарегистрирован' }}</span><strong>{{ fmtDate(drawer.createdAt) }}</strong></div>
              </div>
              <button class="edit-full-btn" @click="openEdit(drawer)">
                {{ lang === 'tk' ? 'Maglumatlary üýtget' : 'Редактировать' }}
              </button>
            </div>

            <!-- Orders tab -->
            <div v-if="drawerTab === 'orders'" class="drawer-section">
              <div v-if="!drawer.orders?.length" class="empty-tab">{{ lang === 'tk' ? 'Sargyt ýok' : 'Нет заказов' }}</div>
              <div v-for="o in drawer.orders" :key="o.id" class="order-mini">
                <div>
                  <div class="order-mid">#{{ o.id.slice(-6).toUpperCase() }}</div>
                  <div class="order-mdate">{{ fmtDate(o.createdAt) }}</div>
                </div>
                <span :class="['badge', o.status.toLowerCase()]">{{ STATUS_LABELS[o.status]?.[lang] }}</span>
                <strong class="order-mtotal">${{ fmt(o.total) }}</strong>
              </div>
            </div>
          </template>
        </div>
      </div>
    </Transition>

    <!-- Edit Modal -->
    <Transition name="modal">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal">
          <div class="modal-head">
            <h3>{{ lang === 'tk' ? 'Müşderini üýtget' : 'Редактировать клиента' }}</h3>
            <button class="close-btn" @click="showModal = false">×</button>
          </div>
          <div class="modal-body">
            <div class="form-row">
              <div class="field">
                <label class="label">{{ lang === 'tk' ? 'Ady' : 'Имя' }}</label>
                <input v-model="form.name" class="input" :class="{ error: formErrors.name }" />
                <span v-if="formErrors.name" class="err">{{ formErrors.name }}</span>
              </div>
              <div class="field">
                <label class="label">{{ lang === 'tk' ? 'E-poçta' : 'Email' }}</label>
                <input v-model="form.email" type="email" class="input" :class="{ error: formErrors.email }" />
                <span v-if="formErrors.email" class="err">{{ formErrors.email }}</span>
              </div>
            </div>
            <div class="form-row">
              <div class="field">
                <label class="label">{{ lang === 'tk' ? 'Telefon' : 'Телефон' }}</label>
                <input v-model="form.phone" class="input" :class="{ error: formErrors.phone }" />
              </div>
              <div class="field">
                <label class="label">{{ lang === 'tk' ? 'Ýagdaý' : 'Статус' }}</label>
                <select v-model="form.status" class="input">
                  <option value="ACTIVE">{{ lang === 'tk' ? 'Işjeň' : 'Активный' }}</option>
                  <option value="BLOCKED">{{ lang === 'tk' ? 'Blokla' : 'Заблокировать' }}</option>
                </select>
              </div>
            </div>
            <div class="field">
              <label class="label">{{ lang === 'tk' ? 'Salgy' : 'Адрес' }}</label>
              <input v-model="form.address" class="input" :class="{ error: formErrors.address }" />
            </div>
          </div>
          <div class="modal-foot">
            <button class="cancel-btn" @click="showModal = false">{{ lang === 'tk' ? 'Ýatyr' : 'Отмена' }}</button>
            <button class="save-btn" :disabled="saving" @click="save">{{ saving ? '...' : (lang === 'tk' ? 'Ýatda sakla' : 'Сохранить') }}</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Delete confirm -->
    <Transition name="modal">
      <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
        <div class="modal modal-sm">
          <div class="modal-head">
            <h3>{{ lang === 'tk' ? 'Pozmagy tassykla' : 'Подтвердить удаление' }}</h3>
            <button class="close-btn" @click="deleteTarget = null">×</button>
          </div>
          <div class="modal-body"><p>{{ lang === 'tk' ? `"${deleteTarget?.name}" müşderini pozmak isleýärsiňizmi?` : `Удалить клиента "${deleteTarget?.name}"?` }}</p></div>
          <div class="modal-foot">
            <button class="cancel-btn" @click="deleteTarget = null">{{ lang === 'tk' ? 'Ýok' : 'Нет' }}</button>
            <button class="del-btn" :disabled="deleting" @click="confirmDelete">{{ deleting ? '...' : (lang === 'tk' ? 'Hawa, poz' : 'Да, удалить') }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.customers { display: flex; flex-direction: column; gap: 16px; }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.stat-card { background: var(--white); border-radius: var(--radius-lg); padding: 16px 20px; border: 1.5px solid var(--border-light); box-shadow: var(--shadow-sm); }
.stat-value { font-size: 22px; font-weight: 800; color: var(--dark); font-family: var(--font-display); }
.stat-label { font-size: 12px; color: var(--subtle); margin-top: 4px; }
.toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.filter-tabs { display: flex; gap: 4px; background: var(--white); border: 1.5px solid var(--border); border-radius: var(--radius-md); padding: 4px; }
.ftab { padding: 5px 14px; border-radius: var(--radius-sm); border: none; background: transparent; font-size: 13px; font-weight: 600; color: var(--subtle); cursor: pointer; font-family: var(--font-body); transition: all .15s; }
.ftab.active { background: var(--dark); color: var(--white); }
.search-wrap { position: relative; }
.search-wrap svg { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); width: 14px; height: 14px; color: var(--subtle); }
.search { height: 38px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--white); padding: 0 12px 0 32px; font-size: 13px; font-family: var(--font-body); color: var(--dark); outline: none; width: 200px; }
.search:focus { border-color: var(--gold); }
.card { background: var(--white); border-radius: var(--radius-lg); border: 1.5px solid var(--border-light); overflow: hidden; box-shadow: var(--shadow-sm); }
.table-loading { display: flex; justify-content: center; padding: 60px; }
.spinner { width: 30px; height: 30px; border: 3px solid var(--border); border-top-color: var(--gold); border-radius: 50%; animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.t-head { display: grid; grid-template-columns: 2fr 1fr 70px 110px 110px 100px 80px; gap: 8px; padding: 10px 20px; background: var(--surface); font-size: 11px; font-weight: 700; color: var(--subtle); text-transform: uppercase; letter-spacing: .04em; }
.t-row { display: grid; grid-template-columns: 2fr 1fr 70px 110px 110px 100px 80px; gap: 8px; padding: 12px 20px; border-top: 1px solid var(--border-light); align-items: center; cursor: pointer; transition: background .12s; }
.t-row:hover { background: var(--surface); }
.cust-cell { display: flex; align-items: center; gap: 10px; }
.avatar { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: var(--white); flex-shrink: 0; }
.cust-name  { font-size: 13px; font-weight: 700; color: var(--dark); }
.cust-email { font-size: 11px; color: var(--subtle); margin-top: 1px; }
.cell-muted { font-size: 13px; color: var(--subtle); }
.cell-bold  { font-size: 13px; font-weight: 700; color: var(--dark); }
.badge { display: inline-flex; align-items: center; padding: 3px 9px; border-radius: var(--radius-pill); font-size: 11px; font-weight: 700; }
.badge.active     { background: #DCFCE7; color: #14532D; }
.badge.blocked    { background: #FEE2E2; color: #991B1B; }
.badge.pending    { background: #FEF3C7; color: #92400E; }
.badge.processing { background: #DBEAFE; color: #1E40AF; }
.badge.shipped    { background: #EDE9FE; color: #5B21B6; }
.badge.delivered  { background: #DCFCE7; color: #14532D; }
.badge.cancelled  { background: #FEE2E2; color: #991B1B; }
.actions { display: flex; gap: 6px; }
.act-btn { width: 30px; height: 30px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--surface); cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--muted); transition: all .15s; }
.act-btn svg { width: 13px; height: 13px; }
.act-btn.edit:hover { border-color: var(--gold); color: var(--gold); background: var(--gold-glow); }
.act-btn.del:hover  { border-color: var(--error); color: var(--error); background: var(--error-bg); }
.empty { padding: 40px; text-align: center; color: var(--subtle); font-size: 14px; }

/* Drawer */
.drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.35); z-index: 900; }
.drawer { position: fixed; top: 0; right: 0; width: 400px; height: 100vh; background: var(--white); box-shadow: -8px 0 40px rgba(0,0,0,.15); overflow-y: auto; }
.drawer-head { display: flex; align-items: center; gap: 12px; padding: 24px; border-bottom: 1px solid var(--border-light); }
.drawer-avatar { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; color: var(--white); flex-shrink: 0; }
.drawer-head h3 { font-family: var(--font-display); font-size: 17px; font-weight: 700; color: var(--dark); }
.drawer-head p  { font-size: 12px; color: var(--subtle); margin-top: 2px; }
.close-btn { width: 30px; height: 30px; border-radius: 50%; border: none; background: var(--surface); font-size: 18px; cursor: pointer; color: var(--muted); flex-shrink: 0; }
.drawer-tabs { display: flex; border-bottom: 1px solid var(--border-light); padding: 0 24px; }
.dtab { padding: 12px 16px; border: none; background: none; font-size: 13px; font-weight: 700; color: var(--subtle); cursor: pointer; border-bottom: 2px solid transparent; font-family: var(--font-body); transition: all .15s; margin-bottom: -1px; display: flex; align-items: center; gap: 6px; }
.dtab.active { color: var(--gold); border-bottom-color: var(--gold); }
.tab-count { background: var(--gold); color: #fff; font-size: 10px; font-weight: 800; padding: 1px 6px; border-radius: var(--radius-pill); }
.drawer-loading { display: flex; justify-content: center; padding: 40px; }
.drawer-section { padding: 20px 24px; }
.stats-mini { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }
.mini-stat { background: var(--surface); border-radius: var(--radius-md); padding: 12px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.mini-val { font-size: 18px; font-weight: 800; color: var(--dark); font-family: var(--font-display); }
.mini-lbl { font-size: 11px; color: var(--subtle); margin-top: 3px; }
.info-card { background: var(--surface); border-radius: var(--radius-md); padding: 12px; display: flex; flex-direction: column; gap: 8px; }
.info-row { display: flex; justify-content: space-between; font-size: 13px; }
.info-row span { color: var(--subtle); }
.info-row strong { color: var(--dark); text-align: right; max-width: 60%; }
.edit-full-btn { margin-top: 14px; width: 100%; height: 40px; border-radius: var(--radius-md); border: 1.5px solid var(--gold); background: var(--gold-glow); color: var(--gold); font-size: 13px; font-weight: 700; cursor: pointer; font-family: var(--font-body); transition: all .15s; }
.edit-full-btn:hover { background: var(--gold); color: var(--white); }
.empty-tab { text-align: center; padding: 30px; color: var(--subtle); font-size: 14px; }
.order-mini { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: var(--radius-md); background: var(--surface); margin-bottom: 8px; }
.order-mid   { font-size: 13px; font-weight: 700; color: var(--gold); font-family: monospace; }
.order-mdate { font-size: 11px; color: var(--subtle); margin-top: 2px; }
.order-mtotal { font-size: 14px; font-weight: 700; color: var(--dark); margin-left: auto; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
.modal { background: var(--white); border-radius: var(--radius-xl); width: 100%; max-width: 500px; box-shadow: 0 24px 64px rgba(0,0,0,.3); }
.modal-sm { max-width: 380px; }
.modal-head { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 0; }
.modal-head h3 { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--dark); }
.modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 14px; }
.modal-body p { font-size: 14px; color: var(--dark); }
.modal-foot { display: flex; gap: 10px; justify-content: flex-end; padding: 0 24px 20px; }
.field { display: flex; flex-direction: column; gap: 5px; flex: 1; }
.label { font-size: 12px; font-weight: 700; color: var(--dark); }
.input { height: 40px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--surface); padding: 0 12px; font-size: 13px; font-family: var(--font-body); color: var(--dark); outline: none; width: 100%; box-sizing: border-box; }
.input:focus { border-color: var(--gold); background: var(--white); }
.input.error { border-color: var(--error); }
.err { font-size: 11px; color: var(--error); }
.form-row { display: flex; gap: 12px; }
.cancel-btn { height: 38px; padding: 0 16px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--surface); font-size: 13px; font-weight: 600; color: var(--muted); cursor: pointer; font-family: var(--font-body); }
.save-btn { height: 38px; padding: 0 20px; border-radius: var(--radius-md); border: none; background: linear-gradient(135deg, var(--gold), var(--gold-dark)); font-size: 13px; font-weight: 700; color: var(--white); cursor: pointer; font-family: var(--font-body); }
.save-btn:disabled { opacity: .7; cursor: not-allowed; }
.del-btn { height: 38px; padding: 0 20px; border-radius: var(--radius-md); border: none; background: var(--error); font-size: 13px; font-weight: 700; color: var(--white); cursor: pointer; font-family: var(--font-body); }

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
</style>
