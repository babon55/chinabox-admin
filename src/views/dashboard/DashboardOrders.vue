<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { Order, OrderStatus, Lang } from '@/types'

defineProps<{ orders: Order[]; lang: Lang }>()

const L = {
  tk: { title: 'Soňky sargytlar', viewAll: 'Hemmesini gör', id: 'Sargyt №', customer: 'Müşderi', items: 'Haryt', total: 'Jemi', status: 'Ýagdaý', date: 'Sene', ea: 'sany' },
  ru: { title: 'Последние заказы', viewAll: 'Смотреть все', id: 'Заказ №',  customer: 'Клиент',  items: 'Товары', total: 'Итого', status: 'Статус', date: 'Дата', ea: 'шт.'  },
}

const S: Record<OrderStatus, { color: string; bg: string; tk: string; ru: string }> = {
  pending:    { color: '#F59E0B', bg: 'rgba(245,158,11,.12)', tk: 'Garaşylýar', ru: 'Ожидает'     },
  processing: { color: '#3B82F6', bg: 'rgba(59,130,246,.12)', tk: 'Işlenýär',   ru: 'В обработке' },
  shipped:    { color: '#8B5CF6', bg: 'rgba(139,92,246,.12)', tk: 'Iberildi',   ru: 'Отправлен'   },
  delivered:  { color: '#22C55E', bg: 'rgba(34,197,94,.12)',  tk: 'Eltildi',    ru: 'Доставлен'   },
  cancelled:  { color: '#EF4444', bg: 'rgba(239,68,68,.12)',  tk: 'Ýatyryldy', ru: 'Отменён'     },
}
</script>

<template>
  <div class="card">
    <div class="card-head">
      <h3>{{ L[lang].title }}</h3>
      <RouterLink to="/orders" class="view-all">
        {{ L[lang].viewAll }}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </RouterLink>
    </div>
    <div class="t-head">
      <span>{{ L[lang].id }}</span>
      <span>{{ L[lang].customer }}</span>
      <span class="h-sm">{{ L[lang].items }}</span>
      <span>{{ L[lang].total }}</span>
      <span>{{ L[lang].status }}</span>
      <span class="h-sm">{{ L[lang].date }}</span>
    </div>
    <div v-for="o in orders" :key="o.id" class="t-row">
      <span class="oid">{{ o.id }}</span>
      <span class="name">{{ o.customer }}</span>
      <span class="dim h-sm">{{ o.items }} {{ L[lang].ea }}</span>
      <span class="bold">${{ o.total.toFixed(2) }}</span>
      <span class="pill" :style="{ color: S[o.status].color, background: S[o.status].bg }">{{ S[o.status][lang] }}</span>
      <span class="dim h-sm">{{ o.date }}</span>
    </div>
  </div>
</template>

<style scoped>
.card { background: var(--white); border-radius: var(--radius-xl); border: 1.5px solid var(--border-light); box-shadow: var(--shadow-sm); overflow: hidden; }
.card-head { display: flex; align-items: center; justify-content: space-between; padding: 18px 22px; border-bottom: 1px solid var(--border-light); }
.card-head h3 { font-family: var(--font-display); font-size: 16px; font-weight: 700; color: var(--dark); }
.view-all { display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 700; color: var(--gold); text-decoration: none; transition: gap .15s; }
.view-all svg { width: 12px; height: 12px; }
.view-all:hover { gap: 7px; }
.t-head, .t-row { display: grid; grid-template-columns: 108px 1fr 70px 86px 110px 96px; padding: 10px 22px; align-items: center; }
.t-head { background: var(--surface); font-size: 10px; font-weight: 700; color: var(--subtle); text-transform: uppercase; letter-spacing: .06em; border-bottom: 1px solid var(--border-light); }
.t-row { border-bottom: 1px solid var(--border-light); transition: background .12s; }
.t-row:last-child { border-bottom: none; }
.t-row:hover { background: var(--surface); }
.oid  { font-size: 13px; font-weight: 700; color: var(--gold); }
.name { font-size: 13px; font-weight: 600; color: var(--dark); }
.bold { font-size: 13px; font-weight: 700; color: var(--dark); font-family: var(--font-display); }
.dim  { font-size: 12px; color: var(--muted); }
.pill { display: inline-flex; padding: 3px 9px; border-radius: var(--radius-pill); font-size: 11px; font-weight: 700; white-space: nowrap; width: fit-content; }
@media (max-width: 860px) {
  .t-head, .t-row { grid-template-columns: 1fr 86px 110px; }
  .h-sm, .oid { display: none; }
}
</style>
