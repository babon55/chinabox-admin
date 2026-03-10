<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { Product, Lang } from '@/types'

const props = defineProps<{ products: Product[]; lang: Lang }>()
const maxSold = computed(() => Math.max(...props.products.map(p => p.sold)))

const L = {
  tk: { title: 'Iň köp satylýan', viewAll: 'Hemmesini gör', sold: 'Satyldy', stock: 'Stok'    },
  ru: { title: 'Топ продаваемых',  viewAll: 'Смотреть все',  sold: 'Продано', stock: 'Остаток' },
}
</script>

<template>
  <div class="card">
    <div class="card-head">
      <h3>{{ L[lang].title }}</h3>
      <RouterLink to="/products" class="view-all">
        {{ L[lang].viewAll }}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </RouterLink>
    </div>
    <div v-for="(p, i) in products" :key="p.id" class="row">
      <span :class="['rank', `r${i+1}`]">{{ i + 1 }}</span>
      <div class="thumb">{{ p.image }}</div>
      <div class="info">
        <span class="pname">{{ p.name[lang] }}</span>
        <div class="bar-row">
          <div class="track"><div class="fill" :style="{ width: Math.round((p.sold/maxSold)*100)+'%' }" /></div>
          <span class="sold">{{ p.sold }} {{ L[lang].sold }}</span>
        </div>
      </div>
      <div class="rev">
        <span class="rev-val">${{ p.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
        <span class="stock">{{ L[lang].stock }}: {{ p.stock }}</span>
      </div>
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
.row { display: flex; align-items: center; gap: 12px; padding: 13px 22px; border-bottom: 1px solid var(--border-light); transition: background .12s; }
.row:last-child { border-bottom: none; }
.row:hover { background: var(--surface); }
.rank { width: 22px; height: 22px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; flex-shrink: 0; background: var(--border-light); color: var(--subtle); }
.r1 { background: rgba(232,160,32,.15); color: var(--gold); }
.r2 { background: rgba(156,163,175,.15); color: #6B7280; }
.r3 { background: rgba(180,120,60,.15);  color: #B47C3C; }
.thumb { width: 40px; height: 40px; border-radius: var(--radius-md); background: var(--surface); display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
.info { flex: 1; min-width: 0; }
.pname { display: block; font-size: 13px; font-weight: 700; color: var(--dark); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 5px; }
.bar-row { display: flex; align-items: center; gap: 7px; }
.track { flex: 1; height: 4px; background: var(--border-light); border-radius: 3px; overflow: hidden; }
.fill  { height: 100%; background: linear-gradient(90deg, var(--gold), var(--gold-dark)); border-radius: 3px; transition: width .5s ease; }
.sold  { font-size: 11px; color: var(--subtle); white-space: nowrap; }
.rev { text-align: right; flex-shrink: 0; }
.rev-val { display: block; font-family: var(--font-display); font-size: 14px; font-weight: 700; color: var(--dark); }
.stock { font-size: 11px; color: var(--subtle); }
</style>
