<script setup lang="ts">
import { ref } from 'vue'
import type { ProductOption, OptionType } from '@/api/products'

const props = defineProps<{
  modelValue: ProductOption[]
  lang: 'tk' | 'ru'
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: ProductOption[]): void
}>()

// ── i18n ──────────────────────────────────────────────────────────────────────
const L = {
  tk: {
    title:       'Önüm opsiýalary',
    subtitle:    'Müşderi sargyt edende saýlap biljek opsiýalary goş',
    addOption:   '+ Opsiýa goş',
    nameTk:      'Opsiýa ady (TK)',
    nameRu:      'Opsiýa ady (RU)',
    type:        'Görnüşi',
    unit:        'Birlik',
    required:    'Hökman',
    values:      'Bahalar',
    addValue:    'Baha goş',
    remove:      'Poz',
    types:       { select: 'Saýlaw (S/M/L…)', number: 'San (ölçeg)', text: 'Erkin tekst' },
    unitHint:    'Mysal: cm, mm, kg',
    valPlaceholder: 'Mysal: S',
    nameTkPh:    'Mysal: Ölçeg',
    nameRuPh:    'Mysal: Размер',
    noOptions:   'Opsiýa goşulmady',
    presets:     'Çalt goş:',
  },
  ru: {
    title:       'Параметры товара',
    subtitle:    'Добавьте опции, которые покупатель выбирает при заказе',
    addOption:   '+ Добавить параметр',
    nameTk:      'Название параметра (TK)',
    nameRu:      'Название параметра (RU)',
    type:        'Тип',
    unit:        'Единица',
    required:    'Обязательно',
    values:      'Значения',
    addValue:    'Добавить',
    remove:      'Удалить',
    types:       { select: 'Выбор (S/M/L…)', number: 'Число (размер)', text: 'Свободный текст' },
    unitHint:    'Пример: см, мм, кг',
    valPlaceholder: 'Пример: S',
    nameTkPh:    'Пример: Ölçeg',
    nameRuPh:    'Пример: Размер',
    noOptions:   'Параметры не добавлены',
    presets:     'Быстрые шаблоны:',
  },
}

// ── Presets ───────────────────────────────────────────────────────────────────
const PRESETS = [
  {
    label:  { tk: '👕 Egin-eşik ölçegi', ru: '👕 Размер одежды' },
    option: (): ProductOption => ({
      id: crypto.randomUUID(), nameTk: 'Ölçeg', nameRu: 'Размер',
      type: 'select', values: ['XS','S','M','L','XL','XXL'], required: true,
    }),
  },
  {
    label:  { tk: '👟 Aýakgap ölçegi (saýlaw)', ru: '👟 Размер обуви (выбор)' },
    option: (): ProductOption => ({
      id: crypto.randomUUID(), nameTk: 'Ölçeg', nameRu: 'Размер',
      type: 'select', values: ['S','M','L','XL','XXL'], required: true,
    }),
  },
  {
    label:  { tk: '👟 Aýakgap ölçegi (san)', ru: '👟 Размер обуви (число)' },
    option: (): ProductOption => ({
      id: crypto.randomUUID(), nameTk: 'Ölçeg', nameRu: 'Размер',
      type: 'number', unit: 'EU', values: [], required: true,
    }),
  },
  {
    label:  { tk: '📏 Ini (cm)', ru: '📏 Ширина (см)' },
    option: (): ProductOption => ({
      id: crypto.randomUUID(), nameTk: 'Ini', nameRu: 'Ширина',
      type: 'number', unit: 'cm', values: [], required: true,
    }),
  },
  {
    label:  { tk: '📐 Uzynlygy (cm)', ru: '📐 Высота (см)' },
    option: (): ProductOption => ({
      id: crypto.randomUUID(), nameTk: 'Uzynlygy', nameRu: 'Высота',
      type: 'number', unit: 'cm', values: [], required: true,
    }),
  },
  {
    label:  { tk: '🎨 Reňk', ru: '🎨 Цвет' },
    option: (): ProductOption => ({
      id: crypto.randomUUID(), nameTk: 'Reňk', nameRu: 'Цвет',
      type: 'select', values: [], required: false,
    }),
  },
]

// ── State for new-value inputs ────────────────────────────────────────────────
const newValueInputs = ref<Record<string, string>>({})

// ── Helpers ───────────────────────────────────────────────────────────────────
function update(options: ProductOption[]) {
  emit('update:modelValue', options)
}

function addBlank() {
  update([
    ...props.modelValue,
    {
      id: crypto.randomUUID(),
      nameTk: '', nameRu: '',
      type: 'select',
      values: [],
      required: false,
    },
  ])
}

function addPreset(option: ProductOption) {
  update([...props.modelValue, option])
}

function addSimpleOption(type: 'size-number' | 'size-text' | 'color') {
  let option: ProductOption
  if (type === 'size-number') {
    option = {
      id: crypto.randomUUID(),
      nameTk: 'Ölçeg', nameRu: 'Размер',
      type: 'number', unit: 'EU', values: [], required: true,
    }
  } else if (type === 'size-text') {
    option = {
      id: crypto.randomUUID(),
      nameTk: 'Ölçeg', nameRu: 'Размер',
      type: 'select', values: ['XS','S','M','L','XL','XXL'], required: true,
    }
  } else if (type === 'color') {
    option = {
      id: crypto.randomUUID(),
      nameTk: 'Reňk', nameRu: 'Цвет',
      type: 'select',
      values: ['Akat', 'Ak', 'Gyzyl', 'Gök', 'Ýaşil', 'Sary', 'Gülgün', 'Çal'],
      required: false,
    }
  } else {
    return
  }
  update([...props.modelValue, option])
}

function removeOption(id: string) {
  update(props.modelValue.filter(o => o.id !== id))
}

function patchOption(id: string, patch: Partial<ProductOption>) {
  update(props.modelValue.map(o => o.id === id ? { ...o, ...patch } : o))
}

function addValue(optionId: string) {
  const val = (newValueInputs.value[optionId] ?? '').trim()
  if (!val) return
  const opt = props.modelValue.find(o => o.id === optionId)
  if (!opt) return
  patchOption(optionId, { values: [...opt.values, val] })
  newValueInputs.value[optionId] = ''
}

function removeValue(optionId: string, valueIndex: number) {
  const opt = props.modelValue.find(o => o.id === optionId)
  if (!opt) return
  patchOption(optionId, { values: opt.values.filter((_, i) => i !== valueIndex) })
}

function onValueKeydown(e: KeyboardEvent, optionId: string) {
  if (e.key === 'Enter') {
    e.preventDefault()
    addValue(optionId)
  }
}

const t = L  // alias

const typeOptions: OptionType[] = ['select', 'number', 'text']
</script>

<template>
  <div class="options-editor">

    <!-- Header -->
    <div class="oe-header">
      <div class="oe-header-left">
        <div class="oe-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        <div>
          <div class="oe-title">{{ t[lang].title }}</div>
          <div class="oe-subtitle">{{ t[lang].subtitle }}</div>
        </div>
      </div>
      <button class="add-btn" @click="addBlank">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:14px;height:14px;margin-right:4px">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        {{ t[lang].addOption }}
      </button>
    </div>

    <!-- Simple 3-buttons interface -->
    <div class="simple-options-row">
      <div class="so-label">{{ lang === 'tk' ? 'Ýerine goşmak' : 'Добавить опцию' }}</div>
      <div class="so-buttons">
        <button class="so-btn" @click="addSimpleOption('size-number')">
          <span class="so-icon">🔢</span>
          <span class="so-text">
            <strong>{{ lang === 'tk' ? 'Ölçeg (san)' : 'Размер (число)' }}</strong>
            <small>{{ lang === 'tk' ? '35, 36, 37...' : '35, 36, 37...' }}</small>
          </span>
        </button>
        <button class="so-btn" @click="addSimpleOption('size-text')">
          <span class="so-icon">📏</span>
          <span class="so-text">
            <strong>{{ lang === 'tk' ? 'Ölçeg (text)' : 'Размер (текст)' }}</strong>
            <small>{{ lang === 'tk' ? 'S, M, L, XL...' : 'S, M, L, XL...' }}</small>
          </span>
        </button>
        <button class="so-btn" @click="addSimpleOption('color')">
          <span class="so-icon">🎨</span>
          <span class="so-text">
            <strong>{{ lang === 'tk' ? 'Reňk' : 'Цвет' }}</strong>
            <small>{{ lang === 'tk' ? 'Akat, ak, gyzyl...' : 'Черный, белый, красный...' }}</small>
          </span>
        </button>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="modelValue.length === 0" class="oe-empty">
      <div class="oe-empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 9c0 1.5-1.5 3-3 3H8a4 4 0 0 1-.5-7.94"/>
          <path d="M3 16c0 1.5 1.5 3 3 3h7a4 4 0 0 0 4-4"/>
          <path d="M9 12l2 2 4-4"/>
        </svg>
      </div>
      <div class="oe-empty-text">
        <strong>{{ lang === 'tk' ? 'Opsiyalar goşulmady' : 'Опции не добавлены' }}</strong>
        <span>{{ lang === 'tk' ? 'Müşderiler sargyt edende saýlap biljek özüniň opsiýalaryňyzy goşuň' : 'Добавьте параметры, которые покупатель будет выбирать при заказе' }}</span>
      </div>
    </div>

    <!-- Option cards -->
    <TransitionGroup name="opt" tag="div" class="options-list">
      <div v-for="opt in modelValue" :key="opt.id" class="option-card">

        <!-- Card header -->
        <div class="card-head">
          <div class="card-head-left">
            <span class="opt-type-badge" :class="opt.type">
              {{ t[lang].types[opt.type] }}
            </span>
          </div>
          <div class="card-head-right">
            <!-- Required toggle -->
            <label class="required-toggle">
              <input
                type="checkbox"
                :checked="opt.required"
                @change="patchOption(opt.id, { required: ($event.target as HTMLInputElement).checked })"
              />
              <span class="toggle-track">
                <span class="toggle-thumb"></span>
              </span>
              <span class="toggle-label">{{ t[lang].required }}</span>
            </label>
            <!-- Remove -->
            <button class="remove-btn" @click="removeOption(opt.id)" :title="t[lang].remove">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Name row -->
        <div class="card-row">
          <div class="mini-field">
            <label class="mini-label">{{ t[lang].nameTk }}</label>
            <input
              class="mini-input"
              :value="opt.nameTk"
              :placeholder="t[lang].nameTkPh"
              @input="patchOption(opt.id, { nameTk: ($event.target as HTMLInputElement).value })"
            />
          </div>
          <div class="mini-field">
            <label class="mini-label">{{ t[lang].nameRu }}</label>
            <input
              class="mini-input"
              :value="opt.nameRu"
              :placeholder="t[lang].nameRuPh"
              @input="patchOption(opt.id, { nameRu: ($event.target as HTMLInputElement).value })"
            />
          </div>
        </div>

        <!-- Type + Unit row -->
        <div class="card-row">
          <div class="mini-field">
            <label class="mini-label">{{ t[lang].type }}</label>
            <select
              class="mini-input"
              :value="opt.type"
              @change="patchOption(opt.id, { type: ($event.target as HTMLSelectElement).value as OptionType, values: [] })"
            >
              <option v-for="tp in typeOptions" :key="tp" :value="tp">
                {{ t[lang].types[tp] }}
              </option>
            </select>
          </div>
          <div v-if="opt.type === 'number'" class="mini-field">
            <label class="mini-label">{{ t[lang].unit }}</label>
            <input
              class="mini-input"
              :value="opt.unit ?? ''"
              :placeholder="t[lang].unitHint"
              @input="patchOption(opt.id, { unit: ($event.target as HTMLInputElement).value })"
            />
          </div>
        </div>

        <!-- Values (for 'select' type) -->
        <div v-if="opt.type === 'select'" class="values-section">
          <label class="mini-label">{{ t[lang].values }}</label>
          <div class="values-list">
            <span v-for="(val, idx) in opt.values" :key="idx" class="value-chip">
              {{ val }}
              <button class="chip-remove" @click="removeValue(opt.id, idx)">×</button>
            </span>
            <div class="add-value-wrap">
              <input
                class="mini-input add-value-input"
                v-model="newValueInputs[opt.id]"
                :placeholder="t[lang].valPlaceholder"
                @keydown="onValueKeydown($event, opt.id)"
              />
              <button class="add-value-btn" @click="addValue(opt.id)">
                {{ t[lang].addValue }}
              </button>
            </div>
          </div>
        </div>

        <!-- Customer preview -->
        <div class="customer-preview">
          <div class="cp-label">{{ lang === 'tk' ? 'Müşderi görünüşi' : 'Как увидит покупатель' }}</div>
          <div class="cp-mock">
            <span class="cp-name">{{ opt.nameRu || opt.nameTk }}</span>
            <span v-if="opt.required" class="cp-required">*</span>
            <span class="cp-colon">:</span>
            <span v-if="opt.type === 'select'" class="cp-value-preview">
              {{ opt.values.length > 0 ? opt.values.slice(0, 3).join(', ') + (opt.values.length > 3 ? '...' : '') : (lang === 'tk' ? '[saýlawlar goşulyňyz]' : '[добавьте варианты]') }}
            </span>
            <span v-else-if="opt.type === 'number'" class="cp-value-preview">
              {{ opt.unit ? `[san] ${opt.unit}` : '[san]' }}
            </span>
            <span v-else class="cp-value-preview">
              {{ lang === 'tk' ? '[tekst giriziň]' : '[введите текст]' }}
            </span>
          </div>
        </div>

      </div>
    </TransitionGroup>

  </div>
</template>

<style scoped>
.options-editor {
  border: 1.5px solid var(--border-light);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--surface);
}

/* Header */
.oe-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px;
  background: var(--white);
  border-bottom: 1px solid var(--border-light);
}
.oe-header-left { display: flex; align-items: center; gap: 10px; }
.oe-icon {
  width: 34px; height: 34px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--gold), var(--gold-dark));
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.oe-icon svg { width: 16px; height: 16px; color: white; }
.oe-title { font-size: 13px; font-weight: 700; color: var(--dark); }
.oe-subtitle { font-size: 11px; color: var(--subtle); margin-top: 1px; }

.add-btn {
  height: 32px; padding: 0 14px;
  border-radius: var(--radius-md);
  border: none;
  background: linear-gradient(135deg, var(--gold), var(--gold-dark));
  color: white; font-size: 12px; font-weight: 700;
  cursor: pointer; font-family: var(--font-body);
  white-space: nowrap;
  transition: all .15s;
}
.add-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 10px var(--gold-shadow); }

/* Presets */
.presets-row {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  padding: 10px 16px;
  border-bottom: 1px solid var(--border-light);
  background: var(--surface);
}
.presets-label { font-size: 11px; font-weight: 700; color: var(--subtle); white-space: nowrap; }
.presets { display: flex; gap: 6px; flex-wrap: wrap; }
.preset-chip {
  height: 28px; padding: 0 10px;
  border-radius: var(--radius-pill);
  border: 1.5px solid var(--border);
  background: var(--white);
  font-size: 11px; font-weight: 600; color: var(--muted);
  cursor: pointer; font-family: var(--font-body);
  transition: all .15s; white-space: nowrap;
}
.preset-chip:hover { border-color: var(--gold); color: var(--gold); background: var(--gold-glow); }

/* Empty */
.oe-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 8px; padding: 32px 16px;
  color: var(--subtle);
}
.oe-empty svg { width: 28px; height: 28px; opacity: .4; }
.oe-empty span { font-size: 13px; font-weight: 600; }

/* Options list */
.options-list { display: flex; flex-direction: column; gap: 0; }

/* Option card */
.option-card {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-light);
  background: var(--white);
  display: flex; flex-direction: column; gap: 10px;
}
.option-card:last-child { border-bottom: none; }

/* Card header */
.card-head { display: flex; align-items: center; justify-content: space-between; }
.card-head-left { display: flex; align-items: center; gap: 8px; }
.card-head-right { display: flex; align-items: center; gap: 10px; }

/* Type badge */
.opt-type-badge {
  font-size: 10px; font-weight: 700;
  padding: 2px 8px; border-radius: var(--radius-pill);
  letter-spacing: .03em;
}
.opt-type-badge.select { background: rgba(99,102,241,.12); color: #4F46E5; }
.opt-type-badge.number { background: rgba(245,158,11,.12); color: #D97706; }
.opt-type-badge.text   { background: rgba(34,197,94,.12);  color: #15803D; }

/* Required toggle */
.required-toggle { display: flex; align-items: center; gap: 6px; cursor: pointer; }
.required-toggle input { display: none; }
.toggle-track {
  width: 32px; height: 18px; border-radius: 9px;
  background: var(--border);
  position: relative; transition: background .2s;
  flex-shrink: 0;
}
.required-toggle input:checked + .toggle-track { background: var(--gold); }
.toggle-thumb {
  position: absolute; top: 2px; left: 2px;
  width: 14px; height: 14px; border-radius: 50%;
  background: white; transition: transform .2s;
  box-shadow: 0 1px 3px rgba(0,0,0,.2);
}
.required-toggle input:checked + .toggle-track .toggle-thumb { transform: translateX(14px); }
.toggle-label { font-size: 11px; font-weight: 600; color: var(--muted); }

/* Remove button */
.remove-btn {
  width: 28px; height: 28px; border-radius: var(--radius-md);
  border: 1.5px solid var(--border); background: var(--surface);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--muted); transition: all .15s;
}
.remove-btn svg { width: 13px; height: 13px; }
.remove-btn:hover { border-color: var(--error); color: var(--error); background: var(--error-bg); }

/* Form rows */
.card-row { display: flex; gap: 10px; }
.mini-field { display: flex; flex-direction: column; gap: 4px; flex: 1; }
.mini-label { font-size: 11px; font-weight: 700; color: var(--dark); }
.mini-input {
  height: 34px; border-radius: var(--radius-md);
  border: 1.5px solid var(--border); background: var(--surface);
  padding: 0 10px; font-size: 12px; font-family: var(--font-body); color: var(--dark);
  outline: none; transition: border-color .15s; width: 100%;
}
.mini-input:focus { border-color: var(--gold); background: var(--white); }

/* Values section */
.values-section { display: flex; flex-direction: column; gap: 6px; }
.values-list { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }

.value-chip {
  display: inline-flex; align-items: center; gap: 4px;
  height: 28px; padding: 0 10px;
  border-radius: var(--radius-pill);
  background: var(--surface); border: 1.5px solid var(--border);
  font-size: 12px; font-weight: 600; color: var(--dark);
}
.chip-remove {
  background: none; border: none; cursor: pointer;
  color: var(--subtle); font-size: 15px; line-height: 1;
  padding: 0; margin: 0 -4px 0 0;
  transition: color .12s;
}
.chip-remove:hover { color: var(--error); }

.add-value-wrap { display: flex; gap: 6px; align-items: center; }
.add-value-input { width: 100px !important; }
.add-value-btn {
  height: 34px; padding: 0 12px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--gold); background: var(--gold-glow);
  font-size: 12px; font-weight: 700; color: var(--gold);
  cursor: pointer; font-family: var(--font-body); white-space: nowrap;
  transition: all .15s;
}
.add-value-btn:hover { background: var(--gold); color: white; }

/* Simple 3-buttons interface */
.simple-options-row {
  padding: 14px 16px;
  background: var(--white);
  border-bottom: 1px solid var(--border-light);
}
.so-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--subtle);
  margin-bottom: 8px;
}
.so-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.so-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 48px;
  padding: 0 12px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border);
  background: var(--surface);
  cursor: pointer;
  font-family: var(--font-body);
  transition: all .15s;
  text-align: left;
}
.so-btn:hover {
  border-color: var(--gold);
  background: var(--gold-glow);
}
.so-icon {
  font-size: 20px;
  flex-shrink: 0;
}
.so-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.so-text strong {
  font-size: 12px;
  font-weight: 700;
  color: var(--dark);
  line-height: 1.2;
}
.so-text small {
  font-size: 10px;
  color: var(--subtle);
  line-height: 1.2;
}

/* Customer Preview */
.customer-preview {
  padding: 10px 12px;
  background: var(--surface);
  border-top: 1px solid var(--border-light);
  border-radius: 0 0 var(--radius-md) var(--radius-md);
  margin-top: -6px;
}
.cp-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--subtle);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: .03em;
}
.cp-mock {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: var(--white);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  font-size: 12px;
}
.cp-name {
  font-weight: 700;
  color: var(--dark);
}
.cp-required {
  color: var(--error);
  font-weight: 800;
}
.cp-colon {
  color: var(--muted);
  margin-right: 4px;
}
.cp-value-preview {
  color: var(--gold);
  font-weight: 600;
  background: rgba(251,191,36,.1);
  padding: 2px 8px;
  border-radius: var(--radius-pill);
}

/* Empty state */
.oe-empty {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 16px;
  background: var(--surface);
  border: 2px dashed var(--border);
  border-radius: var(--radius-lg);
  margin: 0 -16px;
}
.oe-empty-icon svg {
  width: 36px;
  height: 36px;
  color: var(--subtle);
  opacity: .6;
}
.oe-empty-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.oe-empty-text strong {
  font-size: 13px;
  font-weight: 700;
  color: var(--dark);
}
.oe-empty-text span {
  font-size: 11px;
  color: var(--subtle);
}

/* Modified transitions */
.opt-enter-active, .opt-leave-active { transition: opacity .25s, transform .25s; }
.opt-enter-from, .opt-leave-to { opacity: 0; transform: translateY(-8px); }

.opt-enter-active, .opt-leave-active { transition: opacity .2s, transform .2s; }
.opt-enter-from, .opt-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
