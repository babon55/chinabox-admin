<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUiStore }   from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'

const ui    = useUiStore()
const auth  = useAuthStore()
const route = useRoute()

const lang      = computed(() => ui.lang)
const pageTitle = computed(() => ui.pageTitle(route.path))

const AVATAR_COLORS = ['#E8A020','#3B82F6','#22C55E','#8B5CF6']
function avatarColor(name: string) {
  const i = (name ?? '').split('').reduce((s, c) => s + c.charCodeAt(0), 0) % AVATAR_COLORS.length
  return AVATAR_COLORS[i]
}
</script>
<template>
  <header class="topbar">
    <button class="menu-btn" @click="ui.toggleSidebar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="6"  x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="18" x2="21" y2="18"/>
      </svg>
    </button>

    <h1 class="page-title">{{ pageTitle }}</h1>

    <div class="right">
      <!-- Language toggle -->
      <div class="lang-toggle">
        <button :class="['ltab', { active: lang === 'tk' }]" @click="ui.setLang('tk')">TK</button>
        <button :class="['ltab', { active: lang === 'ru' }]" @click="ui.setLang('ru')">RU</button>
      </div>

      <!-- User -->
      <div class="user-chip" v-if="auth.user">
        <div class="avatar" :style="{ background: avatarColor(auth.user.name) }">
          {{ auth.user.avatar ?? auth.user.name[0] }}
        </div>
        <span class="uname">{{ auth.user.name }}</span>
      </div>

      <!-- Logout -->
      <button class="logout-btn" @click="auth.logout" :title="lang === 'tk' ? 'Çykyş' : 'Выйти'">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      </button>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  height: var(--topbar-h);
  background: var(--white);
  border-bottom: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 16px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-sm);
}

.menu-btn { width: 34px; height: 34px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--surface); display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--muted); transition: all .15s; flex-shrink: 0; }
.menu-btn svg { width: 16px; height: 16px; }
.menu-btn:hover { border-color: var(--gold); color: var(--gold); background: var(--gold-glow); }

.page-title { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--dark); flex: 1; }

.right { display: flex; align-items: center; gap: 10px; }

.lang-toggle { display: flex; gap: 3px; background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--radius-md); padding: 3px; }
.ltab { padding: 3px 10px; border-radius: var(--radius-sm); border: none; background: transparent; font-size: 11px; font-weight: 700; color: var(--muted); cursor: pointer; font-family: var(--font-body); transition: all .15s; }
.ltab.active { background: var(--dark); color: var(--white); }

.user-chip { display: flex; align-items: center; gap: 8px; padding: 4px 10px 4px 4px; border-radius: var(--radius-pill); background: var(--surface); border: 1.5px solid var(--border); }
.avatar { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
.uname { font-size: 13px; font-weight: 700; color: var(--dark); }

.logout-btn { width: 34px; height: 34px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--surface); display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--muted); transition: all .15s; }
.logout-btn svg { width: 16px; height: 16px; }
.logout-btn:hover { border-color: var(--error); color: var(--error); background: var(--error-bg); }
</style>
