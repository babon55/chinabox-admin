<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useUiStore } from '@/stores/ui'
import { productsApi, uploadApi, type Product, type ProductForm, type Category } from '@/api/products'

const ui   = useUiStore()
const lang = computed(() => ui.lang)

// ── Delivery rate constants ───────────────────────────────────────────────────
const FAST_RATE   = 11  // $ per kg — 7-15 days
const SIMPLE_RATE = 7   // $ per kg — 15-30 days

function calcDelivery(weightG: number | null | undefined, rate: number) {
  if (!weightG) return 0
  return (weightG / 1000) * rate
}

function totalPrice(price: number | string, weightG: number | null | undefined, rate: number) {
  return Number(price) + calcDelivery(weightG, rate)
}

// ── State ─────────────────────────────────────────────────────────────────────
const products   = ref<Product[]>([])
const categories = ref<Category[]>([])
const total      = ref(0)
const page       = ref(1)
const loading    = ref(true)
const search     = ref('')
const filter     = ref<'ALL' | 'ACTIVE' | 'DRAFT' | 'ARCHIVED'>('ALL')

// Modal
const showModal  = ref(false)
const editTarget = ref<Product | null>(null)
const saving     = ref(false)
const form       = ref<ProductForm>({
  nameTk: '', nameRu: '', categoryId: '', image: '📦',
  imageUrl: null, price: 0, weightG: null, stock: 0, status: 'ACTIVE'
})
const formErrors = ref<Record<string, string>>({})

// Image upload
const imageFile      = ref<File | null>(null)
const imagePreview   = ref<string | null>(null)
const imageUploading = ref(false)
const imagePublicId  = ref<string | null>(null)
const fileInputRef   = ref<HTMLInputElement | null>(null)

// Delete
const deleteTarget = ref<Product | null>(null)
const deleting     = ref(false)

// Toast
const toast = ref<{ msg: string; type: 'success' | 'error' } | null>(null)
function showToast(msg: string, type: 'success' | 'error' = 'success') {
  toast.value = { msg, type }
  setTimeout(() => toast.value = null, 2800)
}

// ── Fetch ─────────────────────────────────────────────────────────────────────
async function load() {
  loading.value = true
  try {
    const [prodRes, catRes] = await Promise.all([
      productsApi.list({ status: filter.value === 'ALL' ? undefined : filter.value, search: search.value || undefined, page: page.value }),
      categories.value.length ? Promise.resolve(null) : productsApi.categories(),
    ])
    products.value = prodRes.data.items
    total.value    = prodRes.data.total
    if (catRes) categories.value = catRes.data
  } finally { loading.value = false }
}

onMounted(load)
watch([filter, page], load)
let searchTimer: ReturnType<typeof setTimeout>
watch(search, () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { page.value = 1; load() }, 400) })

// ── Stats ─────────────────────────────────────────────────────────────────────
const stats = computed(() => {
  const l = lang.value
  return [
    { label: l === 'tk' ? 'Jemi önümler' : 'Всего товаров', value: total.value },
    { label: l === 'tk' ? 'Işjeň'        : 'Активные',      value: products.value.filter(p => p.status === 'ACTIVE').length   },
    { label: l === 'tk' ? 'Taslama'      : 'Черновики',     value: products.value.filter(p => p.status === 'DRAFT').length    },
    { label: l === 'tk' ? 'Arhiw'        : 'Архив',         value: products.value.filter(p => p.status === 'ARCHIVED').length },
  ]
})

const filters = computed(() => [
  { key: 'ALL',      label: lang.value === 'tk' ? 'Hemmesi' : 'Все'      },
  { key: 'ACTIVE',   label: lang.value === 'tk' ? 'Işjeň'  : 'Активные' },
  { key: 'DRAFT',    label: lang.value === 'tk' ? 'Taslama': 'Черновики' },
  { key: 'ARCHIVED', label: lang.value === 'tk' ? 'Arhiw'  : 'Архив'    },
])

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n: number | string | null | undefined) {
  return Number(n ?? 0).toFixed(2)
}

function fmtWeight(g: number | null | undefined) {
  if (g == null) return '—'
  if (g >= 1000) return (g / 1000).toFixed(2).replace(/\.00$/, '') + ' kg'
  return g + ' g'
}

// ── Image upload ──────────────────────────────────────────────────────────────
function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    showToast(lang.value === 'tk' ? 'Faýl 5MB-dan uly bolmaly däldir' : 'Файл не должен превышать 5MB', 'error')
    return
  }
  imageFile.value    = file
  imagePreview.value = URL.createObjectURL(file)
}

function clearImage() {
  imageFile.value     = null
  imagePreview.value  = null
  imagePublicId.value = null
  form.value.imageUrl = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}

// ── Modal ─────────────────────────────────────────────────────────────────────
const EMOJIS = ['📦','🎧','⌚','🔋','🔊','🎒','💡','🔌','👟','🧴','⌨️','🖥️','📱','🎮','🛒','🎁','💎','👗','🧥','🏠']

function openCreate() {
  editTarget.value    = null
  form.value          = { nameTk: '', nameRu: '', categoryId: categories.value[0]?.id ?? '', image: '📦', imageUrl: null, price: 0, weightG: null, stock: 0, status: 'ACTIVE' }
  formErrors.value    = {}
  imageFile.value     = null
  imagePreview.value  = null
  imagePublicId.value = null
  showModal.value     = true
}

function openEdit(p: Product) {
  editTarget.value    = p
  form.value          = {
    nameTk:     p.nameTk,
    nameRu:     p.nameRu,
    categoryId: p.categoryId,
    image:      p.image,
    imageUrl:   p.imageUrl ?? null,
    price:      Number(p.price),
    weightG:    p.weightG ?? null,
    stock:      p.stock,
    status:     p.status,
  }
  formErrors.value    = {}
  imageFile.value     = null
  imagePreview.value  = p.imageUrl ?? null
  imagePublicId.value = null
  showModal.value     = true
}

function validate() {
  const e: Record<string, string> = {}
  if (!form.value.nameTk)     e.nameTk     = lang.value === 'tk' ? 'Hökman' : 'Обязательно'
  if (!form.value.nameRu)     e.nameRu     = lang.value === 'tk' ? 'Hökman' : 'Обязательно'
  if (!form.value.categoryId) e.categoryId = lang.value === 'tk' ? 'Hökman' : 'Обязательно'
  if (form.value.price <= 0)  e.price      = lang.value === 'tk' ? 'Nol-dan uly bolmaly' : 'Больше нуля'
  formErrors.value = e
  return Object.keys(e).length === 0
}

async function save() {
  if (!validate()) return
  saving.value = true
  try {
    if (imageFile.value) {
      imageUploading.value = true
      try {
        const res = await uploadApi.uploadImage(imageFile.value)
        form.value.imageUrl = res.data.url
        imagePublicId.value = res.data.publicId
      } finally {
        imageUploading.value = false
      }
    }
    if (editTarget.value) {
      await productsApi.update(editTarget.value.id, form.value)
      showToast(lang.value === 'tk' ? 'Önüm täzelendi' : 'Товар обновлён')
    } else {
      await productsApi.create(form.value)
      showToast(lang.value === 'tk' ? 'Önüm goşuldy' : 'Товар добавлен')
    }
    showModal.value = false
    await load()
  } catch (err: unknown) {
    showToast((err as any)?.response?.data?.message ?? 'Error', 'error')
  } finally {
    saving.value = false
  }
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await productsApi.remove(deleteTarget.value.id)
    showToast(lang.value === 'tk' ? 'Önüm pozuldy' : 'Товар удалён')
    deleteTarget.value = null
    await load()
  } catch (err: unknown) {
    showToast((err as any)?.response?.data?.message ?? 'Error', 'error')
  } finally { deleting.value = false }
}

function catName(c: Category) { return lang.value === 'tk' ? c.nameTk : c.nameRu }

const STATUS_LABELS: Record<string, Record<string, string>> = {
  ACTIVE:   { tk: 'Işjeň',   ru: 'Активный' },
  DRAFT:    { tk: 'Taslama', ru: 'Черновик'  },
  ARCHIVED: { tk: 'Arhiw',   ru: 'Архив'     },
}
</script>

<template>
  <div class="products">

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

    <!-- Delivery rates info bar -->
    <div class="rates-bar">
      <div class="rate-item fast">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        <span>{{ lang === 'tk' ? 'Tiz eltip beriş (7-15 gün)' : 'Быстрая доставка (7-15 дней)' }}</span>
        <strong>${{ FAST_RATE }}/kg</strong>
      </div>
      <div class="rate-divider"></div>
      <div class="rate-item simple">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
        <span>{{ lang === 'tk' ? 'Adaty eltip beriş (15-30 gün)' : 'Обычная доставка (15-30 дней)' }}</span>
        <strong>${{ SIMPLE_RATE }}/kg</strong>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="filter-tabs">
        <button v-for="f in filters" :key="f.key" :class="['ftab', { active: filter === f.key }]" @click="filter = f.key as any; page = 1">{{ f.label }}</button>
      </div>
      <div class="right">
        <div class="search-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="search" class="search" :placeholder="lang === 'tk' ? 'Gözle...' : 'Поиск...'" />
        </div>
        <button class="add-btn" @click="openCreate">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          {{ lang === 'tk' ? 'Önüm goş' : 'Добавить' }}
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="card">
      <div v-if="loading" class="table-loading"><div class="spinner"></div></div>
      <template v-else>
        <div class="table">
          <div class="t-head">
            <span>{{ lang === 'tk' ? 'Önüm' : 'Товар' }}</span>
            <span>{{ lang === 'tk' ? 'Kategoriýa' : 'Категория' }}</span>
            <span>{{ lang === 'tk' ? 'Bahasy' : 'Цена' }}</span>
            <span>{{ lang === 'tk' ? 'Agram' : 'Вес' }}</span>
            <span class="fast-col">⚡ {{ lang === 'tk' ? 'Tiz (7-15g)' : 'Быстрая' }}</span>
            <span class="simple-col">🚚 {{ lang === 'tk' ? 'Adaty (15-30g)' : 'Обычная' }}</span>
            <span>{{ lang === 'tk' ? 'Ätiýaç' : 'Склад' }}</span>
            <span>{{ lang === 'tk' ? 'Satylan' : 'Продано' }}</span>
            <span>{{ lang === 'tk' ? 'Ýagdaý' : 'Статус' }}</span>
            <span></span>
          </div>
          <div v-for="p in products" :key="p.id" class="t-row">
            <div class="prod-cell">
              <div class="prod-thumb">
                <img v-if="p.imageUrl" :src="p.imageUrl" :alt="p.nameTk" class="prod-img-real" />
                <span v-else class="prod-img-emoji">{{ p.image }}</span>
              </div>
              <div>
                <div class="prod-name">{{ lang === 'tk' ? p.nameTk : p.nameRu }}</div>
                <div class="prod-id">#{{ p.id.slice(-6).toUpperCase() }}</div>
              </div>
            </div>
            <span class="cell-muted">{{ lang === 'tk' ? p.category?.nameTk : p.category?.nameRu }}</span>
            <span class="cell-bold">${{ fmt(p.price) }}</span>
            <span class="cell-muted">{{ fmtWeight(p.weightG) }}</span>
            <span class="cell-fast">${{ fmt(totalPrice(p.price, p.weightG, FAST_RATE)) }}</span>
            <span class="cell-simple">${{ fmt(totalPrice(p.price, p.weightG, SIMPLE_RATE)) }}</span>
            <div class="stock-cell">
              <span :class="['stock-num', { low: p.stock <= 10, out: p.stock === 0 }]">{{ p.stock }}</span>
              <div class="stock-bar">
                <div class="stock-fill" :style="{ width: Math.min(p.stock / 100 * 100, 100) + '%', background: p.stock === 0 ? '#EF4444' : p.stock <= 10 ? '#F59E0B' : '#22C55E' }"></div>
              </div>
            </div>
            <span class="cell-muted">{{ p.sold }}</span>
            <span :class="['badge', p.status.toLowerCase()]">{{ STATUS_LABELS[p.status]?.[lang] }}</span>
            <div class="actions">
              <button class="act-btn edit" @click="openEdit(p)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="act-btn del" @click="deleteTarget = p">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              </button>
            </div>
          </div>
          <div v-if="!products.length" class="empty">{{ lang === 'tk' ? 'Önüm tapylmady' : 'Товары не найдены' }}</div>
        </div>
      </template>
    </div>

    <!-- Modal -->
    <Transition name="modal">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal">
          <div class="modal-head">
            <h3>{{ editTarget ? (lang === 'tk' ? 'Önümi üýtget' : 'Редактировать') : (lang === 'tk' ? 'Täze önüm' : 'Новый товар') }}</h3>
            <button class="close-btn" @click="showModal = false">×</button>
          </div>
          <div class="modal-body">

            <!-- Image upload zone -->
            <div class="field">
              <label class="label">{{ lang === 'tk' ? 'Önüm suraty' : 'Фото товара' }}</label>
              <div class="upload-zone" :class="{ 'has-image': imagePreview }" @click="fileInputRef?.click()">
                <template v-if="imagePreview">
                  <img :src="imagePreview" class="preview-img" />
                  <button class="remove-img" @click.stop="clearImage">×</button>
                  <div class="preview-overlay"><span>{{ lang === 'tk' ? 'Üýtget' : 'Изменить' }}</span></div>
                </template>
                <template v-else>
                  <div class="upload-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  </div>
                  <div class="upload-text">
                    <span>{{ lang === 'tk' ? 'Surat ýükle' : 'Загрузить фото' }}</span>
                    <small>JPG, PNG, WebP • Max 5MB</small>
                  </div>
                </template>
              </div>
              <input ref="fileInputRef" type="file" accept="image/jpeg,image/png,image/webp,image/gif" class="file-input" @change="onFileChange" />
            </div>

            <!-- Emoji fallback -->
            <div v-if="!imagePreview" class="field">
              <label class="label">{{ lang === 'tk' ? 'Ýa-da emoji saýla' : 'Или выбери иконку' }}</label>
              <div class="emoji-grid">
                <button v-for="e in EMOJIS" :key="e" :class="['emoji-btn', { active: form.image === e }]" @click="form.image = e">{{ e }}</button>
              </div>
            </div>

            <!-- Names -->
            <div class="form-row">
              <div class="field">
                <label class="label">{{ lang === 'tk' ? 'Ady (TK)' : 'Название (TK)' }}</label>
                <input v-model="form.nameTk" class="input" :class="{ error: formErrors.nameTk }" />
                <span v-if="formErrors.nameTk" class="err">{{ formErrors.nameTk }}</span>
              </div>
              <div class="field">
                <label class="label">{{ lang === 'tk' ? 'Ady (RU)' : 'Название (RU)' }}</label>
                <input v-model="form.nameRu" class="input" :class="{ error: formErrors.nameRu }" />
                <span v-if="formErrors.nameRu" class="err">{{ formErrors.nameRu }}</span>
              </div>
            </div>

            <!-- Category + Status -->
            <div class="form-row">
              <div class="field">
                <label class="label">{{ lang === 'tk' ? 'Kategoriýa' : 'Категория' }}</label>
                <select v-model="form.categoryId" class="input">
                  <option v-for="c in categories" :key="c.id" :value="c.id">{{ catName(c) }}</option>
                </select>
              </div>
              <div class="field">
                <label class="label">{{ lang === 'tk' ? 'Ýagdaý' : 'Статус' }}</label>
                <select v-model="form.status" class="input">
                  <option value="ACTIVE">{{ lang === 'tk' ? 'Işjeň' : 'Активный' }}</option>
                  <option value="DRAFT">{{ lang === 'tk' ? 'Taslama' : 'Черновик' }}</option>
                  <option value="ARCHIVED">{{ lang === 'tk' ? 'Arhiw' : 'Архив' }}</option>
                </select>
              </div>
            </div>

            <!-- Price + Stock -->
            <div class="form-row">
              <div class="field">
                <label class="label">{{ lang === 'tk' ? 'Önüm bahasy ($)' : 'Цена товара ($)' }}</label>
                <input v-model.number="form.price" type="number" step="0.01" class="input" :class="{ error: formErrors.price }" />
                <span v-if="formErrors.price" class="err">{{ formErrors.price }}</span>
              </div>
              <div class="field">
                <label class="label">{{ lang === 'tk' ? 'Ätiýaç (sany)' : 'Склад (шт)' }}</label>
                <input v-model.number="form.stock" type="number" class="input" />
              </div>
            </div>

            <!-- Weight -->
            <div class="field">
              <label class="label">{{ lang === 'tk' ? 'Agram (gram)' : 'Вес товара (граммы)' }}</label>
              <div class="input-with-hint">
                <input v-model.number="form.weightG" type="number" min="0" class="input" placeholder="500" />
                <span v-if="form.weightG != null && form.weightG >= 1000" class="input-hint">
                  {{ (form.weightG / 1000).toFixed(2).replace(/\.00$/, '') }} kg
                </span>
              </div>
            </div>

            <!-- Delivery price preview -->
            <div class="delivery-preview">
              <div class="delivery-preview-title">
                {{ lang === 'tk' ? 'Eltip beriş hasaplamasy' : 'Расчёт доставки' }}
              </div>
              <div class="delivery-options">
                <div class="delivery-option fast">
                  <div class="d-option-head">
                    <span class="d-badge fast">⚡ {{ lang === 'tk' ? 'Tiz' : 'Быстрая' }}</span>
                    <span class="d-days">7–15 {{ lang === 'tk' ? 'gün' : 'дней' }}</span>
                  </div>
                  <div class="d-breakdown">
                    <span class="d-line">{{ lang === 'tk' ? 'Önüm' : 'Товар' }}: ${{ fmt(form.price) }}</span>
                    <span class="d-line">{{ lang === 'tk' ? 'Eltip beriş' : 'Доставка' }}: ${{ fmt(calcDelivery(form.weightG, FAST_RATE)) }}</span>
                  </div>
                  <div class="d-total">${{ fmt(totalPrice(form.price, form.weightG, FAST_RATE)) }}</div>
                </div>
                <div class="delivery-option simple">
                  <div class="d-option-head">
                    <span class="d-badge simple">🚚 {{ lang === 'tk' ? 'Adaty' : 'Обычная' }}</span>
                    <span class="d-days">15–30 {{ lang === 'tk' ? 'gün' : 'дней' }}</span>
                  </div>
                  <div class="d-breakdown">
                    <span class="d-line">{{ lang === 'tk' ? 'Önüm' : 'Товар' }}: ${{ fmt(form.price) }}</span>
                    <span class="d-line">{{ lang === 'tk' ? 'Eltip beriş' : 'Доставка' }}: ${{ fmt(calcDelivery(form.weightG, SIMPLE_RATE)) }}</span>
                  </div>
                  <div class="d-total">${{ fmt(totalPrice(form.price, form.weightG, SIMPLE_RATE)) }}</div>
                </div>
              </div>
            </div>

          </div>
          <div class="modal-foot">
            <button class="cancel-btn" @click="showModal = false">{{ lang === 'tk' ? 'Ýatyr' : 'Отмена' }}</button>
            <button class="save-btn" :disabled="saving || imageUploading" @click="save">
              <svg v-if="saving || imageUploading" class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              {{ imageUploading ? (lang === 'tk' ? 'Ýüklenýär...' : 'Загрузка...') : saving ? '...' : (lang === 'tk' ? 'Ýatda sakla' : 'Сохранить') }}
            </button>
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
          <div class="modal-body">
            <p>{{ lang === 'tk' ? `"${deleteTarget?.nameTk}" önümini pozmak isleýärsiňizmi?` : `Удалить "${deleteTarget?.nameRu}"?` }}</p>
          </div>
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
.products { display: flex; flex-direction: column; gap: 16px; }

.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.stat-card { background: var(--white); border-radius: var(--radius-lg); padding: 16px 20px; border: 1.5px solid var(--border-light); box-shadow: var(--shadow-sm); }
.stat-value { font-size: 24px; font-weight: 800; color: var(--dark); font-family: var(--font-display); }
.stat-label { font-size: 12px; color: var(--subtle); margin-top: 4px; }

.rates-bar { display: flex; align-items: center; background: var(--white); border-radius: var(--radius-lg); border: 1.5px solid var(--border-light); box-shadow: var(--shadow-sm); overflow: hidden; }
.rate-item { display: flex; align-items: center; gap: 10px; padding: 12px 20px; flex: 1; }
.rate-item svg { width: 16px; height: 16px; flex-shrink: 0; }
.rate-item span { font-size: 13px; color: var(--subtle); flex: 1; }
.rate-item strong { font-size: 15px; font-weight: 800; }
.rate-item.fast svg, .rate-item.fast strong { color: #F59E0B; }
.rate-item.simple svg, .rate-item.simple strong { color: #3B82F6; }
.rate-divider { width: 1px; height: 36px; background: var(--border-light); flex-shrink: 0; }

.toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.filter-tabs { display: flex; gap: 4px; background: var(--white); border: 1.5px solid var(--border); border-radius: var(--radius-md); padding: 4px; }
.ftab { padding: 5px 14px; border-radius: var(--radius-sm); border: none; background: transparent; font-size: 13px; font-weight: 600; color: var(--subtle); cursor: pointer; font-family: var(--font-body); transition: all .15s; }
.ftab.active { background: var(--dark); color: var(--white); }
.right { display: flex; gap: 10px; align-items: center; }
.search-wrap { position: relative; }
.search-wrap svg { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); width: 14px; height: 14px; color: var(--subtle); }
.search { height: 38px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--white); padding: 0 12px 0 32px; font-size: 13px; font-family: var(--font-body); color: var(--dark); outline: none; width: 200px; }
.search:focus { border-color: var(--gold); }
.add-btn { height: 38px; padding: 0 16px; border-radius: var(--radius-md); border: none; background: linear-gradient(135deg, var(--gold), var(--gold-dark)); color: var(--white); font-size: 13px; font-weight: 700; font-family: var(--font-body); cursor: pointer; display: flex; align-items: center; gap: 6px; }
.add-btn svg { width: 14px; height: 14px; }

.card { background: var(--white); border-radius: var(--radius-lg); border: 1.5px solid var(--border-light); overflow: hidden; box-shadow: var(--shadow-sm); }
.table-loading { display: flex; justify-content: center; padding: 60px; }
.spinner { width: 30px; height: 30px; border: 3px solid var(--border); border-top-color: var(--gold); border-radius: 50%; animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.t-head { display: grid; grid-template-columns: 2fr 1fr 80px 65px 110px 110px 1fr 60px 100px 72px; gap: 8px; padding: 10px 20px; background: var(--surface); font-size: 11px; font-weight: 700; color: var(--subtle); text-transform: uppercase; letter-spacing: .04em; }
.t-row  { display: grid; grid-template-columns: 2fr 1fr 80px 65px 110px 110px 1fr 60px 100px 72px; gap: 8px; padding: 12px 20px; border-top: 1px solid var(--border-light); align-items: center; transition: background .12s; }
.t-row:hover { background: var(--surface); }

.fast-col   { color: #F59E0B !important; }
.simple-col { color: #3B82F6 !important; }
.cell-fast   { font-size: 13px; font-weight: 700; color: #F59E0B; }
.cell-simple { font-size: 13px; font-weight: 700; color: #3B82F6; }

.prod-cell { display: flex; align-items: center; gap: 10px; }
.prod-thumb { width: 40px; height: 40px; border-radius: var(--radius-md); overflow: hidden; background: var(--surface); border: 1.5px solid var(--border-light); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.prod-img-real  { width: 100%; height: 100%; object-fit: cover; }
.prod-img-emoji { font-size: 22px; }
.prod-name { font-size: 13px; font-weight: 700; color: var(--dark); }
.prod-id   { font-size: 11px; color: var(--subtle); margin-top: 2px; font-family: monospace; }
.cell-muted { font-size: 13px; color: var(--subtle); }
.cell-bold  { font-size: 13px; font-weight: 700; color: var(--dark); }

.stock-cell { display: flex; flex-direction: column; gap: 4px; }
.stock-num { font-size: 13px; font-weight: 700; color: var(--dark); }
.stock-num.low { color: #F59E0B; }
.stock-num.out { color: #EF4444; }
.stock-bar  { height: 4px; background: var(--border-light); border-radius: var(--radius-pill); }
.stock-fill { height: 100%; border-radius: var(--radius-pill); transition: width .3s; }

.badge { display: inline-flex; align-items: center; padding: 3px 9px; border-radius: var(--radius-pill); font-size: 11px; font-weight: 700; }
.badge.active   { background: #DCFCE7; color: #14532D; }
.badge.draft    { background: #FEF9C3; color: #854D0E; }
.badge.archived { background: #F3F4F6; color: #6B7280; }

.actions { display: flex; gap: 6px; }
.act-btn { width: 30px; height: 30px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--surface); cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--muted); transition: all .15s; }
.act-btn svg { width: 13px; height: 13px; }
.act-btn.edit:hover { border-color: var(--gold); color: var(--gold); background: var(--gold-glow); }
.act-btn.del:hover  { border-color: var(--error); color: var(--error); background: var(--error-bg); }
.empty { padding: 40px; text-align: center; color: var(--subtle); font-size: 14px; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
.modal { background: var(--white); border-radius: var(--radius-xl); width: 100%; max-width: 560px; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 24px 64px rgba(0,0,0,.3); }
.modal-sm { max-width: 380px; }
.modal-head { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 0; flex-shrink: 0; }
.modal-head h3 { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--dark); }
.close-btn { width: 30px; height: 30px; border-radius: 50%; border: none; background: var(--surface); font-size: 18px; cursor: pointer; color: var(--muted); line-height: 1; }
.modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 14px; overflow-y: auto; }
.modal-body p { font-size: 14px; color: var(--dark); }
.modal-foot { display: flex; gap: 10px; justify-content: flex-end; padding: 14px 24px; border-top: 1px solid var(--border-light); flex-shrink: 0; }

.upload-zone { width: 100%; height: 140px; border: 2px dashed var(--border); border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; gap: 12px; cursor: pointer; transition: all .15s; background: var(--surface); position: relative; overflow: hidden; }
.upload-zone:hover { border-color: var(--gold); background: var(--gold-glow); }
.upload-zone.has-image { border-style: solid; border-color: var(--gold); padding: 0; }
.upload-icon { width: 40px; height: 40px; border-radius: var(--radius-md); background: var(--border-light); display: flex; align-items: center; justify-content: center; }
.upload-icon svg { width: 20px; height: 20px; color: var(--subtle); }
.upload-text { display: flex; flex-direction: column; gap: 3px; }
.upload-text span { font-size: 14px; font-weight: 700; color: var(--dark); }
.upload-text small { font-size: 11px; color: var(--subtle); }
.preview-img { width: 100%; height: 100%; object-fit: cover; }
.preview-overlay { position: absolute; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity .15s; }
.upload-zone:hover .preview-overlay { opacity: 1; }
.preview-overlay span { color: var(--white); font-size: 13px; font-weight: 700; }
.remove-img { position: absolute; top: 8px; right: 8px; width: 24px; height: 24px; border-radius: 50%; background: rgba(0,0,0,.6); border: none; color: var(--white); font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10; line-height: 1; }
.file-input { display: none; }

.field { display: flex; flex-direction: column; gap: 5px; flex: 1; }
.label { font-size: 12px; font-weight: 700; color: var(--dark); }
.input { height: 40px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--surface); padding: 0 12px; font-size: 13px; font-family: var(--font-body); color: var(--dark); outline: none; width: 100%; box-sizing: border-box; }
.input:focus { border-color: var(--gold); background: var(--white); }
.input.error { border-color: var(--error); }
.err { font-size: 11px; color: var(--error); }
.form-row { display: flex; gap: 12px; }
.emoji-grid { display: flex; flex-wrap: wrap; gap: 6px; }
.emoji-btn { width: 36px; height: 36px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--surface); font-size: 18px; cursor: pointer; transition: all .12s; }
.emoji-btn.active { border-color: var(--gold); background: var(--gold-glow); }

.input-with-hint { position: relative; }
.input-with-hint .input { padding-right: 52px; }
.input-hint { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); font-size: 11px; color: var(--gold); font-weight: 700; pointer-events: none; }

/* Delivery preview */
.delivery-preview { border-radius: var(--radius-lg); border: 1.5px solid var(--border-light); overflow: hidden; }
.delivery-preview-title { padding: 10px 14px; background: var(--surface); font-size: 11px; font-weight: 700; color: var(--subtle); text-transform: uppercase; letter-spacing: .04em; border-bottom: 1px solid var(--border-light); }
.delivery-options { display: grid; grid-template-columns: 1fr 1fr; }
.delivery-option { padding: 14px; display: flex; flex-direction: column; gap: 8px; }
.delivery-option.fast { border-right: 1px solid var(--border-light); }
.d-option-head { display: flex; align-items: center; justify-content: space-between; }
.d-badge { font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: var(--radius-pill); }
.d-badge.fast   { background: #FEF3C7; color: #92400E; }
.d-badge.simple { background: #DBEAFE; color: #1E40AF; }
.d-days { font-size: 11px; color: var(--subtle); }
.d-breakdown { display: flex; flex-direction: column; gap: 2px; }
.d-line { font-size: 12px; color: var(--subtle); }
.d-total { font-size: 20px; font-weight: 800; font-family: var(--font-display); }
.delivery-option.fast   .d-total { color: #F59E0B; }
.delivery-option.simple .d-total { color: #3B82F6; }

.cancel-btn { height: 38px; padding: 0 16px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--surface); font-size: 13px; font-weight: 600; color: var(--muted); cursor: pointer; font-family: var(--font-body); }
.save-btn { height: 38px; padding: 0 20px; border-radius: var(--radius-md); border: none; background: linear-gradient(135deg, var(--gold), var(--gold-dark)); font-size: 13px; font-weight: 700; color: var(--white); cursor: pointer; font-family: var(--font-body); display: flex; align-items: center; gap: 6px; }
.save-btn:disabled { opacity: .7; cursor: not-allowed; }
.del-btn { height: 38px; padding: 0 20px; border-radius: var(--radius-md); border: none; background: var(--error); font-size: 13px; font-weight: 700; color: var(--white); cursor: pointer; font-family: var(--font-body); }
.spin { animation: spin .8s linear infinite; width: 14px; height: 14px; }

.toast { position: fixed; bottom: 24px; right: 24px; padding: 12px 20px; border-radius: var(--radius-md); font-size: 14px; font-weight: 700; z-index: 9999; box-shadow: 0 8px 24px rgba(0,0,0,.15); }
.toast.success { background: #22C55E; color: var(--white); }
.toast.error   { background: var(--error); color: var(--white); }
.toast-enter-active, .toast-leave-active { transition: all .25s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(12px); }
.modal-enter-active, .modal-leave-active { transition: opacity .2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
