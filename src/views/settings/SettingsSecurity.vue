<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Lang } from '@/types'

const props = defineProps<{ lang: Lang }>()

const saved  = ref(false)
const saving = ref(false)
const show   = ref({ current: false, next: false, confirm: false })

const form   = ref({ current: '', next: '', confirm: '' })
const errors = ref<Partial<Record<keyof typeof form.value, string>>>({})

const L = computed(() => props.lang === 'tk' ? {
  title:      'Howpsuzlyk',
  sub:        'Giriş parolyňyzy üýtgediň',
  current:    'Häzirki parol',
  next:       'Täze parol',
  confirm:    'Täze paroly tassykla',
  save:       'Paroly üýtget',
  saved:      'Parol üýtgedildi!',
  strength:   'Paroluň güýji',
  levels:     ['Gaty gowşak', 'Gowşak', 'Orta', 'Güýçli', 'Gaty güýçli'],
  err: {
    reqCurrent: 'Häzirki paroly giriziň',
    reqNext:    'Täze paroly giriziň',
    minLen:     'Iň az 8 nyşan bolmaly',
    noMatch:    'Parollar gabat gelmeýär',
  },
  tips: ['Iň az 8 nyşan', 'Uly harp', 'San', 'Ýörite nyşan'],
} : {
  title:      'Безопасность',
  sub:        'Изменение пароля для входа',
  current:    'Текущий пароль',
  next:       'Новый пароль',
  confirm:    'Подтвердите новый пароль',
  save:       'Изменить пароль',
  saved:      'Пароль изменён!',
  strength:   'Надёжность пароля',
  levels:     ['Очень слабый', 'Слабый', 'Средний', 'Надёжный', 'Очень надёжный'],
  err: {
    reqCurrent: 'Введите текущий пароль',
    reqNext:    'Введите новый пароль',
    minLen:     'Минимум 8 символов',
    noMatch:    'Пароли не совпадают',
  },
  tips: ['Минимум 8 символов', 'Заглавная буква', 'Цифра', 'Спецсимвол'],
})

// Strength score 0–4
const strength = computed(() => {
  const p = form.value.next
  if (!p) return -1
  let s = 0
  if (p.length >= 8)          s++
  if (/[A-Z]/.test(p))        s++
  if (/[0-9]/.test(p))        s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  return s
})

const strengthColors = ['#EF4444', '#F59E0B', '#F59E0B', '#22C55E', '#22C55E']
const tipsMet = computed(() => {
  const p = form.value.next
  return [p.length >= 8, /[A-Z]/.test(p), /[0-9]/.test(p), /[^A-Za-z0-9]/.test(p)]
})

function validate(): boolean {
  const e: typeof errors.value = {}
  if (!form.value.current)           e.current = L.value.err.reqCurrent
  if (!form.value.next)              e.next    = L.value.err.reqNext
  else if (form.value.next.length < 8) e.next  = L.value.err.minLen
  if (form.value.next !== form.value.confirm) e.confirm = L.value.err.noMatch
  errors.value = e
  return Object.keys(e).length === 0
}

async function save() {
  if (!validate()) return
  saving.value = true
  await new Promise(r => setTimeout(r, 700))
  saving.value = false
  saved.value  = true
  form.value   = { current: '', next: '', confirm: '' }
  setTimeout(() => { saved.value = false }, 2800)
}
</script>

<template>
  <div class="section">
    <div class="section-head">
      <h3>{{ L.title }}</h3>
      <p class="section-sub">{{ L.sub }}</p>
    </div>

    <div class="form">

      <!-- Current password -->
      <div class="field">
        <label class="field-label">{{ L.current }}</label>
        <div class="pw-wrap">
          <input v-model="form.current" :type="show.current ? 'text' : 'password'"
            class="field-input" :class="{ error: errors.current }" autocomplete="current-password" />
          <button class="eye-btn" @click="show.current = !show.current">
            <svg v-if="!show.current" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          </button>
        </div>
        <span v-if="errors.current" class="field-error">{{ errors.current }}</span>
      </div>

      <div class="divider" />

      <!-- New password -->
      <div class="field">
        <label class="field-label">{{ L.next }}</label>
        <div class="pw-wrap">
          <input v-model="form.next" :type="show.next ? 'text' : 'password'"
            class="field-input" :class="{ error: errors.next }" autocomplete="new-password" />
          <button class="eye-btn" @click="show.next = !show.next">
            <svg v-if="!show.next" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          </button>
        </div>
        <span v-if="errors.next" class="field-error">{{ errors.next }}</span>

        <!-- Strength meter -->
        <div v-if="form.next" class="strength-wrap">
          <div class="strength-bars">
            <div v-for="i in 4" :key="i" class="strength-bar"
              :style="{ background: strength >= i ? strengthColors[strength] : 'var(--border)' }" />
          </div>
          <span class="strength-label" :style="{ color: strength >= 0 ? strengthColors[strength] : 'var(--subtle)' }">
            {{ L.levels[strength] }}
          </span>
        </div>

        <!-- Tips -->
        <div v-if="form.next" class="tips">
          <span v-for="(tip, i) in L.tips" :key="i" :class="['tip', { met: tipsMet[i] }]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline v-if="tipsMet[i]" points="20 6 9 17 4 12"/>
              <circle v-else cx="12" cy="12" r="1" fill="currentColor"/>
            </svg>
            {{ tip }}
          </span>
        </div>
      </div>

      <!-- Confirm -->
      <div class="field">
        <label class="field-label">{{ L.confirm }}</label>
        <div class="pw-wrap">
          <input v-model="form.confirm" :type="show.confirm ? 'text' : 'password'"
            class="field-input" :class="{ error: errors.confirm }" autocomplete="new-password" />
          <button class="eye-btn" @click="show.confirm = !show.confirm">
            <svg v-if="!show.confirm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          </button>
        </div>
        <span v-if="errors.confirm" class="field-error">{{ errors.confirm }}</span>
      </div>

    </div>

    <div class="form-footer">
      <Transition name="toast">
        <div v-if="saved" class="toast">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          {{ L.saved }}
        </div>
      </Transition>
      <button class="save-btn" :class="{ loading: saving }" @click="save">
        <svg v-if="!saving" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <svg v-else class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        {{ L.save }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.section { display: flex; flex-direction: column; gap: 0; max-width: 520px; }
.section-head { margin-bottom: 28px; }
.section-head h3 { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--dark); margin-bottom: 4px; }
.section-sub { font-size: 13px; color: var(--subtle); }

.form { display: flex; flex-direction: column; gap: 18px; }
.field { display: flex; flex-direction: column; gap: 7px; }
.field-label { font-size: 12px; font-weight: 700; color: var(--dark); }
.field-input { height: 40px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--surface); padding: 0 40px 0 12px; font-size: 13px; font-family: var(--font-body); color: var(--dark); outline: none; transition: border-color .15s, box-shadow .15s; width: 100%; }
.field-input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px var(--gold-glow); background: var(--white); }
.field-input.error { border-color: var(--error); }
.field-error { font-size: 11px; color: var(--error); font-weight: 600; }

.pw-wrap { position: relative; }
.eye-btn { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--subtle); display: flex; align-items: center; padding: 0; transition: color .15s; }
.eye-btn:hover { color: var(--dark); }
.eye-btn svg { width: 16px; height: 16px; }

.divider { height: 1px; background: var(--border-light); }

/* Strength meter */
.strength-wrap { display: flex; align-items: center; gap: 10px; margin-top: 2px; }
.strength-bars { display: flex; gap: 4px; flex: 1; }
.strength-bar  { flex: 1; height: 4px; border-radius: 2px; transition: background .3s; }
.strength-label { font-size: 11px; font-weight: 700; white-space: nowrap; }

/* Tips */
.tips { display: flex; flex-wrap: wrap; gap: 6px; }
.tip { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600; color: var(--subtle); padding: 3px 9px; border-radius: var(--radius-pill); background: var(--surface); border: 1.5px solid var(--border-light); transition: all .2s; }
.tip svg { width: 11px; height: 11px; }
.tip.met { color: var(--success); background: var(--success-bg); border-color: rgba(34,197,94,.3); }

.form-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 28px; padding-top: 22px; border-top: 1px solid var(--border-light); gap: 12px; }
.save-btn { display: flex; align-items: center; gap: 8px; height: 40px; padding: 0 22px; border-radius: var(--radius-md); border: none; background: linear-gradient(135deg, var(--gold), var(--gold-dark)); font-size: 13px; font-weight: 800; color: #fff; cursor: pointer; font-family: var(--font-body); transition: all .15s; box-shadow: 0 4px 12px var(--gold-shadow); }
.save-btn svg { width: 15px; height: 15px; }
.save-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 16px var(--gold-shadow); }
.save-btn.loading { opacity: .75; pointer-events: none; }

.toast { display: flex; align-items: center; gap: 8px; background: var(--success-bg); color: var(--success); border: 1.5px solid rgba(34,197,94,.3); border-radius: var(--radius-md); padding: 8px 14px; font-size: 13px; font-weight: 700; }
.toast svg { width: 15px; height: 15px; flex-shrink: 0; }
.toast-enter-active, .toast-leave-active { transition: opacity .2s, transform .2s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-8px); }

.spin { animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
