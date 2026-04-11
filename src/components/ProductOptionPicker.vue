<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Product, ProductOption } from '@/api/products'

const props = defineProps<{
  product: Product
  lang: 'tk' | 'ru'
  modelValue: Record<string, string>  // optionId → selected value
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: Record<string, string>): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const L = computed(() => props.lang === 'tk' ? {
  title:    'Opsiyalary saýla',
  choose:   'Saýlaň',
  required: '* Hökman',
  skip:     'Atlaýyň (ýok)',
} : {
  title:    'Выберите опции',
  choose:   'Выбрать',
  required: '* Обязательно',
  skip:     'Пропустить (нет)',
})

// Local state for selections
const selections = ref<{ [optionId: string]: string }>({})

function getSelection(opt: ProductOption): string {
  return selections.value[opt.id] ?? ''
}

function setSelection(optId: string, val: string) {
  selections.value[optId] = val
  emitUpdate()
}

function emitUpdate() {
  // Emit the raw selections object: { optionId: value }
  emit('update:modelValue', { ...selections.value })
}

function isRequired(opt: ProductOption): boolean {
  return opt.required === true
}

function hasOptions(): boolean {
  return (props.product.options?.length ?? 0) > 0
}

function getMissingRequired(): string[] {
  if (!props.product.options) return []
  return props.product.options
    .filter(opt => isRequired(opt) && !getSelection(opt)?.trim())
    .map(opt => opt.nameRu || opt.nameTk)
}

function confirm() {
  const missing = getMissingRequired()
  if (missing.length > 0) {
    alert(L.value.required + ': ' + missing.join(', '))
    return
  }
  emitUpdate()
  emit('confirm')
}

function cancel() {
  emit('cancel')
}
</script>

<template>
  <div class="option-picker-overlay" @click.self="cancel">
    <div class="option-picker">
      <div class="op-header">
        <h3>{{ L.title }}</h3>
        <p class="op-product">{{ lang === 'tk' ? product.nameTk : product.nameRu }}</p>
      </div>

      <div v-if="!hasOptions()" class="op-empty">
        {{ lang === 'tk' ? 'Bu önümiň opsiýasy ýok' : 'У этого товара нет опций' }}
      </div>

      <div v-else class="op-options">
        <div v-for="opt in product.options" :key="opt.id" class="op-option">
          <div class="op-option-label">
            <strong>{{ opt.nameRu || opt.nameTk }}</strong>
            <span v-if="isRequired(opt)" class="op-required">*</span>
          </div>

          <!-- Select type -->
          <div v-if="opt.type === 'select'" class="op-select">
            <button
              v-for="val in opt.values"
              :key="val"
              :class="['op-opt-btn', { active: getSelection(opt) === val }]"
              @click="setSelection(opt.id, val)"
            >
              {{ val }}
            </button>
            <button
              v-if="!isRequired(opt)"
              :class="['op-opt-btn', { active: !getSelection(opt) }]"
              @click="setSelection(opt.id, '')"
            >
              {{ L.skip }}
            </button>
          </div>

          <!-- Number type -->
          <div v-else-if="opt.type === 'number'" class="op-number">
            <input
              type="number"
              :value="getSelection(opt)"
              @input="setSelection(opt.id, ($event.target as HTMLInputElement).value)"
              :placeholder="opt.unit ? `0 ${opt.unit}` : '0'"
              class="op-num-input"
            />
            <span v-if="opt.unit" class="op-unit">{{ opt.unit }}</span>
          </div>

          <!-- Text type -->
          <div v-else-if="opt.type === 'text'" class="op-text">
            <input
              type="text"
              :value="getSelection(opt)"
              @input="setSelection(opt.id, ($event.target as HTMLInputElement).value)"
              :placeholder="lang === 'tk' ? 'Giriziň...' : 'Введите...'"
              class="op-text-input"
            />
          </div>
        </div>
      </div>

      <div class="op-footer">
        <button class="op-cancel-btn" @click="cancel">{{ lang === 'tk' ? 'Ýatyr' : 'Отмена' }}</button>
        <button class="op-confirm-btn" @click="confirm">
          {{ L.choose }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.option-picker-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}
.option-picker {
  background: var(--white);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 420px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 64px rgba(0,0,0,.25);
}

.op-header {
  padding: 22px 24px;
  border-bottom: 1px solid var(--border-light);
  flex-shrink: 0;
}
.op-header h3 {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--dark);
  margin: 0;
}
.op-product {
  font-size: 13px;
  color: var(--subtle);
  margin: 4px 0 0;
}

.op-empty {
  padding: 40px 24px;
  text-align: center;
  color: var(--subtle);
  font-size: 14px;
}

.op-options {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.op-option {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.op-option-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 700;
  color: var(--dark);
}
.op-required {
  color: var(--error);
}

.op-select {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.op-opt-btn {
  height: 34px;
  padding: 0 12px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border);
  background: var(--white);
  font-size: 12px;
  font-weight: 600;
  color: var(--dark);
  cursor: pointer;
  transition: all .12s;
}
.op-opt-btn:hover {
  border-color: var(--gold);
}
.op-opt-btn.active {
  background: var(--gold);
  border-color: var(--gold);
  color: white;
}

.op-number, .op-text {
  display: flex;
  align-items: center;
  gap: 8px;
}
.op-num-input, .op-text-input {
  flex: 1;
  height: 38px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border);
  background: var(--surface);
  padding: 0 12px;
  font-size: 13px;
  color: var(--dark);
  outline: none;
}
.op-num-input:focus, .op-text-input:focus {
  border-color: var(--gold);
  background: var(--white);
}
.op-unit {
  font-size: 12px;
  color: var(--subtle);
  font-weight: 600;
}

.op-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding: 16px 24px;
  border-top: 1px solid var(--border-light);
  flex-shrink: 0;
}
.op-cancel-btn {
  height: 38px;
  padding: 0 18px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border);
  background: var(--surface);
  font-size: 13px;
  font-weight: 600;
  color: var(--muted);
  cursor: pointer;
}
.op-confirm-btn {
  height: 38px;
  padding: 0 20px;
  border-radius: var(--radius-md);
  border: none;
  background: var(--gold);
  font-size: 13px;
  font-weight: 700;
  color: white;
  cursor: pointer;
}
.op-confirm-btn:hover {
  background: var(--gold-dark);
}
</style>
