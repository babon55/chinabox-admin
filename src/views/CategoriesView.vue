<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUiStore } from '@/stores/ui'
import { productsApi, type Category } from '@/api/products'

const ui   = useUiStore()
const lang = computed(() => ui.lang)

// ── State ─────────────────────────────────────────────────────────────────────
const categories = ref<Category[]>([])
const loading    = ref(true)

// Modal
const showModal  = ref(false)
const saving     = ref(false)
const editTarget = ref<Category | null>(null)
const form       = ref({ nameTk: '', nameRu: '', parentId: null as string | null })
const formErrors = ref<Record<string, string>>({})

// Delete
const deleteTarget = ref<Category | null>(null)
const deleting     = ref(false)

// Toast
const toast = ref<{ msg: string; type: 'success' | 'error' } | null>(null)
function showToast(msg: string, type: 'success' | 'error' = 'success') {
  toast.value = { msg, type }
  setTimeout(() => { toast.value = null }, 2800)
}

// ── Load ──────────────────────────────────────────────────────────────────────
async function load() {
  loading.value = true
  try {
    const res = await productsApi.categories()
    categories.value = res.data
  } finally {
    loading.value = false
  }
}

onMounted(load)

// ── Computed ──────────────────────────────────────────────────────────────────
const rootCategories = computed(() => categories.value.filter(c => !c.parentId))

const totalChildren = computed(() =>
  categories.value.reduce((acc, c) => acc + (c.children?.length ?? 0), 0)
)

// ── Modal ─────────────────────────────────────────────────────────────────────
function openCreate(parentId: string | null = null) {
  editTarget.value = null
  form.value       = { nameTk: '', nameRu: '', parentId }
  formErrors.value = {}
  showModal.value  = true
}

function openEdit(cat: Category, parentId: string | null = null) {
  editTarget.value = cat
  form.value       = { nameTk: cat.nameTk, nameRu: cat.nameRu, parentId }
  formErrors.value = {}
  showModal.value  = true
}

function validate() {
  const e: Record<string, string> = {}
  if (!form.value.nameTk.trim()) e.nameTk = lang.value === 'tk' ? 'Hökman' : 'Обязательно'
  if (!form.value.nameRu.trim()) e.nameRu = lang.value === 'tk' ? 'Hökman' : 'Обязательно'
  formErrors.value = e
  return Object.keys(e).length === 0
}

async function save() {
  if (!validate()) return
  saving.value = true
  try {
    if (editTarget.value) {
      await productsApi.updateCategory(editTarget.value.id, {
        nameTk:   form.value.nameTk,
        nameRu:   form.value.nameRu,
        parentId: form.value.parentId,
      })
      showToast(lang.value === 'tk' ? 'Kategoriýa täzelendi' : 'Категория обновлена')
    } else {
      await productsApi.createCategory({
        nameTk:   form.value.nameTk,
        nameRu:   form.value.nameRu,
        parentId: form.value.parentId,
      })
      showToast(lang.value === 'tk' ? 'Kategoriýa goşuldy' : 'Категория добавлена')
    }
    showModal.value = false
    await load()
  } catch {
    showToast(lang.value === 'tk' ? 'Ýalňyşlyk boldy' : 'Произошла ошибка', 'error')
  } finally {
    saving.value = false
  }
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await productsApi.deleteCategory(deleteTarget.value.id)
    showToast(lang.value === 'tk' ? 'Kategoriýa pozuldy' : 'Категория удалена')
    deleteTarget.value = null
    await load()
  } catch {
    showToast(lang.value === 'tk' ? 'Ýalňyşlyk boldy' : 'Произошла ошибка', 'error')
  } finally {
    deleting.value = false
  }
}

function catName(c: Category) {
  return lang.value === 'tk' ? c.nameTk : c.nameRu
}
</script>

<template>
  <div class="categories">

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toast" :class="['toast', toast.type]">{{ toast.msg }}</div>
    </Transition>

    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">
          {{ lang === 'tk' ? 'Kategoriýalar' : 'Категории' }}
        </h1>
        <div class="header-stats">
          <span class="stat-pill">
            {{ rootCategories.length }}
            {{ lang === 'tk' ? 'esasy' : 'основных' }}
          </span>
          <span class="stat-pill sub">
            {{ totalChildren }}
            {{ lang === 'tk' ? 'bölüm' : 'подразделов' }}
          </span>
        </div>
      </div>
      <button class="add-btn" @click="openCreate(null)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        {{ lang === 'tk' ? 'Kategoriýa goş' : 'Добавить категорию' }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-wrap">
      <div class="spinner" />
    </div>

    <!-- Empty -->
    <div v-else-if="!rootCategories.length" class="empty-state">
      <div class="empty-icon">🗂️</div>
      <h3>{{ lang === 'tk' ? 'Kategoriýa ýok' : 'Нет категорий' }}</h3>
      <p>{{ lang === 'tk' ? 'Ilkinji kategoriýany goşuň' : 'Добавьте первую категорию' }}</p>
      <button class="add-btn" @click="openCreate(null)">
        {{ lang === 'tk' ? 'Goş' : 'Добавить' }}
      </button>
    </div>

    <!-- Categories grid -->
    <div v-else class="cat-grid">
      <div v-for="root in rootCategories" :key="root.id" class="cat-card">

        <!-- Root header -->
        <div class="cat-head">
          <div class="cat-head-left">
            <div class="cat-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div>
              <div class="cat-name">{{ catName(root) }}</div>
              <div class="cat-sub-count">
                {{ root.children?.length ?? 0 }}
                {{ lang === 'tk' ? 'bölüm' : 'подразделов' }}
              </div>
            </div>
          </div>
          <div class="cat-actions">
            <button
              class="act-btn add-sub"
              :title="lang === 'tk' ? 'Bölüm goş' : 'Добавить подраздел'"
              @click="openCreate(root.id)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
            <button
              class="act-btn edit"
              :title="lang === 'tk' ? 'Üýtget' : 'Редактировать'"
              @click="openEdit(root, null)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button
              class="act-btn del"
              :title="lang === 'tk' ? 'Poz' : 'Удалить'"
              @click="deleteTarget = root"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14H6L5 6"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Subcategories -->
        <div v-if="root.children?.length" class="sub-list">
          <div
            v-for="child in root.children"
            :key="child.id"
            class="sub-item"
          >
            <div class="sub-left">
              <span class="sub-connector">└</span>
              <span class="sub-name">{{ catName(child) }}</span>
            </div>
            <div class="sub-actions">
              <button
                class="act-btn edit sm"
                @click="openEdit(child, root.id)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button
                class="act-btn del sm"
                @click="deleteTarget = child"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14H6L5 6"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Add subcategory inline hint -->
        <button class="add-sub-inline" @click="openCreate(root.id)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="12" height="12">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {{ lang === 'tk' ? 'Bölüm goş' : 'Добавить подраздел' }}
        </button>

      </div>
    </div>

    <!-- ── Create / Edit Modal ── -->
    <Transition name="modal">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal">

          <div class="modal-head">
            <div class="modal-head-left">
              <div class="modal-icon" :class="form.parentId ? 'sub' : 'root'">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path v-if="!form.parentId" d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                  <path v-else d="M3 7h18M3 12h12M3 17h8"/>
                </svg>
              </div>
              <div>
                <h3 class="modal-title">
                  {{ editTarget
                    ? (lang === 'tk' ? 'Kategoriýany üýtget' : 'Редактировать категорию')
                    : form.parentId
                      ? (lang === 'tk' ? 'Täze bölüm' : 'Новый подраздел')
                      : (lang === 'tk' ? 'Täze kategoriýa' : 'Новая категория') }}
                </h3>
                <p v-if="form.parentId" class="modal-sub">
                  {{ lang === 'tk' ? 'Esasy:' : 'Основная:' }}
                  <strong>{{ catName(rootCategories.find(r => r.id === form.parentId)!) }}</strong>
                </p>
              </div>
            </div>
            <button class="close-btn" @click="showModal = false">×</button>
          </div>

          <div class="modal-body">
            <!-- Turkmen name -->
            <div class="field">
              <label class="label">
                {{ lang === 'tk' ? 'Ady (Türkmençe)' : 'Название (Туркменский)' }}
                <span class="flag">🇹🇲</span>
              </label>
              <input
                v-model="form.nameTk"
                class="input"
                :class="{ error: formErrors.nameTk }"
                :placeholder="form.parentId
                  ? (lang === 'tk' ? 'mysal: Erkek köwüşleri' : 'например: Мужская обувь')
                  : (lang === 'tk' ? 'mysal: Egin-eşik' : 'например: Одежда')"
              />
              <span v-if="formErrors.nameTk" class="err">{{ formErrors.nameTk }}</span>
            </div>

            <!-- Russian name -->
            <div class="field">
              <label class="label">
                {{ lang === 'tk' ? 'Ady (Rusça)' : 'Название (Русский)' }}
                <span class="flag">🇷🇺</span>
              </label>
              <input
                v-model="form.nameRu"
                class="input"
                :class="{ error: formErrors.nameRu }"
                :placeholder="form.parentId
                  ? (lang === 'tk' ? 'mysal: Мужская обувь' : 'например: Мужская обувь')
                  : (lang === 'tk' ? 'mysal: Одежда' : 'например: Одежда')"
              />
              <span v-if="formErrors.nameRu" class="err">{{ formErrors.nameRu }}</span>
            </div>

            <!-- Type indicator -->
            <div class="type-indicator" :class="form.parentId ? 'sub' : 'root'">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span v-if="form.parentId">
                {{ lang === 'tk'
                  ? 'Bu bölüm, esasy kategoriýanyň içinde görünýär'
                  : 'Этот подраздел будет отображаться внутри основной категории' }}
              </span>
              <span v-else>
                {{ lang === 'tk'
                  ? 'Bu esasy kategoriýa — içine bölümler goşup bilersiňiz'
                  : 'Это основная категория — внутрь можно добавить подразделы' }}
              </span>
            </div>
          </div>

          <div class="modal-foot">
            <button class="cancel-btn" @click="showModal = false">
              {{ lang === 'tk' ? 'Ýatyr' : 'Отмена' }}
            </button>
            <button class="save-btn" :disabled="saving" @click="save">
              <svg v-if="saving" class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              {{ saving ? '...' : (lang === 'tk' ? 'Ýatda sakla' : 'Сохранить') }}
            </button>
          </div>

        </div>
      </div>
    </Transition>

    <!-- ── Delete Confirm ── -->
    <Transition name="modal">
      <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
        <div class="modal modal-sm">
          <div class="modal-head">
            <h3 class="modal-title">
              {{ lang === 'tk' ? 'Pozmagy tassykla' : 'Подтвердить удаление' }}
            </h3>
            <button class="close-btn" @click="deleteTarget = null">×</button>
          </div>
          <div class="modal-body">
            <div class="delete-warning">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <div>
                <p class="delete-name">« {{ catName(deleteTarget) }} »</p>
                <p class="delete-desc">
                  {{ deleteTarget.children?.length
                    ? (lang === 'tk'
                        ? `Bu kategoriýany pozsaňyz, ${deleteTarget.children.length} bölüm esasy derejä geçiriler`
                        : `При удалении ${deleteTarget.children.length} подраздел(а) будут перемещены на верхний уровень`)
                    : (lang === 'tk'
                        ? 'Bu kategoriýa silinip aýrylar'
                        : 'Категория будет удалена безвозвратно') }}
                </p>
              </div>
            </div>
          </div>
          <div class="modal-foot">
            <button class="cancel-btn" @click="deleteTarget = null">
              {{ lang === 'tk' ? 'Ýok' : 'Нет' }}
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
.categories { display: flex; flex-direction: column; gap: 20px; }

/* Header */
.page-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.header-left { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.page-title  { font-family: var(--font-display); font-size: 22px; font-weight: 800; color: var(--dark); }
.header-stats { display: flex; gap: 8px; }
.stat-pill {
  display: inline-flex; align-items: center;
  height: 24px; padding: 0 10px;
  border-radius: var(--radius-pill);
  background: var(--surface); border: 1.5px solid var(--border-light);
  font-size: 12px; font-weight: 700; color: var(--dark);
}
.stat-pill.sub { color: var(--gold); border-color: rgba(232,160,32,.3); background: rgba(232,160,32,.08); }

.add-btn {
  display: inline-flex; align-items: center; gap: 7px;
  height: 38px; padding: 0 16px;
  border-radius: var(--radius-md); border: none;
  background: linear-gradient(135deg, var(--gold), var(--gold-dark));
  color: white; font-size: 13px; font-weight: 700;
  font-family: var(--font-body); cursor: pointer; transition: all .15s;
  box-shadow: 0 4px 12px var(--gold-shadow);
}
.add-btn svg { width: 14px; height: 14px; }
.add-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 16px var(--gold-shadow); }

/* Loading */
.loading-wrap { display: flex; justify-content: center; padding: 60px; }
.spinner { width: 30px; height: 30px; border: 3px solid var(--border); border-top-color: var(--gold); border-radius: 50%; animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Empty */
.empty-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 80px 20px; text-align: center; background: var(--white); border-radius: var(--radius-xl); border: 1.5px dashed var(--border-light); }
.empty-icon  { font-size: 52px; }
.empty-state h3 { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--dark); }
.empty-state p  { font-size: 14px; color: var(--subtle); }

/* Grid */
.cat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }

/* Card */
.cat-card {
  background: var(--white);
  border-radius: var(--radius-xl);
  border: 1.5px solid var(--border-light);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: box-shadow .15s;
}
.cat-card:hover { box-shadow: var(--shadow-md); }

/* Card head */
.cat-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 16px 14px;
  background: linear-gradient(135deg, var(--surface), #FEFDF8);
  border-bottom: 1px solid var(--border-light);
}
.cat-head-left { display: flex; align-items: center; gap: 12px; }
.cat-icon-wrap {
  width: 38px; height: 38px; border-radius: var(--radius-md);
  background: rgba(232,160,32,.12); border: 1.5px solid rgba(232,160,32,.2);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.cat-icon-wrap svg { width: 16px; height: 16px; color: var(--gold); }
.cat-name      { font-size: 15px; font-weight: 800; color: var(--dark); font-family: var(--font-display); }
.cat-sub-count { font-size: 11px; color: var(--subtle); margin-top: 2px; }

.cat-actions { display: flex; gap: 6px; }
.act-btn {
  width: 32px; height: 32px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border);
  background: var(--white);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--muted);
  transition: all .15s; flex-shrink: 0;
}
.act-btn svg { width: 13px; height: 13px; }
.act-btn.sm  { width: 26px; height: 26px; }
.act-btn.sm svg { width: 11px; height: 11px; }
.act-btn.add-sub:hover { border-color: var(--gold); color: var(--gold); background: rgba(232,160,32,.08); }
.act-btn.edit:hover    { border-color: #3B82F6; color: #3B82F6; background: #EFF6FF; }
.act-btn.del:hover     { border-color: var(--error); color: var(--error); background: var(--error-bg); }

/* Subcategories */
.sub-list { display: flex; flex-direction: column; padding: 8px 0; }
.sub-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 7px 16px;
  transition: background .12s;
}
.sub-item:hover { background: var(--surface); }
.sub-left { display: flex; align-items: center; gap: 10px; }
.sub-connector { font-size: 14px; color: var(--border); flex-shrink: 0; line-height: 1; }
.sub-name { font-size: 13px; font-weight: 600; color: var(--dark); }
.sub-actions { display: flex; gap: 5px; opacity: 0; transition: opacity .15s; }
.sub-item:hover .sub-actions { opacity: 1; }

/* Add subcategory inline */
.add-sub-inline {
  display: flex; align-items: center; gap: 7px;
  width: 100%; padding: 10px 16px;
  border: none; background: none;
  font-size: 12px; font-weight: 600; color: var(--subtle);
  cursor: pointer; font-family: var(--font-body);
  border-top: 1px dashed var(--border-light);
  transition: all .15s;
}
.add-sub-inline:hover { color: var(--gold); background: rgba(232,160,32,.04); }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
.modal { background: var(--white); border-radius: var(--radius-xl); width: 100%; max-width: 460px; display: flex; flex-direction: column; box-shadow: 0 24px 64px rgba(0,0,0,.3); overflow: hidden; }
.modal-sm { max-width: 380px; }

.modal-head { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 0; gap: 12px; }
.modal-head-left { display: flex; align-items: center; gap: 12px; }
.modal-icon {
  width: 40px; height: 40px; border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.modal-icon.root { background: rgba(232,160,32,.12); border: 1.5px solid rgba(232,160,32,.25); }
.modal-icon.root svg { color: var(--gold); width: 18px; height: 18px; }
.modal-icon.sub  { background: rgba(59,130,246,.1); border: 1.5px solid rgba(59,130,246,.25); }
.modal-icon.sub svg  { color: #3B82F6; width: 18px; height: 18px; }
.modal-title { font-family: var(--font-display); font-size: 17px; font-weight: 700; color: var(--dark); }
.modal-sub   { font-size: 12px; color: var(--subtle); margin-top: 3px; }
.modal-sub strong { color: var(--gold); }

.close-btn { width: 30px; height: 30px; border-radius: 50%; border: none; background: var(--surface); font-size: 18px; cursor: pointer; color: var(--muted); line-height: 1; flex-shrink: 0; }

.modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 14px; }

.field { display: flex; flex-direction: column; gap: 5px; }
.label { font-size: 12px; font-weight: 700; color: var(--dark); display: flex; align-items: center; gap: 6px; }
.flag  { font-size: 14px; }
.input { height: 42px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--surface); padding: 0 14px; font-size: 14px; font-family: var(--font-body); color: var(--dark); outline: none; width: 100%; box-sizing: border-box; transition: border-color .15s; }
.input:focus { border-color: var(--gold); background: var(--white); }
.input.error { border-color: var(--error); }
.err { font-size: 11px; color: var(--error); }

.type-indicator {
  display: flex; align-items: flex-start; gap: 8px;
  padding: 10px 14px; border-radius: var(--radius-md);
  font-size: 12px; line-height: 1.5; font-family: var(--font-body);
}
.type-indicator.root { background: rgba(232,160,32,.07); color: #92400E; border: 1px solid rgba(232,160,32,.2); }
.type-indicator.sub  { background: rgba(59,130,246,.07); color: #1E40AF; border: 1px solid rgba(59,130,246,.2); }
.type-indicator svg  { flex-shrink: 0; margin-top: 1px; }

/* Delete warning */
.delete-warning { display: flex; gap: 14px; align-items: flex-start; padding: 14px; background: #FEF2F2; border-radius: var(--radius-md); border: 1.5px solid #FECACA; color: #991B1B; }
.delete-name { font-size: 15px; font-weight: 700; margin-bottom: 5px; }
.delete-desc { font-size: 13px; opacity: .8; line-height: 1.5; }

.modal-foot { display: flex; gap: 10px; justify-content: flex-end; padding: 16px 24px; border-top: 1px solid var(--border-light); }
.cancel-btn { height: 38px; padding: 0 16px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--surface); font-size: 13px; font-weight: 600; color: var(--muted); cursor: pointer; font-family: var(--font-body); }
.save-btn { height: 38px; padding: 0 20px; border-radius: var(--radius-md); border: none; background: linear-gradient(135deg, var(--gold), var(--gold-dark)); font-size: 13px; font-weight: 700; color: white; cursor: pointer; font-family: var(--font-body); display: flex; align-items: center; gap: 7px; }
.save-btn:disabled { opacity: .7; cursor: not-allowed; }
.del-btn { height: 38px; padding: 0 20px; border-radius: var(--radius-md); border: none; background: var(--error); font-size: 13px; font-weight: 700; color: white; cursor: pointer; font-family: var(--font-body); }
.spin { animation: spin .8s linear infinite; width: 14px; height: 14px; }

/* Toast */
.toast { position: fixed; bottom: 24px; right: 24px; padding: 12px 20px; border-radius: var(--radius-md); font-size: 14px; font-weight: 700; z-index: 9999; box-shadow: 0 8px 24px rgba(0,0,0,.15); }
.toast.success { background: #22C55E; color: white; }
.toast.error   { background: var(--error); color: white; }
.toast-enter-active, .toast-leave-active { transition: all .25s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(12px); }
.modal-enter-active, .modal-leave-active { transition: opacity .2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>