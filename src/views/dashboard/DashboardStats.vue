<script setup lang="ts">
import type { StatCard, Lang } from '@/types'
defineProps<{ cards: StatCard[]; lang: Lang }>()
</script>

<template>
  <div class="grid">
    <div v-for="c in cards" :key="c.key" class="card">
      <div class="card-icon" :style="{ background: c.color + '18', color: c.color }">
        <svg v-if="c.icon==='revenue'"   viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        <svg v-if="c.icon==='orders'"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        <svg v-if="c.icon==='customers'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <svg v-if="c.icon==='products'"  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
      </div>
      <div class="card-body">
        <p class="card-label">{{ c.label[lang] }}</p>
        <p class="card-value">{{ c.value }}</p>
        <p :class="['card-change', c.change >= 0 ? 'up' : 'down']">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline v-if="c.change >= 0" points="18 15 12 9 6 15"/>
            <polyline v-else               points="6 9 12 15 18 9"/>
          </svg>
          {{ Math.abs(c.change) }}%
        </p>
      </div>
      <div class="spark">
        <div v-for="i in 7" :key="i" class="spark-bar"
          :style="{ height: (28 + Math.sin(i * 1.4 + c.key.length) * 26 + i * 4) + '%', background: c.color, opacity: .2 + i * .11 }"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
.card {
  background: var(--white); border-radius: var(--radius-xl);
  border: 1.5px solid var(--border-light); box-shadow: var(--shadow-sm);
  padding: 20px; display: flex; flex-direction: column; gap: 12px;
  overflow: hidden; transition: box-shadow .2s, transform .2s;
}
.card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
.card-icon { width: 44px; height: 44px; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.card-icon svg { width: 20px; height: 20px; }
.card-label { font-size: 11px; font-weight: 600; color: var(--subtle); text-transform: uppercase; letter-spacing: .05em; margin-bottom: 4px; }
.card-value { font-family: var(--font-display); font-size: 26px; font-weight: 700; color: var(--dark); line-height: 1; }
.card-change { display: inline-flex; align-items: center; gap: 3px; font-size: 12px; font-weight: 700; margin-top: 2px; }
.card-change svg { width: 12px; height: 12px; }
.card-change.up   { color: var(--success); }
.card-change.down { color: var(--error); }
.spark { display: flex; align-items: flex-end; gap: 3px; height: 32px; }
.spark-bar { flex: 1; border-radius: 3px 3px 0 0; min-height: 3px; }
@media (max-width: 1100px) { .grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 560px)  { .grid { grid-template-columns: 1fr; } }
</style>
