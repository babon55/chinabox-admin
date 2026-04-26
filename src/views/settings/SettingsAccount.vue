<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Lang } from '@/types'

const props = defineProps<{ lang: Lang }>()

const saved  = ref(false)
const saving = ref(false)

const form = ref({
  name:     'Admin',
  email:    'admin@chinaexpress.tm',
  phone:    '+993 12 000000',
  role:     'admin',
  avatar:   '👤',
  timezone: 'Asia/Ashgabat',
  langPref: 'tk',
})

const L = computed(() => props.lang === 'tk' ? {
  title:    'Profil maglumatlary',
  sub:      'Admin hasabynyň şahsy maglumatlary',
  avatar:   'Profil suraty',
  name:     'Doly ady',
  email:    'Elektron poçta',
  phone:    'Telefon belgisi',
  role:     'Wezipesi',
  timezone: 'Wagt guşagy',
  langPref: 'Ileri tutulýan dil',
  save:     'Profili ýatda sakla',
  saved:    'Profil ýatda saklandy!',
  roles:    { admin: 'Dolandyryjy', manager: 'Menejer', viewer: 'Syn ediji' },
} : {
  title:    'Данные профиля',
  sub:      'Личные данные аккаунта администратора',
  avatar:   'Фото профиля',
  name:     'Полное имя',
  email:    'Электронная почта',
  phone:    'Телефон',
  role:     'Должность',
  timezone: 'Часовой пояс',
  langPref: 'Предпочтительный язык',
  save:     'Сохранить профиль',
  saved:    'Профиль сохранён!',
  roles:    { admin: 'Администратор', manager: 'Менеджер', viewer: 'Наблюдатель' },
})

const emojiPicks = ['👤','👨‍💼','👩‍💼','🧑‍💻','👨‍💻','👩‍💻','🧑‍🔧','🦸','🧑','👨']

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

    <!-- Avatar row -->
    <div class="avatar-section">
      <div class="big-avatar">{{ form.avatar }}</div>
      <div>
        <p class="field-label" style="margin-bottom:8px">{{ L.avatar }}</p>
        <div class="emoji-picks">
          <button v-for="e in emojiPicks" :key="e"
            :class="['emoji-pick', { active: form.avatar === e }]"
            @click="form.avatar = e">{{ e }}</button>
        </div>
      </div>
    </div>

    <div class="divider" />

    <div class="form">
      <!-- Name + Email -->
      <div class="field-row">
        <div class="field">
          <label class="field-label">{{ L.name }}</label>
          <input v-model="form.name" class="field-input" />
        </div>
        <div class="field">
          <label class="field-label">{{ L.email }}</label>
          <input v-model="form.email" type="email" class="field-input" />
        </div>
      </div>

      <!-- Phone + Role -->
      <div class="field-row">
        <div class="field">
          <label class="field-label">{{ L.phone }}</label>
          <input v-model="form.phone" class="field-input" />
        </div>
        <div class="field">
          <label class="field-label">{{ L.role }}</label>
          <select v-model="form.role" class="field-input">
            <option value="admin">{{ L.roles.admin }}</option>
            <option value="manager">{{ L.roles.manager }}</option>
            <option value="viewer">{{ L.roles.viewer }}</option>
          </select>
        </div>
      </div>

      <!-- Timezone + Language -->
      <div class="field-row">
        <div class="field">
          <label class="field-label">{{ L.timezone }}</label>
          <select v-model="form.timezone" class="field-input">
            <option value="Asia/Ashgabat">Aşgabat (UTC+5)</option>
            <option value="Europe/Moscow">Moskwa (UTC+3)</option>
            <option value="UTC">UTC+0</option>
          </select>
        </div>
        <div class="field">
          <label class="field-label">{{ L.langPref }}</label>
          <select v-model="form.langPref" class="field-input">
            <option value="tk">Türkmençe</option>
            <option value="ru">Русский</option>
          </select>
        </div>
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
        <svg v-if="!saving" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
        <svg v-else class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        {{ L.save }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.section { display: flex; flex-direction: column; gap: 0; }
.section-head { margin-bottom: 24px; }
.section-head h3 { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--dark); margin-bottom: 4px; }
.section-sub { font-size: 13px; color: var(--subtle); }

.avatar-section { display: flex; align-items: center; gap: 20px; margin-bottom: 22px; }
.big-avatar { width: 72px; height: 72px; border-radius: var(--radius-xl); background: linear-gradient(135deg, var(--gold), var(--gold-dark)); display: flex; align-items: center; justify-content: center; font-size: 34px; flex-shrink: 0; box-shadow: 0 4px 14px var(--gold-shadow); }

.emoji-picks { display: flex; flex-wrap: wrap; gap: 6px; }
.emoji-pick { width: 32px; height: 32px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--surface); font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .15s; }
.emoji-pick:hover  { border-color: var(--gold); background: var(--gold-glow); }
.emoji-pick.active { border-color: var(--gold); background: var(--gold-glow); box-shadow: 0 0 0 2px var(--gold-glow); }

.divider { height: 1px; background: var(--border-light); margin-bottom: 22px; }

.form { display: flex; flex-direction: column; gap: 18px; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 12px; font-weight: 700; color: var(--dark); }
.field-input { height: 40px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--surface); padding: 0 12px; font-size: 13px; font-family: var(--font-body); color: var(--dark); outline: none; transition: border-color .15s, box-shadow .15s; width: 100%; }
.field-input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px var(--gold-glow); background: var(--white); }
select.field-input { cursor: pointer; }

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
