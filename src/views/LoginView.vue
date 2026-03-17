<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUiStore }   from '@/stores/ui'

const auth = useAuthStore()
const ui   = useUiStore()
const lang = computed(() => ui.lang)

const email    = ref('admin@silkshop.tm')
const password = ref('')
const showPw   = ref(false)

async function submit() {
  if (!email.value || !password.value) return
  await auth.login(email.value, password.value)
}

const L = computed(() => lang.value === 'tk' ? {
  title:    'Adminpanel',
  sub:      'Dowam etmek üçin giriş açyň',
  email:    'Elektron poçta',
  password: 'Parol',
  btn:      'Giriş',
  loading:  'Girilýär...',
} : {
  title:    'Панель администратора',
  sub:      'Войдите чтобы продолжить',
  email:    'Электронная почта',
  password: 'Пароль',
  btn:      'Войти',
  loading:  'Вход...',
})
</script>

<template>
  <div class="login-page">

    <!-- Language toggle -->
    <div class="lang-toggle">
      <button :class="['ltab', { active: lang === 'tk' }]" @click="ui.setLang('tk')">TK</button>
      <button :class="['ltab', { active: lang === 'ru' }]" @click="ui.setLang('ru')">RU</button>
    </div>

    <div class="card">
      <!-- Logo -->
      <div class="logo-wrap">
        <div class="logo">🛍️</div>
        <h1 class="brand">SilkShop</h1>
      </div>

      <h2 class="title">{{ L.title }}</h2>
      <p class="sub">{{ L.sub }}</p>

      <!-- Error -->
      <Transition name="shake">
        <div v-if="auth.error" class="error-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {{ auth.error }}
        </div>
      </Transition>

      <!-- Form -->
      <div class="form">
        <div class="field">
          <label class="label">{{ L.email }}</label>
          <div class="input-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <input v-model="email" type="email" class="input" autocomplete="email" @keyup.enter="submit" />
          </div>
        </div>

        <div class="field">
          <label class="label">{{ L.password }}</label>
          <div class="input-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <input v-model="password" :type="showPw ? 'text' : 'password'" class="input" autocomplete="current-password" @keyup.enter="submit" />
            <button class="eye" @click="showPw = !showPw">
              <svg v-if="!showPw" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            </button>
          </div>
        </div>

        <button class="submit-btn" :disabled="auth.loading" @click="submit">
          <svg v-if="auth.loading" class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          {{ auth.loading ? L.loading : L.btn }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  background: var(--sidebar-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
}

.lang-toggle {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 4px;
  background: rgba(255,255,255,.08);
  border-radius: var(--radius-md);
  padding: 3px;
}
.ltab {
  padding: 4px 12px;
  border-radius: var(--radius-sm);
  border: none;
  background: transparent;
  font-size: 12px;
  font-weight: 700;
  color: rgba(255,255,255,.4);
  cursor: pointer;
  font-family: var(--font-body);
  transition: all .15s;
}
.ltab.active { background: var(--gold); color: #fff; }

.card {
  background: var(--white);
  border-radius: var(--radius-xl);
  padding: 40px 36px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 24px 64px rgba(0,0,0,.35);
}

.logo-wrap { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; }
.logo { width: 44px; height: 44px; border-radius: var(--radius-lg); background: linear-gradient(135deg, var(--gold), var(--gold-dark)); display: flex; align-items: center; justify-content: center; font-size: 22px; box-shadow: 0 4px 12px var(--gold-shadow); }
.brand { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--dark); }

.title { font-family: var(--font-display); font-size: 24px; font-weight: 700; color: var(--dark); margin-bottom: 6px; }
.sub   { font-size: 14px; color: var(--subtle); margin-bottom: 28px; }

.error-box {
  display: flex; align-items: center; gap: 8px;
  background: var(--error-bg); color: var(--error);
  border: 1.5px solid rgba(239,68,68,.3);
  border-radius: var(--radius-md); padding: 10px 14px;
  font-size: 13px; font-weight: 600; margin-bottom: 18px;
}
.error-box svg { width: 16px; height: 16px; flex-shrink: 0; }

.form { display: flex; flex-direction: column; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.label { font-size: 12px; font-weight: 700; color: var(--dark); }
.input-wrap { position: relative; display: flex; align-items: center; }
.input-wrap > svg:first-child { position: absolute; left: 11px; width: 15px; height: 15px; color: var(--subtle); pointer-events: none; }
.input {
  height: 44px; width: 100%;
  border-radius: var(--radius-md); border: 1.5px solid var(--border);
  background: var(--surface); padding: 0 40px;
  font-size: 14px; font-family: var(--font-body); color: var(--dark);
  outline: none; transition: border-color .15s, box-shadow .15s;
}
.input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px var(--gold-glow); background: var(--white); }
.eye { position: absolute; right: 10px; background: none; border: none; cursor: pointer; color: var(--subtle); display: flex; align-items: center; transition: color .15s; }
.eye:hover { color: var(--dark); }
.eye svg { width: 16px; height: 16px; }

.submit-btn {
  height: 46px; border-radius: var(--radius-md); border: none;
  background: linear-gradient(135deg, var(--gold), var(--gold-dark));
  font-size: 15px; font-weight: 800; color: #fff;
  cursor: pointer; font-family: var(--font-body);
  transition: all .15s; box-shadow: 0 4px 16px var(--gold-shadow);
  display: flex; align-items: center; justify-content: center; gap: 8px;
  margin-top: 4px;
}
.submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px var(--gold-shadow); }
.submit-btn:disabled { opacity: .7; cursor: not-allowed; }

.spin { animation: spin .8s linear infinite; width: 16px; height: 16px; }
@keyframes spin { to { transform: rotate(360deg); } }

.shake-enter-active { animation: shake .3s ease; }
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-6px); }
  75% { transform: translateX(6px); }
}
</style>
