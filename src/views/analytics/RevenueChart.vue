<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Lang } from '@/types'

const props = defineProps<{
  lang:   Lang
  points: { label: string; value: number }[]
}>()

const W = 600
const H = 180
const PAD = { top: 16, right: 16, bottom: 28, left: 48 }

const plotW = computed(() => W - PAD.left - PAD.right)
const plotH = computed(() => H - PAD.top - PAD.bottom)

const maxVal = computed(() => Math.max(...props.points.map(p => p.value), 1))
const minVal = computed(() => Math.min(...props.points.map(p => p.value)))

function x(i: number) { return PAD.left + (i / (props.points.length - 1)) * plotW.value }
function y(v: number) { return PAD.top + (1 - (v - minVal.value) / (maxVal.value - minVal.value || 1)) * plotH.value }

const linePath = computed(() =>
  props.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`).join(' ')
)
const areaPath = computed(() => {
  const baseline = PAD.top + plotH.value
  return [
    ...props.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`),
    `L ${x(props.points.length - 1).toFixed(1)} ${baseline}`,
    `L ${x(0).toFixed(1)} ${baseline}`,
    'Z',
  ].join(' ')
})

const yTicks = computed(() => {
  const range = maxVal.value - minVal.value || maxVal.value
  const step  = Math.ceil(range / 4 / 1000) * 1000 || Math.ceil(range / 4)
  return [0, 1, 2, 3, 4].map(i => minVal.value + step * i)
})

function fmt(v: number) { return v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}` }

const hovered = ref<number | null>(null)
const L = { tk: { title: 'Girdeji dinamikasy', total: 'Döwür üçin jemi' }, ru: { title: 'Динамика выручки', total: 'Итого за период' } }
const total = computed(() => props.points.reduce((s, p) => s + p.value, 0))
</script>

<template>
  <div class="card">
    <div class="card-head">
      <div>
        <p class="sub-label">{{ L[lang].title }}</p>
        <p class="total-val">${{ total.toLocaleString() }} <span class="sub-dim">{{ L[lang].total }}</span></p>
      </div>
      <div class="legend">
        <span class="legend-line" />
        {{ lang === 'tk' ? 'Girdeji' : 'Выручка' }}
      </div>
    </div>

    <div class="chart-wrap">
      <svg :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none" class="svg">
        <defs>
          <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stop-color="#E8A020" stop-opacity=".22"/>
            <stop offset="100%" stop-color="#E8A020" stop-opacity="0"/>
          </linearGradient>
        </defs>

        <!-- Grid lines -->
        <line v-for="t in yTicks" :key="t"
          :x1="PAD.left" :x2="W - PAD.right"
          :y1="y(t)" :y2="y(t)"
          stroke="#E5E7EB" stroke-width="1"
        />

        <!-- Y axis labels -->
        <text v-for="t in yTicks" :key="'l'+t"
          :x="PAD.left - 6" :y="y(t) + 4"
          text-anchor="end" font-size="10" fill="#9CA3AF">{{ fmt(t) }}</text>

        <!-- Area fill -->
        <path :d="areaPath" fill="url(#area-grad)" />

        <!-- Line -->
        <path :d="linePath" fill="none" stroke="#E8A020" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>

        <!-- X labels -->
        <text v-for="(p, i) in points" :key="'x'+i"
          :x="x(i)" :y="H - 6"
          text-anchor="middle" font-size="10" fill="#9CA3AF">{{ p.label }}</text>

        <!-- Hover dots + hitbox -->
        <g v-for="(p, i) in points" :key="'h'+i">
          <circle
            v-if="hovered === i"
            :cx="x(i)" :cy="y(p.value)" r="5"
            fill="#E8A020" stroke="white" stroke-width="2"
          />
          <rect
            :x="x(i) - 16" :y="PAD.top" width="32" :height="plotH"
            fill="transparent" style="cursor:crosshair"
            @mouseenter="hovered = i" @mouseleave="hovered = null"
          />
        </g>

        <!-- Tooltip -->
        <g v-if="hovered !== null">
          <rect
            :x="Math.min(Math.max(x(hovered) - 36, PAD.left), W - PAD.right - 72)"
            :y="y(points[hovered].value) - 38"
            width="72" height="26" rx="6"
            fill="#0F1117"
          />
          <text
            :x="Math.min(Math.max(x(hovered), PAD.left + 36), W - PAD.right - 36)"
            :y="y(points[hovered].value) - 20"
            text-anchor="middle" font-size="11" fill="#E8A020" font-weight="700">
            {{ fmt(points[hovered].value) }}
          </text>
        </g>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.card { background: var(--white); border-radius: var(--radius-xl); border: 1.5px solid var(--border-light); box-shadow: var(--shadow-sm); padding: 22px; }
.card-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px; }
.sub-label { font-size: 11px; font-weight: 700; color: var(--subtle); text-transform: uppercase; letter-spacing: .05em; margin-bottom: 4px; }
.total-val { font-family: var(--font-display); font-size: 24px; font-weight: 700; color: var(--dark); }
.sub-dim   { font-family: var(--font-body); font-size: 12px; color: var(--subtle); margin-left: 4px; }
.legend { display: flex; align-items: center; gap: 7px; font-size: 12px; font-weight: 600; color: var(--muted); }
.legend-line { display: inline-block; width: 22px; height: 3px; background: linear-gradient(90deg, var(--gold), var(--gold-dark)); border-radius: 2px; }
.chart-wrap { width: 100%; }
.svg { width: 100%; height: auto; display: block; overflow: visible; }
</style>
