<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUiStore }   from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import { settingsApi, type StoreSettings } from '@/api/settings'
import { authApi } from '@/api/auth'
import { getErrorMessage } from '@/utils/error'

const ui   = useUiStore()
const auth = useAuthStore()
const lang = computed(() => ui.lang)

type Tab = 'store' | 'account' | 'security' | 'notifications'
const tab = ref<Tab>('store')

// ── Store settings ────────────────────────────────────────────────────────────
const store   = ref<Partial<StoreSettings>>({})
const storeLoading = ref(true)
const storeSaving  = ref(false)

onMounted(async () => {
  try {
    const res  = await settingsApi.getStore()
    store.value = { ...res.data }
  } finally { storeLoading.value = false }
})

async function saveStore() {
  storeSaving.value = true
  try {
    const res = await settingsApi.updateStore(store.value)
    store.value = { ...res.data }
    showToast(lang.value === 'tk' ? 'Ýatda saklandy' : 'Сохранено')
  } catch (e: unknown) {
    showToast(getErrorMessage(e) ?? 'Error', 'error')
  } finally { storeSaving.value = false }
}

// ── Account ───────────────────────────────────────────────────────────────────
const account = ref({ name: '', phone: '', avatar: '👤', timezone: 'Asia/Ashgabat', langPref: 'tk' })
const accountSaving = ref(false)

onMounted(() => {
  if (auth.user) {
    account.value = {
      name:     auth.user.name,
      phone:    auth.user.phone    ?? '',
      avatar:   auth.user.avatar   ?? '👤',
      timezone: auth.user.timezone ?? 'Asia/Ashgabat',
      langPref: auth.user.langPref ?? 'tk',
    }
  }
})

async function saveAccount() {
  accountSaving.value = true
  try {
    await auth.updateMe(account.value)
    showToast(lang.value === 'tk' ? 'Ýatda saklandy' : 'Сохранено')
  } catch (e: unknown) {
    showToast(getErrorMessage(e) ?? 'Error', 'error')
  } finally { accountSaving.value = false }
}

// ── Security ──────────────────────────────────────────────────────────────────
const pw = ref({ current: '', next: '', confirm: '' })
const pwErrors = ref<Record<string, string>>({})
const pwSaving = ref(false)
const showCur  = ref(false)
const showNew  = ref(false)

async function savePassword() {
  pwErrors.value = {}
  if (!pw.value.current) { pwErrors.value.current = lang.value === 'tk' ? 'Hökman' : 'Обязательно'; return }
  if (pw.value.next.length < 8) { pwErrors.value.next = lang.value === 'tk' ? 'Min 8 harp' : 'Мин. 8 символов'; return }
  if (pw.value.next !== pw.value.confirm) { pwErrors.value.confirm = lang.value === 'tk' ? 'Gabat gelmeýär' : 'Не совпадает'; return }
  pwSaving.value = true
  try {
    await authApi.changePassword(pw.value.current, pw.value.next)
    pw.value = { current: '', next: '', confirm: '' }
    showToast(lang.value === 'tk' ? 'Parol üýtgedildi' : 'Пароль изменён')
  } catch (e: unknown) {
    showToast(getErrorMessage(e) ?? 'Error', 'error')
  } finally { pwSaving.value = false }
}

const pwStrength = computed(() => {
  const v = pw.value.next
  if (!v) return 0
  let s = 0
  if (v.length >= 8)    s++
  if (/[A-Z]/.test(v))  s++
  if (/[0-9]/.test(v))  s++
  if (/[^A-Za-z0-9]/.test(v)) s++
  return s
})
const pwStrengthLabel = computed(() => {
  const l = lang.value
  return ['', l === 'tk' ? 'Gowşak' : 'Слабый', l === 'tk' ? 'Orta' : 'Средний', l === 'tk' ? 'Gowy' : 'Хороший', l === 'tk' ? 'Güýçli' : 'Надёжный'][pwStrength.value]
})
const pwStrengthColor = ['','#EF4444','#F59E0B','#3B82F6','#22C55E']

// ── Toast ─────────────────────────────────────────────────────────────────────
const toast = ref<{ msg: string; type: 'success' | 'error' } | null>(null)
function showToast(msg: string, type: 'success' | 'error' = 'success') {
  toast.value = { msg, type }
  setTimeout(() => toast.value = null, 2800)
}

const EMOJIS = ['🛍️','🏪','💼','🎁','💎','🌟','🔥','✨','🛒','🏷️']
const AVATARS = ['👤','👨‍💼','👩‍💼','🧑‍💻','👑','🦁','🐯','🦊','🐺','🐻']
const CURRENCIES = ['USD','EUR','TMT','RUB']

const tabs = computed(() => [
  { key: 'store',    label: lang.value === 'tk' ? 'Dükan'     : 'Магазин'    },
  { key: 'account',  label: lang.value === 'tk' ? 'Profil'    : 'Профиль'    },
  { key: 'security', label: lang.value === 'tk' ? 'Howpsuzlyk': 'Безопасность'},
])
</script>

<template>
  <div class="settings">

    <Transition name="toast">
      <div v-if="toast" :class="['toast', toast.type]">{{ toast.msg }}</div>
    </Transition>

    <div class="settings-layout">

      <!-- Sidebar tabs -->
      <div class="settings-nav">
        <button v-for="t in tabs" :key="t.key" :class="['nav-btn', { active: tab === t.key }]" @click="tab = t.key as Tab">
          {{ t.label }}
        </button>
      </div>

      <!-- Panels -->
      <div class="settings-panel">

        <!-- Store Info -->
        <div v-if="tab === 'store'">
          <div v-if="storeLoading" class="panel-loading"><div class="spinner"></div></div>
          <template v-else>
            <h3 class="panel-title">{{ lang === 'tk' ? 'Dükan maglumatlary' : 'Информация о магазине' }}</h3>

            <div class="field">
              <label class="label">{{ lang === 'tk' ? 'Logo' : 'Логотип' }}</label>
              <div class="emoji-grid">
                <button v-for="e in EMOJIS" :key="e" :class="['emoji-btn', { active: store.logo === e }]" @click="store.logo = e">{{ e }}</button>
              </div>
            </div>

            <div class="form-row">
              <div class="field">
                <label class="label">{{ lang === 'tk' ? 'Ady (TK)' : 'Название (TK)' }}</label>
                <input v-model="store.nameTk" class="input" />
              </div>
              <div class="field">
                <label class="label">{{ lang === 'tk' ? 'Ady (RU)' : 'Название (RU)' }}</label>
                <input v-model="store.nameRu" class="input" />
              </div>
            </div>
            <div class="form-row">
              <div class="field">
                <label class="label">{{ lang === 'tk' ? 'Şygar (TK)' : 'Слоган (TK)' }}</label>
                <input v-model="store.taglineTk" class="input" />
              </div>
              <div class="field">
                <label class="label">{{ lang === 'tk' ? 'Şygar (RU)' : 'Слоган (RU)' }}</label>
                <input v-model="store.taglineRu" class="input" />
              </div>
            </div>
            <div class="form-row">
              <div class="field">
                <label class="label">{{ lang === 'tk' ? 'E-poçta' : 'Email' }}</label>
                <input v-model="store.email" type="email" class="input" />
              </div>
              <div class="field">
                <label class="label">{{ lang === 'tk' ? 'Telefon' : 'Телефон' }}</label>
                <input v-model="store.phone" class="input" />
              </div>
            </div>
            <div class="form-row">
              <div class="field">
                <label class="label">{{ lang === 'tk' ? 'Walýuta' : 'Валюта' }}</label>
                <select v-model="store.currency" class="input">
                  <option v-for="c in CURRENCIES" :key="c" :value="c">{{ c }}</option>
                </select>
              </div>
            </div>

            <div class="panel-foot">
              <button class="save-btn" :disabled="storeSaving" @click="saveStore">
                <svg v-if="storeSaving" class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                {{ storeSaving ? '...' : (lang === 'tk' ? 'Ýatda sakla' : 'Сохранить') }}
              </button>
            </div>
          </template>
        </div>

        <!-- Account -->
        <div v-if="tab === 'account'">
          <h3 class="panel-title">{{ lang === 'tk' ? 'Profil maglumatlary' : 'Данные профиля' }}</h3>

          <div class="field">
            <label class="label">{{ lang === 'tk' ? 'Avatar' : 'Аватар' }}</label>
            <div class="emoji-grid">
              <button v-for="e in AVATARS" :key="e" :class="['emoji-btn', { active: account.avatar === e }]" @click="account.avatar = e">{{ e }}</button>
            </div>
          </div>

          <div class="form-row">
            <div class="field">
              <label class="label">{{ lang === 'tk' ? 'Ady' : 'Имя' }}</label>
              <input v-model="account.name" class="input" />
            </div>
            <div class="field">
              <label class="label">{{ lang === 'tk' ? 'Telefon' : 'Телефон' }}</label>
              <input v-model="account.phone" class="input" />
            </div>
          </div>
          <div class="form-row">
            <div class="field">
              <label class="label">{{ lang === 'tk' ? 'Wagt zolak' : 'Часовой пояс' }}</label>
              <select v-model="account.timezone" class="input">
                <option value="Asia/Ashgabat">Asia/Ashgabat (UTC+5)</option>
                <option value="Europe/Moscow">Europe/Moscow (UTC+3)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
            <div class="field">
              <label class="label">{{ lang === 'tk' ? 'Dil' : 'Язык' }}</label>
              <select v-model="account.langPref" class="input">
                <option value="tk">Türkmençe</option>
                <option value="ru">Русский</option>
              </select>
            </div>
          </div>

          <div class="panel-foot">
            <button class="save-btn" :disabled="accountSaving" @click="saveAccount">
              <svg v-if="accountSaving" class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              {{ accountSaving ? '...' : (lang === 'tk' ? 'Ýatda sakla' : 'Сохранить') }}
            </button>
          </div>
        </div>

        <!-- Security -->
        <div v-if="tab === 'security'">
          <h3 class="panel-title">{{ lang === 'tk' ? 'Parol üýtget' : 'Изменить пароль' }}</h3>

          <div class="field">
            <label class="label">{{ lang === 'tk' ? 'Häzirki parol' : 'Текущий пароль' }}</label>
            <div class="input-wrap">
              <input v-model="pw.current" :type="showCur ? 'text' : 'password'" class="input" :class="{ error: pwErrors.current }" />
              <button class="eye" @click="showCur = !showCur">{{ showCur ? '🙈' : '👁️' }}</button>
            </div>
            <span v-if="pwErrors.current" class="err">{{ pwErrors.current }}</span>
          </div>

          <div class="field">
            <label class="label">{{ lang === 'tk' ? 'Täze parol' : 'Новый пароль' }}</label>
            <div class="input-wrap">
              <input v-model="pw.next" :type="showNew ? 'text' : 'password'" class="input" :class="{ error: pwErrors.next }" />
              <button class="eye" @click="showNew = !showNew">{{ showNew ? '🙈' : '👁️' }}</button>
            </div>
            <span v-if="pwErrors.next" class="err">{{ pwErrors.next }}</span>
            <!-- Strength meter -->
            <div v-if="pw.next" class="strength-wrap">
              <div class="strength-bars">
                <div v-for="i in 4" :key="i" class="strength-bar" :style="{ background: i <= pwStrength ? pwStrengthColor[pwStrength] : 'var(--border)' }"></div>
              </div>
              <span class="strength-label" :style="{ color: pwStrengthColor[pwStrength] }">{{ pwStrengthLabel }}</span>
            </div>
          </div>

          <div class="field">
            <label class="label">{{ lang === 'tk' ? 'Täze paroly tassykla' : 'Повторите пароль' }}</label>
            <input v-model="pw.confirm" type="password" class="input" :class="{ error: pwErrors.confirm }" />
            <span v-if="pwErrors.confirm" class="err">{{ pwErrors.confirm }}</span>
          </div>

          <div class="panel-foot">
            <button class="save-btn" :disabled="pwSaving" @click="savePassword">
              {{ pwSaving ? '...' : (lang === 'tk' ? 'Paroly üýtget' : 'Изменить пароль') }}
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.settings { display: flex; flex-direction: column; gap: 16px; }
.settings-layout { display: grid; grid-template-columns: 200px 1fr; gap: 20px; align-items: start; }
.settings-nav { background: var(--white); border-radius: var(--radius-lg); border: 1.5px solid var(--border-light); padding: 8px; display: flex; flex-direction: column; gap: 4px; box-shadow: var(--shadow-sm); position: sticky; top: 80px; }
.nav-btn { padding: 10px 14px; border-radius: var(--radius-md); border: none; background: transparent; font-size: 13px; font-weight: 700; color: var(--subtle); cursor: pointer; font-family: var(--font-body); text-align: left; transition: all .15s; }
.nav-btn.active { background: var(--gold-glow); color: var(--gold); }
.nav-btn:hover:not(.active) { background: var(--surface); color: var(--dark); }
.settings-panel { background: var(--white); border-radius: var(--radius-lg); border: 1.5px solid var(--border-light); padding: 28px; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; gap: 18px; }
.panel-title { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--dark); margin-bottom: 4px; }
.panel-loading { display: flex; justify-content: center; padding: 40px; }
.spinner { width: 28px; height: 28px; border: 3px solid var(--border); border-top-color: var(--gold); border-radius: 50%; animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.field { display: flex; flex-direction: column; gap: 6px; }
.label { font-size: 12px; font-weight: 700; color: var(--dark); }
.input { height: 40px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--surface); padding: 0 12px; font-size: 13px; font-family: var(--font-body); color: var(--dark); outline: none; width: 100%; box-sizing: border-box; }
.input:focus { border-color: var(--gold); background: var(--white); }
.input.error { border-color: var(--error); }
.form-row { display: flex; gap: 14px; }
.form-row .field { flex: 1; }
.emoji-grid { display: flex; flex-wrap: wrap; gap: 6px; }
.emoji-btn { width: 36px; height: 36px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--surface); font-size: 18px; cursor: pointer; transition: all .12s; }
.emoji-btn.active { border-color: var(--gold); background: var(--gold-glow); }
.input-wrap { position: relative; display: flex; align-items: center; }
.input-wrap .input { padding-right: 40px; }
.eye { position: absolute; right: 10px; background: none; border: none; cursor: pointer; font-size: 16px; line-height: 1; }
.err { font-size: 11px; color: var(--error); }
.strength-wrap { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
.strength-bars { display: flex; gap: 4px; }
.strength-bar { width: 36px; height: 4px; border-radius: var(--radius-pill); transition: background .2s; }
.strength-label { font-size: 11px; font-weight: 700; }
.panel-foot { display: flex; justify-content: flex-end; padding-top: 8px; border-top: 1px solid var(--border-light); margin-top: 4px; }
.save-btn { height: 40px; padding: 0 24px; border-radius: var(--radius-md); border: none; background: linear-gradient(135deg, var(--gold), var(--gold-dark)); font-size: 14px; font-weight: 700; color: var(--white); cursor: pointer; font-family: var(--font-body); display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px var(--gold-shadow); transition: all .15s; }
.save-btn:hover:not(:disabled) { transform: translateY(-1px); }
.save-btn:disabled { opacity: .7; cursor: not-allowed; }
.spin { animation: spin .8s linear infinite; width: 14px; height: 14px; }
.toast { position: fixed; bottom: 24px; right: 24px; padding: 12px 20px; border-radius: var(--radius-md); font-size: 14px; font-weight: 700; z-index: 9999; box-shadow: 0 8px 24px rgba(0,0,0,.15); }
.toast.success { background: #22C55E; color: var(--white); }
.toast.error   { background: var(--error); color: var(--white); }
.toast-enter-active, .toast-leave-active { transition: all .25s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(12px); }
@media (max-width: 700px) { .settings-layout { grid-template-columns: 1fr; } .settings-nav { flex-direction: row; position: static; } }
</style>
