<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUiStore } from '@/stores/ui'
import ProductTable from './products/ProductTable.vue'
import ProductModal from './products/ProductModal.vue'
import type { ProductItem, ProductForm, ProductStatus } from '@/types'

const ui   = useUiStore()
const lang = computed(() => ui.lang)

// ── Translations ──────────────────────────────────────────────────────────────
const L = computed(() => lang.value === 'tk' ? {
  total: 'Jemi önüm', active: 'Işjeň', lowStock: 'Az stok', outOfStock: 'Gutaran',
  addBtn: '+ Önüm goş', search: 'Önüm gözle...', all: 'Hemmesi',
  deleteConfirm: 'Bu önümi pozmak isleýärsiňizmi?', showing: 'Görkezilýär', of: '/',
} : {
  total: 'Всего товаров', active: 'Активных', lowStock: 'Мало', outOfStock: 'Нет в наличии',
  addBtn: '+ Добавить', search: 'Поиск товара...', all: 'Все',
  deleteConfirm: 'Удалить этот товар?', showing: 'Показано', of: 'из',
})

// ── Data ──────────────────────────────────────────────────────────────────────
const products = ref<ProductItem[]>([
  { id: 'PRD-001', name: { tk: 'Simsiz Gulaklyk Pro',   ru: 'Наушники Pro'             }, category: { tk: 'Elektronika', ru: 'Электроника' }, image: '🎧', price: 24.99, stock: 42,  sold: 284, status: 'active',   createdAt: '2026-01-10' },
  { id: 'PRD-002', name: { tk: 'Akylly Sagat Series 3', ru: 'Умные часы Series 3'      }, category: { tk: 'Elektronika', ru: 'Электроника' }, image: '⌚', price: 89.99, stock: 18,  sold: 173, status: 'active',   createdAt: '2026-01-14' },
  { id: 'PRD-003', name: { tk: 'Göçme Zarýadlaýjy',     ru: 'Портативная зарядка'     }, category: { tk: 'Aksesuar',    ru: 'Аксессуары'  }, image: '🔋', price: 12.99, stock: 105, sold: 461, status: 'active',   createdAt: '2026-01-18' },
  { id: 'PRD-004', name: { tk: 'Bluetooth Dinamigi',    ru: 'Bluetooth-колонка'       }, category: { tk: 'Elektronika', ru: 'Электроника' }, image: '🔊', price: 24.99, stock: 67,  sold: 198, status: 'active',   createdAt: '2026-01-22' },
  { id: 'PRD-005', name: { tk: 'Kamera Çantasy',        ru: 'Сумка для камеры'        }, category: { tk: 'Egin-eşik',   ru: 'Одежда'      }, image: '🎒', price: 18.50, stock: 89,  sold: 134, status: 'active',   createdAt: '2026-02-01' },
  { id: 'PRD-006', name: { tk: 'Akylly Lampochka',      ru: 'Умная лампочка'          }, category: { tk: 'Öý üçin',     ru: 'Для дома'    }, image: '💡', price: 9.99,  stock: 8,   sold: 92,  status: 'active',   createdAt: '2026-02-05' },
  { id: 'PRD-007', name: { tk: 'USB-C Hub 7-in-1',      ru: 'USB-C Hub 7-в-1'        }, category: { tk: 'Aksesuar',    ru: 'Аксессуары'  }, image: '🔌', price: 34.99, stock: 0,   sold: 57,  status: 'active',   createdAt: '2026-02-10' },
  { id: 'PRD-008', name: { tk: 'Sport Köwüş Nike',      ru: 'Кроссовки Nike'          }, category: { tk: 'Egin-eşik',   ru: 'Одежда'      }, image: '👟', price: 79.99, stock: 34,  sold: 210, status: 'draft',    createdAt: '2026-02-14' },
  { id: 'PRD-009', name: { tk: 'Ýüz Kremi',             ru: 'Крем для лица'           }, category: { tk: 'Gözellik',    ru: 'Красота'     }, image: '🧴', price: 15.00, stock: 55,  sold: 88,  status: 'active',   createdAt: '2026-02-18' },
  { id: 'PRD-010', name: { tk: 'Mehaniki Klawiatura',   ru: 'Механическая клавиатура' }, category: { tk: 'Elektronika', ru: 'Электроника' }, image: '⌨️', price: 59.99, stock: 5,   sold: 41,  status: 'archived', createdAt: '2026-02-22' },
])

// ── Search + Filter ───────────────────────────────────────────────────────────
const search       = ref('')
const statusFilter = ref<ProductStatus | 'all'>('all')

const filtered = computed(() => {
  let list = products.value
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(p =>
      p.name.tk.toLowerCase().includes(q) ||
      p.name.ru.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q)
    )
  }
  if (statusFilter.value !== 'all') {
    list = list.filter(p => p.status === statusFilter.value)
  }
  return list
})

const totalCount    = computed(() => products.value.length)
const activeCount   = computed(() => products.value.filter(p => p.status === 'active').length)
const lowStockCount = computed(() => products.value.filter(p => p.stock > 0 && p.stock <= 10).length)
const outOfStock    = computed(() => products.value.filter(p => p.stock === 0).length)

// ── Modal ─────────────────────────────────────────────────────────────────────
const modalOpen = ref(false)
const editing   = ref<ProductItem | null>(null)

function openAdd()  { editing.value = null;    modalOpen.value = true }
function openEdit(p: ProductItem) { editing.value = p; modalOpen.value = true }
function closeModal() { modalOpen.value = false; editing.value = null }

function saveProduct(form: ProductForm) {
  if (editing.value) {
    const idx = products.value.findIndex(p => p.id === editing.value!.id)
    if (idx !== -1) products.value[idx] = { ...products.value[idx], ...form }
  } else {
    products.value.unshift({
      id: `PRD-${String(products.value.length + 1).padStart(3, '0')}`,
      ...form, sold: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    })
  }
  closeModal()
}

// ── Delete ────────────────────────────────────────────────────────────────────
const deleteTarget  = ref<ProductItem | null>(null)
const deleteConfirm = ref(false)

function askDelete(p: ProductItem) { deleteTarget.value = p; deleteConfirm.value = true }
function confirmDelete() {
  if (deleteTarget.value) products.value = products.value.filter(p => p.id !== deleteTarget.value!.id)
  deleteTarget.value = null; deleteConfirm.value = false
}

const statusOptions: Array<ProductStatus | 'all'> = ['all', 'active', 'draft', 'archived']
const statusLabel: Record<ProductStatus | 'all', Record<'tk' | 'ru', string>> = {
  all:      { tk: 'Hemmesi',     ru: 'Все'          },
  active:   { tk: 'Işjeň',      ru: 'Активен'      },
  draft:    { tk: 'Taslama',    ru: 'Черновик'     },
  archived: { tk: 'Arhiwlenen', ru: 'Архивирован'  },
}
</script>

<template>
  <div class="view">

    <!-- Summary -->
    <div class="summary">
      <div class="s-card">
        <p class="s-label">{{ L.total }}</p>
        <p class="s-value">{{ totalCount }}</p>
      </div>
      <div class="s-card">
        <p class="s-label">{{ L.active }}</p>
        <p class="s-value success">{{ activeCount }}</p>
      </div>
      <div class="s-card">
        <p class="s-label">{{ L.lowStock }}</p>
        <p class="s-value warning">{{ lowStockCount }}</p>
      </div>
      <div class="s-card">
        <p class="s-label">{{ L.outOfStock }}</p>
        <p class="s-value error">{{ outOfStock }}</p>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="toolbar-left">
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

      <button class="add-btn" @click="openAdd">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        {{ L.addBtn }}
      </button>
    </div>

    <!-- Table -->
    <ProductTable :products="filtered" :lang="lang" @edit="openEdit" @delete="askDelete" />

    <!-- Showing count -->
    <p class="showing">{{ L.showing }} {{ filtered.length }} {{ L.of }} {{ totalCount }}</p>

    <!-- Add/Edit modal -->
    <ProductModal :open="modalOpen" :editing="editing" :lang="lang" @close="closeModal" @save="saveProduct" />

    <!-- Delete confirm dialog -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="deleteConfirm" class="overlay" @click.self="deleteConfirm = false">
          <div class="confirm-box">
            <div class="confirm-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <p class="confirm-text">{{ L.deleteConfirm }}</p>
            <p class="confirm-name">{{ deleteTarget?.name[lang] }}</p>
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
.s-card { background: var(--white); border-radius: var(--radius-xl); border: 1.5px solid var(--border-light); box-shadow: var(--shadow-sm); padding: 16px 20px; }
.s-label { font-size: 11px; font-weight: 600; color: var(--subtle); text-transform: uppercase; letter-spacing: .05em; margin-bottom: 6px; }
.s-value { font-family: var(--font-display); font-size: 28px; font-weight: 700; color: var(--dark); }
.s-value.success { color: var(--success); }
.s-value.warning { color: var(--warning); }
.s-value.error   { color: var(--error); }

/* Toolbar */
.toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.toolbar-left { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; flex: 1; }

.search-wrap {
  display: flex; align-items: center; gap: 8px;
  background: var(--white); border: 1.5px solid var(--border);
  border-radius: var(--radius-md); padding: 0 12px;
  height: 38px; min-width: 220px; cursor: text;
  transition: border-color .15s, box-shadow .15s;
}
.search-wrap:focus-within { border-color: var(--gold); box-shadow: 0 0 0 3px var(--gold-glow); }
.search-wrap svg { width: 14px; height: 14px; color: var(--subtle); flex-shrink: 0; }
.search-wrap input { flex: 1; border: none; background: transparent; outline: none; font-size: 13px; font-family: var(--font-body); color: var(--dark); }
.search-wrap input::placeholder { color: var(--subtle); }

.filter-tabs { display: flex; gap: 4px; background: var(--white); border: 1.5px solid var(--border); border-radius: var(--radius-md); padding: 3px; }
.tab { padding: 4px 12px; border-radius: var(--radius-sm); border: none; background: transparent; font-size: 12px; font-weight: 600; color: var(--muted); cursor: pointer; transition: all .15s; font-family: var(--font-body); white-space: nowrap; }
.tab:hover  { background: var(--surface); color: var(--dark); }
.tab.active { background: var(--dark); color: var(--white); }

.add-btn {
  display: flex; align-items: center; gap: 7px;
  height: 38px; padding: 0 18px; border-radius: var(--radius-md);
  border: none; background: linear-gradient(135deg, var(--gold), var(--gold-dark));
  font-size: 13px; font-weight: 800; color: white;
  cursor: pointer; transition: all .15s; font-family: var(--font-body);
  box-shadow: 0 4px 12px var(--gold-shadow); white-space: nowrap; flex-shrink: 0;
}
.add-btn svg { width: 14px; height: 14px; }
.add-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 16px var(--gold-shadow); }

.showing { font-size: 12px; color: var(--subtle); font-weight: 500; text-align: right; }

/* Delete confirm */
.overlay { position: fixed; inset: 0; z-index: 500; background: rgba(15,17,23,.55); backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; padding: 20px; }
.confirm-box { background: var(--white); border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); padding: 28px; width: 100%; max-width: 360px; display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center; }
.confirm-icon { width: 52px; height: 52px; border-radius: 50%; background: var(--error-bg); display: flex; align-items: center; justify-content: center; color: var(--error); }
.confirm-icon svg { width: 24px; height: 24px; }
.confirm-text { font-size: 15px; font-weight: 700; color: var(--dark); }
.confirm-name { font-size: 13px; color: var(--muted); background: var(--surface); padding: 6px 14px; border-radius: var(--radius-md); }
.confirm-actions { display: flex; gap: 10px; margin-top: 4px; }
.btn-cancel { height: 38px; padding: 0 18px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--surface); font-size: 13px; font-weight: 700; color: var(--muted); cursor: pointer; transition: all .15s; font-family: var(--font-body); }
.btn-cancel:hover { border-color: var(--dark); color: var(--dark); }
.btn-delete { height: 38px; padding: 0 18px; border-radius: var(--radius-md); border: none; background: var(--error); font-size: 13px; font-weight: 800; color: white; cursor: pointer; transition: all .15s; font-family: var(--font-body); }
.btn-delete:hover { background: #DC2626; }

.modal-enter-active, .modal-leave-active { transition: opacity .2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

@media (max-width: 900px) { .summary { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 500px)  { .summary { grid-template-columns: 1fr 1fr; } }
</style>
