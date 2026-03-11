<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Lang } from '@/types'

const props = defineProps<{
  lang: Lang
  items: { label: Record<Lang, string>; value: number; color: string }[]
}>()

const hovered = ref<number | null>(null)
const total   = computed(() => props.items.reduce((s, i) => s + i.value, 0))

// SVG donut math (cx=60, cy=60, r=46, gap=3deg)
const CX = 60; const CY = 60; const R = 46; const GAP_DEG = 2
function toRad(d: number) { return (d * Math.PI) / 180 }

const slices = computed(() => {
  let start = -90
  return props.items.map((item, idx) => {
    const pct   = item.value / total.value
    const sweep = pct * 360 - GAP_DEG
    const s     = toRad(start)
    const e     = toRad(start + sweep)
    const large = sweep > 180 ? 1 : 0
    const x1 = CX + R * Math.cos(s); const y1 = CY + R * Math.sin(s)
    const x2 = CX + R * Math.cos(e); const y2 = CY + R * Math.sin(e)
    const path = `M ${CX} ${CY} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`
    start += pct * 360
    return { ...item, path, pct, idx }
  })
})

const L = {
  tk: { title: 'Kategoriýa boýunça', share: 'paý' },
  ru: { title: 'По категориям',      share: 'доля' },
}
</script>

<template>
  <div class="card">
    <p class="sub-label">{{ L[lang].title }}</p>

    <div class="body">
      <!-- Donut -->
      <div class="donut-wrap">
        <svg viewBox="0 0 120 120" class="donut-svg">
          <path v-for="s in slices" :key="s.idx"
            :d="s.path"
            :fill="s.color"
            :opacity="hovered === null || hovered === s.idx ? 1 : 0.35"
            style="transition: opacity .18s"
            @mouseenter="hovered = s.idx"
            @mouseleave="hovered = null"
          />
          <!-- Inner hole -->
          <circle cx="60" cy="60" r="30" fill="white" />
          <!-- Center text -->
          <text x="60" y="57" text-anchor="middle" font-size="11" font-weight="700" fill="#0F1117">
            {{ hovered !== null ? Math.round(slices[hovered].pct * 100) + '%' : total.toLocaleString() }}
          </text>
          <text x="60" y="70" text-anchor="middle" font-size="8" fill="#9CA3AF">
            {{ hovered !== null ? L[lang].share : (lang === 'tk' ? 'sargyt' : 'заказов') }}
          </text>
        </svg>
      </div>

      <!-- Legend -->
      <div class="legend">
        <div v-for="(item, i) in items" :key="i" class="legend-row"
          :style="{ opacity: hovered === null || hovered === i ? 1 : .4 }"
          @mouseenter="hovered = i" @mouseleave="hovered = null">
          <span class="legend-dot" :style="{ background: item.color }" />
          <span class="legend-label">{{ item.label[lang] }}</span>
          <span class="legend-pct">{{ Math.round((item.value / total) * 100) }}%</span>
          <span class="legend-val">{{ item.value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card { background: var(--white); border-radius: var(--radius-xl); border: 1.5px solid var(--border-light); box-shadow: var(--shadow-sm); padding: 22px; }
.sub-label { font-size: 11px; font-weight: 700; color: var(--subtle); text-transform: uppercase; letter-spacing: .05em; margin-bottom: 18px; }

.body { display: flex; align-items: center; gap: 24px; }
.donut-wrap { flex-shrink: 0; width: 130px; }
.donut-svg { width: 100%; cursor: pointer; }

.legend { flex: 1; display: flex; flex-direction: column; gap: 10px; }
.legend-row { display: flex; align-items: center; gap: 8px; cursor: pointer; transition: opacity .18s; }
.legend-dot   { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }
.legend-label { flex: 1; font-size: 13px; color: var(--dark); font-weight: 500; }
.legend-pct   { font-size: 12px; font-weight: 700; color: var(--muted); min-width: 32px; text-align: right; }
.legend-val   { font-size: 12px; font-weight: 700; color: var(--dark); font-family: var(--font-display); min-width: 36px; text-align: right; }
</style>
