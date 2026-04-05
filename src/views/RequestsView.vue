<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useUiStore } from '@/stores/ui'
import { client } from '@/api/client'

const ui   = useUiStore()
const lang = computed(() => ui.lang)

interface ProductRequest {
  id:           string
  nameTk:       string
  nameRu:       string
  description?: string | null
  imageUrl?:    string | null
  contactName:  string
  contactPhone?: string | null
  contactEmail?: string | null
  status:       'NEW' | 'SEEN' | 'ADDED' | 'REJECTED'
  adminNote?:   string | null
  createdAt:    string
}

const items    = ref<ProductRequest[]>([])
const total    = ref(0)
const loading  = ref(true)
const filter   = ref<'ALL' | 'NEW' | 'SEEN' | 'ADDED' | 'REJECTED'>('ALL')
const drawer   = ref<ProductRequest | null>(null)
const updating = ref(false)
const adminNote = ref('')

const toast = ref<{ msg: string; type: 'success' | 'error' } | null>(null)
function showToast(msg: string, type: 'success' | 'error' = 'success') {
  toast.value = { msg, type }
  setTimeout(() => toast.value = null, 2800)
}

async function load() {
  loading.value = true
  try {
    const res = await client.get('/requests', {
      params: { status: filter.value === 'ALL' ? undefined : filter.value }
    })
    items.value = res.data.items
    total.value = res.data.total
  } finally { loading.value = false }
}

onMounted(load)
watch(filter, load)

const STATUS_LABELS: Record<string, Record<string, string>> = {
  NEW:      { tk: 'Täze',       ru: 'Новый'      },
  SEEN:     { tk: 'Görüldi',    ru: 'Просмотрен' },
  ADDED:    { tk: 'Goşuldy',    ru: 'Добавлен'   },
  REJECTED: { tk: 'Ret edildi', ru: 'Отклонён'   },
}

const filters = computed(() => [
  { key: 'ALL',      label: lang.value === 'tk' ? 'Hemmesi'    : 'Все'        },
  { key: 'NEW',      label: lang.value === 'tk' ? 'Täze'       : 'Новые'      },
  { key: 'SEEN',     label: lang.value === 'tk' ? 'Görüldi'    : 'Просмотрен' },
  { key: 'ADDED',    label: lang.value === 'tk' ? 'Goşuldy'    : 'Добавлен'   },
  { key: 'REJECTED', label: lang.value === 'tk' ? 'Ret edildi' : 'Отклонён'   },
])

const stats = computed(() => [
  { label: lang.value === 'tk' ? 'Jemi'       : 'Всего',       value: total.value,                                            color: '#6B7280' },
  { label: lang.value === 'tk' ? 'Täze'       : 'Новых',       value: items.value.filter(i => i.status === 'NEW').length,     color: '#3B82F6' },
  { label: lang.value === 'tk' ? 'Goşuldy'    : 'Добавлено',   value: items.value.filter(i => i.status === 'ADDED').length,   color: '#22C55E' },
  { label: lang.value === 'tk' ? 'Ret edildi' : 'Отклонено',   value: items.value.filter(i => i.status === 'REJECTED').length, color: '#EF4444' },
])

function openDrawer(item: ProductRequest) {
  drawer.value   = item
  adminNote.value = item.adminNote ?? ''
  // Auto-mark as SEEN
  if (item.status === 'NEW') updateStatus(item, 'SEEN')
}

async function updateStatus(item: ProductRequest, status: string) {
  updating.value = true
  try {
    const res = await client.patch(`/requests/${item.id}`, { status, adminNote: adminNote.value || undefined })
    const idx = items.value.findIndex(i => i.id === item.id)
    if (idx !== -1) items.value[idx] = res.data
    if (drawer.value?.id === item.id) drawer.value = res.data
    showToast(lang.value === 'tk' ? 'Täzelendi' : 'Обновлено')
  } catch {
    showToast('Error', 'error')
  } finally { updating.value = false }
}

async function saveNote() {
  if (!drawer.value) return
  await updateStatus(drawer.value, drawer.value.status)
}

async function deleteItem(id: string) {
  try {
    await client.delete(`/requests/${id}`)
    items.value = items.value.filter(i => i.id !== id)
    if (drawer.value?.id === id) drawer.value = null
    showToast(lang.value === 'tk' ? 'Pozuldy' : 'Удалено')
  } catch {
    showToast('Error', 'error')
  }
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString(lang.value === 'tk' ? 'tk-TM' : 'ru-RU', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}
</script>

<template>
  <div class="requests">

    <Transition name="toast">
      <div v-if="toast" :class="['toast', toast.type]">{{ toast.msg }}</div>
    </Transition>

    <!-- Stats -->
    <div class="stats-grid">
      <div v-for="s in stats" :key="s.label" class="stat-card">
        <div class="stat-value" :style="{ color: s.color }">{{ s.value }}</div>
        <div class="stat-label">{{ s.label }}</div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="filter-tabs">
        <button
          v-for="f in filters" :key="f.key"
          :class="['ftab', { active: filter === f.key }]"
          @click="filter = f.key as any"
        >{{ f.label }}</button>
      </div>
      <button class="refresh-btn" @click="load" :disabled="loading">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
      </button>
    </div>

    <!-- Table -->
    <div class="card">
      <div v-if="loading" class="table-loading"><div class="spinner" /></div>
      <template v-else>
        <div class="table">
          <div class="t-head">
            <span>{{ lang === 'tk' ? 'Haryt ady' : 'Название товара' }}</span>
            <span>{{ lang === 'tk' ? 'Habarlaşmak' : 'Контакт' }}</span>
            <span>{{ lang === 'tk' ? 'Sene' : 'Дата' }}</span>
            <span>{{ lang === 'tk' ? 'Ýagdaý' : 'Статус' }}</span>
            <span></span>
          </div>

          <div v-for="item in items" :key="item.id" class="t-row" @click="openDrawer(item)">
            <!-- Product -->
            <div class="prod-cell">
              <div class="prod-thumb">
                <img v-if="item.imageUrl" :src="item.imageUrl" class="prod-img" />
                <span v-else class="prod-emoji">🛍️</span>
              </div>
              <div>
                <div class="prod-name">{{ lang === 'tk' ? item.nameTk : item.nameRu }}</div>
                <div class="prod-desc" v-if="item.description">{{ item.description.slice(0, 50) }}{{ item.description.length > 50 ? '…' : '' }}</div>
              </div>
            </div>

            <!-- Contact -->
            <div>
              <div class="contact-name">{{ item.contactName }}</div>
              <div class="contact-info">{{ item.contactPhone ?? item.contactEmail ?? '—' }}</div>
            </div>

            <!-- Date -->
            <span class="cell-muted">{{ fmtDate(item.createdAt) }}</span>

            <!-- Status -->
            <span :class="['badge', item.status.toLowerCase()]">
              {{ STATUS_LABELS[item.status]?.[lang] }}
            </span>

            <!-- Actions -->
            <div class="actions" @click.stop>
              <button class="act-btn del" @click="deleteItem(item.id)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
              </button>
            </div>
          </div>

          <div v-if="!items.length" class="empty">
            {{ lang === 'tk' ? 'Talap tapylmady' : 'Запросов не найдено' }}
          </div>
        </div>
      </template>
    </div>

    <!-- Drawer -->
    <Transition name="drawer">
      <div v-if="drawer" class="drawer-overlay" @click.self="drawer = null">
        <div class="drawer">
          <div class="drawer-head">
            <div>
              <h3>{{ lang === 'tk' ? drawer.nameTk : drawer.nameRu }}</h3>
              <p>{{ fmtDate(drawer.createdAt) }}</p>
            </div>
            <button class="close-btn" @click="drawer = null">×</button>
          </div>

          <!-- Image -->
          <div v-if="drawer.imageUrl" class="drawer-section">
            <img :src="drawer.imageUrl" class="drawer-img" />
          </div>

          <!-- Product info -->
          <div class="drawer-section">
            <div class="section-title">{{ lang === 'tk' ? 'Haryt maglumaty' : 'Информация о товаре' }}</div>
            <div class="info-card">
              <div class="info-row">
                <span>{{ lang === 'tk' ? 'Ady (TK)' : 'Название (TK)' }}</span>
                <strong>{{ drawer.nameTk }}</strong>
              </div>
              <div class="info-row">
                <span>{{ lang === 'tk' ? 'Ady (RU)' : 'Название (RU)' }}</span>
                <strong>{{ drawer.nameRu }}</strong>
              </div>
              <div v-if="drawer.description" class="info-row desc-row">
                <span>{{ lang === 'tk' ? 'Beýany' : 'Описание' }}</span>
                <span class="desc-text">{{ drawer.description }}</span>
              </div>
            </div>
          </div>

          <!-- Contact -->
          <div class="drawer-section">
            <div class="section-title">{{ lang === 'tk' ? 'Habarlaşmak' : 'Контакт' }}</div>
            <div class="info-card">
              <div class="info-row"><span>{{ lang === 'tk' ? 'Ady' : 'Имя' }}</span><strong>{{ drawer.contactName }}</strong></div>
              <div v-if="drawer.contactPhone" class="info-row"><span>{{ lang === 'tk' ? 'Telefon' : 'Телефон' }}</span><strong>{{ drawer.contactPhone }}</strong></div>
              <div v-if="drawer.contactEmail" class="info-row"><span>Email</span><strong>{{ drawer.contactEmail }}</strong></div>
            </div>
          </div>

          <!-- Admin note -->
          <div class="drawer-section">
            <div class="section-title">{{ lang === 'tk' ? 'Bellik' : 'Заметка (для себя)' }}</div>
            <textarea v-model="adminNote" class="note-input" rows="3"
              :placeholder="lang === 'tk' ? 'Içerki bellik...' : 'Внутренняя заметка...'"
            />
            <button class="save-note-btn" @click="saveNote" :disabled="updating">
              {{ lang === 'tk' ? 'Ýatda sakla' : 'Сохранить' }}
            </button>
          </div>

          <!-- Status -->
          <div class="drawer-section">
            <div class="section-title">{{ lang === 'tk' ? 'Ýagdaýy üýtget' : 'Изменить статус' }}</div>
            <div class="status-btns">
              <button
                v-for="s in ['NEW', 'SEEN', 'ADDED', 'REJECTED']" :key="s"
                :class="['status-btn', s.toLowerCase(), { active: drawer.status === s }]"
                :disabled="updating || drawer.status === s"
                @click="updateStatus(drawer, s)"
              >{{ STATUS_LABELS[s]?.[lang] }}</button>
            </div>
          </div>

        </div>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
.requests { display: flex; flex-direction: column; gap: 16px; }

.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.stat-card  { background: var(--white); border-radius: var(--radius-lg); padding: 16px 20px; border: 1.5px solid var(--border-light); box-shadow: var(--shadow-sm); }
.stat-value { font-size: 24px; font-weight: 800; font-family: var(--font-display); }
.stat-label { font-size: 12px; color: var(--subtle); margin-top: 4px; }

.toolbar { display: flex; align-items: center; gap: 12px; }
.filter-tabs { display: flex; gap: 4px; background: var(--white); border: 1.5px solid var(--border); border-radius: var(--radius-md); padding: 4px; flex-wrap: wrap; }
.ftab { padding: 5px 14px; border-radius: var(--radius-sm); border: none; background: transparent; font-size: 12px; font-weight: 600; color: var(--subtle); cursor: pointer; font-family: var(--font-body); transition: all .15s; }
.ftab.active { background: var(--dark); color: var(--white); }
.refresh-btn { width: 38px; height: 38px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--white); cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--muted); transition: all .15s; flex-shrink: 0; }
.refresh-btn:hover:not(:disabled) { border-color: var(--gold); color: var(--gold); }
.refresh-btn svg { width: 15px; height: 15px; }

.card { background: var(--white); border-radius: var(--radius-lg); border: 1.5px solid var(--border-light); overflow: hidden; box-shadow: var(--shadow-sm); }
.table-loading { display: flex; justify-content: center; padding: 60px; }
.spinner { width: 30px; height: 30px; border: 3px solid var(--border); border-top-color: var(--gold); border-radius: 50%; animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.t-head { display: grid; grid-template-columns: 2fr 1.5fr 100px 110px 50px; gap: 8px; padding: 10px 20px; background: var(--surface); font-size: 11px; font-weight: 700; color: var(--subtle); text-transform: uppercase; letter-spacing: .04em; }
.t-row  { display: grid; grid-template-columns: 2fr 1.5fr 100px 110px 50px; gap: 8px; padding: 12px 20px; border-top: 1px solid var(--border-light); align-items: center; cursor: pointer; transition: background .12s; }
.t-row:hover { background: var(--surface); }

.prod-cell { display: flex; align-items: center; gap: 10px; min-width: 0; }
.prod-thumb { width: 44px; height: 44px; border-radius: var(--radius-md); background: var(--surface); border: 1.5px solid var(--border-light); display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; }
.prod-img   { width: 100%; height: 100%; object-fit: cover; }
.prod-emoji { font-size: 24px; }
.prod-name  { font-size: 13px; font-weight: 700; color: var(--dark); }
.prod-desc  { font-size: 11px; color: var(--subtle); margin-top: 2px; }
.contact-name { font-size: 13px; font-weight: 700; color: var(--dark); }
.contact-info { font-size: 11px; color: var(--subtle); margin-top: 2px; }
.cell-muted { font-size: 13px; color: var(--subtle); }

.badge { display: inline-flex; align-items: center; padding: 3px 9px; border-radius: var(--radius-pill); font-size: 11px; font-weight: 700; }
.badge.new      { background: #DBEAFE; color: #1E40AF; }
.badge.seen     { background: #FEF3C7; color: #92400E; }
.badge.added    { background: #DCFCE7; color: #14532D; }
.badge.rejected { background: #FEE2E2; color: #991B1B; }

.actions { display: flex; gap: 6px; }
.act-btn { width: 30px; height: 30px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--surface); cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--muted); transition: all .15s; }
.act-btn svg { width: 13px; height: 13px; }
.act-btn.del:hover { border-color: var(--error); color: var(--error); background: var(--error-bg); }
.empty { padding: 40px; text-align: center; color: var(--subtle); font-size: 14px; }

/* Drawer */
.drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.35); z-index: 900; }
.drawer { position: fixed; top: 0; right: 0; width: 440px; height: 100vh; background: var(--white); box-shadow: -8px 0 40px rgba(0,0,0,.15); overflow-y: auto; display: flex; flex-direction: column; }
.drawer-head { display: flex; align-items: flex-start; justify-content: space-between; padding: 24px; border-bottom: 1px solid var(--border-light); }
.drawer-head h3 { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--dark); }
.drawer-head p  { font-size: 12px; color: var(--subtle); margin-top: 3px; }
.close-btn { width: 30px; height: 30px; border-radius: 50%; border: none; background: var(--surface); font-size: 18px; cursor: pointer; color: var(--muted); }
.drawer-section { padding: 16px 24px; border-bottom: 1px solid var(--border-light); }
.section-title { font-size: 11px; font-weight: 700; color: var(--subtle); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 10px; }
.drawer-img { width: 100%; border-radius: var(--radius-lg); object-fit: cover; max-height: 220px; }
.info-card { background: var(--surface); border-radius: var(--radius-md); padding: 12px; display: flex; flex-direction: column; gap: 8px; }
.info-row { display: flex; justify-content: space-between; font-size: 13px; gap: 12px; }
.info-row span { color: var(--subtle); flex-shrink: 0; }
.info-row strong { color: var(--dark); text-align: right; }
.desc-row { flex-direction: column; gap: 4px; }
.desc-text { font-size: 13px; color: var(--dark); line-height: 1.5; }

.note-input { width: 100%; border: 1.5px solid var(--border); border-radius: var(--radius-md); padding: 10px 12px; font-size: 13px; font-family: var(--font-body); color: var(--dark); resize: vertical; outline: none; }
.note-input:focus { border-color: var(--gold); }
.save-note-btn { margin-top: 8px; height: 36px; padding: 0 16px; border-radius: var(--radius-md); border: none; background: var(--gold); color: white; font-size: 12px; font-weight: 700; cursor: pointer; font-family: var(--font-body); }
.save-note-btn:disabled { opacity: .6; cursor: not-allowed; }

.status-btns { display: flex; flex-wrap: wrap; gap: 8px; }
.status-btn { padding: 6px 14px; border-radius: var(--radius-pill); border: 1.5px solid var(--border); background: var(--surface); font-size: 12px; font-weight: 700; cursor: pointer; font-family: var(--font-body); transition: all .15s; color: var(--muted); }
.status-btn:disabled { cursor: not-allowed; }
.status-btn.new.active      { background: #DBEAFE; border-color: #3B82F6; color: #1E40AF; }
.status-btn.seen.active     { background: #FEF3C7; border-color: #F59E0B; color: #92400E; }
.status-btn.added.active    { background: #DCFCE7; border-color: #22C55E; color: #14532D; }
.status-btn.rejected.active { background: #FEE2E2; border-color: #EF4444; color: #991B1B; }
.status-btn:not(.active):hover { border-color: var(--gold); color: var(--gold); }

.toast { position: fixed; bottom: 24px; right: 24px; padding: 12px 20px; border-radius: var(--radius-md); font-size: 14px; font-weight: 700; z-index: 9999; box-shadow: 0 8px 24px rgba(0,0,0,.15); }
.toast.success { background: #22C55E; color: var(--white); }
.toast.error   { background: var(--error); color: var(--white); }
.toast-enter-active, .toast-leave-active { transition: all .25s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(12px); }
.drawer-enter-active, .drawer-leave-active { transition: opacity .2s; }
.drawer-enter-active .drawer, .drawer-leave-active .drawer { transition: transform .25s cubic-bezier(.4,0,.2,1); }
.drawer-enter-from .drawer, .drawer-leave-to .drawer { transform: translateX(100%); }
.drawer-enter-from, .drawer-leave-to { opacity: 0; }
</style>
