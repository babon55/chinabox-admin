<script setup lang="ts">
import { computed } from 'vue'
import type { Lang } from '@/types'

const props = defineProps<{
  lang:  Lang
  items: { name: Record<Lang, string>; image: string; sold: number; revenue: number }[]
}>()

const maxSold = computed(() => Math.max(...props.items.map(i => i.sold), 1))

const RANK_STYLE = [
  { bg: 'rgba(232,160,32,.15)', color: 'var(--gold)'  },
  { bg: 'rgba(156,163,175,.15)', color: '#6B7280' },
  { bg: 'rgba(180,120,60,.15)',  color: '#B47C3C' },
]

const L = {
  tk: { title: 'Iň köp satylýan önümler', sold: 'satyldy', revenue: 'Girdeji' },
  ru: { title: 'Топ продаваемых товаров', sold: 'продано', revenue: 'Выручка' },
}
</script>

<template>
  <div class="card">
    <p class="sub-label">{{ L[lang].title }}</p>

    <div class="list">
      <div v-for="(item, i) in items" :key="i" class="row">
        <!-- Rank -->
        <div class="rank" :style="i < 3 ? RANK_STYLE[i] : { bg: 'var(--surface)', color: 'var(--subtle)' }">
          {{ i + 1 }}
        </div>

        <!-- Thumb -->
        <div class="thumb">{{ item.image }}</div>

        <!-- Info -->
        <div class="info">
          <p class="pname">{{ item.name[lang] }}</p>
          <div class="bar-row">
            <div class="track">
              <div class="fill" :style="{ width: Math.round((item.sold / maxSold) * 100) + '%' }" />
            </div>
            <span class="sold-label">{{ item.sold }} {{ L[lang].sold }}</span>
          </div>
        </div>

        <!-- Revenue -->
        <div class="revenue">
          <p class="rev-val">${{ item.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</p>
          <p class="rev-label">{{ L[lang].revenue }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card { background: var(--white); border-radius: var(--radius-xl); border: 1.5px solid var(--border-light); box-shadow: var(--shadow-sm); padding: 22px; }
.sub-label { font-size: 11px; font-weight: 700; color: var(--subtle); text-transform: uppercase; letter-spacing: .05em; margin-bottom: 18px; }

.list { display: flex; flex-direction: column; gap: 14px; }
.row  { display: flex; align-items: center; gap: 12px; }

.rank { width: 24px; height: 24px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; flex-shrink: 0; }

.thumb { width: 40px; height: 40px; border-radius: var(--radius-md); background: var(--surface); border: 1.5px solid var(--border-light); display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }

.info  { flex: 1; min-width: 0; }
.pname { font-size: 13px; font-weight: 700; color: var(--dark); margin-bottom: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bar-row { display: flex; align-items: center; gap: 8px; }
.track { flex: 1; height: 5px; background: var(--border-light); border-radius: 3px; overflow: hidden; }
.fill  { height: 100%; background: linear-gradient(90deg, var(--gold), var(--gold-dark)); border-radius: 3px; transition: width .6s cubic-bezier(.4,0,.2,1); }
.sold-label { font-size: 11px; color: var(--subtle); white-space: nowrap; min-width: 72px; text-align: right; }

.revenue { text-align: right; flex-shrink: 0; }
.rev-val   { font-family: var(--font-display); font-size: 14px; font-weight: 700; color: var(--dark); }
.rev-label { font-size: 10px; color: var(--subtle); }
</style>
