<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useUiStore } from '@/stores/ui'
import { commentsApi, type AdminComment } from '@/api/comments'
import { productsApi, type Product } from '@/api/products'
import { getErrorMessage } from '@/utils/error'

const ui   = useUiStore()
const lang = computed(() => ui.lang)

// ── State ─────────────────────────────────────────────────────────────────────
const comments  = ref<AdminComment[]>([])
const total     = ref(0)
const page      = ref(1)
const loading   = ref(true)
const LIMIT     = 20

const products        = ref<Product[]>([])
const selectedProduct = ref('')

// Delete
const deleteTarget = ref<AdminComment | null>(null)
const deleting     = ref(false)

// Toast
const toast = ref<{ msg: string; type: 'success' | 'error' } | null>(null)
function showToast(msg: string, type: 'success' | 'error' = 'success') {
  toast.value = { msg, type }
  setTimeout(() => { toast.value = null }, 2800)
}

// ── Load products for filter dropdown ────────────────────────────────────────
async function loadProducts() {
  try {
    const res = await productsApi.list({ limit: 200, status: 'ACTIVE' })
    products.value = res.data.items
  } catch {}
}

// ── Load comments ─────────────────────────────────────────────────────────────
async function load() {
  loading.value = true
  try {
    const res = await commentsApi.listAll({
      page:      page.value,
      limit:     LIMIT,
      productId: selectedProduct.value || undefined,
    })
    comments.value = res.data.comments
    total.value    = res.data.total
  } catch (err: unknown) {
    showToast(getErrorMessage(err, 'Failed to load comments'), 'error')
  } finally {
    loading.value = false
  }
}

onMounted(() => { loadProducts(); load() })
watch([page, selectedProduct], load)

function onProductChange() { page.value = 1 }

const totalPages = computed(() => Math.ceil(total.value / LIMIT))

// ── Stats ─────────────────────────────────────────────────────────────────────
const stats = computed(() => [
  { label: lang.value === 'tk' ? 'Jemi teswirler'  : 'Всего отзывов',   value: total.value },
  { label: lang.value === 'tk' ? '5 ýyldyz'        : '5 звёзд',         value: comments.value.filter(c => c.rating === 5).length },
  { label: lang.value === 'tk' ? '1–2 ýyldyz'      : '1–2 звезды',      value: comments.value.filter(c => c.rating <= 2).length },
])

// ── Delete ────────────────────────────────────────────────────────────────────
async function confirmDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await commentsApi.delete(deleteTarget.value.product.id, deleteTarget.value.id)
    showToast(lang.value === 'tk' ? 'Teswir pozuldy' : 'Отзыв удалён')
    deleteTarget.value = null
    await load()
  } catch (err: unknown) {
    showToast(getErrorMessage(err, 'Failed to delete comment'), 'error')
  } finally {
    deleting.value = false
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString(
    lang.value === 'tk' ? 'tk-TM' : 'ru-RU',
    { day: '2-digit', month: 'short', year: 'numeric' }
  )
}

const AVATAR_COLORS = ['#E8A020','#3B82F6','#22C55E','#8B5CF6','#EF4444','#06B6D4','#F59E0B','#EC4899']
function avatarColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}
function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}
</script>

<template>
  <div class="comments-admin">

    <!-- Toast -->
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
      <div class="filter-group">
        <div class="select-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 3H2l8 9.46V19l4 2V12.46z"/>
          </svg>
          <select
            v-model="selectedProduct"
            class="filter-select"
            @change="onProductChange"
          >
            <option value="">{{ lang === 'tk' ? 'Ähli önümler' : 'Все товары' }}</option>
            <option v-for="p in products" :key="p.id" :value="p.id">
              {{ lang === 'tk' ? p.nameTk : p.nameRu }}
            </option>
          </select>
        </div>
      </div>

      <button class="refresh-btn" :disabled="loading" @click="load">
        <svg :class="['btn-icon', { spin: loading }]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        {{ lang === 'tk' ? 'Täzele' : 'Обновить' }}
      </button>
    </div>

    <!-- Table card -->
    <div class="card">
      <div v-if="loading" class="table-loading">
        <div class="spinner"></div>
      </div>

      <template v-else>
        <!-- Empty -->
        <div v-if="!comments.length" class="empty">
          💬 {{ lang === 'tk' ? 'Teswir tapylmady' : 'Отзывы не найдены' }}
        </div>

        <div v-else class="table">
          <!-- Head -->
          <div class="t-head">
            <span>{{ lang === 'tk' ? 'Müşderi'  : 'Покупатель' }}</span>
            <span>{{ lang === 'tk' ? 'Önüm'     : 'Товар'      }}</span>
            <span>{{ lang === 'tk' ? 'Baha'     : 'Оценка'     }}</span>
            <span>{{ lang === 'tk' ? 'Teswir'   : 'Отзыв'      }}</span>
            <span>{{ lang === 'tk' ? 'Senesi'   : 'Дата'       }}</span>
            <span></span>
          </div>

          <!-- Rows -->
          <div v-for="c in comments" :key="c.id" class="t-row">

            <!-- Customer -->
            <div class="customer-cell">
              <div class="avatar" :style="{ background: avatarColor(c.customer.name) }">
                {{ initials(c.customer.name) }}
              </div>
              <span class="customer-name">{{ c.customer.name }}</span>
            </div>

            <!-- Product -->
            <div class="product-cell">
              <span class="product-name">
                {{ lang === 'tk' ? c.product.nameTk : c.product.nameRu }}
              </span>
              <span class="product-id">#{{ c.product.id.slice(-6).toUpperCase() }}</span>
            </div>

            <!-- Rating -->
            <div class="stars-cell">
              <span v-for="i in 5" :key="i" :class="['star', { filled: i <= c.rating }]">★</span>
              <span class="rating-num">{{ c.rating }}.0</span>
            </div>

            <!-- Text -->
            <div class="text-cell">
              <p class="comment-text">{{ c.text }}</p>
            </div>

            <!-- Date -->
            <span class="date-cell">{{ fmtDate(c.createdAt) }}</span>

            <!-- Actions -->
            <div class="actions">
              <button class="act-btn del" :title="lang === 'tk' ? 'Poz' : 'Удалить'" @click="deleteTarget = c">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6"/><path d="M14 11v6"/>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </button>
            </div>

          </div>
        </div>
      </template>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <button :disabled="page === 1" class="page-btn" @click="page--">
        ← {{ lang === 'tk' ? 'Öňki' : 'Назад' }}
      </button>
      <span class="page-info">
        {{ lang === 'tk' ? `${page} / ${totalPages}` : `Стр. ${page} из ${totalPages}` }}
      </span>
      <button :disabled="page >= totalPages" class="page-btn" @click="page++">
        {{ lang === 'tk' ? 'Indiki' : 'Вперёд' }} →
      </button>
    </div>

    <!-- Delete confirm modal -->
    <Transition name="modal">
      <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
        <div class="modal modal-sm">
          <div class="modal-head">
            <h3>{{ lang === 'tk' ? 'Pozmagy tassykla' : 'Подтвердить удаление' }}</h3>
            <button class="close-btn" @click="deleteTarget = null">×</button>
          </div>
          <div class="modal-body">
            <p>
              {{ lang === 'tk'
                ? `"${deleteTarget?.customer.name}" müşderiniň teswirini pozmak isleýärsiňizmi?`
                : `Удалить отзыв покупателя "${deleteTarget?.customer.name}"?` }}
            </p>
            <div v-if="deleteTarget" class="delete-preview">
              <div class="dp-stars">
                <span v-for="i in 5" :key="i" :class="['star', { filled: i <= deleteTarget.rating }]">★</span>
              </div>
              <p class="dp-text">{{ deleteTarget.text }}</p>
            </div>
          </div>
          <div class="modal-foot">
            <button class="cancel-btn" @click="deleteTarget = null">
              {{ lang === 'tk' ? 'Ýok' : 'Отмена' }}
            </button>
            <button class="del-btn" :disabled="deleting" @click="confirmDelete">
              {{ deleting ? '...' : (lang === 'tk' ? 'Hawa, poz' : 'Да, удалить') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
.comments-admin { display: flex; flex-direction: column; gap: 16px; }

/* Stats */
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.stat-card  { background: var(--white); border-radius: var(--radius-lg); padding: 16px 20px; border: 1.5px solid var(--border-light); box-shadow: var(--shadow-sm); }
.stat-value { font-size: 24px; font-weight: 800; color: var(--dark); font-family: var(--font-display); }
.stat-label { font-size: 12px; color: var(--subtle); margin-top: 4px; }

/* Toolbar */
.toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.filter-group { display: flex; gap: 10px; }
.select-wrap { position: relative; }
.select-wrap svg { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); width: 14px; height: 14px; color: var(--subtle); pointer-events: none; }
.filter-select { height: 38px; padding: 0 12px 0 32px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--white); font-size: 13px; font-family: var(--font-body); color: var(--dark); outline: none; min-width: 220px; cursor: pointer; }
.filter-select:focus { border-color: var(--gold); }

.refresh-btn { height: 38px; padding: 0 16px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--white); font-size: 13px; font-weight: 600; color: var(--muted); cursor: pointer; font-family: var(--font-body); display: flex; align-items: center; gap: 6px; transition: all .15s; }
.refresh-btn:hover:not(:disabled) { border-color: var(--gold); color: var(--gold); }
.refresh-btn:disabled { opacity: .5; cursor: not-allowed; }
.btn-icon { width: 14px; height: 14px; }

/* Card / table */
.card { background: var(--white); border-radius: var(--radius-lg); border: 1.5px solid var(--border-light); overflow: hidden; box-shadow: var(--shadow-sm); }
.table-loading { display: flex; justify-content: center; padding: 60px; }
.spinner { width: 30px; height: 30px; border: 3px solid var(--border); border-top-color: var(--gold); border-radius: 50%; animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.empty { padding: 48px; text-align: center; color: var(--subtle); font-size: 14px; }

.t-head { display: grid; grid-template-columns: 1.4fr 1.4fr 120px 2fr 100px 48px; gap: 8px; padding: 10px 20px; background: var(--surface); font-size: 11px; font-weight: 700; color: var(--subtle); text-transform: uppercase; letter-spacing: .04em; }
.t-row  { display: grid; grid-template-columns: 1.4fr 1.4fr 120px 2fr 100px 48px; gap: 8px; padding: 14px 20px; border-top: 1px solid var(--border-light); align-items: center; transition: background .12s; }
.t-row:hover { background: var(--surface); }

/* Customer cell */
.customer-cell { display: flex; align-items: center; gap: 10px; }
.avatar { width: 34px; height: 34px; border-radius: 50%; color: white; font-size: 12px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.customer-name { font-size: 13px; font-weight: 700; color: var(--dark); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* Product cell */
.product-cell { display: flex; flex-direction: column; gap: 2px; overflow: hidden; }
.product-name { font-size: 13px; font-weight: 700; color: var(--dark); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.product-id   { font-size: 11px; color: var(--subtle); font-family: monospace; }

/* Stars */
.stars-cell { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
.star       { font-size: 14px; color: var(--border-light); }
.star.filled { color: #F59E0B; }
.rating-num { font-size: 12px; font-weight: 700; color: var(--subtle); margin-left: 2px; }

/* Comment text */
.text-cell    { overflow: hidden; }
.comment-text { font-size: 13px; color: var(--dark); line-height: 1.5; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

/* Date */
.date-cell { font-size: 12px; color: var(--subtle); white-space: nowrap; }

/* Actions */
.actions { display: flex; gap: 6px; justify-content: flex-end; }
.act-btn { width: 30px; height: 30px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--surface); cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--muted); transition: all .15s; }
.act-btn svg { width: 13px; height: 13px; }
.act-btn.del:hover { border-color: var(--error); color: var(--error); background: var(--error-bg); }

/* Pagination */
.pagination { display: flex; align-items: center; gap: 16px; justify-content: center; }
.page-btn   { height: 38px; padding: 0 16px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--white); font-size: 13px; font-weight: 700; color: var(--dark); cursor: pointer; font-family: var(--font-body); transition: all .15s; }
.page-btn:hover:not(:disabled) { border-color: var(--gold); color: var(--gold); }
.page-btn:disabled { opacity: .4; cursor: not-allowed; }
.page-info  { font-size: 13px; color: var(--subtle); font-weight: 600; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
.modal    { background: var(--white); border-radius: var(--radius-xl); width: 100%; max-width: 560px; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 24px 64px rgba(0,0,0,.3); }
.modal-sm { max-width: 400px; }
.modal-head { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 0; flex-shrink: 0; }
.modal-head h3 { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--dark); }
.close-btn  { width: 30px; height: 30px; border-radius: 50%; border: none; background: var(--surface); font-size: 18px; cursor: pointer; color: var(--muted); line-height: 1; }
.modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 14px; overflow-y: auto; }
.modal-body p { font-size: 14px; color: var(--dark); }
.modal-foot { display: flex; gap: 10px; justify-content: flex-end; padding: 14px 24px; border-top: 1px solid var(--border-light); flex-shrink: 0; }

/* Delete preview */
.delete-preview { background: var(--surface); border-radius: var(--radius-md); border: 1.5px solid var(--border-light); padding: 12px 14px; display: flex; flex-direction: column; gap: 8px; }
.dp-stars { display: flex; gap: 3px; }
.dp-text  { font-size: 13px; color: var(--dark); line-height: 1.5; margin: 0; }

.cancel-btn { height: 38px; padding: 0 16px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--surface); font-size: 13px; font-weight: 600; color: var(--muted); cursor: pointer; font-family: var(--font-body); }
.del-btn    { height: 38px; padding: 0 20px; border-radius: var(--radius-md); border: none; background: var(--error); font-size: 13px; font-weight: 700; color: var(--white); cursor: pointer; font-family: var(--font-body); }
.del-btn:disabled { opacity: .7; cursor: not-allowed; }

/* Toast */
.toast { position: fixed; bottom: 24px; right: 24px; padding: 12px 20px; border-radius: var(--radius-md); font-size: 14px; font-weight: 700; z-index: 9999; box-shadow: 0 8px 24px rgba(0,0,0,.15); }
.toast.success { background: #22C55E; color: var(--white); }
.toast.error   { background: var(--error); color: var(--white); }
.toast-enter-active, .toast-leave-active { transition: all .25s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(12px); }
.modal-enter-active, .modal-leave-active { transition: opacity .2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

.spin { animation: spin .8s linear infinite; }
</style>