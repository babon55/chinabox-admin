<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUiStore } from '@/stores/ui'
import SettingsStore         from './settings/SettingsStore.vue'
import SettingsAccount       from './settings/SettingsAccount.vue'
import SettingsSecurity      from './settings/SettingsSecurity.vue'
import SettingsNotifications from './settings/SettingsNotifications.vue'

const ui   = useUiStore()
const lang = computed(() => ui.lang)

type Tab = 'store' | 'account' | 'security' | 'notifications'
const active = ref<Tab>('store')

interface NavTab {
  key:   Tab
  label: Record<'tk' | 'ru', string>
  desc:  Record<'tk' | 'ru', string>
  icon:  string
  color: string
}

const tabs = computed<NavTab[]>(() => [
  {
    key: 'store', icon: 'store', color: '#E8A020',
    label: { tk: 'Dükan maglumaty', ru: 'Данные магазина' },
    desc:  { tk: 'At, logotip, habarlaşmak', ru: 'Название, логотип, контакты' },
  },
  {
    key: 'account', icon: 'user', color: '#3B82F6',
    label: { tk: 'Profil',          ru: 'Профиль'        },
    desc:  { tk: 'Şahsy maglumat',  ru: 'Личные данные'  },
  },
  {
    key: 'security', icon: 'lock', color: '#8B5CF6',
    label: { tk: 'Howpsuzlyk',      ru: 'Безопасность'   },
    desc:  { tk: 'Parol üýtgetmek', ru: 'Смена пароля'   },
  },
  {
    key: 'notifications', icon: 'bell', color: '#22C55E',
    label: { tk: 'Habarnamalar',    ru: 'Уведомления'    },
    desc:  { tk: 'Habar sazlamalary', ru: 'Настройки уведомлений' },
  },
])
</script>

<template>
  <div class="view">

    <!-- Sidebar -->
    <aside class="sidebar">
      <button
        v-for="t in tabs" :key="t.key"
        :class="['tab-btn', { active: active === t.key }]"
        @click="active = t.key"
      >
        <div class="tab-icon" :style="active === t.key ? { background: t.color + '20', color: t.color } : {}">
          <svg v-if="t.icon==='store'"         viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <svg v-if="t.icon==='user'"          viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <svg v-if="t.icon==='lock'"          viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <svg v-if="t.icon==='bell'"          viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        </div>
        <div class="tab-text">
          <span class="tab-label">{{ t.label[lang] }}</span>
          <span class="tab-desc">{{ t.desc[lang] }}</span>
        </div>
        <svg v-if="active === t.key" class="tab-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
    </aside>

    <!-- Content panel -->
    <div class="panel">
      <Transition name="fade-up" mode="out-in">
        <SettingsStore         v-if="active === 'store'"         :lang="lang" :key="'store'"  />
        <SettingsAccount       v-else-if="active === 'account'"  :lang="lang" :key="'acct'"   />
        <SettingsSecurity      v-else-if="active === 'security'" :lang="lang" :key="'sec'"    />
        <SettingsNotifications v-else                            :lang="lang" :key="'notif'"  />
      </Transition>
    </div>

  </div>
</template>

<style scoped>
.view {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 24px;
  align-items: start;
}

/* Sidebar */
.sidebar {
  background: var(--white);
  border-radius: var(--radius-xl);
  border: 1.5px solid var(--border-light);
  box-shadow: var(--shadow-sm);
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  position: sticky;
  top: calc(var(--topbar-h) + 28px);
}

.tab-btn {
  display: flex; align-items: center; gap: 12px;
  padding: 11px 12px; border-radius: var(--radius-lg);
  background: transparent; border: none; cursor: pointer;
  text-align: left; width: 100%; transition: background .15s;
  font-family: var(--font-body);
}
.tab-btn:hover         { background: var(--surface); }
.tab-btn.active        { background: var(--surface); }
.tab-btn.active::after {
  content: none;
}

.tab-icon {
  width: 38px; height: 38px; border-radius: var(--radius-md);
  background: var(--surface); color: var(--muted);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: background .15s, color .15s;
}
.tab-btn:hover .tab-icon { background: var(--border-light); }
.tab-icon svg { width: 17px; height: 17px; }

.tab-text { flex: 1; min-width: 0; }
.tab-label { display: block; font-size: 13px; font-weight: 700; color: var(--dark); margin-bottom: 1px; }
.tab-desc  { display: block; font-size: 11px; color: var(--subtle); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tab-btn.active .tab-label { color: var(--dark); }

.tab-chevron { width: 14px; height: 14px; color: var(--gold); flex-shrink: 0; }

/* Content panel */
.panel {
  background: var(--white);
  border-radius: var(--radius-xl);
  border: 1.5px solid var(--border-light);
  box-shadow: var(--shadow-sm);
  padding: 28px 32px;
  min-height: 500px;
}

/* Transition */
.fade-up-enter-active, .fade-up-leave-active { transition: opacity .16s ease, transform .16s ease; }
.fade-up-enter-from  { opacity: 0; transform: translateY(8px); }
.fade-up-leave-to    { opacity: 0; transform: translateY(-4px); }

@media (max-width: 860px) {
  .view { grid-template-columns: 1fr; }
  .sidebar { position: static; flex-direction: row; overflow-x: auto; }
  .tab-desc, .tab-chevron { display: none; }
  .tab-icon { width: 30px; height: 30px; }
}
</style>
