<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Lang } from '@/types'

const props = defineProps<{ lang: Lang }>()

const saved  = ref(false)
const saving = ref(false)

const form = ref({
  name:     { tk: 'SilkShop',    ru: 'SilkShop'      },
  tagline:  { tk: 'Iň gowy önümler', ru: 'Лучшие товары' },
  email:    'info@silkshop.tm',
  phone:    '+993 12 123456',
  address:  { tk: 'Aşgabat, Türkmenistan', ru: 'Ашхабад, Туркменистан' },
  currency: 'USD',
  logo:     '🛍️',
})

const L = computed(() => props.lang === 'tk' ? {
  title:     'Dükanyň maglumatlary',
  sub:       'Müşderilere görkezilýän esasy maglumatlar',
  logo:      'Logotip / Emoji',
  nameTk:    'Dükan ady (Türkmençe)',
  nameRu:    'Dükan ady (Rusça)',
  tagTk:     'Şygar (Türkmençe)',
  tagRu:     'Şygar (Rusça)',
  email:     'Elektron poçta',
  phone:     'Telefon',
  addrTk:   'Salgy (Türkmençe)',
  addrRu:   'Salgy (Rusça)',
  currency:  'Walýuta',
  save:      'Üýtgetmeleri ýatda sakla',
  saved:     'Üýtgetmeler ýatda saklandy!',
} : {
  title:     'Данные магазина',
  sub:       'Основная информация, отображаемая клиентам',
  logo:      'Логотип / Emoji',
  nameTk:    'Название (Туркменский)',
  nameRu:    'Название (Русский)',
  tagTk:     'Слоган (Туркменский)',
  tagRu:     'Слоган (Русский)',
  email:     'Электронная почта',
  phone:     'Телефон',
  addrTk:   'Адрес (Туркменский)',
  addrRu:   'Адрес (Русский)',
  currency:  'Валюта',
  save:      'Сохранить изменения',
  saved:     'Изменения сохранены!',
})

const emojiPicks = ['🛍️','🏪','💎','👑','🌟','🎁','🛒','💍','🧵','🪡']

async function save() {
  saving.value = true
  await new Promise(r => setTimeout(r, 700))
  saving.value = false
  saved.value  = true
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

      <!-- Logo -->
      <div class="field">
        <label class="field-label">{{ L.logo }}</label>
        <div class="logo-row">
          <div class="logo-preview">{{ form.logo }}</div>
          <div>
            <div class="emoji-picks">
              <button v-for="e in emojiPicks" :key="e"
                :class="['emoji-pick', { active: form.logo === e }]"
                @click="form.logo = e">{{ e }}</button>
            </div>
          </div>
        </div>
      </div>

      <div class="divider" />

      <!-- Names -->
      <div class="field-row">
        <div class="field">
          <label class="field-label">{{ L.nameTk }}</label>
          <input v-model="form.name.tk" class="field-input" />
        </div>
        <div class="field">
          <label class="field-label">{{ L.nameRu }}</label>
          <input v-model="form.name.ru" class="field-input" />
        </div>
      </div>

      <!-- Taglines -->
      <div class="field-row">
        <div class="field">
          <label class="field-label">{{ L.tagTk }}</label>
          <input v-model="form.tagline.tk" class="field-input" />
        </div>
        <div class="field">
          <label class="field-label">{{ L.tagRu }}</label>
          <input v-model="form.tagline.ru" class="field-input" />
        </div>
      </div>

      <div class="divider" />

      <!-- Email + Phone -->
      <div class="field-row">
        <div class="field">
          <label class="field-label">{{ L.email }}</label>
          <div class="input-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <input v-model="form.email" type="email" class="field-input icon-input" />
          </div>
        </div>
        <div class="field">
          <label class="field-label">{{ L.phone }}</label>
          <div class="input-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <input v-model="form.phone" class="field-input icon-input" />
          </div>
        </div>
      </div>

      <!-- Addresses -->
      <div class="field-row">
        <div class="field">
          <label class="field-label">{{ L.addrTk }}</label>
          <input v-model="form.address.tk" class="field-input" />
        </div>
        <div class="field">
          <label class="field-label">{{ L.addrRu }}</label>
          <input v-model="form.address.ru" class="field-input" />
        </div>
      </div>

      <!-- Currency -->
      <div class="field" style="max-width: 200px">
        <label class="field-label">{{ L.currency }}</label>
        <select v-model="form.currency" class="field-input">
          <option value="USD">USD — $</option>
          <option value="EUR">EUR — €</option>
          <option value="TMT">TMT — m</option>
          <option value="RUB">RUB — ₽</option>
        </select>
      </div>
    </div>

    <!-- Footer -->
    <div class="form-footer">
      <Transition name="toast">
        <div v-if="saved" class="toast">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          {{ L.saved }}
        </div>
      </Transition>
      <button class="save-btn" :class="{ loading: saving }" @click="save">
        <svg v-if="!saving" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
        <svg v-else class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        {{ L.save }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.section { display: flex; flex-direction: column; gap: 0; }
.section-head { margin-bottom: 28px; }
.section-head h3 { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--dark); margin-bottom: 4px; }
.section-sub { font-size: 13px; color: var(--subtle); }

.form { display: flex; flex-direction: column; gap: 18px; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 12px; font-weight: 700; color: var(--dark); }
.field-input { height: 40px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--surface); padding: 0 12px; font-size: 13px; font-family: var(--font-body); color: var(--dark); outline: none; transition: border-color .15s, box-shadow .15s; width: 100%; }
.field-input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px var(--gold-glow); background: var(--white); }
select.field-input { cursor: pointer; }

.input-icon-wrap { position: relative; }
.input-icon-wrap svg { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); width: 15px; height: 15px; color: var(--subtle); pointer-events: none; }
.icon-input { padding-left: 34px; }

.logo-row { display: flex; align-items: center; gap: 16px; }
.logo-preview { width: 56px; height: 56px; border-radius: var(--radius-lg); background: var(--surface); border: 1.5px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 28px; flex-shrink: 0; }
.emoji-picks { display: flex; flex-wrap: wrap; gap: 6px; }
.emoji-pick { width: 34px; height: 34px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--surface); font-size: 17px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .15s; }
.emoji-pick:hover  { border-color: var(--gold); background: var(--gold-glow); }
.emoji-pick.active { border-color: var(--gold); background: var(--gold-glow); box-shadow: 0 0 0 2px var(--gold-glow); }

.divider { height: 1px; background: var(--border-light); }

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

@media (max-width: 640px) { .field-row { grid-template-columns: 1fr; } }
</style>
