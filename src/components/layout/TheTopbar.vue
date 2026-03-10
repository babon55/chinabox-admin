<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useUiStore } from '@/stores/ui'

defineProps<{ title: string }>()

const ui = useUiStore()

const notifOpen   = ref(false)
const profileOpen = ref(false)
function closeAll() { notifOpen.value = false; profileOpen.value = false }
onMounted(()   => document.addEventListener('click', closeAll))
onUnmounted(() => document.removeEventListener('click', closeAll))

const notifications = ref([
  { id: 1, tk: '12 täze sargyt geldi',    ru: '12 новых заказов',               time: '2m', unread: true  },
  { id: 2, tk: 'Stok azalýar: iPhone 15', ru: 'Заканчивается: iPhone 15',        time: '1h', unread: true  },
  { id: 3, tk: 'Täze müşderi hasap açdy', ru: 'Новый клиент зарегистрировался',  time: '3h', unread: false },
])

const unreadCount = computed(() => notifications.value.filter(n => n.unread).length)
</script>

<template>
  <header class="topbar" :style="{ left: ui.sidebarOffset }">
    <div class="left">
      <button class="icon-btn" @click.stop="ui.toggleSidebar()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <line x1="3" y1="6"  x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
      <h1 class="title">{{ title }}</h1>
    </div>

    <div class="right">

      <!-- Search -->
      <label class="search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input :placeholder="ui.lang === 'tk' ? 'Gözleg...' : 'Поиск...'" />
        <kbd>⌘K</kbd>
      </label>

      <!-- Lang -->
      <div class="lang-toggle">
        <button :class="{ active: ui.lang === 'tk' }" @click.stop="ui.setLang('tk')">🇹🇲</button>
        <button :class="{ active: ui.lang === 'ru' }" @click.stop="ui.setLang('ru')">🇷🇺</button>
      </div>

      <!-- Notifications -->
      <div class="dd-anchor" @click.stop>
        <button class="icon-btn" @click="notifOpen = !notifOpen; profileOpen = false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span v-if="unreadCount" class="badge">{{ unreadCount }}</span>
        </button>
        <Transition name="pop">
          <div v-if="notifOpen" class="dropdown notif-dd">
            <div class="dd-head">
              <span>{{ ui.lang === 'tk' ? 'Habarnamalar' : 'Уведомления' }}</span>
              <button class="text-btn">{{ ui.lang === 'tk' ? 'Hemmesini okamak' : 'Прочитать все' }}</button>
            </div>
            <div v-for="n in notifications" :key="n.id" :class="['notif-row', { unread: n.unread }]">
              <span class="notif-dot" :style="{ opacity: n.unread ? 1 : 0 }" />
              <div>
                <p class="notif-text">{{ n[ui.lang] }}</p>
                <span class="notif-time">{{ n.time }} {{ ui.lang === 'tk' ? 'öň' : 'назад' }}</span>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Profile -->
      <div class="dd-anchor" @click.stop>
        <button class="profile-btn" @click="profileOpen = !profileOpen; notifOpen = false">
          <div class="avatar">A</div>
          <div class="profile-text">
            <span class="profile-name">Admin</span>
            <span class="profile-role">{{ ui.lang === 'tk' ? 'Dolandyryjy' : 'Администратор' }}</span>
          </div>
          <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        <Transition name="pop">
          <div v-if="profileOpen" class="dropdown profile-dd">
            <RouterLink to="/settings" class="dd-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              {{ ui.lang === 'tk' ? 'Sazlamalar' : 'Настройки' }}
            </RouterLink>
            <div class="dd-sep" />
            <button class="dd-item danger">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              {{ ui.lang === 'tk' ? 'Çykmak' : 'Выйти' }}
            </button>
          </div>
        </Transition>
      </div>

    </div>
  </header>
</template>

<style scoped>
.topbar {
  position: fixed; top: 0; right: 0;
  height: var(--topbar-h);
  background: var(--white);
  border-bottom: 1px solid var(--border-light);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 24px; gap: 12px; z-index: 90;
  box-shadow: var(--shadow-sm);
  transition: left .28s cubic-bezier(.4,0,.2,1);
}
.left  { display: flex; align-items: center; gap: 12px; }
.right { display: flex; align-items: center; gap: 8px; }
.title { font-family: var(--font-display); font-size: 19px; font-weight: 700; color: var(--dark); white-space: nowrap; }

.search {
  display: flex; align-items: center; gap: 8px;
  background: var(--surface); border: 1.5px solid var(--border);
  border-radius: var(--radius-md); padding: 0 10px;
  height: 36px; min-width: 210px; cursor: text;
  transition: border-color .15s, box-shadow .15s;
}
.search:focus-within { border-color: var(--gold); box-shadow: 0 0 0 3px var(--gold-glow); background: var(--white); }
.search svg   { width: 14px; height: 14px; color: var(--subtle); flex-shrink: 0; }
.search input { flex: 1; border: none; background: transparent; outline: none; font-size: 13px; font-family: var(--font-body); color: var(--dark); }
.search input::placeholder { color: var(--subtle); }
.search kbd   { font-size: 10px; color: var(--subtle); background: var(--border-light); border-radius: 4px; padding: 1px 5px; font-family: monospace; }

.lang-toggle { display: flex; gap: 2px; background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--radius-pill); padding: 2px; }
.lang-toggle button { padding: 3px 9px; border-radius: var(--radius-pill); border: none; background: transparent; font-size: 13px; cursor: pointer; transition: background .15s; }
.lang-toggle button.active { background: var(--dark); }

.icon-btn {
  position: relative; width: 36px; height: 36px; border-radius: var(--radius-md);
  background: var(--surface); border: 1.5px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--muted); transition: border-color .15s, color .15s, background .15s;
}
.icon-btn svg { width: 16px; height: 16px; }
.icon-btn:hover { border-color: var(--gold); color: var(--gold); background: var(--gold-glow); }
.badge {
  position: absolute; top: -5px; right: -5px;
  min-width: 17px; height: 17px; border-radius: var(--radius-pill);
  background: var(--gold); color: #fff; font-size: 10px; font-weight: 800;
  display: flex; align-items: center; justify-content: center; padding: 0 4px;
  border: 2px solid var(--white);
}

.profile-btn {
  display: flex; align-items: center; gap: 9px;
  padding: 4px 10px 4px 4px; border-radius: var(--radius-lg);
  background: var(--surface); border: 1.5px solid var(--border);
  cursor: pointer; transition: border-color .15s, background .15s;
}
.profile-btn:hover { border-color: var(--gold); background: var(--gold-glow); }
.avatar { width: 28px; height: 28px; border-radius: var(--radius-md); background: linear-gradient(135deg, var(--gold), var(--gold-dark)); color: #fff; font-size: 12px; font-weight: 800; display: flex; align-items: center; justify-content: center; font-family: var(--font-body); }
.profile-text { display: flex; flex-direction: column; line-height: 1.25; }
.profile-name { font-size: 12px; font-weight: 700; color: var(--dark); font-family: var(--font-body); }
.profile-role { font-size: 10px; color: var(--subtle); font-family: var(--font-body); }
.chevron { width: 13px; height: 13px; color: var(--subtle); }

.dd-anchor  { position: relative; }
.dropdown   { position: absolute; top: calc(100% + 8px); right: 0; background: var(--white); border: 1.5px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); z-index: 200; overflow: hidden; }

.notif-dd   { width: 290px; }
.dd-head    { display: flex; align-items: center; justify-content: space-between; padding: 13px 16px; border-bottom: 1px solid var(--border-light); font-size: 13px; font-weight: 700; color: var(--dark); font-family: var(--font-body); }
.text-btn   { font-size: 11px; font-weight: 600; color: var(--gold); background: none; border: none; cursor: pointer; font-family: var(--font-body); }
.notif-row  { display: flex; align-items: flex-start; gap: 10px; padding: 11px 16px; transition: background .12s; }
.notif-row:hover { background: var(--surface); }
.notif-row.unread { background: rgba(232,160,32,.04); }
.notif-dot  { width: 7px; height: 7px; border-radius: 50%; background: var(--gold); flex-shrink: 0; margin-top: 5px; }
.notif-text { font-size: 13px; color: var(--dark); font-family: var(--font-body); margin-bottom: 2px; }
.notif-time { font-size: 11px; color: var(--subtle); font-family: var(--font-body); }

.profile-dd { width: 190px; padding: 5px; }
.dd-item    { display: flex; align-items: center; gap: 9px; padding: 8px 9px; border-radius: var(--radius-md); font-size: 13px; font-weight: 600; color: var(--dark); text-decoration: none; font-family: var(--font-body); background: none; border: none; cursor: pointer; width: 100%; text-align: left; transition: background .12s; }
.dd-item svg { width: 14px; height: 14px; color: var(--subtle); }
.dd-item:hover { background: var(--surface); }
.dd-item.danger { color: var(--error); }
.dd-item.danger svg { color: var(--error); }
.dd-item.danger:hover { background: var(--error-bg); }
.dd-sep { height: 1px; background: var(--border-light); margin: 3px 0; }

.pop-enter-active, .pop-leave-active { transition: opacity .14s, transform .14s; }
.pop-enter-from,   .pop-leave-to     { opacity: 0; transform: translateY(-5px) scale(.97); }

@media (max-width: 768px) {
  .search, .profile-text, .chevron { display: none; }
}
</style>
