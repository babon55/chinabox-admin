<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { ProductItem, ProductForm, ProductStatus, Lang } from '@/types'

const props = defineProps<{
  lang:     Lang
  open:     boolean
  editing:  ProductItem | null   // null = add mode
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', form: ProductForm): void
}>()

// ── Translations ─────────────────────────────────────────────────────────────
const L = {
  tk: {
    addTitle:  'Täze önüm goş',
    editTitle: 'Önümi üýtget',
    nameTk:    'Ady (Türkmençe)',
    nameRu:    'Ady (Rusça)',
    category:  'Kategoriýa',
    catTk:     'Kategoriýa (TK)',
    catRu:     'Kategoriýa (RU)',
    image:     'Emoji / Surat',
    price:     'Baha ($)',
    stock:     'Stok mukdary',
    status:    'Ýagdaý',
    cancel:    'Ýatyr',
    save:      'Ýatda sakla',
    statuses:  { active: 'Işjeň', draft: 'Taslama', archived: 'Arhiwlenen' },
    required:  'Bu meýdan hökman!',
    priceErr:  'Dogry baha giriziň',
    stockErr:  'Dogry sany giriziň',
  },
  ru: {
    addTitle:  'Добавить товар',
    editTitle: 'Редактировать товар',
    nameTk:    'Название (Туркменский)',
    nameRu:    'Название (Русский)',
    category:  'Категория',
    catTk:     'Категория (TK)',
    catRu:     'Категория (RU)',
    image:     'Emoji / Изображение',
    price:     'Цена ($)',
    stock:     'Количество',
    status:    'Статус',
    cancel:    'Отмена',
    save:      'Сохранить',
    statuses:  { active: 'Активен', draft: 'Черновик', archived: 'Архивирован' },
    required:  'Это поле обязательно!',
    priceErr:  'Введите корректную цену',
    stockErr:  'Введите корректное количество',
  },
}

// ── Form state ────────────────────────────────────────────────────────────────
const blank = (): ProductForm => ({
  name:     { tk: '', ru: '' },
  category: { tk: '', ru: '' },
  image:    '📦',
  price:    0,
  stock:    0,
  status:   'active',
})

const form   = ref<ProductForm>(blank())
const errors = ref<Partial<Record<keyof ProductForm | 'name_tk' | 'name_ru' | 'cat_tk' | 'cat_ru', string>>>({})

// Populate form when editing
watch(() => props.editing, (val) => {
  if (val) {
    form.value = {
      name:     { tk: val.name.tk,     ru: val.name.ru     },
      category: { tk: val.category.tk, ru: val.category.ru },
      image:    val.image,
      price:    val.price,
      stock:    val.stock,
      status:   val.status,
    }
  } else {
    form.value = blank()
  }
  errors.value = {}
})

const t = computed(() => L[props.lang])

// ── Validation ────────────────────────────────────────────────────────────────
function validate(): boolean {
  const e: typeof errors.value = {}
  if (!form.value.name.tk.trim())     e.name_tk = t.value.required
  if (!form.value.name.ru.trim())     e.name_ru = t.value.required
  if (!form.value.category.tk.trim()) e.cat_tk  = t.value.required
  if (!form.value.category.ru.trim()) e.cat_ru  = t.value.required
  if (!form.value.image.trim())       e.image   = t.value.required
  if (form.value.price <= 0)          e.price   = t.value.priceErr
  if (form.value.stock < 0)           e.stock   = t.value.stockErr
  errors.value = e
  return Object.keys(e).length === 0
}

function submit() {
  if (validate()) emit('save', { ...form.value })
}

// Quick emoji picks
const emojiPicks = ['📦', '👟', '👕', '👗', '📱', '💻', '⌚', '🎧', '🔋', '🔊', '🎒', '💄', '🧴', '🏠', '🍎']

const statusOptions: ProductStatus[] = ['active', 'draft', 'archived']
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="overlay" @click.self="emit('close')">
        <div class="modal">

          <!-- Header -->
          <div class="modal-head">
            <h2>{{ editing ? t.editTitle : t.addTitle }}</h2>
            <button class="close-btn" @click="emit('close')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="modal-body">

            <!-- Image / Emoji -->
            <div class="field">
              <label class="field-label">{{ t.image }}</label>
              <div class="emoji-row">
                <div class="emoji-preview">{{ form.image }}</div>
                <input v-model="form.image" class="field-input emoji-input" maxlength="4" />
              </div>
              <div class="emoji-picks">
                <button v-for="e in emojiPicks" :key="e" :class="['emoji-pick', { active: form.image === e }]" @click="form.image = e">
                  {{ e }}
                </button>
              </div>
            </div>

            <!-- Names -->
            <div class="field-row">
              <div class="field">
                <label class="field-label">{{ t.nameTk }}</label>
                <input v-model="form.name.tk" class="field-input" :class="{ error: errors.name_tk }" placeholder="Mysal: Simsiz Gulaklyk" />
                <span v-if="errors.name_tk" class="field-error">{{ errors.name_tk }}</span>
              </div>
              <div class="field">
                <label class="field-label">{{ t.nameRu }}</label>
                <input v-model="form.name.ru" class="field-input" :class="{ error: errors.name_ru }" placeholder="Пример: Беспроводные наушники" />
                <span v-if="errors.name_ru" class="field-error">{{ errors.name_ru }}</span>
              </div>
            </div>

            <!-- Categories -->
            <div class="field-row">
              <div class="field">
                <label class="field-label">{{ t.catTk }}</label>
                <input v-model="form.category.tk" class="field-input" :class="{ error: errors.cat_tk }" placeholder="Mysal: Elektronika" />
                <span v-if="errors.cat_tk" class="field-error">{{ errors.cat_tk }}</span>
              </div>
              <div class="field">
                <label class="field-label">{{ t.catRu }}</label>
                <input v-model="form.category.ru" class="field-input" :class="{ error: errors.cat_ru }" placeholder="Пример: Электроника" />
                <span v-if="errors.cat_ru" class="field-error">{{ errors.cat_ru }}</span>
              </div>
            </div>

            <!-- Price + Stock -->
            <div class="field-row">
              <div class="field">
                <label class="field-label">{{ t.price }}</label>
                <div class="input-prefix-wrap">
                  <span class="prefix">$</span>
                  <input v-model.number="form.price" type="number" min="0" step="0.01" class="field-input prefix-input" :class="{ error: errors.price }" />
                </div>
                <span v-if="errors.price" class="field-error">{{ errors.price }}</span>
              </div>
              <div class="field">
                <label class="field-label">{{ t.stock }}</label>
                <input v-model.number="form.stock" type="number" min="0" class="field-input" :class="{ error: errors.stock }" />
                <span v-if="errors.stock" class="field-error">{{ errors.stock }}</span>
              </div>
            </div>

            <!-- Status -->
            <div class="field">
              <label class="field-label">{{ t.status }}</label>
              <div class="status-options">
                <button
                  v-for="s in statusOptions" :key="s"
                  :class="['status-opt', s, { active: form.status === s }]"
                  @click="form.status = s"
                >
                  {{ t.statuses[s] }}
                </button>
              </div>
            </div>

          </div>

          <!-- Footer -->
          <div class="modal-foot">
            <button class="btn-cancel" @click="emit('close')">{{ t.cancel }}</button>
            <button class="btn-save" @click="submit">{{ t.save }}</button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Overlay */
.overlay {
  position: fixed; inset: 0; z-index: 500;
  background: rgba(15, 17, 23, 0.55);
  backdrop-filter: blur(3px);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}

/* Modal */
.modal {
  background: var(--white); border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  width: 100%; max-width: 580px;
  display: flex; flex-direction: column;
  max-height: 90vh; overflow: hidden;
}

/* Head */
.modal-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px; border-bottom: 1px solid var(--border-light);
  flex-shrink: 0;
}
.modal-head h2 { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--dark); }
.close-btn { width: 30px; height: 30px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--surface); display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--muted); transition: all .15s; }
.close-btn svg { width: 14px; height: 14px; }
.close-btn:hover { border-color: var(--error); color: var(--error); background: var(--error-bg); }

/* Body */
.modal-body { padding: 22px 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 18px; }

/* Fields */
.field { display: flex; flex-direction: column; gap: 6px; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.field-label { font-size: 12px; font-weight: 700; color: var(--dark); }
.field-input {
  height: 38px; border-radius: var(--radius-md);
  border: 1.5px solid var(--border); background: var(--surface);
  padding: 0 12px; font-size: 13px; font-family: var(--font-body); color: var(--dark);
  outline: none; transition: border-color .15s, box-shadow .15s; width: 100%;
}
.field-input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px var(--gold-glow); background: var(--white); }
.field-input.error { border-color: var(--error); }
.field-input.error:focus { box-shadow: 0 0 0 3px var(--error-bg); }
.field-error { font-size: 11px; color: var(--error); font-weight: 600; }

/* Prefix input ($) */
.input-prefix-wrap { position: relative; }
.prefix { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); font-size: 13px; font-weight: 700; color: var(--muted); pointer-events: none; }
.prefix-input { padding-left: 24px; }

/* Emoji */
.emoji-row { display: flex; align-items: center; gap: 10px; }
.emoji-preview { width: 48px; height: 48px; border-radius: var(--radius-md); background: var(--surface); border: 1.5px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 26px; flex-shrink: 0; }
.emoji-input { width: 80px; text-align: center; font-size: 20px; }
.emoji-picks { display: flex; flex-wrap: wrap; gap: 6px; }
.emoji-pick { width: 34px; height: 34px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--surface); font-size: 17px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .15s; }
.emoji-pick:hover  { border-color: var(--gold); background: var(--gold-glow); }
.emoji-pick.active { border-color: var(--gold); background: var(--gold-glow); box-shadow: 0 0 0 2px var(--gold-glow); }

/* Status options */
.status-options { display: flex; gap: 8px; }
.status-opt {
  padding: 6px 14px; border-radius: var(--radius-pill);
  border: 1.5px solid var(--border); background: var(--surface);
  font-size: 12px; font-weight: 700; cursor: pointer; transition: all .15s;
  font-family: var(--font-body); color: var(--muted);
}
.status-opt.active.active   { border-color: #22C55E; color: #22C55E; background: rgba(34,197,94,.1); }
.status-opt.draft.active    { border-color: #F59E0B; color: #F59E0B; background: rgba(245,158,11,.1); }
.status-opt.archived.active { border-color: #9CA3AF; color: #6B7280; background: rgba(156,163,175,.1); }
.status-opt:not(.active):hover { border-color: var(--gold); color: var(--gold); }

/* Footer */
.modal-foot {
  display: flex; align-items: center; justify-content: flex-end; gap: 10px;
  padding: 16px 24px; border-top: 1px solid var(--border-light); flex-shrink: 0;
}
.btn-cancel {
  height: 38px; padding: 0 18px; border-radius: var(--radius-md);
  border: 1.5px solid var(--border); background: var(--surface);
  font-size: 13px; font-weight: 700; color: var(--muted);
  cursor: pointer; transition: all .15s; font-family: var(--font-body);
}
.btn-cancel:hover { border-color: var(--dark); color: var(--dark); }
.btn-save {
  height: 38px; padding: 0 22px; border-radius: var(--radius-md);
  border: none; background: linear-gradient(135deg, var(--gold), var(--gold-dark));
  font-size: 13px; font-weight: 800; color: white;
  cursor: pointer; transition: all .15s; font-family: var(--font-body);
  box-shadow: 0 4px 12px var(--gold-shadow);
}
.btn-save:hover { transform: translateY(-1px); box-shadow: 0 6px 16px var(--gold-shadow); }
.btn-save:active { transform: translateY(0); }

/* Modal animation */
.modal-enter-active, .modal-leave-active { transition: opacity .2s ease; }
.modal-enter-active .modal, .modal-leave-active .modal { transition: opacity .2s ease, transform .2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal, .modal-leave-to .modal { opacity: 0; transform: scale(.96) translateY(10px); }

@media (max-width: 560px) {
  .field-row { grid-template-columns: 1fr; }
}
</style>
