<script setup lang="ts">
import type { OrderItem, OrderStatus, Lang } from '@/types'

defineProps<{ orders: OrderItem[]; lang: Lang }>()

const emit = defineEmits<{
  (e: 'view',   order: OrderItem): void
  (e: 'delete', order: OrderItem): void
}>()

const STATUS_CONFIG: Record<OrderStatus, { color: string; bg: string; tk: string; ru: string }> = {
  PENDING:    { color: '#F59E0B', bg: 'rgba(245,158,11,.12)',  tk: 'Garaşylýar',  ru: 'Ожидает'      },
  PROCESSING: { color: '#3B82F6', bg: 'rgba(59,130,246,.12)',  tk: 'Işlenýär',    ru: 'В обработке'  },
  SHIPPED:    { color: '#8B5CF6', bg: 'rgba(139,92,246,.12)',  tk: 'Iberildi',    ru: 'Отправлен'    },
  DELIVERED:  { color: '#22C55E', bg: 'rgba(34,197,94,.12)',   tk: 'Eltildi',     ru: 'Доставлен'    },
  CANCELLED:  { color: '#EF4444', bg: 'rgba(239,68,68,.12)',   tk: 'Ýatyryldy',  ru: 'Отменён'      },
}

const L = {
  tk: { id: 'Sargyt №', customer: 'Müşderi', items: 'Haryt', total: 'Jemi', status: 'Ýagdaý', date: 'Sene', actions: 'Hereketler', ea: 'sany' },
  ru: { id: 'Заказ №',  customer: 'Клиент',  items: 'Товары', total: 'Итого', status: 'Статус', date: 'Дата', actions: 'Действия',  ea: 'шт.'  },
}
</script>

<template>
  <div class="table-wrap">
    <div class="t-head">
      <span>{{ L[lang].id }}</span>
      <span>{{ L[lang].customer }}</span>
      <span class="hide-sm">{{ L[lang].items }}</span>
      <span>{{ L[lang].total }}</span>
      <span>{{ L[lang].status }}</span>
      <span class="hide-sm">{{ L[lang].date }}</span>
      <span>{{ L[lang].actions }}</span>
    </div>

    <TransitionGroup name="row" tag="div">
      <div v-for="o in orders" :key="o.id" class="t-row" @click="emit('view', o)">
        <span class="oid">{{ o.id }}</span>
        <div class="customer-cell">
          <div class="avatar">{{ o.customer[0] }}</div>
          <div>
            <p class="customer-name">{{ o.customer }}</p>
            <p class="customer-email hide-sm">{{ o.email }}</p>
          </div>
        </div>
        <span class="dim hide-sm">{{ o.lines.length }} {{ L[lang].ea }}</span>
        <span class="bold">${{ o.total.toFixed(2) }}</span>
        <span class="pill" :style="{ color: STATUS_CONFIG[o.status].color, background: STATUS_CONFIG[o.status].bg }">
          {{ STATUS_CONFIG[o.status][lang] }}
        </span>
        <span class="dim hide-sm">{{ o.date }}</span>
        <div class="actions" @click.stop>
          <button class="action-btn view-btn" @click="emit('view', o)" :title="lang === 'tk' ? 'Gör' : 'Просмотр'">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button class="action-btn del-btn" @click="emit('delete', o)" :title="lang === 'tk' ? 'Poz' : 'Удалить'">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      </div>
    </TransitionGroup>

    <div v-if="orders.length === 0" class="empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
      <p>{{ lang === 'tk' ? 'Sargyt tapylmady' : 'Заказы не найдены' }}</p>
    </div>
  </div>
</template>

<style scoped>
.table-wrap { background: var(--white); border-radius: var(--radius-xl); border: 1.5px solid var(--border-light); box-shadow: var(--shadow-sm); overflow: hidden; }

.t-head, .t-row {
  display: grid;
  grid-template-columns: 110px 1fr 80px 90px 120px 100px 80px;
  padding: 10px 22px; gap: 8px; align-items: center;
}
.t-head { background: var(--surface); border-bottom: 1px solid var(--border-light); font-size: 10px; font-weight: 700; color: var(--subtle); text-transform: uppercase; letter-spacing: .06em; }
.t-row { border-bottom: 1px solid var(--border-light); transition: background .12s; cursor: pointer; padding-top: 13px; padding-bottom: 13px; }
.t-row:last-child { border-bottom: none; }
.t-row:hover { background: var(--surface); }

.oid { font-size: 13px; font-weight: 700; color: var(--gold); }

.customer-cell { display: flex; align-items: center; gap: 10px; min-width: 0; }
.avatar { width: 32px; height: 32px; border-radius: var(--radius-md); background: linear-gradient(135deg, var(--gold), var(--gold-dark)); color: white; font-size: 13px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-family: var(--font-body); }
.customer-name  { font-size: 13px; font-weight: 600; color: var(--dark); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.customer-email { font-size: 11px; color: var(--subtle); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.bold { font-size: 13px; font-weight: 700; color: var(--dark); font-family: var(--font-display); }
.dim  { font-size: 12px; color: var(--muted); }
.pill { display: inline-flex; padding: 3px 9px; border-radius: var(--radius-pill); font-size: 11px; font-weight: 700; white-space: nowrap; width: fit-content; }

.actions { display: flex; gap: 6px; }
.action-btn { width: 30px; height: 30px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--surface); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .15s; color: var(--muted); }
.action-btn svg { width: 14px; height: 14px; }
.view-btn:hover { border-color: var(--gold);  color: var(--gold);  background: var(--gold-glow); }
.del-btn:hover  { border-color: var(--error); color: var(--error); background: var(--error-bg);  }

.empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 60px 20px; color: var(--subtle); }
.empty svg { width: 40px; height: 40px; opacity: .35; }
.empty p { font-size: 14px; font-weight: 600; }

.row-enter-active, .row-leave-active { transition: opacity .18s, transform .18s; }
.row-enter-from, .row-leave-to { opacity: 0; transform: translateX(-6px); }

@media (max-width: 960px) {
  .t-head, .t-row { grid-template-columns: 100px 1fr 90px 120px 80px; }
  .hide-sm { display: none !important; }
}
@media (max-width: 600px) {
  .t-head, .t-row { grid-template-columns: 1fr 90px 120px 72px; }
  .oid { display: none; }
}
</style>
