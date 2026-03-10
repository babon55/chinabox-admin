<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ChartPoint, Lang } from '@/types'

const props = defineProps<{ points: ChartPoint[]; lang: Lang; title: string }>()
const maxVal  = computed(() => Math.max(...props.points.map(p => p.value)))
const total   = computed(() => props.points.reduce((s, p) => s + p.value, 0))
const hovered = ref<number | null>(null)

function pct(v: number) { return Math.round((v / maxVal.value) * 100) }
function fmt(v: number) { return v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}` }
</script>

<template>
  <div class="card">
    <div class="head">
      <div>
        <p class="sub-label">{{ title }}</p>
        <p class="total">${{ total.toLocaleString() }} <span class="period">{{ lang === 'tk' ? 'bu hepde' : 'эта неделя' }}</span></p>
      </div>
      <span class="legend"><span class="legend-dot" />{{ lang === 'tk' ? 'Girdeji' : 'Выручка' }}</span>
    </div>

    <div class="body">
      <div class="y-axis">
        <span v-for="t in [maxVal, maxVal*.75, maxVal*.5, maxVal*.25, 0]" :key="t">{{ fmt(t) }}</span>
      </div>
      <div class="plot">
        <div class="gridlines">
          <div v-for="i in 5" :key="i" class="gridline" />
        </div>
        <div class="bars">
          <div
            v-for="(p, i) in points" :key="i"
            class="col"
            @mouseenter="hovered = i"
            @mouseleave="hovered = null"
          >
            <Transition name="tt">
              <div v-if="hovered === i" class="tooltip">
                <span class="tt-day">{{ p.label }}</span>
                <span class="tt-val">{{ fmt(p.value) }}</span>
              </div>
            </Transition>
            <div class="track">
              <div class="bar" :class="{ lit: hovered === i }" :style="{ height: pct(p.value) + '%' }" />
            </div>
            <span class="x-label">{{ p.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card { background: var(--white); border-radius: var(--radius-xl); border: 1.5px solid var(--border-light); box-shadow: var(--shadow-sm); padding: 22px; }
.head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
.sub-label { font-size: 11px; font-weight: 600; color: var(--subtle); text-transform: uppercase; letter-spacing: .05em; margin-bottom: 4px; }
.total { font-family: var(--font-display); font-size: 24px; font-weight: 700; color: var(--dark); }
.period { font-family: var(--font-body); font-size: 12px; color: var(--subtle); margin-left: 6px; }
.legend { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: var(--muted); }
.legend-dot { width: 9px; height: 9px; border-radius: 50%; background: linear-gradient(135deg, var(--gold), var(--gold-dark)); }

.body { display: flex; gap: 10px; height: 190px; }
.y-axis { display: flex; flex-direction: column; justify-content: space-between; padding-bottom: 22px; font-size: 10px; font-weight: 500; color: var(--subtle); white-space: nowrap; }
.plot { flex: 1; position: relative; display: flex; flex-direction: column; }
.gridlines { position: absolute; inset: 0; padding-bottom: 22px; display: flex; flex-direction: column; justify-content: space-between; pointer-events: none; }
.gridline { height: 1px; background: var(--border-light); }
.bars { flex: 1; display: flex; align-items: flex-end; gap: 8px; padding-bottom: 22px; position: relative; z-index: 1; }
.col { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; position: relative; cursor: pointer; }
.track { flex: 1; display: flex; align-items: flex-end; width: 100%; }
.bar { width: 100%; max-width: 36px; margin: 0 auto; border-radius: 5px 5px 0 0; background: linear-gradient(to top, var(--gold), var(--gold-dark)); opacity: .55; transition: opacity .18s, box-shadow .18s; min-height: 3px; }
.bar.lit { opacity: 1; box-shadow: 0 -4px 14px var(--gold-shadow); }
.x-label { position: absolute; bottom: 0; font-size: 10px; font-weight: 600; color: var(--subtle); }
.tooltip { position: absolute; bottom: calc(100% - 20px); left: 50%; transform: translateX(-50%); background: var(--dark); border-radius: var(--radius-md); padding: 5px 10px; display: flex; flex-direction: column; align-items: center; pointer-events: none; white-space: nowrap; z-index: 10; }
.tooltip::after { content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%); border: 5px solid transparent; border-top-color: var(--dark); }
.tt-day { font-size: 10px; color: rgba(255,255,255,.5); }
.tt-val { font-size: 12px; font-weight: 700; color: var(--gold); }
.tt-enter-active, .tt-leave-active { transition: opacity .1s, transform .1s; }
.tt-enter-from,   .tt-leave-to     { opacity: 0; transform: translateX(-50%) translateY(4px); }
</style>
