<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Lang } from '@/types'

const props = defineProps<{
  lang:   Lang
  points: { label: string; value: number }[]
}>()

const hovered = ref<number | null>(null)
const maxVal  = computed(() => Math.max(...props.points.map(p => p.value), 1))
const total   = computed(() => props.points.reduce((s, p) => s + p.value, 0))
const avg     = computed(() => Math.round(total.value / props.points.length))

function pct(v: number) { return Math.round((v / maxVal.value) * 100) }

const L = {
  tk: { title: 'Sargyt dinamikasy', total: 'Jemi sargyt', avg: 'Ortaça' },
  ru: { title: 'Динамика заказов',  total: 'Всего заказов', avg: 'Среднее' },
}
</script>

<template>
  <div class="card">
    <div class="card-head">
      <div>
        <p class="sub-label">{{ L[lang].title }}</p>
        <p class="total-val">{{ total.toLocaleString() }} <span class="sub-dim">{{ L[lang].total }}</span></p>
      </div>
      <div class="avg-badge">
        ∅ {{ avg }} / {{ lang === 'tk' ? 'döwür' : 'период' }}
      </div>
    </div>

    <div class="bars-wrap">
      <div v-for="(p, i) in points" :key="i" class="col"
        @mouseenter="hovered = i" @mouseleave="hovered = null">

        <Transition name="tt">
          <div v-if="hovered === i" class="tooltip">
            <span class="tt-label">{{ p.label }}</span>
            <span class="tt-val">{{ p.value }}</span>
          </div>
        </Transition>

        <div class="track">
          <div class="bar" :class="{ lit: hovered === i }"
            :style="{ height: pct(p.value) + '%' }" />
        </div>
        <span class="x-label">{{ p.label }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card { background: var(--white); border-radius: var(--radius-xl); border: 1.5px solid var(--border-light); box-shadow: var(--shadow-sm); padding: 22px; }
.card-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
.sub-label { font-size: 11px; font-weight: 700; color: var(--subtle); text-transform: uppercase; letter-spacing: .05em; margin-bottom: 4px; }
.total-val { font-family: var(--font-display); font-size: 24px; font-weight: 700; color: var(--dark); }
.sub-dim   { font-family: var(--font-body); font-size: 12px; color: var(--subtle); margin-left: 4px; }
.avg-badge { padding: 5px 12px; border-radius: var(--radius-pill); background: rgba(59,130,246,.1); color: #3B82F6; font-size: 12px; font-weight: 700; white-space: nowrap; }

.bars-wrap { display: flex; align-items: flex-end; gap: 6px; height: 160px; }
.col { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; position: relative; cursor: pointer; }
.track { flex: 1; display: flex; align-items: flex-end; width: 100%; padding-bottom: 20px; }
.bar { width: 100%; max-width: 40px; margin: 0 auto; border-radius: 5px 5px 0 0; background: linear-gradient(to top, #3B82F6, #60A5FA); opacity: .55; transition: opacity .18s, box-shadow .18s; min-height: 3px; }
.bar.lit { opacity: 1; box-shadow: 0 -4px 14px rgba(59,130,246,.35); }
.x-label { position: absolute; bottom: 0; font-size: 10px; font-weight: 600; color: var(--subtle); white-space: nowrap; }

.tooltip { position: absolute; bottom: calc(100% - 18px); left: 50%; transform: translateX(-50%); background: var(--dark); border-radius: var(--radius-md); padding: 4px 9px; display: flex; flex-direction: column; align-items: center; pointer-events: none; white-space: nowrap; z-index: 10; }
.tooltip::after { content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%); border: 4px solid transparent; border-top-color: var(--dark); }
.tt-label { font-size: 10px; color: rgba(255,255,255,.5); }
.tt-val   { font-size: 12px; font-weight: 700; color: #60A5FA; }
.tt-enter-active, .tt-leave-active { transition: opacity .1s, transform .1s; }
.tt-enter-from, .tt-leave-to { opacity: 0; transform: translateX(-50%) translateY(4px); }
</style>
