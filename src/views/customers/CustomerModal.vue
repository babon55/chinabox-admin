<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { CustomerItem, CustomerForm, CustomerStatus, Lang } from '@/types'

const props = defineProps<{
  lang:    Lang
  open:    boolean
  editing: CustomerItem | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', form: CustomerForm): void
}>()

const L = computed(() => props.lang === 'tk' ? {
  title:    'Müşderi maglumatyny üýtget',
  name:     'Doly ady',
  email:    'E-poçta',
  phone:    'Telefon',
  address:  'Salgy',
  status:   'Ýagdaý',
  cancel:   'Ýatyr',
  save:     'Ýatda sakla',
  statuses: { active: 'Işjeň', blocked: 'Bloklanan' },
  errors:   { required: 'Bu meýdan hökman!', email: 'Dogry e-poçta giriziň' },
} : {
  title:    'Редактировать клиента',
  name:     'Полное имя',
  email:    'E-mail',
  phone:    'Телефон',
  address:  'Адрес',
  status:   'Статус',
  cancel:   'Отмена',
  save:     'Сохранить',
  statuses: { active: 'Активен', blocked: 'Заблокирован' },
  errors:   { required: 'Это поле обязательно!', email: 'Введите корректный email' },
})

const blank = (): CustomerForm => ({ name: '', email: '', phone: '', address: '', status: 'active' })
const form   = ref<CustomerForm>(blank())
const errors = ref<Partial<Record<keyof CustomerForm, string>>>({})

watch(() => props.editing, (val) => {
  form.value   = val ? { name: val.name, email: val.email, phone: val.phone, address: val.address, status: val.status } : blank()
  errors.value = {}
})

function validate(): boolean {
  const e: typeof errors.value = {}
  if (!form.value.name.trim())    e.name    = L.value.errors.required
  if (!form.value.email.trim())   e.email   = L.value.errors.required
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) e.email = L.value.errors.email
  if (!form.value.phone.trim())   e.phone   = L.value.errors.required
  if (!form.value.address.trim()) e.address = L.value.errors.required
  errors.value = e
  return Object.keys(e).length === 0
}

function submit() { if (validate()) emit('save', { ...form.value }) }

const statusOptions: CustomerStatus[] = ['active', 'blocked']
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="overlay" @click.self="emit('close')">
        <div class="modal">

          <div class="modal-head">
            <h2>{{ L.title }}</h2>
            <button class="close-btn" @click="emit('close')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div class="modal-body">

            <!-- Name -->
            <div class="field">
              <label class="field-label">{{ L.name }}</label>
              <input v-model="form.name" class="field-input" :class="{ error: errors.name }"
                :placeholder="lang === 'tk' ? 'Merdan Ataýew' : 'Иван Иванов'" />
              <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
            </div>

            <!-- Email + Phone -->
            <div class="field-row">
              <div class="field">
                <label class="field-label">{{ L.email }}</label>
                <input v-model="form.email" type="email" class="field-input" :class="{ error: errors.email }"
                  placeholder="example@mail.com" />
                <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
              </div>
              <div class="field">
                <label class="field-label">{{ L.phone }}</label>
                <input v-model="form.phone" class="field-input" :class="{ error: errors.phone }"
                  placeholder="+993 65 123456" />
                <span v-if="errors.phone" class="field-error">{{ errors.phone }}</span>
              </div>
            </div>

            <!-- Address -->
            <div class="field">
              <label class="field-label">{{ L.address }}</label>
              <input v-model="form.address" class="field-input" :class="{ error: errors.address }"
                :placeholder="lang === 'tk' ? 'Aşgabat, Bitarap köç. 12' : 'Ашхабад, ул. Битарап 12'" />
              <span v-if="errors.address" class="field-error">{{ errors.address }}</span>
            </div>

            <!-- Status -->
            <div class="field">
              <label class="field-label">{{ L.status }}</label>
              <div class="status-opts">
                <button
                  v-for="s in statusOptions" :key="s"
                  :class="['status-btn', s, { active: form.status === s }]"
                  @click="form.status = s"
                >
                  <span class="status-dot" />
                  {{ L.statuses[s] }}
                </button>
              </div>
            </div>

          </div>

          <div class="modal-foot">
            <button class="btn-cancel" @click="emit('close')">{{ L.cancel }}</button>
            <button class="btn-save"   @click="submit">{{ L.save }}</button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.overlay { position: fixed; inset: 0; z-index: 500; background: rgba(15,17,23,.55); backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal { background: var(--white); border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); width: 100%; max-width: 500px; display: flex; flex-direction: column; max-height: 90vh; overflow: hidden; }

.modal-head { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid var(--border-light); flex-shrink: 0; }
.modal-head h2 { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--dark); }
.close-btn { width: 30px; height: 30px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--surface); display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--muted); transition: all .15s; }
.close-btn svg { width: 14px; height: 14px; }
.close-btn:hover { border-color: var(--error); color: var(--error); background: var(--error-bg); }

.modal-body { padding: 22px 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 12px; font-weight: 700; color: var(--dark); }
.field-input { height: 38px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--surface); padding: 0 12px; font-size: 13px; font-family: var(--font-body); color: var(--dark); outline: none; transition: border-color .15s, box-shadow .15s; width: 100%; }
.field-input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px var(--gold-glow); background: var(--white); }
.field-input.error { border-color: var(--error); }
.field-error { font-size: 11px; color: var(--error); font-weight: 600; }

.status-opts { display: flex; gap: 8px; }
.status-btn { display: flex; align-items: center; gap: 7px; padding: 7px 16px; border-radius: var(--radius-pill); border: 1.5px solid var(--border); background: var(--surface); font-size: 12px; font-weight: 700; cursor: pointer; transition: all .15s; font-family: var(--font-body); color: var(--muted); }
.status-dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
.status-btn.active.active  { border-color: #22C55E; color: #22C55E; background: rgba(34,197,94,.1);  }
.status-btn.blocked.active { border-color: #EF4444; color: #EF4444; background: rgba(239,68,68,.1); }
.status-btn:not(.active):hover { border-color: var(--gold); color: var(--gold); }

.modal-foot { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 24px; border-top: 1px solid var(--border-light); flex-shrink: 0; }
.btn-cancel { height: 38px; padding: 0 18px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--surface); font-size: 13px; font-weight: 700; color: var(--muted); cursor: pointer; transition: all .15s; font-family: var(--font-body); }
.btn-cancel:hover { border-color: var(--dark); color: var(--dark); }
.btn-save { height: 38px; padding: 0 22px; border-radius: var(--radius-md); border: none; background: linear-gradient(135deg, var(--gold), var(--gold-dark)); font-size: 13px; font-weight: 800; color: #fff; cursor: pointer; transition: all .15s; font-family: var(--font-body); box-shadow: 0 4px 12px var(--gold-shadow); }
.btn-save:hover { transform: translateY(-1px); box-shadow: 0 6px 16px var(--gold-shadow); }

.modal-enter-active, .modal-leave-active { transition: opacity .2s; }
.modal-enter-active .modal, .modal-leave-active .modal { transition: opacity .2s, transform .2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal, .modal-leave-to .modal { opacity: 0; transform: scale(.96) translateY(10px); }

@media (max-width: 500px) { .field-row { grid-template-columns: 1fr; } }
</style>
