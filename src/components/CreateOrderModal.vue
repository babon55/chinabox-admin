<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ordersApi }   from '@/api/orders'
import { customersApi } from '@/api/customers'
import { productsApi }  from '@/api/products'
import type { Lang }    from '@/types'
import ProductOptionPicker from './ProductOptionPicker.vue'

const props = defineProps<{ open: boolean; lang: Lang }>()
const emit  = defineEmits<{
  (e: 'close'): void
  (e: 'created'): void
}>()

// ── i18n ─────────────────────────────────────────────────────────────────────
const L = computed(() => props.lang === 'tk' ? {
  title:       'Täze Sargyt',
  customer:    'Müşderi saýla',
  searchCust:  'Müşderi gözle...',
  products:    'Haryt goş',
  searchProd:  'Haryt gözle...',
  qty:         'Mukdar',
  price:       'Baha',
  note:        'Bellik (islege görä)',
  notePh:      'Sargyt barada bellik...',
  add:         'Goş',
  remove:      'Aýyr',
  cancel:      'Ýok',
  create:      'Döret',
  creating:    'Döredilýär...',
  total:       'Jemi',
  noLines:     'Azyndan bir haryt goşuň',
  noCust:      'Müşderi saýlaň',
  errCreate:   'Sargyt döredilmedi',
} : {
  title:       'Новый заказ',
  customer:    'Выберите клиента',
  searchCust:  'Найти клиента...',
  products:    'Добавить товар',
  searchProd:  'Найти товар...',
  qty:         'Кол-во',
  price:       'Цена',
  note:        'Примечание (необязательно)',
  notePh:      'Заметка к заказу...',
  add:         'Добавить',
  remove:      'Убрать',
  cancel:      'Отмена',
  create:      'Создать',
  creating:    'Создание...',
  total:       'Итого',
  noLines:     'Добавьте хотя бы один товар',
  noCust:      'Выберите клиента',
  errCreate:   'Не удалось создать заказ',
})

// ── State ─────────────────────────────────────────────────────────────────────
const customers     = ref<any[]>([])
const products      = ref<any[]>([])
const custSearch    = ref('')
const prodSearch    = ref('')
const selectedCust  = ref<any | null>(null)
const lines         = ref<{ productId: string; name: Record<string,string>; image: string; qty: number; unitPrice: number; options?: Record<string,string>; optionsDisplay?: { name: string; value: string }[] }[]>([])
const note          = ref('')
const submitting    = ref(false)
const error         = ref('')
const custOpen      = ref(false)
const prodOpen      = ref(false)

// Option picker state: optionId → value
const pickerProduct = ref<any | null>(null)
const pickerOptions = ref<Record<string,string>>({})
const pickerOpen    = ref(false)

// ── Load data ─────────────────────────────────────────────────────────────────
async function loadCustomers() {
  try {
    const res = await customersApi.list({ search: custSearch.value || undefined, limit: 20 })
    customers.value = res.data.items
  } catch { customers.value = [] }
}

async function loadProducts() {
  try {
    const res = await productsApi.list({ search: prodSearch.value || undefined, status: 'ACTIVE', limit: 30 })
    products.value = res.data.items
  } catch { products.value = [] }
}

watch(() => props.open, open => {
  if (open) { reset(); loadCustomers(); loadProducts() }
})

let custTimer: ReturnType<typeof setTimeout>
watch(custSearch, () => { clearTimeout(custTimer); custTimer = setTimeout(loadCustomers, 300) })

let prodTimer: ReturnType<typeof setTimeout>
watch(prodSearch, () => { clearTimeout(prodTimer); prodTimer = setTimeout(loadProducts, 300) })

// ── Helpers ───────────────────────────────────────────────────────────────────
function selectCustomer(c: any) {
  selectedCust.value = c
  custOpen.value = false
  custSearch.value = ''
}

function addLine(p: any) {
  // If product has options, open picker
  if (p.options && p.options.length > 0) {
    pickerProduct.value = p
    pickerOptions.value = {}
    pickerOpen.value = true
    return
  }
  // No options, add directly
  pushLine(p, {})
}

function pushLine(p: any, opts: Record<string, string>) {
  const existing = lines.value.find(l => l.productId === p.id)
  if (existing) {
    existing.qty++
    return
  }
  // Precompute display array for options (for UI only)
  const optionsDisplay = p.options?.length
    ? p.options.filter((o: any) => opts[o.id]).map((o: any) => ({
        name: props.lang === 'tk' ? o.nameTk : o.nameRu,
        value: opts[o.id]
      }))
    : undefined
  lines.value.push({
    productId: p.id,
    name:      { tk: p.nameTk, ru: p.nameRu },
    image:     p.image ?? '📦',
    qty:       1,
    unitPrice: Number(p.price),
    options:   Object.keys(opts).length ? opts : undefined,
    optionsDisplay  // UI-only field, ignored by API
  })
  prodOpen.value = false
  prodSearch.value = ''
}

function onPickerConfirm() {
  if (pickerProduct.value) {
    pushLine(pickerProduct.value, pickerOptions.value)
  }
  pickerOpen.value = false
  pickerProduct.value = null
  pickerOptions.value = {}
}

function onPickerCancel() {
  pickerOpen.value = false
  pickerProduct.value = null
  pickerOptions.value = {}
}

function removeLine(idx: number) { lines.value.splice(idx, 1) }

const total = computed(() => lines.value.reduce((s, l) => s + l.qty * l.unitPrice, 0))

function reset() {
  selectedCust.value = null
  lines.value        = []
  note.value         = ''
  error.value        = ''
  custSearch.value   = ''
  prodSearch.value   = ''
  custOpen.value     = false
  prodOpen.value     = false
}

// ── Submit ────────────────────────────────────────────────────────────────────
async function submit() {
  error.value = ''
  if (!selectedCust.value) { error.value = L.value.noCust;  return }
  if (!lines.value.length) { error.value = L.value.noLines; return }

  submitting.value = true
  try {
    await ordersApi.create({
      customerId: selectedCust.value.id,
      lines: lines.value.map(l => ({
        productId: l.productId,
        qty:       l.qty,
        unitPrice: l.unitPrice,
        options:   l.options,
      })),
      note: note.value || undefined,
    })
    emit('created')
    emit('close')
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? L.value.errCreate
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="backdrop" @click="emit('close')" />
    </Transition>

    <Transition name="modal">
      <div v-if="open" class="modal-wrap" @click.self="emit('close')">
        <div class="modal">

          <!-- Header -->
          <div class="modal-head">
            <h2>{{ L.title }}</h2>
            <button class="close-btn" @click="emit('close')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div class="modal-body">

            <!-- Customer picker -->
            <div class="field">
              <label>{{ L.customer }}</label>
              <div v-if="selectedCust" class="selected-cust" @click="custOpen = !custOpen">
                <div class="cust-avatar">{{ selectedCust.name[0] }}</div>
                <div class="cust-info">
                  <p class="cust-name">{{ selectedCust.name }}</p>
                  <p class="cust-email">{{ selectedCust.email }}</p>
                </div>
                <span class="change-link">↩</span>
              </div>
              <div v-else class="dropdown">
                <input v-model="custSearch" class="inp" :placeholder="L.searchCust" @focus="custOpen = true" />
                <div v-if="custOpen && customers.length" class="drop-list">
                  <button v-for="c in customers" :key="c.id" class="drop-item" @click="selectCustomer(c)">
                    <div class="cust-avatar sm">{{ c.name[0] }}</div>
                    <div>
                      <p class="cust-name">{{ c.name }}</p>
                      <p class="cust-email">{{ c.email }}</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <!-- Product picker -->
            <div class="field">
              <label>{{ L.products }}</label>
              <div class="dropdown">
                <input v-model="prodSearch" class="inp" :placeholder="L.searchProd" @focus="prodOpen = true" />
                <div v-if="prodOpen && products.length" class="drop-list">
                  <button v-for="p in products" :key="p.id" class="drop-item" @click="addLine(p)">
                    <span class="prod-thumb">{{ p.image ?? '📦' }}</span>
                    <div>
                      <p class="cust-name">{{ lang === 'tk' ? p.nameTk : p.nameRu }}</p>
                      <p class="cust-email">${{ Number(p.price).toFixed(2) }}</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <!-- Lines -->
            <div v-if="lines.length" class="lines">
              <div v-for="(l, i) in lines" :key="l.productId" class="line-row">
                <span class="line-thumb">{{ l.image }}</span>
                <div class="line-info">
                  <p class="line-name">{{ typeof l.name === 'object' ? (lang === 'tk' ? l.name.tk : l.name.ru) : l.name }}</p>
                  <div v-if="l.optionsDisplay && l.optionsDisplay.length" class="line-options">
                    <span v-for="opt in l.optionsDisplay" :key="opt.name" class="line-opt">
                      {{ opt.name }}: <strong>{{ opt.value }}</strong>
                    </span>
                  </div>
                </div>
                <div class="line-controls">
                  <button class="qty-btn" @click="l.qty = Math.max(1, l.qty - 1)">−</button>
                  <span class="qty-val">{{ l.qty }}</span>
                  <button class="qty-btn" @click="l.qty++">+</button>
                </div>
                <div class="line-price-wrap">
                  <span class="line-unit">$</span>
                  <input v-model.number="l.unitPrice" type="number" min="0.01" step="0.01" class="price-inp" />
                </div>
                <span class="line-sub">${{ (l.qty * l.unitPrice).toFixed(2) }}</span>
                <button class="rem-btn" @click="removeLine(i)">×</button>
              </div>

              <!-- Total -->
              <div class="lines-total">
                <span>{{ L.total }}</span>
                <strong>${{ total.toFixed(2) }}</strong>
              </div>
            </div>

            <!-- Note -->
            <div class="field">
              <label>{{ L.note }}</label>
              <textarea v-model="note" class="textarea" :placeholder="L.notePh" rows="2" />
            </div>

            <!-- Error -->
            <p v-if="error" class="error">{{ error }}</p>

          </div>

          <!-- Footer -->
          <div class="modal-foot">
            <button class="btn-cancel" @click="emit('close')">{{ L.cancel }}</button>
            <button class="btn-create" :disabled="submitting" @click="submit">
              {{ submitting ? L.creating : L.create }}
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Product Option Picker Modal -->
  <ProductOptionPicker
    v-if="pickerOpen"
    :product="pickerProduct"
    :lang="props.lang"
    :model-value="pickerOptions"
    @update:model-value="pickerOptions = $event"
    @confirm="onPickerConfirm"
    @cancel="onPickerCancel"
  />
</template>

<style scoped>
.backdrop { position: fixed; inset: 0; z-index: 300; background: rgba(15,17,23,.5); backdrop-filter: blur(2px); }
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.modal-wrap { position: fixed; inset: 0; z-index: 301; display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal { background: var(--white); border-radius: var(--radius-xl); width: 100%; max-width: 560px; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 24px 64px rgba(0,0,0,.25); }
.modal-enter-active, .modal-leave-active { transition: opacity .2s, transform .2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(.96); }

/* Head */
.modal-head { display: flex; align-items: center; justify-content: space-between; padding: 22px 24px; border-bottom: 1px solid var(--border-light); flex-shrink: 0; }
.modal-head h2 { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--dark); }
.close-btn { width: 30px; height: 30px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--surface); display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--muted); }
.close-btn svg { width: 14px; height: 14px; }

/* Body */
.modal-body { flex: 1; overflow-y: auto; padding: 20px 24px; display: flex; flex-direction: column; gap: 18px; }

/* Fields */
.field { display: flex; flex-direction: column; gap: 6px; }
label { font-size: 11px; font-weight: 700; color: var(--subtle); text-transform: uppercase; letter-spacing: .06em; }
.inp { height: 38px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--surface); padding: 0 12px; font-size: 13px; font-family: var(--font-body); color: var(--dark); outline: none; width: 100%; }
.inp:focus { border-color: var(--gold); }
.textarea { border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--surface); padding: 10px 12px; font-size: 13px; font-family: var(--font-body); color: var(--dark); outline: none; width: 100%; resize: vertical; }
.textarea:focus { border-color: var(--gold); }

/* Customer selected */
.selected-cust { display: flex; align-items: center; gap: 10px; background: var(--surface); border: 1.5px solid var(--border-light); border-radius: var(--radius-md); padding: 10px 12px; cursor: pointer; }
.selected-cust:hover { border-color: var(--gold); }
.change-link { margin-left: auto; font-size: 16px; color: var(--subtle); }

/* Dropdown */
.dropdown { position: relative; }
.drop-list { position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: var(--white); border: 1.5px solid var(--border); border-radius: var(--radius-md); box-shadow: 0 8px 24px rgba(0,0,0,.1); z-index: 10; max-height: 200px; overflow-y: auto; }
.drop-item { display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 12px; text-align: left; background: none; border: none; cursor: pointer; border-bottom: 1px solid var(--border-light); }
.drop-item:last-child { border-bottom: none; }
.drop-item:hover { background: var(--surface); }

/* Avatar */
.cust-avatar { width: 32px; height: 32px; border-radius: var(--radius-md); background: linear-gradient(135deg, var(--gold), var(--gold-dark)); color: white; font-size: 13px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.cust-avatar.sm { width: 28px; height: 28px; font-size: 12px; }
.cust-name  { font-size: 13px; font-weight: 600; color: var(--dark); }
.cust-email { font-size: 11px; color: var(--subtle); margin-top: 1px; }

.prod-thumb { font-size: 20px; width: 32px; text-align: center; flex-shrink: 0; }

/* Lines */
.lines { background: var(--surface); border-radius: var(--radius-lg); border: 1.5px solid var(--border-light); overflow: hidden; }
.line-row { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-bottom: 1px solid var(--border-light); }
.line-thumb { font-size: 20px; flex-shrink: 0; }
.line-name  { flex: 1; font-size: 13px; font-weight: 600; color: var(--dark); min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.line-options {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 2px;
  font-size: 11px;
  color: var(--subtle);
}
.line-opt {
  background: var(--surface);
  padding: 1px 6px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--border-light);
}
.line-opt strong {
  color: var(--gold);
  font-weight: 700;
}
.line-controls { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.qty-btn { width: 24px; height: 24px; border-radius: var(--radius-sm); border: 1.5px solid var(--border); background: var(--white); font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--dark); }
.qty-val { font-size: 13px; font-weight: 700; color: var(--dark); min-width: 20px; text-align: center; }
.line-price-wrap { display: flex; align-items: center; gap: 2px; flex-shrink: 0; }
.line-unit { font-size: 13px; color: var(--subtle); }
.price-inp { width: 72px; height: 30px; border-radius: var(--radius-sm); border: 1.5px solid var(--border); background: var(--white); padding: 0 6px; font-size: 13px; font-family: var(--font-body); color: var(--dark); outline: none; text-align: right; }
.price-inp:focus { border-color: var(--gold); }
.line-sub { font-size: 13px; font-weight: 700; color: var(--dark); min-width: 60px; text-align: right; flex-shrink: 0; }
.rem-btn { width: 22px; height: 22px; border-radius: 50%; border: 1.5px solid var(--border); background: var(--white); font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--muted); flex-shrink: 0; }
.rem-btn:hover { border-color: var(--error); color: var(--error); background: var(--error-bg); }

.lines-total { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; font-size: 14px; color: var(--muted); }
.lines-total strong { font-family: var(--font-display); font-size: 16px; font-weight: 700; color: var(--dark); }

/* Error */
.error { font-size: 13px; font-weight: 600; color: var(--error); background: var(--error-bg); border-radius: var(--radius-md); padding: 10px 14px; }

/* Footer */
.modal-foot { display: flex; gap: 10px; justify-content: flex-end; padding: 16px 24px; border-top: 1px solid var(--border-light); flex-shrink: 0; }
.btn-cancel { height: 38px; padding: 0 18px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--surface); font-size: 13px; font-weight: 600; color: var(--muted); cursor: pointer; font-family: var(--font-body); }
.btn-create { height: 38px; padding: 0 22px; border-radius: var(--radius-md); border: none; background: var(--gold); font-size: 13px; font-weight: 700; color: white; cursor: pointer; font-family: var(--font-body); transition: background .15s; }
.btn-create:hover:not(:disabled) { background: var(--gold-dark); }
.btn-create:disabled { opacity: .6; cursor: not-allowed; }
</style>
