<script setup lang="ts">
import type { CustomerItem, CustomerStatus, Lang } from '@/types'

defineProps<{ customers: CustomerItem[]; lang: Lang }>()

const emit = defineEmits<{
  (e: 'view',   c: CustomerItem): void
  (e: 'edit',   c: CustomerItem): void
  (e: 'delete', c: CustomerItem): void
}>()

const STATUS: Record<CustomerStatus, { color: string; bg: string; tk: string; ru: string }> = {
  active:  { color: '#22C55E', bg: 'rgba(34,197,94,.12)',   tk: 'Işjeň',     ru: 'Активен'    },
  blocked: { color: '#EF4444', bg: 'rgba(239,68,68,.12)',   tk: 'Bloklanan', ru: 'Заблокирован' },
}

const L = {
  tk: { customer: 'Müşderi', contact: 'Habarlaşmak', orders: 'Sargytlar', spent: 'Sarp etdi', joined: 'Goşuldy', status: 'Ýagdaý', actions: 'Hereketler' },
  ru: { customer: 'Клиент',  contact: 'Контакты',    orders: 'Заказов',   spent: 'Потратил',  joined: 'С нами',  status: 'Статус', actions: 'Действия'   },
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

// Simple deterministic avatar colour from name
const AVATAR_COLORS = ['#E8A020','#3B82F6','#22C55E','#8B5CF6','#EF4444','#F59E0B','#06B6D4']
function avatarColor(name: string) {
  const i = name.split('').reduce((s, c) => s + c.charCodeAt(0), 0) % AVATAR_COLORS.length
  return AVATAR_COLORS[i]
}
</script>

<template>
  <div class="table-wrap">
    <div class="t-head">
      <span>{{ L[lang].customer }}</span>
      <span class="hide-sm">{{ L[lang].contact }}</span>
      <span>{{ L[lang].orders }}</span>
      <span>{{ L[lang].spent }}</span>
      <span class="hide-sm">{{ L[lang].joined }}</span>
      <span>{{ L[lang].status }}</span>
      <span>{{ L[lang].actions }}</span>
    </div>

    <TransitionGroup name="row" tag="div">
      <div v-for="c in customers" :key="c.id" class="t-row" @click="emit('view', c)">

        <!-- Customer -->
        <div class="customer-cell">
          <div class="avatar" :style="{ background: avatarColor(c.name) }">{{ initials(c.name) }}</div>
          <div class="cinfo">
            <p class="cname">{{ c.name }}</p>
            <p class="cid">{{ c.id }}</p>
          </div>
        </div>

        <!-- Contact -->
        <div class="contact-cell hide-sm">
          <p class="cemail">{{ c.email }}</p>
          <p class="cphone">{{ c.phone }}</p>
        </div>

        <!-- Orders count -->
        <span class="orders-num">{{ c.totalOrders }}</span>

        <!-- Spent -->
        <span class="spent">${{ c.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>

        <!-- Joined -->
        <span class="dim hide-sm">{{ c.joined }}</span>

        <!-- Status -->
        <span class="pill" :style="{ color: STATUS[c.status].color, background: STATUS[c.status].bg }">
          {{ STATUS[c.status][lang] }}
        </span>

        <!-- Actions -->
        <div class="actions" @click.stop>
          <button class="action-btn view-btn"   @click="emit('view', c)"   :title="lang==='tk' ? 'Gör'      : 'Просмотр'">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button class="action-btn edit-btn"   @click="emit('edit', c)"   :title="lang==='tk' ? 'Üýtget'   : 'Редактировать'">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="action-btn del-btn"    @click="emit('delete', c)" :title="lang==='tk' ? 'Poz'      : 'Удалить'">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>

      </div>
    </TransitionGroup>

    <div v-if="customers.length === 0" class="empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      <p>{{ lang === 'tk' ? 'Müşderi tapylmady' : 'Клиенты не найдены' }}</p>
    </div>
  </div>
</template>

<style scoped>
.table-wrap { background: var(--white); border-radius: var(--radius-xl); border: 1.5px solid var(--border-light); box-shadow: var(--shadow-sm); overflow: hidden; }

.t-head, .t-row {
  display: grid;
  grid-template-columns: 1.6fr 1.4fr 80px 110px 110px 120px 100px;
  padding: 10px 22px; gap: 8px; align-items: center;
}
.t-head { background: var(--surface); border-bottom: 1px solid var(--border-light); font-size: 10px; font-weight: 700; color: var(--subtle); text-transform: uppercase; letter-spacing: .06em; }
.t-row  { border-bottom: 1px solid var(--border-light); transition: background .12s; cursor: pointer; padding-top: 13px; padding-bottom: 13px; }
.t-row:last-child { border-bottom: none; }
.t-row:hover { background: var(--surface); }

/* Customer cell */
.customer-cell { display: flex; align-items: center; gap: 10px; min-width: 0; }
.avatar { width: 36px; height: 36px; border-radius: var(--radius-md); color: #fff; font-size: 12px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-family: var(--font-body); }
.cname  { font-size: 13px; font-weight: 700; color: var(--dark); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 1px; }
.cid    { font-size: 11px; color: var(--subtle); }

/* Contact */
.contact-cell { min-width: 0; }
.cemail { font-size: 12px; color: var(--dark); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px; }
.cphone { font-size: 11px; color: var(--subtle); }

/* Numbers */
.orders-num { font-size: 13px; font-weight: 700; color: var(--gold); font-family: var(--font-display); }
.spent      { font-size: 13px; font-weight: 700; color: var(--dark); font-family: var(--font-display); }
.dim        { font-size: 12px; color: var(--muted); }

/* Status */
.pill { display: inline-flex; padding: 3px 9px; border-radius: var(--radius-pill); font-size: 11px; font-weight: 700; white-space: nowrap; width: fit-content; }

/* Actions */
.actions { display: flex; gap: 5px; }
.action-btn { width: 28px; height: 28px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--surface); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .15s; color: var(--muted); }
.action-btn svg { width: 13px; height: 13px; }
.view-btn:hover { border-color: var(--gold);  color: var(--gold);  background: var(--gold-glow); }
.edit-btn:hover { border-color: #3B82F6;       color: #3B82F6;      background: rgba(59,130,246,.1); }
.del-btn:hover  { border-color: var(--error);  color: var(--error); background: var(--error-bg); }

/* Empty */
.empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 60px 20px; color: var(--subtle); }
.empty svg { width: 40px; height: 40px; opacity: .35; }
.empty p { font-size: 14px; font-weight: 600; }

/* Row transition */
.row-enter-active, .row-leave-active { transition: opacity .18s, transform .18s; }
.row-enter-from, .row-leave-to { opacity: 0; transform: translateX(-6px); }

@media (max-width: 1050px) {
  .t-head, .t-row { grid-template-columns: 1.4fr 80px 110px 120px 100px; }
  .hide-sm { display: none !important; }
}
@media (max-width: 640px) {
  .t-head, .t-row { grid-template-columns: 1fr 90px 110px 80px; }
  .orders-num { display: none; }
}
</style>
