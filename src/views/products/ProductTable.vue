<script setup lang="ts">
import type { ProductItem, ProductStatus, Lang } from '@/types'

defineProps<{ products: ProductItem[]; lang: Lang }>()

const emit = defineEmits<{
  (e: 'edit',   product: ProductItem): void
  (e: 'delete', product: ProductItem): void
}>()

const statusStyle: Record<ProductStatus, { color: string; bg: string; tk: string; ru: string }> = {
  active:   { color: '#22C55E', bg: 'rgba(34,197,94,.12)',   tk: 'Işjeň',     ru: 'Активен'    },
  draft:    { color: '#F59E0B', bg: 'rgba(245,158,11,.12)',  tk: 'Taslama',   ru: 'Черновик'   },
  archived: { color: '#9CA3AF', bg: 'rgba(156,163,175,.12)', tk: 'Arhiwlenen', ru: 'Архивирован' },
}

const L = {
  tk: { name: 'Önüm', category: 'Kategoriýa', price: 'Baha', stock: 'Stok', sold: 'Satyldy', status: 'Ýagdaý', actions: 'Hereketler' },
  ru: { name: 'Товар', category: 'Категория',  price: 'Цена', stock: 'Остаток', sold: 'Продано', status: 'Статус', actions: 'Действия'  },
}

function stockClass(stock: number) {
  if (stock === 0)  return 'stock-empty'
  if (stock <= 10)  return 'stock-low'
  return ''
}
</script>

<template>
  <div class="table-wrap">
    <!-- Head -->
    <div class="t-head">
      <span class="col-product">{{ L[lang].name }}</span>
      <span class="col-cat hide-md">{{ L[lang].category }}</span>
      <span class="col-price">{{ L[lang].price }}</span>
      <span class="col-stock">{{ L[lang].stock }}</span>
      <span class="col-sold hide-md">{{ L[lang].sold }}</span>
      <span class="col-status">{{ L[lang].status }}</span>
      <span class="col-actions">{{ L[lang].actions }}</span>
    </div>

    <!-- Rows -->
    <TransitionGroup name="row" tag="div">
      <div v-for="p in products" :key="p.id" class="t-row">

        <!-- Product name + image -->
        <div class="col-product product-cell">
          <div class="thumb">{{ p.image }}</div>
          <div class="product-info">
            <span class="product-name">{{ p.name[lang] }}</span>
            <span class="product-id">ID: {{ p.id }}</span>
          </div>
        </div>

        <!-- Category -->
        <span class="col-cat hide-md cat-label">{{ p.category[lang] }}</span>

        <!-- Price -->
        <span class="col-price price">${{ p.price.toFixed(2) }}</span>

        <!-- Stock -->
        <div class="col-stock stock-cell">
          <span :class="['stock-num', stockClass(p.stock)]">{{ p.stock }}</span>
          <div class="stock-bar">
            <div
              class="stock-fill"
              :class="stockClass(p.stock)"
              :style="{ width: Math.min((p.stock / 200) * 100, 100) + '%' }"
            />
          </div>
        </div>

        <!-- Sold -->
        <span class="col-sold hide-md sold">{{ p.sold }}</span>

        <!-- Status -->
        <span
          class="col-status status-pill"
          :style="{ color: statusStyle[p.status].color, background: statusStyle[p.status].bg }"
        >
          {{ statusStyle[p.status][lang] }}
        </span>

        <!-- Actions -->
        <div class="col-actions actions">
          <button class="action-btn edit" @click="emit('edit', p)" :title="lang === 'tk' ? 'Üýtget' : 'Редактировать'">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="action-btn delete" @click="emit('delete', p)" :title="lang === 'tk' ? 'Poz' : 'Удалить'">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        </div>
      </div>
    </TransitionGroup>

    <!-- Empty state -->
    <div v-if="products.length === 0" class="empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
      <p>{{ lang === 'tk' ? 'Önüm tapylmady' : 'Товары не найдены' }}</p>
    </div>
  </div>
</template>

<style scoped>
.table-wrap { background: var(--white); border-radius: var(--radius-xl); border: 1.5px solid var(--border-light); box-shadow: var(--shadow-sm); overflow: hidden; }

/* Grid columns */
.t-head, .t-row {
  display: grid;
  grid-template-columns: 2fr 1.2fr 90px 110px 80px 110px 80px;
  padding: 0 22px;
  align-items: center;
  gap: 8px;
}

/* Head */
.t-head {
  padding-top: 10px; padding-bottom: 10px;
  background: var(--surface);
  border-bottom: 1px solid var(--border-light);
  font-size: 10px; font-weight: 700;
  color: var(--subtle); text-transform: uppercase; letter-spacing: .06em;
}

/* Row */
.t-row {
  padding-top: 13px; padding-bottom: 13px;
  border-bottom: 1px solid var(--border-light);
  transition: background .12s;
}
.t-row:last-child { border-bottom: none; }
.t-row:hover { background: var(--surface); }

/* Product cell */
.product-cell { display: flex; align-items: center; gap: 12px; min-width: 0; }
.thumb { width: 42px; height: 42px; border-radius: var(--radius-md); background: var(--surface); display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; border: 1.5px solid var(--border-light); }
.product-info { min-width: 0; }
.product-name { display: block; font-size: 13px; font-weight: 700; color: var(--dark); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px; }
.product-id { font-size: 11px; color: var(--subtle); }

/* Category */
.cat-label { font-size: 13px; color: var(--muted); }

/* Price */
.price { font-size: 13px; font-weight: 700; color: var(--dark); font-family: var(--font-display); }

/* Stock */
.stock-cell { display: flex; flex-direction: column; gap: 4px; }
.stock-num { font-size: 13px; font-weight: 700; color: var(--dark); }
.stock-num.stock-low   { color: var(--warning); }
.stock-num.stock-empty { color: var(--error); }
.stock-bar { height: 3px; background: var(--border-light); border-radius: 2px; overflow: hidden; }
.stock-fill { height: 100%; background: var(--success); border-radius: 2px; transition: width .4s ease; }
.stock-fill.stock-low   { background: var(--warning); }
.stock-fill.stock-empty { background: var(--error); }

/* Sold */
.sold { font-size: 13px; color: var(--muted); }

/* Status pill */
.status-pill { display: inline-flex; padding: 3px 9px; border-radius: var(--radius-pill); font-size: 11px; font-weight: 700; white-space: nowrap; width: fit-content; }

/* Actions */
.actions { display: flex; align-items: center; gap: 6px; }
.action-btn {
  width: 30px; height: 30px; border-radius: var(--radius-md);
  border: 1.5px solid var(--border); background: var(--surface);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all .15s; color: var(--muted);
}
.action-btn svg { width: 14px; height: 14px; }
.action-btn.edit:hover   { border-color: var(--gold);  color: var(--gold);  background: var(--gold-glow); }
.action-btn.delete:hover { border-color: var(--error); color: var(--error); background: var(--error-bg);  }

/* Empty state */
.empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 60px 20px; color: var(--subtle); }
.empty svg { width: 40px; height: 40px; opacity: .4; }
.empty p { font-size: 14px; font-weight: 600; }

/* Row transition */
.row-enter-active, .row-leave-active { transition: opacity .2s, transform .2s; }
.row-enter-from, .row-leave-to { opacity: 0; transform: translateX(-8px); }
.row-leave-active { position: absolute; }

@media (max-width: 1000px) {
  .t-head, .t-row { grid-template-columns: 2fr 90px 110px 110px 80px; }
  .hide-md { display: none !important; }
}
@media (max-width: 640px) {
  .t-head, .t-row { grid-template-columns: 1fr 90px 110px 80px; }
  .col-stock { display: none; }
}
</style>
